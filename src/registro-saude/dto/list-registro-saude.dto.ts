import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dto/paginacao.dto.js';
import { TipoRegistroSaude } from '../entities/registro-saude.entity.js';

export class ListRegistroSaudeDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Filtra pelos registros de um animal' })
  @IsOptional()
  @IsUUID()
  animalId?: string;

  @ApiPropertyOptional({ enum: TipoRegistroSaude })
  @IsOptional()
  @IsEnum(TipoRegistroSaude)
  tipo?: TipoRegistroSaude;
}