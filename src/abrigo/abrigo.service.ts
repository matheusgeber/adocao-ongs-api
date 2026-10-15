import { Injectable } from '@nestjs/common';
import { CreateAbrigoDto } from './dto/create-abrigo.dto.js';
import { UpdateAbrigoDto } from './dto/update-abrigo.dto.js';

@Injectable()
export class AbrigoService {
  create(createAbrigoDto: CreateAbrigoDto) {
    return 'This action adds a new abrigo';
  }

  findAll() {
    return `This action returns all abrigo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} abrigo`;
  }

  update(id: number, updateAbrigoDto: UpdateAbrigoDto) {
    return `This action updates a #${id} abrigo`;
  }

  remove(id: number) {
    return `This action removes a #${id} abrigo`;
  }
}
