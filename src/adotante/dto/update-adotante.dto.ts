import { PartialType } from '@nestjs/swagger';
import { CreateAdotanteDto } from './create-adotante.dto.js';

export class UpdateAdotanteDto extends PartialType(CreateAdotanteDto) {}
