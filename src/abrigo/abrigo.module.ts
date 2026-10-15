import { Module } from '@nestjs/common';
import { AbrigoService } from './abrigo.service.js';
import { AbrigoController } from './abrigo.controller.js';

@Module({
  controllers: [AbrigoController],
  providers: [AbrigoService],
})
export class AbrigoModule {}
