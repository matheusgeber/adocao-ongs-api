import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { AnimalService } from './animal.service.js';
import { CreateAnimalDto } from './dto/create-animal.dto.js';
import { UpdateAnimalDto } from './dto/update-animal.dto.js';
import { TransferirAnimalDto } from './dto/transferir-animal.dto.js';
import { ListAnimalDto } from './dto/list-animal.dto.js';

@ApiTags('Animais')
@ApiBearerAuth()
@Controller('animais')
export class AnimalController {
  constructor(private readonly service: AnimalService) {}

  @Get()
  findAll(@Query() dto: ListAnimalDto) {
    return this.service.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ONG)
  @Post()
  create(
    @Body() dto: CreateAnimalDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.service.create(dto, usuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ONG)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAnimalDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.service.update(id, dto, usuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ONG)
  @Patch(':id/transferir')
  transferir(
    @Param('id') id: string,
    @Body() dto: TransferirAnimalDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.service.transferir(id, dto, usuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ONG, Perfil.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.service.remove(id, usuario);
  }
}