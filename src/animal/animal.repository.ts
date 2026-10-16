import { Injectable } from '@nestjs/common';
import { StatusAnimal, PorteAnimal } from './entities/animal.entity.js';
import { Prisma, PorteAnimal as PrismaPorteAnimal, StatusAnimal as PrismaStatusAnimal } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListAnimalDto } from './dto/list-animal.dto.js';
import { CreateAnimalDto } from './dto/create-animal.dto.js';
import { UpdateAnimalDto } from './dto/update-animal.dto.js';
import { paginar } from '../common/dto/paginacao.dto.js';

const statusAnimaMapper: Record<StatusAnimal, PrismaStatusAnimal> = {
  [StatusAnimal.DISPONIVEL]: PrismaStatusAnimal.DISPONIVEL,
  [StatusAnimal.EM_PROCESSO]: PrismaStatusAnimal.EM_PROCESSO,
  [StatusAnimal.ADOTADO]: PrismaStatusAnimal.ADOTADO,
};

const porteAnimalMapper: Record<PorteAnimal, PrismaPorteAnimal> = {
  [PorteAnimal.PEQUENO]: PrismaPorteAnimal.PEQUENO,
  [PorteAnimal.MEDIO]: PrismaPorteAnimal.MEDIO,
  [PorteAnimal.GRANDE]: PrismaPorteAnimal.GRANDE,
};

@Injectable()
export class AnimalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(listAnimalDto: ListAnimalDto) {
    const { page, limit, porte, status, ...filtros } = listAnimalDto;
    const { skip, take } = paginar({ page, limit });

    const where: Prisma.AnimalWhereInput = {
      ...filtros,
      porte: porte ? porteAnimalMapper[porte] : undefined,
      status: status ? statusAnimaMapper[status] : undefined,
    }

    const [dados, total] = await this.prisma.$transaction([
      this.prisma.animal.findMany({
        where,
        skip,
        take,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.animal.count({ where }),
    ]);
    return { dados, total };
  }

  findById(id: string) {
    return this.prisma.animal.findUnique({
      where: { id },
      include: { abrigo: true, registrosSaude: true },
    });
  }

  create(data: CreateAnimalDto & { ongId: string }) {
    return this.prisma.animal.create({ 
      data: { 
        ...data, 
        porte: porteAnimalMapper[data.porte], 
        status: statusAnimaMapper[data.status] 
      } 
    });
  }

  update(id: string, data: UpdateAnimalDto) {
    return this.prisma.animal.update({ 
      where: { id }, 
      data: {
        ...data,
        porte: data.porte ? porteAnimalMapper[data.porte] : undefined,
        status: data.status ? statusAnimaMapper[data.status] : undefined,
      } 
    });
  }

  delete(id: string) {
    return this.prisma.animal.delete({ where: { id } });
  }

  countNaoAdotadosPorAbrigo(abrigoId: string) {
    return this.prisma.animal.count({
      where: { abrigoId, status: { not: PrismaStatusAnimal.ADOTADO } },
    });
  }
}