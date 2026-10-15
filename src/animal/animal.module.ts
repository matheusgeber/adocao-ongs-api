import { Module } from '@nestjs/common';
import { AnimalController } from './animal.controller.js';
import { AnimalService } from './animal.service.js';
import { AnimalRepository } from './animal.repository.js';

@Module({
  controllers: [AnimalController],
  providers: [AnimalService, AnimalRepository],
  exports: [AnimalService, AnimalRepository],
})
export class AnimalModule {}