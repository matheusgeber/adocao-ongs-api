import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { escopoAdocao } from '../adocao/adocao.repository.js';
import { paginar } from '../common/dto/paginacao.dto.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListarVisitasDto } from './dto/listar-visitas.dto.js';

// sem a senha do usuário
const incluir = {
  adocao: { include: { animal: true, adotante: true } },
  voluntario: { select: { id: true, email: true } },
};

@Injectable()
export class VisitaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: ListarVisitasDto, usuario: UsuarioAutenticado) {
    const where: Prisma.VisitaWhereInput = { adocao: escopoAdocao(usuario) };
    if (filtros.status) where.status = filtros.status;
    if (filtros.data) {
      const inicio = new Date(filtros.data);
      inicio.setUTCHours(0, 0, 0, 0);
      const fim = new Date(inicio);
      fim.setUTCDate(fim.getUTCDate() + 1);
      where.dataAgendada = { gte: inicio, lt: fim };
    }

    const [dados, total] = await this.prisma.$transaction([
      this.prisma.visita.findMany({
        where,
        include: incluir,
        orderBy: { dataAgendada: 'asc' },
        ...paginar(filtros),
      }),
      this.prisma.visita.count({ where }),
    ]);
    return { dados, total };
  }

  buscarPorId(id: string) {
    return this.prisma.visita.findUnique({ where: { id }, include: incluir });
  }

  buscarAdocao(id: string) {
    return this.prisma.adocao.findUnique({ where: { id }, include: { animal: true } });
  }

  buscarVoluntario(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, perfil: true, ativo: true, ongId: true },
    });
  }

  criar(adocaoId: string, voluntarioId: string, dataAgendada: Date) {
    return this.prisma.visita.create({
      data: { adocaoId, voluntarioId, dataAgendada },
      include: incluir,
    });
  }

  atualizar(id: string, data: Prisma.VisitaUpdateInput) {
    return this.prisma.visita.update({ where: { id }, data, include: incluir });
  }
}
