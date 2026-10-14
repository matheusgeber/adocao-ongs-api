import { PartialType } from '@nestjs/swagger';
import { CreateAdocaoDto } from './create-adocao.dto.js';

export class UpdateAdocaoDto extends PartialType(CreateAdocaoDto) {}
