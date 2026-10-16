import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { QuestionariosService } from './questionarios.service.js';
import { CreateQuestionarioDto } from './dto/create-questionario.dto.js';
import { ListarQuestionariosDto } from './dto/listar-questionarios.dto.js';
import { RevisarQuestionarioDto } from './dto/revisar-questionario.dto.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Questionários')
@Controller('questionarios')
export class QuestionariosController {
  constructor(private readonly questionariosService: QuestionariosService) { }

  @Post()
  create(@Body() createQuestionarioDto: CreateQuestionarioDto) {
    return this.questionariosService.create(createQuestionarioDto);
  }

  @Get()
  findAll(@Query() filtros: ListarQuestionariosDto) {
    return this.questionariosService.findAll(filtros);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionariosService.findOne(id);
  }

  @Patch(':id/revisar')
  revisar(@Param('id') id: string, @Body() dadosRevisao: RevisarQuestionarioDto) {
    return this.questionariosService.revisar(id, dadosRevisao);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionariosService.remove(id);
  }
}