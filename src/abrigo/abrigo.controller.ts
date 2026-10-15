import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AbrigoService } from './abrigo.service.js';
import { CreateAbrigoDto } from './dto/create-abrigo.dto.js';
import { UpdateAbrigoDto } from './dto/update-abrigo.dto.js';

@Controller('abrigo')
export class AbrigoController {
  constructor(private readonly abrigoService: AbrigoService) {}

  @Post()
  create(@Body() createAbrigoDto: CreateAbrigoDto) {
    return this.abrigoService.create(createAbrigoDto);
  }

  @Get()
  findAll() {
    return this.abrigoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.abrigoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAbrigoDto: UpdateAbrigoDto) {
    return this.abrigoService.update(+id, updateAbrigoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.abrigoService.remove(+id);
  }
}
