import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListAbrigoDto } from './dto/list-abrigo.dto.js';
import { CreateAbrigoDto } from './dto/create-abrigo.dto.js';
import { UpdateAbrigoDto } from './dto/update-abrigo.dto.js';
import { paginar } from '../common/dto/paginacao.dto.js';

@Injectable()
export class AbrigoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(listAbrigoDto: ListAbrigoDto) {
    const { page, limit, ...filtros } = listAbrigoDto;
    const { skip, take } = paginar({ page, limit });

    const where: Prisma.AbrigoWhereInput = {
      ...filtros
    };

    const [dados, total] = await this.prisma.$transaction([
      this.prisma.abrigo.findMany({
        where,
        skip,
        take,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.abrigo.count({ where }),
    ]);
    return { dados, total };
  }

  findById(id: string) {
    return this.prisma.abrigo.findUnique({ where: { id } });
  }

  create(data: CreateAbrigoDto & { ongId: string }) {
    return this.prisma.abrigo.create({ data });
  }

  update(id: string, data: UpdateAbrigoDto) {
    return this.prisma.abrigo.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.abrigo.delete({ where: { id } });
  }
}