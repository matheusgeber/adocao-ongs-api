import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { QuestionariosService } from './questionarios.service.js';
import { CreateQuestionarioDto } from './dto/create-questionario.dto.js';
import { ListarQuestionariosDto } from './dto/listar-questionarios.dto.js';
import { RevisarQuestionarioDto } from './dto/revisar-questionario.dto.js';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Perfil } from '@prisma/client';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Questionários')
@Controller('questionarios')
export class QuestionariosController {
  constructor(private readonly questionariosService: QuestionariosService) { }

  @Roles(Perfil.ADOTANTE)
  @Post()
  @ApiOperation({ summary: 'Submete e calcula as respostas de um novo questionário preenchido pelo adotante.' })
  create(@Body() createQuestionarioDto: CreateQuestionarioDto) {
    return this.questionariosService.create(createQuestionarioDto);
  }

  @Roles(Perfil.ADMIN, Perfil.ONG)
  @Get()
  @ApiOperation({ summary: 'Lista os questionários respondidos.' })
  findAll(@Query() filtros: ListarQuestionariosDto) {
    return this.questionariosService.findAll(filtros);
  }

  @Roles(Perfil.ADMIN, Perfil.ONG, Perfil.ADOTANTE)
  @Get(':id')
  @ApiOperation({ summary: 'Busca os detalhes, pontuação e respostas de um questionário específico.' })
  async findOne(@Param('id') id: string, @UsuarioLogado() usuario: UsuarioAutenticado) {
    const questionario = await this.questionariosService.findOne(id);
    if (usuario.perfil === Perfil.ADOTANTE && questionario.adotanteId !== usuario.id) {
      throw new ForbiddenException('Não pode ver o questionário de outro adotante.');
    }
    return questionario;
  }

  @Roles(Perfil.ONG)
  @Patch(':id/revisar')
  @ApiOperation({ summary: 'Registra a revisão de um questionário.' })
  revisar(@Param('id') id: string, @Body() dadosRevisao: RevisarQuestionarioDto) {
    return this.questionariosService.revisar(id, dadosRevisao);
  }

  @Roles(Perfil.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove um questionário do sistema.' })
  remove(@Param('id') id: string) {
    return this.questionariosService.remove(id);
  }
}