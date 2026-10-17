import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UsuarioService } from './usuario.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto.js';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { AlterarPerfilDto } from './dto/alterar-perfil.dto.js';

@ApiTags('Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Lista usuários com paginação e filtros por perfil e ativo',
  })
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

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza e-mail ou senha (ADMIN ou o próprio usuário)',
  })
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.usuarioService.atualizar(id, dto, usuario);
  }

  @Patch(':id/perfil')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Altera o perfil de um usuário' })
  alterarPerfil(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AlterarPerfilDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.usuarioService.alterarPerfil(id, dto, usuario);
  }


  @Patch(':id/desativar')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desativa um usuário e encerra as sessões dele' })
  desativar(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuarioService.desativar(id);
  }
}
