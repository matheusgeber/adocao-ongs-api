import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AcompanhamentoController } from './acompanhamento.controller.js';
import { AcompanhamentoRepository } from './acompanhamento.repository.js';
import { AcompanhamentoService } from './acompanhamento.service.js';
import { AcompanhamentoTarefa } from './acompanhamento.tarefa.js';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AcompanhamentoController],
  providers: [AcompanhamentoService, AcompanhamentoRepository, AcompanhamentoTarefa],
})
export class AcompanhamentoModule {}
