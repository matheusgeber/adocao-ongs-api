import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Perfil, PorteAnimal, StatusAdocao, StatusAnimal } from '@prisma/client';
import { respostaPaginada } from '../common/dto/paginacao.dto.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdocaoRepository } from './adocao.repository.js';
import { CreateAdocaoDto } from './dto/create-adocao.dto.js';
import type { ListarAdocoesDto } from './dto/listar-adocoes.dto.js';

const PONTUACAO_MINIMA: Record<PorteAnimal, number> = { PEQUENO: 40, MEDIO: 55, GRANDE: 70 };
const MAXIMO_ADOCOES_ATIVAS = 2;
const VALIDADE_QUESTIONARIO_MESES = 6;

const TRANSICOES: Record<StatusAdocao, StatusAdocao[]> = {
  EM_ANALISE: [StatusAdocao.APROVADA, StatusAdocao.REJEITADA, StatusAdocao.CANCELADA],
  APROVADA: [StatusAdocao.CONCLUIDA, StatusAdocao.CANCELADA],
  REJEITADA: [],
  CONCLUIDA: [],
  CANCELADA: [],
};

type AdocaoCompleta = NonNullable<Awaited<ReturnType<AdocaoRepository['buscarPorId']>>>;

@Injectable()
export class AdocaoService {
  constructor(
    private readonly repository: AdocaoRepository,
    private readonly prisma: PrismaService,
  ) {}

  async listar(filtros: ListarAdocoesDto, usuario: UsuarioAutenticado) {
    const { dados, total } = await this.repository.listar(filtros, usuario);
    return respostaPaginada(dados, total, filtros);
  }

  async buscar(id: string, usuario: UsuarioAutenticado) {
    const adocao = await this.buscarOuFalhar(id);
    const envolvido =
      usuario.perfil === Perfil.ADMIN ||
      (usuario.perfil === Perfil.ADOTANTE && adocao.adotante.usuarioId === usuario.id) ||
      (usuario.perfil === Perfil.ONG && adocao.animal.ongId === usuario.ongId);
    if (!envolvido) throw new ForbiddenException('Você não participa dessa adoção');
    return adocao;
  }

  async solicitar(dto: CreateAdocaoDto, usuario: UsuarioAutenticado) {
    const adotante = await this.repository.buscarAdotantePorUsuario(usuario.id);
    if (!adotante) {
      throw new ForbiddenException('Complete seu cadastro de adotante antes de solicitar uma adoção');
    }

    const animal = await this.repository.buscarAnimal(dto.animalId);
    if (!animal) throw new NotFoundException('Animal não encontrado');

    if (animal.status !== StatusAnimal.DISPONIVEL) {
      throw new ConflictException('Esse animal não está disponível para adoção');
    }
    if (adotante.bloqueado) {
      throw new ForbiddenException('Você está bloqueado para novas adoções');
    }
    // acompanhamento vencido e sem registro também bloqueia, mesmo se o job ainda não rodou
    if ((await this.repository.contarAcompanhamentosVencidos(adotante.id)) > 0) {
      throw new ForbiddenException(
        'Você tem um acompanhamento atrasado e não pode solicitar novas adoções',
      );
    }

    const questionario = await this.repository.ultimoQuestionario(adotante.id);
    if (!questionario) {
      throw new UnprocessableEntityException('Responda o questionário antes de solicitar uma adoção');
    }
    const limite = new Date();
    limite.setMonth(limite.getMonth() - VALIDADE_QUESTIONARIO_MESES);
    if (questionario.dataResposta < limite) {
      throw new UnprocessableEntityException('Seu questionário tem mais de 6 meses, responda de novo');
    }
    const minima = PONTUACAO_MINIMA[animal.porte];
    if (questionario.pontuacao < minima) {
      throw new UnprocessableEntityException(
        `Pontuação ${questionario.pontuacao} é baixa: animais de porte ${animal.porte} pedem pelo menos ${minima}`,
      );
    }

    const ativas = await this.repository.contarAtivasDoAdotante(adotante.id);
    if (ativas >= MAXIMO_ADOCOES_ATIVAS) {
      throw new ConflictException(`Você já tem ${MAXIMO_ADOCOES_ATIVAS} adoções em andamento`);
    }

    return this.prisma.$transaction(async (tx) => {
      const reservado = await this.repository.reservarAnimal(animal.id, tx);
      if (!reservado) throw new ConflictException('Esse animal não está disponível para adoção');
      return this.repository.criar(adotante.id, animal.id, tx);
    });
  }

