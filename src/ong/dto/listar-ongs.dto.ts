import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginacaoDto } from '../../common/dto/paginacao.dto.js';

export class ListarOngsDto extends PaginacaoDto {
  @ApiPropertyOptional({ example: 'patinhas' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: 'Rio de Janeiro' })
  @IsOptional()
  @IsString()
  cidade?: string;
}
