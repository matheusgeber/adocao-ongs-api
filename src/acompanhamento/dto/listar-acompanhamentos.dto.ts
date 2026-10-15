import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { PaginacaoDto } from '../../common/dto/paginacao.dto.js';
import { STATUS_ACOMPANHAMENTO } from '../status-acompanhamento.js';

export class ListarAcompanhamentosDto extends PaginacaoDto {
  @ApiPropertyOptional({ enum: Object.values(STATUS_ACOMPANHAMENTO) })
  @IsOptional()
  @IsIn(Object.values(STATUS_ACOMPANHAMENTO))
  status?: string;

  @ApiPropertyOptional({ description: 'true: só os vencidos sem registro' })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  atrasado?: boolean;
}
