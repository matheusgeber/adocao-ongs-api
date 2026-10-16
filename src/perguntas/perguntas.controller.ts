import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PerguntasService } from './perguntas.service.js';
import { CreatePerguntaDto } from './dto/create-pergunta.dto.js';
import { ListarPerguntasDto } from './dto/listar-perguntas.dto.js';
import { UpdatePerguntaDto } from './dto/update-pergunta.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Perguntas')
@Controller('perguntas')
export class PerguntasController {
  constructor(private readonly perguntasService: PerguntasService) { }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova pergunta para o questionário de adoção.' })
  create(@Body() createPerguntaDto: CreatePerguntaDto) {
    return this.perguntasService.create(createPerguntaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as perguntas do questionário.' })
  findAll(@Query() filtros: ListarPerguntasDto) {
    return this.perguntasService.findAll(filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca os detalhes de uma pergunta específica pelo ID.' })
  findOne(@Param('id') id: string) {
    return this.perguntasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de uma pergunta.' })
  update(@Param('id') id: string, @Body() updatePerguntaDto: UpdatePerguntaDto) {
    return this.perguntasService.update(id, updatePerguntaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete de uma pergunta.' })
  remove(@Param('id') id: string) {
    return this.perguntasService.remove(id);
  }
}