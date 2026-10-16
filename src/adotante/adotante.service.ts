import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAdotanteDto } from './dto/create-adotante.dto.js';
import { ListarAdotantesDto } from './dto/listar-adotantes.dto.js';
import { AdotanteRepository } from './adotante.repository.js';
import { Prisma } from '@prisma/client';
import { paginar, respostaPaginada } from '../common/dto/paginacao.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdotanteService {
  constructor(private prisma: PrismaService, private readonly adotanteRepository: AdotanteRepository) { }

  async create(createAdotanteDto: CreateAdotanteDto) {
    return this.adotanteRepository.create(createAdotanteDto);
  }

  async findAll(filtros: ListarAdotantesDto) {
    const { skip, take } = paginar(filtros);
    const where: Prisma.AdotanteWhereInput = {};

    if (filtros.nome) {
      where.nome = { contains: filtros.nome, mode: 'insensitive' };
    }
    if (filtros.bloqueado !== undefined) {
      where.bloqueado = filtros.bloqueado === 'true';
    }

    const [dados, total] = await Promise.all([
      this.adotanteRepository.findMany(skip, take, where),
      this.adotanteRepository.count(where)
    ]);

    return respostaPaginada(dados, total, filtros);
  }

  async findOne(id: string) {
    const adotante = await this.adotanteRepository.findById(id);
    if (!adotante) throw new NotFoundException('Adotante não encontrado');
    return adotante;
  }

  async update(id: string, updateAdotanteDto: Partial<CreateAdotanteDto>) {
    await this.findOne(id);
    return this.adotanteRepository.update(id, updateAdotanteDto);
  }

  async desbloquear(id: string) {
    await this.findOne(id);
    return this.adotanteRepository.update(id, { bloqueado: false });
  }

  async remove(id: string) {
    const adotante = await this.prisma.adotante.findUnique({ where: { id } });
    if (!adotante) {
      throw new NotFoundException('Adotante não encontrado');
    }
    const adocaoEmAndamento = await this.prisma.adocao.findFirst({
      where: {
        adotanteId: id,
        status: {
          in: ['EM_ANALISE', 'APROVADA'],
        },
      },
    });

    if (adocaoEmAndamento) {
      throw new BadRequestException(
        'Não é possível excluir um adotante que tenha uma adoção EM_ANÁLISE ou APROVADA.',
      );
    }

    return this.prisma.adotante.delete({
      where: { id },
    });
  }
}