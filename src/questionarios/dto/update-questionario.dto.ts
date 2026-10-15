import { PartialType } from '@nestjs/swagger';
import { CreateQuestionarioDto } from './create-questionario.dto.js';

export class UpdateQuestionarioDto extends PartialType(CreateQuestionarioDto) {}
