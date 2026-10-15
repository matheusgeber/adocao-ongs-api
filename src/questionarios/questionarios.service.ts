import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionarioDto } from './dto/create-questionario.dto.js';
import { ListarQuestionariosDto } from './dto/listar-questionarios.dto.js';
import { QuestionariosRepository } from './questionarios.repository.js';
import { RevisarQuestionarioDto } from './dto/revisar-questionario.dto.js';
import { Prisma } from '@prisma/client';
import { paginar, respostaPaginada } from '../common/dto/paginacao.dto.js';

@Injectable()
export class QuestionariosService {
  constructor(private readonly questionariosRepository: QuestionariosRepository) { }

  async create(createQuestionarioDto: CreateQuestionarioDto) {
    const dados = {
      adotanteId: createQuestionarioDto.adotanteId,
      respostas: {
        create: createQuestionarioDto.respostas.map(r => ({
          perguntaId: r.perguntaId,
          valor: r.valor
        }))
      }
    };
    return this.questionariosRepository.create(dados as any);
  }

  async findAll(filtros: ListarQuestionariosDto) {
    const { skip, take } = paginar(filtros);
    const where: Prisma.QuestionarioWhereInput = {};

    if (filtros.adotanteId) {
      where.adotanteId = filtros.adotanteId;
    }
    if (filtros.pontuacaoMinima !== undefined) {
      where.pontuacao = { gte: filtros.pontuacaoMinima };
    }

    const [dados, total] = await Promise.all([
      this.questionariosRepository.findMany(skip, take, where),
      this.questionariosRepository.count(where)
    ]);

    return respostaPaginada(dados, total, filtros);
  }

  async findOne(id: string) {
    const questionario = await this.questionariosRepository.findById(id);
    if (!questionario) throw new NotFoundException('Questionário não encontrado');
    return questionario;
  }

  async revisar(id: string, dadosRevisao: RevisarQuestionarioDto) {
    await this.findOne(id);

    return this.questionariosRepository.update(id, {
      pontuacao: dadosRevisao.pontuacao,
      observacaoOng: dadosRevisao.observacaoOng,
      revisado: true,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.questionariosRepository.delete(id);
  }
}