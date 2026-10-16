import { PickType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto.js';

export class AlterarPerfilDto extends PickType(CreateUsuarioDto, [
  'perfil',
  'ongId',
] as const) {}
