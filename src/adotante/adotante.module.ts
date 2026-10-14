import { Module } from '@nestjs/common';
import { AdotanteService } from './adotante.service.js';
import { AdotanteController } from './adotante.controller.js';

@Module({
  controllers: [AdotanteController],
  providers: [AdotanteService],
})
export class AdotanteModule {}
