import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TipoRegistroSaude } from '../entities/registro-saude.entity.js';

export class CreateRegistroSaudeDto {
  @ApiProperty({ enum: TipoRegistroSaude, example: TipoRegistroSaude.VACINA })
  @IsEnum(TipoRegistroSaude, {message: "O tipo de registro de saúde deve ser 'VACINA', 'CASTRACAO' ou 'CONSULTA'"})
  tipo: TipoRegistroSaude;

  @ApiProperty({ example: 'Animal necessita de vacinação anual' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({ example: '2026-10-16' })
  @IsDateString()
  data: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  animalId: string;
}
