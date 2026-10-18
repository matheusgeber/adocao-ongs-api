import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { AdotanteService } from './adotante.service.js';
import { CreateAdotanteDto } from './dto/create-adotante.dto.js';
import { ListarAdotantesDto } from './dto/listar-adotantes.dto.js';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Perfil } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Adotantes')
@ApiBearerAuth()
@Controller('adotantes')
export class AdotanteController {
  constructor(private readonly adotanteService: AdotanteService) { }

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo adotante no sistema.' })
  @Roles(Perfil.ADMIN, Perfil.ONG)
  create(@Body() createAdotanteDto: CreateAdotanteDto) {
    return this.adotanteService.create(createAdotanteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os adotantes cadastrados.' })
  @Roles(Perfil.ADMIN, Perfil.ONG)
  findAll(@Query() query: ListarAdotantesDto) {
    return this.adotanteService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca os detalhes de um adotante específico pelo ID.' })
  @Roles(Perfil.ADMIN, Perfil.ONG, Perfil.ADOTANTE)
  async findOne(@Param('id') id: string, @UsuarioLogado() usuario: UsuarioAutenticado) {

    const adotante = await this.adotanteService.findOne(id);

    if (usuario.perfil === Perfil.ADOTANTE && adotante.usuarioId !== usuario.id) {
      throw new ForbiddenException('Não pode aceder aos dados de outro adotante.');
    }
    return adotante;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de perfil de um adotante.' })
  @Roles(Perfil.ADMIN, Perfil.ADOTANTE)
  update(@Param('id') id: string, @Body() updateAdotanteDto: Partial<CreateAdotanteDto>, @UsuarioLogado() usuario: UsuarioAutenticado) {
    if (usuario.perfil === Perfil.ADOTANTE && usuario.id !== id) {
      throw new ForbiddenException('Não pode alterar os dados de outro adotante.');
    }
    return this.adotanteService.update(id, updateAdotanteDto);
  }

  @Patch(':id/desbloquear')
  @ApiOperation({ summary: 'Remove o bloqueio de acesso de um adotante.' })
  @Roles(Perfil.ADMIN)
  desbloquear(@Param('id') id: string) {
    return this.adotanteService.desbloquear(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove permanentemente os dados de um adotante do sistema.' })
  @Roles(Perfil.ADMIN, Perfil.ADOTANTE)
  async remove(@Param('id') id: string, @UsuarioLogado() usuario: UsuarioAutenticado) {

    const adotante = await this.adotanteService.findOne(id);
    if (usuario.perfil === Perfil.ADOTANTE && adotante.usuarioId !== usuario.id) {
      throw new ForbiddenException('Não pode apagar a conta de outro adotante.');
    }
    return this.adotanteService.remove(id);
  }
}