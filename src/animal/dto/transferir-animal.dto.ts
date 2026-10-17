import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
 
export class TransferirAnimalDto {
  
  @ApiProperty({ example: 'adc85409-80b2-48f4-b41e-8b1974ae7772' })
  @IsUUID()
  abrigoId: string;
}