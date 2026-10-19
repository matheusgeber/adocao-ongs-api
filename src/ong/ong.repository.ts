import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';
import { STATUS_ACOMPANHAMENTO } from '../acompanhamento/status-acompanhamento.js';

@Injectable()
export class OngRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUsuarioId(usuarioId: string) {
    return this.prisma.ong.findUnique({
      where: { usuarioId },
    });
  }

  findMany(
    where: Prisma.OngWhereInput,
    { skip, take }: { skip: number; take: number },
  ) {
    return this.prisma.ong.findMany({
      where,
      skip,
      take,
      orderBy: { nome: 'asc' },
    });
  }

  count(where: Prisma.OngWhereInput) {
    return this.prisma.ong.count({ where });
  }

  findById(id: string) {
    return this.prisma.ong.findUnique({
      where: { id },
      include: { usuario: { select: { ativo: true } } },
    });
  }

  findByCnpj(cnpj: string) {
    return this.prisma.ong.findUnique({ where: { cnpj } });
  }

  async emailEmUso(email: string) {
    return (await this.prisma.usuario.count({ where: { email } })) > 0;
  }

  createComUsuario(
    dados: Omit<Prisma.OngUncheckedCreateInput, 'usuarioId'>,
    usuario: { email: string; senha: string },
  ) {
    return this.prisma.ong.create({
      data: { ...dados, usuario: { create: { ...usuario, perfil: 'ONG' } } },
    });
  }

  update(id: string, data: Prisma.OngUpdateInput) {
    return this.prisma.ong.update({ where: { id }, data });
  }

  contarPendencias(id: string) {
    return Promise.all([
      this.prisma.animal.count({ where: { ongId: id, status: 'EM_PROCESSO' } }),
      this.prisma.acompanhamento.count({
        where: {
          status: { not: STATUS_ACOMPANHAMENTO.REALIZADO },
          adocao: { animal: { ongId: id } },
        },
      }),
    ]);
  }

  desativar(id: string, usuarioId: string) {
    return this.prisma.usuario.updateMany({
      where: { OR: [{ id: usuarioId }, { ongId: id }] },
      data: { ativo: false, refreshToken: null },
    });
  }
}
