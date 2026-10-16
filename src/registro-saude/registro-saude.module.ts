import { Module } from '@nestjs/common';
import { RegistroSaudeController } from './registro-saude.controller.js';
import { RegistroSaudeService } from './registro-saude.service.js';
import { RegistroSaudeRepository } from './registro-saude.repository.js';
import { AnimalModule } from '../animal/animal.module.js';
import { OngModule } from '../ong/ong.module.js'; 
@Module({
  imports: [AnimalModule, OngModule],
  controllers: [RegistroSaudeController],
  providers: [RegistroSaudeService, RegistroSaudeRepository],
  exports: [RegistroSaudeRepository],
})
export class RegistroSaudeModule {}
