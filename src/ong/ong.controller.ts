import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Publico } from '../common/decorators/roles.decorator.js';
import { OngService } from './ong.service.js';
import { ListarOngsDto } from './dto/listar-ongs.dto.js';

@ApiTags('ONGs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ongs')
export class OngController {
  constructor(private readonly ongService: OngService) {}

  @Get()
  @Publico()
  @ApiOperation({ summary: 'Lista ONGs com paginação e filtros por nome e cidade' })
  listar(@Query() filtros: ListarOngsDto) {
    return this.ongService.listar(filtros);
  }

  @Get(':id')
  @Publico()
  @ApiOperation({ summary: 'Busca uma ONG pelo id' })
  buscarPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.ongService.buscarPorId(id);
  }
}
