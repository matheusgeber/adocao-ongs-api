import { PartialType, PickType } from '@nestjs/swagger';
import { CreateOngDto } from './create-ong.dto.js';

export class UpdateOngDto extends PartialType(
  PickType(CreateOngDto, ['nome', 'telefone', 'cidade'] as const),
) {}
