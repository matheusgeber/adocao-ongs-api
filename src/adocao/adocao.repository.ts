import { Injectable } from '@nestjs/common';
import { Perfil, Prisma, StatusAdocao, StatusAnimal, TipoAcompanhamento } from '@prisma/client';
import { DIAS_POR_TIPO, somarDias } from '../acompanhamento/prazos.js';
import { paginar } from '../common/dto/paginacao.dto.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { STATUS_VISITA } from '../visita/status-visita.js';
import type { ListarAdocoesDto } from './dto/listar-adocoes.dto.js';

type Db = Prisma.TransactionClient | PrismaService;

const incluir = { animal: true, adotante: true };

// o que cada perfil pode enxergar (visita e acompanhamento reaproveitam)
export function escopoAdocao(usuario: UsuarioAutenticado): Prisma.AdocaoWhereInput {
  if (usuario.perfil === Perfil.ADMIN) return {};
  if (usuario.perfil === Perfil.ADOTANTE) return { adotante: { usuarioId: usuario.id } };
  return { animal: { ongId: usuario.ongId ?? '' } };
}

@Injectable()
export class AdocaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: ListarAdocoesDto, usuario: UsuarioAutenticado) {
    const where: Prisma.AdocaoWhereInput = { AND: [escopoAdocao(usuario)] };
    if (filtros.status) where.status = filtros.status;
    if (filtros.animalId) where.animalId = filtros.animalId;
    if (filtros.adotanteId) where.adotanteId = filtros.adotanteId;

    const [dados, total] = await this.prisma.$transaction([
      this.prisma.adocao.findMany({
        where,
        include: incluir,
        orderBy: { dataSolicitacao: 'desc' },
        ...paginar(filtros),
      }),
      this.prisma.adocao.count({ where }),
    ]);
    return { dados, total };
  }

  buscarPorId(id: string, db: Db = this.prisma) {
    return db.adocao.findUnique({ where: { id }, include: incluir });
  }

  buscarAnimal(id: string, db: Db = this.prisma) {
    return db.animal.findUnique({ where: { id } });
  }

  buscarAdotantePorUsuario(usuarioId: string) {
    return this.prisma.adotante.findUnique({ where: { usuarioId } });
  }

  ultimoQuestionario(adotanteId: string) {
    return this.prisma.questionario.findFirst({
      where: { adotanteId },
      orderBy: { dataResposta: 'desc' },
    });
  }

  contarAtivasDoAdotante(adotanteId: string) {
    return this.prisma.adocao.count({
      where: {
        adotanteId,
        status: { in: [StatusAdocao.EM_ANALISE, StatusAdocao.APROVADA] },
      },
    });
  }

  // só muda se o animal ainda estiver disponível (evita duas solicitações ao mesmo tempo)
  async reservarAnimal(id: string, db: Db = this.prisma) {
    const { count } = await db.animal.updateMany({
      where: { id, status: StatusAnimal.DISPONIVEL },
      data: { status: StatusAnimal.EM_PROCESSO },
    });
    return count === 1;
  }

  criar(adotanteId: string, animalId: string, db: Db = this.prisma) {
    return db.adocao.create({ data: { adotanteId, animalId }, include: incluir });
  }

  atualizarStatus(id: string, data: Prisma.AdocaoUpdateInput, db: Db = this.prisma) {
    return db.adocao.update({ where: { id }, data, include: incluir });
  }

  atualizarStatusAnimal(id: string, status: StatusAnimal, db: Db = this.prisma) {
    return db.animal.update({ where: { id }, data: { status } });
  }

  // 30 e 90 dias depois da conclusão
  criarAcompanhamentos(adocaoId: string, dataConclusao: Date, db: Db = this.prisma) {
    return db.acompanhamento.createMany({
      data: (Object.keys(DIAS_POR_TIPO) as TipoAcompanhamento[]).map((tipo) => ({
        adocaoId,
        tipo,
        dataPrevista: somarDias(dataConclusao, DIAS_POR_TIPO[tipo]),
      })),
    });
  }

  contarAcompanhamentosVencidos(adotanteId: string) {
    return this.prisma.acompanhamento.count({
      where: {
        adocao: { adotanteId },
        dataRealizada: null,
        dataPrevista: { lt: new Date() },
      },
    });
  }

  contarVisitasRealizadas(adocaoId: string) {
    return this.prisma.visita.count({ where: { adocaoId, status: STATUS_VISITA.REALIZADA } });
  }

  // quando uma é aprovada, as outras que estavam na fila do mesmo animal caem
  rejeitarOutrasEmAnalise(animalId: string, ignorarId: string, db: Db = this.prisma) {
    return db.adocao.updateMany({
      where: { animalId, id: { not: ignorarId }, status: StatusAdocao.EM_ANALISE },
      data: { status: StatusAdocao.REJEITADA },
    });
  }

  // outras solicitações em aberto pro mesmo animal
  contarAtivasDoAnimal(animalId: string, ignorarId: string, db: Db = this.prisma) {
    return db.adocao.count({
      where: {
        animalId,
        id: { not: ignorarId },
        status: { in: [StatusAdocao.EM_ANALISE, StatusAdocao.APROVADA] },
      },
    });
  }
}
