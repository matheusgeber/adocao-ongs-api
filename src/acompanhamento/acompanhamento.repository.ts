import { Injectable } from '@nestjs/common';
import { Prisma, TipoAcompanhamento } from '@prisma/client';
import { escopoAdocao } from '../adocao/adocao.repository.js';
import { paginar } from '../common/dto/paginacao.dto.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListarAcompanhamentosDto } from './dto/listar-acompanhamentos.dto.js';
import { STATUS_ACOMPANHAMENTO } from './status-acompanhamento.js';

const incluir = { adocao: { include: { animal: true, adotante: true } } };

@Injectable()
export class AcompanhamentoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: ListarAcompanhamentosDto, usuario: UsuarioAutenticado) {
    const where: Prisma.AcompanhamentoWhereInput = { adocao: escopoAdocao(usuario) };
    if (filtros.status) where.status = filtros.status;

    // atrasado = passou da data prevista e ninguém registrou
    const vencido = { dataRealizada: null, dataPrevista: { lt: new Date() } };
    if (filtros.atrasado === true) Object.assign(where, vencido);
    if (filtros.atrasado === false) where.NOT = vencido;

    const [dados, total] = await this.prisma.$transaction([
      this.prisma.acompanhamento.findMany({
        where,
        include: incluir,
        orderBy: { dataPrevista: 'asc' },
        ...paginar(filtros),
      }),
      this.prisma.acompanhamento.count({ where }),
    ]);
    return { dados, total };
  }

  buscarPorId(id: string) {
    return this.prisma.acompanhamento.findUnique({ where: { id }, include: incluir });
  }

  buscarAdocao(id: string) {
    return this.prisma.adocao.findUnique({ where: { id }, include: { animal: true } });
  }

  buscarPorTipo(adocaoId: string, tipo: TipoAcompanhamento) {
    return this.prisma.acompanhamento.findFirst({ where: { adocaoId, tipo } });
  }

  criar(data: Prisma.AcompanhamentoUncheckedCreateInput) {
    return this.prisma.acompanhamento.create({ data, include: incluir });
  }

  atualizar(id: string, data: Prisma.AcompanhamentoUpdateInput) {
    return this.prisma.acompanhamento.update({ where: { id }, data, include: incluir });
  }

  // passou da data prevista e ninguém registrou
  buscarVencidos() {
    return this.prisma.acompanhamento.findMany({
      where: {
        status: STATUS_ACOMPANHAMENTO.PENDENTE,
        dataRealizada: null,
        dataPrevista: { lt: new Date() },
      },
      include: { adocao: { select: { adotanteId: true } } },
    });
  }

  contarVencidosDoAdotante(adotanteId: string) {
    return this.prisma.acompanhamento.count({
      where: { adocao: { adotanteId }, dataRealizada: null, dataPrevista: { lt: new Date() } },
    });
  }

  desbloquearAdotante(id: string) {
    return this.prisma.adotante.update({ where: { id }, data: { bloqueado: false } });
  }

  marcarAtrasados(ids: string[], adotanteIds: string[]) {
    return this.prisma.$transaction([
      this.prisma.acompanhamento.updateMany({
        where: { id: { in: ids } },
        data: { status: STATUS_ACOMPANHAMENTO.ATRASADO },
      }),
      this.prisma.adotante.updateMany({
        where: { id: { in: adotanteIds } },
        data: { bloqueado: true },
      }),
    ]);
  }

  remover(id: string) {
    return this.prisma.acompanhamento.delete({ where: { id } });
  }
}
