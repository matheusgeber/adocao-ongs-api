import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class CreateVisitaDto {
  @ApiProperty()
  @IsUUID()
  adocaoId: string;

  @ApiProperty({ description: 'Voluntário da própria ONG que vai fazer a visita' })
  @IsUUID()
  voluntarioId: string;

  @ApiProperty({ example: '2026-10-20T14:00:00.000Z' })
  @IsDateString()
  dataAgendada: string;
}
