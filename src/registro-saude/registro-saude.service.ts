import { Injectable } from '@nestjs/common';
import { CreateRegistroSaudeDto } from './dto/create-registro-saude.dto.js';
import { UpdateRegistroSaudeDto } from './dto/update-registro-saude.dto.js';

@Injectable()
export class RegistroSaudeService {
  create(createRegistroSaudeDto: CreateRegistroSaudeDto) {
    return 'This action adds a new registroSaude';
  }

  findAll() {
    return `This action returns all registroSaude`;
  }

  findOne(id: number) {
    return `This action returns a #${id} registroSaude`;
  }

  update(id: number, updateRegistroSaudeDto: UpdateRegistroSaudeDto) {
    return `This action updates a #${id} registroSaude`;
  }

  remove(id: number) {
    return `This action removes a #${id} registroSaude`;
  }
}
