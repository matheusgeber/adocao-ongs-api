import { PartialType } from '@nestjs/swagger';
import { CreateAnimalDto } from './create-animal.dto.js';

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {}
