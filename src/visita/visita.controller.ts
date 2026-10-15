import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { CreateVisitaDto } from './dto/create-visita.dto.js';
import { ListarVisitasDto } from './dto/listar-visitas.dto.js';
import { RealizarVisitaDto } from './dto/realizar-visita.dto.js';
import { VisitaService } from './visita.service.js';

@ApiTags('Visitas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('visitas')
export class VisitaController {
  constructor(private readonly visitaService: VisitaService) {}

  @Get()
  @Roles(Perfil.ADMIN, Perfil.ONG, Perfil.VOLUNTARIO, Perfil.ADOTANTE)
  @ApiOperation({ summary: 'Lista as visitas que o usuário pode ver' })
  listar(@Query() filtros: ListarVisitasDto, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.visitaService.listar(filtros, usuario);
  }

  @Get(':id')
  @Roles(Perfil.ADMIN, Perfil.ONG, Perfil.VOLUNTARIO, Perfil.ADOTANTE)
  @ApiOperation({ summary: 'Busca uma visita' })
  buscar(@Param('id', ParseUUIDPipe) id: string, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.visitaService.buscar(id, usuario);
  }

  @Post()
  @Roles(Perfil.ONG)
  @ApiOperation({ summary: 'Agenda uma visita com um voluntário da ONG' })
  agendar(@Body() dto: CreateVisitaDto, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.visitaService.agendar(dto, usuario);
  }

  @Patch(':id/realizar')
  @Roles(Perfil.VOLUNTARIO)
  @ApiOperation({ summary: 'O voluntário registra como foi a visita' })
  realizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RealizarVisitaDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.visitaService.realizar(id, dto, usuario);
  }
}
