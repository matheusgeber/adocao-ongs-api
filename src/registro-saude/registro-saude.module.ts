import { Module } from '@nestjs/common';
import { RegistroSaudeService } from './registro-saude.service.js';
import { RegistroSaudeController } from './registro-saude.controller.js';

@Module({
  controllers: [RegistroSaudeController],
  providers: [RegistroSaudeService],
})
export class RegistroSaudeModule {}
