import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePerguntaDto } from './dto/create-pergunta.dto.js';
import { ListarPerguntasDto } from './dto/listar-perguntas.dto.js';
import { PerguntasRepository } from './perguntas.repository.js';
import { Prisma } from '@prisma/client';
import { paginar, respostaPaginada } from '../common/dto/paginacao.dto.js';

@Injectable()
export class PerguntasService {
  constructor(private readonly perguntasRepository: PerguntasRepository) { }

  async create(createPerguntaDto: CreatePerguntaDto) {
    return this.perguntasRepository.create(createPerguntaDto as any);
  }

  async findAll(filtros: ListarPerguntasDto) {
    const { skip, take } = paginar(filtros);
    const where: Prisma.PerguntaWhereInput = {};

    if (filtros.categoria) {
      where.categoria = filtros.categoria as any;
    }
    if (filtros.ativa !== undefined) {
      where.ativa = filtros.ativa === 'true';
    }

    const [dados, total] = await Promise.all([
      this.perguntasRepository.findMany(skip, take, where),
      this.perguntasRepository.count(where)
    ]);

    return respostaPaginada(dados, total, filtros);
  }

  async findOne(id: string) {
    const pergunta = await this.perguntasRepository.findById(id);
    if (!pergunta) throw new NotFoundException('Pergunta não encontrada');
    return pergunta;
  }

  async update(id: string, updatePerguntaDto: Partial<CreatePerguntaDto>) {
    await this.findOne(id);
    return this.perguntasRepository.update(id, updatePerguntaDto as any);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.perguntasRepository.delete(id);
  }
}