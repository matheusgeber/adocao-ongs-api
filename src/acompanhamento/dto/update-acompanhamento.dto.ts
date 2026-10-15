import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAcompanhamentoDto {
  @ApiPropertyOptional({ description: 'Relato do acompanhamento' })
  @IsOptional()
  @IsString()
  observacao?: string;
}
