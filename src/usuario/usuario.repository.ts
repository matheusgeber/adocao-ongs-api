import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export const usuarioPublico = {
  id: true,
  email: true,
  perfil: true,
  ativo: true,
  criadoEm: true,
  ongId: true,
} satisfies Prisma.UsuarioSelect;

@Injectable()
export class UsuarioRepository {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.UsuarioUncheckedCreateInput) {
    return this.prisma.usuario.create({ data, select: usuarioPublico });
  }

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: { ongDona: { select: { id: true } } },
    });
  }

  findById(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: { ongDona: { select: { id: true } } },
    });
  }

  findPublicoById(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: usuarioPublico,
    });
  }

  update(id: string, data: Prisma.UsuarioUncheckedUpdateInput) {
    return this.prisma.usuario.update({ where: { id }, data });
  }

  findMany(
    where: Prisma.UsuarioWhereInput,
    { skip, take }: { skip: number; take: number },
  ) {
    return this.prisma.usuario.findMany({
      where,
      skip,
      take,
      select: usuarioPublico,
      orderBy: { criadoEm: 'desc' },
    });
  }

  count(where: Prisma.UsuarioWhereInput) {
    return this.prisma.usuario.count({ where });
  }

  updatePublico(id: string, data: Prisma.UsuarioUncheckedUpdateInput) {
    return this.prisma.usuario.update({
      where: { id },
      data,
      select: usuarioPublico,
    });
  }

  async ongExiste(id: string) {
    return (await this.prisma.ong.count({ where: { id } })) > 0;
  }

  incrementarTentativasLogin(id: string) {
    return this.prisma.usuario.update({
      where: { id },
      data: { tentativasLogin: { increment: 1 } },
      select: { tentativasLogin: true },
    });
  }

  contarAdminsAtivos() {
    return this.prisma.usuario.count({
      where: { perfil: 'ADMIN', ativo: true },
    });
  }
}
