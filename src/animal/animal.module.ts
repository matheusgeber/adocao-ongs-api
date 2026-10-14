import { Module } from '@nestjs/common';
import { AnimalService } from './animal.service.js';
import { AnimalController } from './animal.controller.js';

@Module({
  controllers: [AnimalController],
  providers: [AnimalService],
})
export class AnimalModule {}
