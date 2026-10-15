import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RealizarVisitaDto {
  @ApiProperty({ description: 'Como foi a visita' })
  @IsString()
  @IsNotEmpty()
  observacao: string;
}
