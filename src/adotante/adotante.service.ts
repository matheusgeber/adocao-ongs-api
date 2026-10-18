import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CreateAdotanteDto } from './dto/create-adotante.dto.js';
import { ListarAdotantesDto } from './dto/listar-adotantes.dto.js';
import { AdotanteRepository } from './adotante.repository.js';
import { Prisma } from '@prisma/client';
import { paginar, respostaPaginada } from '../common/dto/paginacao.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { QuestionarioRevisadoEvent } from '../questionarios/questionario-revisado.event.js';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AdotanteService {
  private readonly logger = new Logger(AdotanteService.name);

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
        'Não é possível excluir um adotante que tenha uma adoção em análise ou aprovada.',
      );
    }

    return this.prisma.adotante.delete({
      where: { id },
    });
  }

  @OnEvent('questionario.revisado')
  async handleQuestionarioRevisadoEvent(evento: QuestionarioRevisadoEvent) {
    this.logger.log(`Evento recebido! Atualizando adotante ${evento.adotanteId} com ${evento.pontuacao} pontos.`);

    await this.adotanteRepository.update(evento.adotanteId, {
      pontuacaoQuestionario: evento.pontuacao,
    });

    this.logger.log(`Pontuação do adotante atualizada com sucesso!`);
  }

}