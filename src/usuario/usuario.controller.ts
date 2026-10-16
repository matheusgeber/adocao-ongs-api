import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UsuarioService } from './usuario.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto.js';

@ApiTags('Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lista usuários com paginação e filtros por perfil e ativo' })
  listar(@Query() filtros: ListarUsuariosDto) {
    return this.usuarioService.listar(filtros);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Busca um usuário pelo id' })
  buscarPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuarioService.buscarPorId(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cria usuário ADMIN, ADOTANTE ou VOLUNTARIO' })
  criar(@Body() dto: CreateUsuarioDto) {
    return this.usuarioService.criar(dto);
  }
}
