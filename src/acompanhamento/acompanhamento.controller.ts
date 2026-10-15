import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { AcompanhamentoService } from './acompanhamento.service.js';
import { CreateAcompanhamentoDto } from './dto/create-acompanhamento.dto.js';
import { ListarAcompanhamentosDto } from './dto/listar-acompanhamentos.dto.js';
import { UpdateAcompanhamentoDto } from './dto/update-acompanhamento.dto.js';

@ApiTags('Acompanhamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('acompanhamentos')
export class AcompanhamentoController {
  constructor(private readonly acompanhamentoService: AcompanhamentoService) {}

  @Get()
  @Roles(Perfil.ADMIN, Perfil.ONG, Perfil.VOLUNTARIO, Perfil.ADOTANTE)
  @ApiOperation({ summary: 'Lista os acompanhamentos que o usuário pode ver' })
  listar(@Query() filtros: ListarAcompanhamentosDto, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.acompanhamentoService.listar(filtros, usuario);
  }

  @Get(':id')
  @Roles(Perfil.ADMIN, Perfil.ONG, Perfil.VOLUNTARIO, Perfil.ADOTANTE)
  @ApiOperation({ summary: 'Busca um acompanhamento' })
  buscar(@Param('id', ParseUUIDPipe) id: string, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.acompanhamentoService.buscar(id, usuario);
  }

  @Post()
  @Roles(Perfil.ONG, Perfil.VOLUNTARIO)
  @ApiOperation({ summary: 'Cria um acompanhamento de uma adoção concluída' })
  criar(@Body() dto: CreateAcompanhamentoDto, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.acompanhamentoService.criar(dto, usuario);
  }

  @Patch(':id')
  @Roles(Perfil.ONG, Perfil.VOLUNTARIO)
  @ApiOperation({ summary: 'Registra que o acompanhamento foi feito' })
  registrar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAcompanhamentoDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.acompanhamentoService.registrar(id, dto, usuario);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Perfil.ADMIN)
  @ApiOperation({ summary: 'Remove um acompanhamento' })
  remover(@Param('id', ParseUUIDPipe) id: string) {
    return this.acompanhamentoService.remover(id);
  }
}
