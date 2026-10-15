import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginacaoDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export function paginar({ page = 1, limit = 10 }: PaginacaoDto) {
  return { skip: (page - 1) * limit, take: limit };
}

export function respostaPaginada<T>(dados: T[], total: number, { page = 1, limit = 10 }: PaginacaoDto) {
  return { dados, total, page, limit, totalPaginas: Math.ceil(total / limit) };
}
