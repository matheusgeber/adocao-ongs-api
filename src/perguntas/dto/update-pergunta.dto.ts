import { PartialType } from '@nestjs/swagger';
import { CreatePerguntaDto } from './create-pergunta.dto.js';

export class UpdatePerguntaDto extends PartialType(CreatePerguntaDto) { }
