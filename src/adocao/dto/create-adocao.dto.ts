import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateAdocaoDto {
  @ApiProperty({ description: 'Animal que o adotante quer adotar' })
  @IsUUID()
  animalId: string;
}
