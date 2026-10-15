import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Perfil, StatusAdocao } from '@prisma/client';
import { respostaPaginada } from '../common/dto/paginacao.dto.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { CreateVisitaDto } from './dto/create-visita.dto.js';
import type { ListarVisitasDto } from './dto/listar-visitas.dto.js';
import { RealizarVisitaDto } from './dto/realizar-visita.dto.js';
import { STATUS_VISITA } from './status-visita.js';
import { VisitaRepository } from './visita.repository.js';

@Injectable()
export class VisitaService {
  constructor(private readonly repository: VisitaRepository) {}

  async listar(filtros: ListarVisitasDto, usuario: UsuarioAutenticado) {
    const { dados, total } = await this.repository.listar(filtros, usuario);
    return respostaPaginada(dados, total, filtros);
  }

  async buscar(id: string, usuario: UsuarioAutenticado) {
    const visita = await this.repository.buscarPorId(id);
    if (!visita) throw new NotFoundException('Visita não encontrada');

    const { adocao } = visita;
    const envolvido =
      usuario.perfil === Perfil.ADMIN ||
      (usuario.perfil === Perfil.ADOTANTE && adocao.adotante.usuarioId === usuario.id) ||
      (usuario.perfil !== Perfil.ADOTANTE && adocao.animal.ongId === usuario.ongId);
    if (!envolvido) throw new ForbiddenException('Você não participa dessa adoção');
    return visita;
  }

  async agendar(dto: CreateVisitaDto, usuario: UsuarioAutenticado) {
    const adocao = await this.repository.buscarAdocao(dto.adocaoId);
    if (!adocao) throw new NotFoundException('Adoção não encontrada');
    if (adocao.animal.ongId !== usuario.ongId) {
      throw new ForbiddenException('Esse animal pertence a outra ONG');
    }
    if (adocao.status !== StatusAdocao.EM_ANALISE) {
      throw new ConflictException('Só dá pra agendar visita de uma adoção em análise');
    }

    const voluntario = await this.repository.buscarVoluntario(dto.voluntarioId);
    if (!voluntario || voluntario.perfil !== Perfil.VOLUNTARIO || !voluntario.ativo) {
      throw new NotFoundException('Voluntário não encontrado');
    }
    if (voluntario.ongId !== usuario.ongId) {
      throw new BadRequestException('O voluntário precisa ser da sua ONG');
    }

    const dataAgendada = new Date(dto.dataAgendada);
    if (dataAgendada <= new Date()) {
      throw new BadRequestException('A visita precisa ser agendada para uma data futura');
    }

    return this.repository.criar(adocao.id, voluntario.id, dataAgendada);
  }

  async realizar(id: string, dto: RealizarVisitaDto, usuario: UsuarioAutenticado) {
    const visita = await this.repository.buscarPorId(id);
    if (!visita) throw new NotFoundException('Visita não encontrada');
    if (visita.voluntarioId !== usuario.id) {
      throw new ForbiddenException('Essa visita é de outro voluntário');
    }
    if (visita.status !== STATUS_VISITA.AGENDADA) {
      throw new ConflictException('Essa visita já foi realizada');
    }

    return this.repository.atualizar(id, {
      status: STATUS_VISITA.REALIZADA,
      observacao: dto.observacao,
    });
  }
}
