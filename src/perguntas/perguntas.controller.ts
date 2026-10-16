import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PerguntasService } from './perguntas.service.js';
import { CreatePerguntaDto } from './dto/create-pergunta.dto.js';
import { ListarPerguntasDto } from './dto/listar-perguntas.dto.js';
import { UpdatePerguntaDto } from './dto/update-pergunta.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Perfil } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Perguntas')
@Controller('perguntas')
export class PerguntasController {
  constructor(private readonly perguntasService: PerguntasService) { }

  @Roles(Perfil.ADMIN)
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

  @Roles(Perfil.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de uma pergunta.' })
  update(@Param('id') id: string, @Body() updatePerguntaDto: UpdatePerguntaDto) {
    return this.perguntasService.update(id, updatePerguntaDto);
  }

  @Roles(Perfil.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete de uma pergunta.' })
  remove(@Param('id') id: string) {
    return this.perguntasService.remove(id);
  }
}