import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRegistroSaudeDto } from './create-registro-saude.dto.js';

export class UpdateRegistroSaudeDto extends PartialType(
  OmitType(CreateRegistroSaudeDto, ['animalId'] as const),
) {}