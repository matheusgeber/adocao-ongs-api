import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { RegistroSaudeService } from './registro-saude.service.js';
import { CreateRegistroSaudeDto } from './dto/create-registro-saude.dto.js';
import { UpdateRegistroSaudeDto } from './dto/update-registro-saude.dto.js';
import { ListRegistroSaudeDto } from './dto/list-registro-saude.dto.js';

@ApiTags('Registros de saúde')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('registros-saude')
export class RegistroSaudeController {
  constructor(private readonly registroSaudeService: RegistroSaudeService) { }

  @Roles(Perfil.ADMIN, Perfil.ONG, Perfil.VOLUNTARIO)
  @Get()
  @ApiOperation({ summary: 'Lista todos os registros de saúde.' })
  findAll(@Query() query: ListRegistroSaudeDto) {
    return this.registroSaudeService.findAll(query);
  }

  @Roles(Perfil.ADMIN, Perfil.ONG, Perfil.VOLUNTARIO)
  @Get(':id')
  @ApiOperation({ summary: 'Obtém os detalhes de um registro de saúde específico.' })
  findOne(@Param('id') id: string) {
    return this.registroSaudeService.findOne(id);
  }

  @Roles(Perfil.ONG, Perfil.VOLUNTARIO)
  @Post()
  @ApiOperation({ summary: 'Cria um novo registro de saúde.' })
  create(
    @Body() dto: CreateRegistroSaudeDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.registroSaudeService.create(dto, usuario);
  }

  @Roles(Perfil.ONG, Perfil.VOLUNTARIO)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um registro de saúde.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRegistroSaudeDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.registroSaudeService.update(id, dto, usuario);
  }

  @Roles(Perfil.ONG)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um registro de saúde.' })
  remove(
    @Param('id') id: string,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.registroSaudeService.remove(id, usuario);
  }
}