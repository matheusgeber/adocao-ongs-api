import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { AdocaoService } from './adocao.service.js';
import { CreateAdocaoDto } from './dto/create-adocao.dto.js';
import { ListarAdocoesDto } from './dto/listar-adocoes.dto.js';

@ApiTags('Adoções')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('adocoes')
export class AdocaoController {
  constructor(private readonly adocaoService: AdocaoService) {}

  @Get()
  @Roles(Perfil.ADMIN, Perfil.ONG)
  @ApiOperation({ summary: 'Lista as adoções (a ONG só vê as dos próprios animais)' })
  listar(@Query() filtros: ListarAdocoesDto, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.adocaoService.listar(filtros, usuario);
  }

  @Get(':id')
  @Roles(Perfil.ADMIN, Perfil.ONG, Perfil.ADOTANTE)
  @ApiOperation({ summary: 'Busca uma adoção (só quem está envolvido)' })
  buscar(@Param('id', ParseUUIDPipe) id: string, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.adocaoService.buscar(id, usuario);
  }

  @Post()
  @Roles(Perfil.ADOTANTE)
  @ApiOperation({ summary: 'Solicita a adoção de um animal' })
  solicitar(@Body() dto: CreateAdocaoDto, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.adocaoService.solicitar(dto, usuario);
  }

  @Patch(':id/aprovar')
  @Roles(Perfil.ONG)
  @ApiOperation({ summary: 'Aprova a solicitação' })
  aprovar(@Param('id', ParseUUIDPipe) id: string, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.adocaoService.aprovar(id, usuario);
  }

  @Patch(':id/rejeitar')
  @Roles(Perfil.ONG)
  @ApiOperation({ summary: 'Rejeita a solicitação' })
  rejeitar(@Param('id', ParseUUIDPipe) id: string, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.adocaoService.rejeitar(id, usuario);
  }

  @Patch(':id/concluir')
  @Roles(Perfil.ONG)
  @ApiOperation({ summary: 'Conclui uma adoção aprovada' })
  concluir(@Param('id', ParseUUIDPipe) id: string, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.adocaoService.concluir(id, usuario);
  }

  @Patch(':id/cancelar')
  @Roles(Perfil.ADOTANTE)
  @ApiOperation({ summary: 'O adotante cancela a própria solicitação' })
  cancelar(@Param('id', ParseUUIDPipe) id: string, @UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.adocaoService.cancelar(id, usuario);
  }
}
