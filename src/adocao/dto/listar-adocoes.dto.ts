import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusAdocao } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dto/paginacao.dto.js';

export class ListarAdocoesDto extends PaginacaoDto {
  @ApiPropertyOptional({ enum: StatusAdocao })
  @IsOptional()
  @IsEnum(StatusAdocao)
  status?: StatusAdocao;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  animalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  adotanteId?: string;
}
