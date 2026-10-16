import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { AbrigoService } from './abrigo.service.js';
import { CreateAbrigoDto } from './dto/create-abrigo.dto.js';
import { UpdateAbrigoDto } from './dto/update-abrigo.dto.js';
import { ListAbrigoDto } from './dto/list-abrigo.dto.js';
 
@ApiTags('Abrigos')
@ApiBearerAuth()
@Controller('abrigos')
export class AbrigoController {
  constructor(private readonly abrigoService: AbrigoService) {}
 
  @Get()
  findAll(@Query() query: ListAbrigoDto) {
    return this.abrigoService.findAll(query);
  }
 
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.abrigoService.findOne(id);
  }
 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ONG)
  @Post()
  create(
    @Body() dto: CreateAbrigoDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.abrigoService.create(dto, usuario);
  }
 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ONG)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAbrigoDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.abrigoService.update(id, dto, usuario);
  }
 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ONG)
  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.abrigoService.remove(id, usuario);
  }
}