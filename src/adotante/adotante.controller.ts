import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdotanteService } from './adotante.service.js';
import { CreateAdotanteDto } from './dto/create-adotante.dto.js';
import { ListarAdotantesDto } from './dto/listar-adotantes.dto.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Perfil } from '@prisma/client';

@ApiTags('Adotantes')
@ApiBearerAuth()
@Controller('adotantes')
export class AdotanteController {
  constructor(private readonly adotanteService: AdotanteService) { }

  @Post()
  @Roles(Perfil.ADMIN, Perfil.ONG)
  create(@Body() createAdotanteDto: CreateAdotanteDto) {
    return this.adotanteService.create(createAdotanteDto);
  }

  @Get()
  @Roles(Perfil.ADMIN, Perfil.ONG)
  findAll(@Query() query: ListarAdotantesDto) {
    return this.adotanteService.findAll(query);
  }

  @Get(':id')
  @Roles(Perfil.ADMIN, Perfil.ONG, Perfil.ADOTANTE)
  findOne(@Param('id') id: string) {
    return this.adotanteService.findOne(id);
  }

  @Patch(':id')
  @Roles(Perfil.ADMIN, Perfil.ADOTANTE)
  update(@Param('id') id: string, @Body() updateAdotanteDto: Partial<CreateAdotanteDto>) {
    return this.adotanteService.update(id, updateAdotanteDto);
  }

  @Patch(':id/desbloquear')
  @Roles(Perfil.ADMIN)
  desbloquear(@Param('id') id: string) {
    return this.adotanteService.desbloquear(id);
  }

  @Delete(':id')
  @Roles(Perfil.ADMIN)
  remove(@Param('id') id: string) {
    return this.adotanteService.remove(id);
  }
}