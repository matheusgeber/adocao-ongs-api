import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Publico, Roles } from '../common/decorators/roles.decorator.js';
import { OngService } from './ong.service.js';
import { ListarOngsDto } from './dto/listar-ongs.dto.js';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { CreateOngDto } from './dto/create-ong.dto.js';
import { UpdateOngDto } from './dto/update-ong.dto.js';

@ApiTags('ONGs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ongs')
export class OngController {
  constructor(private readonly ongService: OngService) {}

  @Get()
  @Publico()
  @ApiOperation({
    summary: 'Lista ONGs com paginação e filtros por nome e cidade',
  })
  listar(@Query() filtros: ListarOngsDto) {
    return this.ongService.listar(filtros);
  }

  @Get(':id')
  @Publico()
  @ApiOperation({ summary: 'Busca uma ONG pelo id' })
  buscarPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.ongService.buscarPorId(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cadastra uma ONG e o usuário responsável por ela' })
  criar(@Body() dto: CreateOngDto) {
    return this.ongService.criar(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('ADMIN', 'ONG')
  @ApiOperation({ summary: 'Atualiza a ONG (ADMIN ou a própria ONG)' })
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOngDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.ongService.atualizar(id, dto, usuario);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui a ONG e desativa o usuário responsável' })
  remover(@Param('id', ParseUUIDPipe) id: string) {
    return this.ongService.remover(id);
  }
}
