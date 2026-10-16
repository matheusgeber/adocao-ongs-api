import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { QuestionariosService } from './questionarios.service.js';
import { CreateQuestionarioDto } from './dto/create-questionario.dto.js';
import { ListarQuestionariosDto } from './dto/listar-questionarios.dto.js';
import { RevisarQuestionarioDto } from './dto/revisar-questionario.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Questionários')
@Controller('questionarios')
export class QuestionariosController {
  constructor(private readonly questionariosService: QuestionariosService) { }

  @Post()
  @ApiOperation({ summary: 'Submete e calcula as respostas de um novo questionário preenchido pelo adotante.' })
  create(@Body() createQuestionarioDto: CreateQuestionarioDto) {
    return this.questionariosService.create(createQuestionarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os questionários respondidos.' })
  findAll(@Query() filtros: ListarQuestionariosDto) {
    return this.questionariosService.findAll(filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca os detalhes, pontuação e respostas de um questionário específico.' })
  findOne(@Param('id') id: string) {
    return this.questionariosService.findOne(id);
  }

  @Patch(':id/revisar')
  @ApiOperation({ summary: 'Registra a revisão de um questionário.' })
  revisar(@Param('id') id: string, @Body() dadosRevisao: RevisarQuestionarioDto) {
    return this.questionariosService.revisar(id, dadosRevisao);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um questionário do sistema.' })
  remove(@Param('id') id: string) {
    return this.questionariosService.remove(id);
  }
}