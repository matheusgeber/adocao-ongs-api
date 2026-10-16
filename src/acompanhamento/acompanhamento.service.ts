import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Perfil, StatusAdocao } from '@prisma/client';
import { respostaPaginada } from '../common/dto/paginacao.dto.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { AcompanhamentoRepository } from './acompanhamento.repository.js';
import { CreateAcompanhamentoDto } from './dto/create-acompanhamento.dto.js';
import type { ListarAcompanhamentosDto } from './dto/listar-acompanhamentos.dto.js';
import { UpdateAcompanhamentoDto } from './dto/update-acompanhamento.dto.js';
import { DIAS_POR_TIPO, somarDias } from './prazos.js';
import { STATUS_ACOMPANHAMENTO } from './status-acompanhamento.js';

@Injectable()
export class AcompanhamentoService {
  constructor(private readonly repository: AcompanhamentoRepository) {}

  async listar(filtros: ListarAcompanhamentosDto, usuario: UsuarioAutenticado) {
    const { dados, total } = await this.repository.listar(filtros, usuario);
    return respostaPaginada(dados, total, filtros);
  }

  async buscar(id: string, usuario: UsuarioAutenticado) {
    const acompanhamento = await this.buscarOuFalhar(id);
    const { adocao } = acompanhamento;
    const envolvido =
      usuario.perfil === Perfil.ADMIN ||
      (usuario.perfil === Perfil.ADOTANTE && adocao.adotante.usuarioId === usuario.id) ||
      (usuario.perfil !== Perfil.ADOTANTE && adocao.animal.ongId === usuario.ongId);
    if (!envolvido) throw new ForbiddenException('Você não participa dessa adoção');
    return acompanhamento;
  }

  async criar(dto: CreateAcompanhamentoDto, usuario: UsuarioAutenticado) {
    const adocao = await this.repository.buscarAdocao(dto.adocaoId);
    if (!adocao) throw new NotFoundException('Adoção não encontrada');
    if (adocao.animal.ongId !== usuario.ongId) {
      throw new ForbiddenException('Esse animal pertence a outra ONG');
    }
    if (adocao.status !== StatusAdocao.CONCLUIDA || !adocao.dataConclusao) {
      throw new ConflictException('Só dá pra criar acompanhamento de uma adoção concluída');
    }
    if (await this.repository.buscarPorTipo(adocao.id, dto.tipo)) {
      throw new ConflictException('Essa adoção já tem esse acompanhamento');
    }

    return this.repository.criar({
      adocaoId: adocao.id,
      tipo: dto.tipo,
      dataPrevista: somarDias(adocao.dataConclusao, DIAS_POR_TIPO[dto.tipo]),
      observacao: dto.observacao,
    });
  }

  async registrar(id: string, dto: UpdateAcompanhamentoDto, usuario: UsuarioAutenticado) {
    const acompanhamento = await this.buscarOuFalhar(id);
    if (acompanhamento.adocao.animal.ongId !== usuario.ongId) {
      throw new ForbiddenException('Esse animal pertence a outra ONG');
    }
    if (acompanhamento.status === STATUS_ACOMPANHAMENTO.REALIZADO) {
      throw new ConflictException('Esse acompanhamento já foi registrado');
    }

    const registrado = await this.repository.atualizar(id, {
      status: STATUS_ACOMPANHAMENTO.REALIZADO,
      dataRealizada: new Date(),
      observacao: dto.observacao,
    });

    // se era o último atrasado, desbloqueia
    const adotanteId = acompanhamento.adocao.adotanteId;
    if ((await this.repository.contarVencidosDoAdotante(adotanteId)) === 0) {
      await this.repository.desbloquearAdotante(adotanteId);
    }
    return registrado;
  }

  // usado pelo job diário
  async marcarVencidos() {
    const vencidos = await this.repository.buscarVencidos();
    if (vencidos.length === 0) return 0;

    const adotantes = [...new Set(vencidos.map((v) => v.adocao.adotanteId))];
    await this.repository.marcarAtrasados(
      vencidos.map((v) => v.id),
      adotantes,
    );
    return vencidos.length;
  }

  async remover(id: string) {
    await this.buscarOuFalhar(id);
    await this.repository.remover(id);
  }

  private async buscarOuFalhar(id: string) {
    const acompanhamento = await this.repository.buscarPorId(id);
    if (!acompanhamento) throw new NotFoundException('Acompanhamento não encontrado');
    return acompanhamento;
  }
}
