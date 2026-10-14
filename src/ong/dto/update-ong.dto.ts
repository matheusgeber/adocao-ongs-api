import { PartialType } from '@nestjs/swagger';
import { CreateOngDto } from './create-ong.dto.js';

export class UpdateOngDto extends PartialType(CreateOngDto) {}
