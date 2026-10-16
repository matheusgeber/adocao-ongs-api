import { Module } from '@nestjs/common';
import { AdotanteService } from './adotante.service.js';
import { AdotanteController } from './adotante.controller.js';
import { AdotanteRepository } from './adotante.repository.js';

@Module({
  controllers: [AdotanteController],
  providers: [AdotanteService, AdotanteRepository],
})
export class AdotanteModule { }
