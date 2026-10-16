import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PerguntasService } from './perguntas.service.js';
import { CreatePerguntaDto } from './dto/create-pergunta.dto.js';
import { ListarPerguntasDto } from './dto/listar-perguntas.dto.js';
import { UpdatePerguntaDto } from './dto/update-pergunta.dto.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Perguntas')
@Controller('perguntas')
export class PerguntasController {
  constructor(private readonly perguntasService: PerguntasService) { }

  @Post()
  create(@Body() createPerguntaDto: CreatePerguntaDto) {
    return this.perguntasService.create(createPerguntaDto);
  }

  @Get()
  findAll(@Query() filtros: ListarPerguntasDto) {
    return this.perguntasService.findAll(filtros);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perguntasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePerguntaDto: UpdatePerguntaDto) {
    return this.perguntasService.update(id, updatePerguntaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.perguntasService.remove(id);
  }
}