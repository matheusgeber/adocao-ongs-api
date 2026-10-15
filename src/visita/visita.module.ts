import { Module } from '@nestjs/common';
import { VisitaController } from './visita.controller.js';
import { VisitaRepository } from './visita.repository.js';
import { VisitaService } from './visita.service.js';

@Module({
  controllers: [VisitaController],
  providers: [VisitaService, VisitaRepository],
})
export class VisitaModule {}
