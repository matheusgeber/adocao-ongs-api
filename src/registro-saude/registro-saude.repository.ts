import { Injectable } from '@nestjs/common';
import { Prisma, TipoRegistroSaude as PrismaTipoRegistroSaude} from '@prisma/client';
import { TipoRegistroSaude } from './entities/registro-saude.entity.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListRegistroSaudeDto } from './dto/list-registro-saude.dto.js';
import { CreateRegistroSaudeDto } from './dto/create-registro-saude.dto.js';
import { UpdateRegistroSaudeDto } from './dto/update-registro-saude.dto.js';
import { paginar } from '../common/dto/paginacao.dto.js';

const tipoRegistroMapper: Record<TipoRegistroSaude, PrismaTipoRegistroSaude> = {
  [TipoRegistroSaude.VACINA]: PrismaTipoRegistroSaude.VACINA,
  [TipoRegistroSaude.CASTRACAO]: PrismaTipoRegistroSaude.CASTRACAO,
  [TipoRegistroSaude.CONSULTA]: PrismaTipoRegistroSaude.CONSULTA,
};

@Injectable()
export class RegistroSaudeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(listDto: ListRegistroSaudeDto) {
    const { page, limit, tipo, ...filtros } = listDto;
    const { skip, take } = paginar({ page, limit });

    const where: Prisma.RegistroSaudeWhereInput = {
      ...filtros,
      tipo: tipo ? tipoRegistroMapper[tipo] : undefined,
    };

    const [dados, total] = await this.prisma.$transaction([
      this.prisma.registroSaude.findMany({
        where,
        skip,
        take,
        orderBy: { data: 'desc' },
      }),
      this.prisma.registroSaude.count({ where }),
    ]);
    return { dados, total };
  }

  findById(id: string) {
    return this.prisma.registroSaude.findUnique({ where: { id } });
  }

  create(data: CreateRegistroSaudeDto) {
    return this.prisma.registroSaude.create({
      data: {
        ...data,
        tipo: tipoRegistroMapper[data.tipo],
        data: new Date(data.data),
      },
    });
  }

  update(id: string, data: UpdateRegistroSaudeDto) {
    return this.prisma.registroSaude.update({
      where: { id },
      data: {
        ...data,
        tipo: data.tipo ? tipoRegistroMapper[data.tipo] : undefined,
        data: data.data ? new Date(data.data) : undefined,
      },
    });
  }

  delete(id: string) {
    return this.prisma.registroSaude.delete({ where: { id } });
  }

  async findOngIdDoVoluntario(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { ongId: true },
    });
    return usuario?.ongId ?? null;
  }
}