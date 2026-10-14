import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdocaoService } from './adocao.service.js';
import { CreateAdocaoDto } from './dto/create-adocao.dto.js';
import { UpdateAdocaoDto } from './dto/update-adocao.dto.js';

@Controller('adocao')
export class AdocaoController {
  constructor(private readonly adocaoService: AdocaoService) { }

  @Post()
  create(@Body() createAdocaoDto: CreateAdocaoDto) {
    return this.adocaoService.create(createAdocaoDto);
  }

  @Get()
  findAll() {
    return this.adocaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adocaoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdocaoDto: UpdateAdocaoDto) {
    return this.adocaoService.update(id, updateAdocaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adocaoService.remove(id);
  }
}
