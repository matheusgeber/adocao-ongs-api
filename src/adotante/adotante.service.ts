import { Injectable } from '@nestjs/common';
import { CreateAdotanteDto } from './dto/create-adotante.dto.js';
import { UpdateAdotanteDto } from './dto/update-adotante.dto.js';

@Injectable()
export class AdotanteService {
  create(createAdotanteDto: CreateAdotanteDto) {
    return 'This action adds a new adotante';
  }

  findAll() {
    return `This action returns all adotante`;
  }

  findOne(id: string) {
    return `This action returns a #${id} adotante`;
  }

  update(id: string, updateAdotanteDto: UpdateAdotanteDto) {
    return `This action updates a #${id} adotante`;
  }

  remove(id: string) {
    return `This action removes a #${id} adotante`;
  }
}
