import { Injectable } from '@nestjs/common';
import { CreateOngDto } from './dto/create-ong.dto.js';
import { UpdateOngDto } from './dto/update-ong.dto.js';

@Injectable()
export class OngService {
  create(createOngDto: CreateOngDto) {
    return 'This action adds a new ong';
  }

  findAll() {
    return `This action returns all ong`;
  }

  findOne(id: string) {
    return `This action returns a #${id} ong`;
  }

  update(id: string, updateOngDto: UpdateOngDto) {
    return `This action updates a #${id} ong`;
  }

  remove(id: string) {
    return `This action removes a #${id} ong`;
  }
}
