import { IsUUID } from 'class-validator';
 
export class TransferirAnimalDto {
  @IsUUID()
  abrigoId: string;
}