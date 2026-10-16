import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class OngRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUsuarioId(usuarioId: string) {
    return this.prisma.ong.findUnique({
      where: { usuarioId },
    });
  }

    findMany(where: Prisma.OngWhereInput, { skip, take }: { skip: number; take: number }) {
    return this.prisma.ong.findMany({ where, skip, take, orderBy: { nome: 'asc' } });
  }

  count(where: Prisma.OngWhereInput) {
    return this.prisma.ong.count({ where });
  }

  findById(id: string) {
    return this.prisma.ong.findUnique({ where: { id } });
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

  contarVinculos(id: string) {
    return this.prisma.ong.findUnique({
      where: { id },
      select: { _count: { select: { animais: true, abrigos: true } } },
    });
  }

  excluir(id: string, usuarioId: string) {
    return this.prisma.$transaction([
      this.prisma.usuario.updateMany({
        where: { ongId: id },
        data: { ongId: null, ativo: false, refreshToken: null },
      }),
      this.prisma.ong.delete({ where: { id } }),
      this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { ativo: false, refreshToken: null },
      }),
    ]);
  }
}
