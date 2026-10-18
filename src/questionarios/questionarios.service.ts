import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateQuestionarioDto } from './dto/create-questionario.dto.js';
import { ListarQuestionariosDto } from './dto/listar-questionarios.dto.js';
import { QuestionariosRepository } from './questionarios.repository.js';
import { RevisarQuestionarioDto } from './dto/revisar-questionario.dto.js';
import { Prisma } from '@prisma/client';
import { paginar, respostaPaginada } from '../common/dto/paginacao.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuestionarioRevisadoEvent } from './questionario-revisado.event.js';

@Injectable()
export class QuestionariosService {
  constructor(private prisma: PrismaService, private readonly questionariosRepository: QuestionariosRepository, private readonly eventEmitter: EventEmitter2) { }

  async create(createQuestionarioDto: CreateQuestionarioDto) {

    const { adotanteId, respostas } = createQuestionarioDto;

    const ultimoQuestionario = await this.prisma.questionario.findFirst({
      where: { adotanteId },
      orderBy: { dataResposta: 'desc' },
    });

    if (ultimoQuestionario) {
      const trintaDiasEmMs = 30 * 24 * 60 * 60 * 1000;
      const dataAtual = new Date();
      const dataUltimo = new Date(ultimoQuestionario.dataResposta);

      if (dataAtual.getTime() - dataUltimo.getTime() < trintaDiasEmMs) {
        throw new BadRequestException('Só é permitido refazer o questionário 30 dias após o envio anterior.');
      }
    }

    const perguntasAtivas = await this.prisma.pergunta.findMany({
      where: { ativa: true }
    });

    if (respostas.length !== perguntasAtivas.length) {
      throw new BadRequestException('É obrigatório responder a todas as perguntas ativas.');
    }

    let pontuacaoAbsoluta = 0;
    let pontuacaoMaximaPossivel = 0;
    const VALOR_MAXIMO_RESPOSTA = 5;

    for (const pergunta of perguntasAtivas) {
      const respostaDada = respostas.find(r => r.perguntaId === pergunta.id);

      if (!respostaDada) {
        throw new BadRequestException(`Falta a resposta para a pergunta: ${pergunta.texto}`);
      }

      pontuacaoAbsoluta += respostaDada.valor * pergunta.peso;
      pontuacaoMaximaPossivel += VALOR_MAXIMO_RESPOSTA * pergunta.peso;
    }

    const pontuacaoFinal100 = Math.round((pontuacaoAbsoluta / pontuacaoMaximaPossivel) * 100);

    const resultado = await this.prisma.$transaction(async (tx) => {
      const novoQuestionario = await tx.questionario.create({
        data: {
          adotanteId,
          pontuacao: pontuacaoFinal100,
          respostas: {
            create: respostas.map(r => ({
              perguntaId: r.perguntaId,
              valor: r.valor
            }))
          }
        }
      });

      await tx.adotante.update({
        where: { id: adotanteId },
        data: { pontuacaoQuestionario: pontuacaoFinal100 }
      });

      return novoQuestionario;
    });

    return resultado;
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
    const questionario = await this.findOne(id);

    const questionarioAtualizado = await this.questionariosRepository.update(id, {
      pontuacao: dadosRevisao.pontuacao, observacaoOng: dadosRevisao.observacaoOng, revisado: true,
    });

    const evento = new QuestionarioRevisadoEvent();
    evento.questionarioId = id;
    evento.adotanteId = questionario.adotanteId;
    evento.pontuacao = dadosRevisao.pontuacao; this.eventEmitter.emit('questionario.revisado', evento);

    return questionarioAtualizado;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.questionariosRepository.delete(id);
  }
}