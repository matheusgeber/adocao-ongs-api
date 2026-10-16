import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto.js';

export class UpdateUsuarioDto extends PartialType(
  PickType(CreateUsuarioDto, ['email', 'senha'] as const),
) {}
