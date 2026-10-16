import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginar, respostaPaginada } from '../common/dto/paginacao.dto.js';
import { OngRepository } from './ong.repository.js';
import { ListarOngsDto } from './dto/listar-ongs.dto.js';

@Injectable()
export class OngService {
  constructor(private readonly ongRepository: OngRepository) {}

  async listar(filtros: ListarOngsDto) {
    const where: Prisma.OngWhereInput = {
      nome: filtros.nome ? { contains: filtros.nome, mode: 'insensitive' } : undefined,
      cidade: filtros.cidade ? { contains: filtros.cidade, mode: 'insensitive' } : undefined,
    };
    const [dados, total] = await Promise.all([
      this.ongRepository.findMany(where, paginar(filtros)),
      this.ongRepository.count(where),
    ]);
    return respostaPaginada(dados, total, filtros);
  }

  async buscarPorId(id: string) {
    const ong = await this.ongRepository.findById(id);
    if (!ong) throw new NotFoundException('ONG não encontrada');
    return ong;
  }
}