  async aprovar(id: string, usuario: UsuarioAutenticado) {
    const adocao = await this.buscarDaOng(id, usuario);
    this.validarTransicao(adocao.status, StatusAdocao.APROVADA);

    const visitas = await this.repository.contarVisitasRealizadas(id);
    if (visitas === 0) {
      throw new ConflictException('Só dá pra aprovar depois de uma visita realizada');
    }

    // tudo ou nada: se uma das partes falhar, nada muda
    return this.prisma.$transaction(async (tx) => {
      const aprovada = await this.repository.atualizarStatus(
        id,
        { status: StatusAdocao.APROVADA, dataAprovacao: new Date() },
        tx,
      );
      await this.repository.atualizarStatusAnimal(adocao.animalId, StatusAnimal.ADOTADO, tx);
      await this.repository.rejeitarOutrasEmAnalise(adocao.animalId, id, tx);
      return aprovada;
    });
  }

  async rejeitar(id: string, usuario: UsuarioAutenticado) {
    const adocao = await this.buscarDaOng(id, usuario);
    return this.encerrar(adocao, StatusAdocao.REJEITADA);
  }

  async concluir(id: string, usuario: UsuarioAutenticado) {
    const adocao = await this.buscarDaOng(id, usuario);
    this.validarTransicao(adocao.status, StatusAdocao.CONCLUIDA);

    const dataConclusao = new Date();
    return this.prisma.$transaction(async (tx) => {
      const concluida = await this.repository.atualizarStatus(
        id,
        { status: StatusAdocao.CONCLUIDA, dataConclusao },
        tx,
      );
      await this.repository.criarAcompanhamentos(id, dataConclusao, tx);
      return concluida;
    });
  }

  async cancelar(id: string, usuario: UsuarioAutenticado) {
    const adocao = await this.buscarOuFalhar(id);
    if (adocao.adotante.usuarioId !== usuario.id) {
      throw new ForbiddenException('Só quem fez a solicitação pode cancelar');
    }
    return this.encerrar(adocao, StatusAdocao.CANCELADA);
  }

  // rejeitar e cancelar: o animal volta a ficar disponível se ninguém mais estiver na fila
  private async encerrar(adocao: AdocaoCompleta, novoStatus: StatusAdocao) {
    this.validarTransicao(adocao.status, novoStatus);

    return this.prisma.$transaction(async (tx) => {
      const atualizada = await this.repository.atualizarStatus(adocao.id, { status: novoStatus }, tx);
      const outras = await this.repository.contarAtivasDoAnimal(adocao.animalId, adocao.id, tx);
      if (outras === 0) {
        await this.repository.atualizarStatusAnimal(adocao.animalId, StatusAnimal.DISPONIVEL, tx);
      }
      return atualizada;
    });
  }

  private async buscarOuFalhar(id: string) {
    const adocao = await this.repository.buscarPorId(id);
    if (!adocao) throw new NotFoundException('Adoção não encontrada');
    return adocao;
  }

  private async buscarDaOng(id: string, usuario: UsuarioAutenticado) {
    const adocao = await this.buscarOuFalhar(id);
    if (adocao.animal.ongId !== usuario.ongId) {
      throw new ForbiddenException('Esse animal pertence a outra ONG');
    }
    return adocao;
  }

  private validarTransicao(atual: StatusAdocao, novo: StatusAdocao) {
    if (!TRANSICOES[atual].includes(novo)) {
      throw new ConflictException(`Uma adoção ${atual} não pode ir para ${novo}`);
    }
  }
}
