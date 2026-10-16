import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OngService } from './ong.service.js';
import { CreateOngDto } from './dto/create-ong.dto.js';
import { UpdateOngDto } from './dto/update-ong.dto.js';

@Controller('ong')
export class OngController {
  constructor(private readonly ongService: OngService) {}

  @Post()
  create(@Body() createOngDto: CreateOngDto) {
    return this.ongService.create(createOngDto);
  }

  @Get()
  findAll() {
    return this.ongService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ongService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOngDto: UpdateOngDto) {
    return this.ongService.update(id, updateOngDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ongService.remove(id);
  }
}
