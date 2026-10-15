import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoAcompanhamento } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAcompanhamentoDto {
  @ApiProperty()
  @IsUUID()
  adocaoId: string;

  @ApiProperty({ enum: TipoAcompanhamento })
  @IsEnum(TipoAcompanhamento)
  tipo: TipoAcompanhamento;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;
}
