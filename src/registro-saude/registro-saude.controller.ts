import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegistroSaudeService } from './registro-saude.service.js';
import { CreateRegistroSaudeDto } from './dto/create-registro-saude.dto.js';
import { UpdateRegistroSaudeDto } from './dto/update-registro-saude.dto.js';

@Controller('registro-saude')
export class RegistroSaudeController {
  constructor(private readonly registroSaudeService: RegistroSaudeService) {}

  @Post()
  create(@Body() createRegistroSaudeDto: CreateRegistroSaudeDto) {
    return this.registroSaudeService.create(createRegistroSaudeDto);
  }

  @Get()
  findAll() {
    return this.registroSaudeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registroSaudeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegistroSaudeDto: UpdateRegistroSaudeDto) {
    return this.registroSaudeService.update(+id, updateRegistroSaudeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registroSaudeService.remove(+id);
  }
}
