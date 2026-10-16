import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OngRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUsuarioId(usuarioId: string) {
    return this.prisma.ong.findUnique({
      where: { usuarioId },
    });
  }
}