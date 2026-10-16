import { Module } from '@nestjs/common';
import { AbrigoController } from './abrigo.controller.js';
import { AbrigoService } from './abrigo.service.js';
import { AbrigoRepository } from './abrigo.repository.js';
import { OngModule } from '../ong/ong.module.js';

@Module({
  imports: [OngModule], 
  controllers: [AbrigoController],
  providers: [AbrigoService, AbrigoRepository],
  exports: [AbrigoRepository],
})
export class AbrigoModule {}