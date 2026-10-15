import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AnimalService } from './animal.service.js';
import { CreateAnimalDto } from './dto/create-animal.dto.js';
import { UpdateAnimalDto } from './dto/update-animal.dto.js';
import { ListAnimalDto } from './dto/list-animal.dto.js';

@Controller('animal')
export class AnimalController {
  constructor(private readonly animalService: AnimalService) { }

  @Post()
  create(@Body() createAnimalDto: CreateAnimalDto) {
    return this.animalService.create(createAnimalDto);
  }

  @Get()
  findAll(@Query() query: ListAnimalDto) {
    return this.animalService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.animalService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnimalDto: UpdateAnimalDto) {
    return this.animalService.update(id, updateAnimalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.animalService.remove(id);
  }
}
