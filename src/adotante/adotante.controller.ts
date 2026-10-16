import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdotanteService } from './adotante.service.js';
import { CreateAdotanteDto } from './dto/create-adotante.dto.js';
import { ListarAdotantesDto } from './dto/listar-adotantes.dto.js';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Perfil } from '@prisma/client';

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
  findOne(@Param('id') id: string) {
    return this.adotanteService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de perfil de um adotante.' })
  @Roles(Perfil.ADMIN, Perfil.ADOTANTE)
  update(@Param('id') id: string, @Body() updateAdotanteDto: Partial<CreateAdotanteDto>) {
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
  @Roles(Perfil.ADMIN)
  remove(@Param('id') id: string) {
    return this.adotanteService.remove(id);
  }
}