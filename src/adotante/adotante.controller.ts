import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdotanteService } from './adotante.service.js';
import { CreateAdotanteDto } from './dto/create-adotante.dto.js';
import { UpdateAdotanteDto } from './dto/update-adotante.dto.js';

@Controller('adotante')
export class AdotanteController {
  constructor(private readonly adotanteService: AdotanteService) {}

  @Post()
  create(@Body() createAdotanteDto: CreateAdotanteDto) {
    return this.adotanteService.create(createAdotanteDto);
  }

  @Get()
  findAll() {
    return this.adotanteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adotanteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdotanteDto: UpdateAdotanteDto) {
    return this.adotanteService.update(+id, updateAdotanteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adotanteService.remove(+id);
  }
}
