import { PartialType } from '@nestjs/swagger';
import { CreateAbrigoDto } from './create-abrigo.dto.js';

export class UpdateAbrigoDto extends PartialType(CreateAbrigoDto) {}
