import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional } from 'class-validator';
import { PaginacaoDto } from '../../common/dto/paginacao.dto.js';
import { STATUS_VISITA } from '../status-visita.js';

export class ListarVisitasDto extends PaginacaoDto {
  @ApiPropertyOptional({ enum: Object.values(STATUS_VISITA) })
  @IsOptional()
  @IsIn(Object.values(STATUS_VISITA))
  status?: string;

  @ApiPropertyOptional({ example: '2026-10-20', description: 'Dia da visita' })
  @IsOptional()
  @IsDateString()
  data?: string;
}
