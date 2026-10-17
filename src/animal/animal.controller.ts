import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { AnimalService } from './animal.service.js';
import { CreateAnimalDto } from './dto/create-animal.dto.js';
import { UpdateAnimalDto } from './dto/update-animal.dto.js';
import { TransferirAnimalDto } from './dto/transferir-animal.dto.js';
import { ListAnimalDto } from './dto/list-animal.dto.js';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { UseInterceptors } from '@nestjs/common';

@ApiTags('Animais')
@ApiBearerAuth()
@Controller('animais')
export class AnimalController {
  constructor(private readonly service: AnimalService) { }

  @UseInterceptors(CacheInterceptor)
  @Get()
  @ApiOperation({ summary: 'Lista todos os animais.' })
  findAll(@Query() dto: ListAnimalDto) {
    return this.service.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém os detalhes de um animal específico.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ONG)
  @Post()
  @ApiOperation({ summary: 'Cria um novo animal.' })
  create(
    @Body() dto: CreateAnimalDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.service.create(dto, usuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ONG)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um animal.' })
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
  @ApiOperation({ summary: 'Transfere a posse de um animal para outro abrigo.' })
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
  @ApiOperation({ summary: 'Remove um animal.' })
  remove(
    @Param('id') id: string,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.service.remove(id, usuario);
  }
}