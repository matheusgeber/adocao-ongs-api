import { Module } from '@nestjs/common';
import { PerguntasService } from './perguntas.service.js';
import { PerguntasController } from './perguntas.controller.js';
import { PerguntasRepository } from './perguntas.repository.js';

@Module({
  controllers: [PerguntasController],
  providers: [PerguntasService, PerguntasRepository],
})
export class PerguntasModule { }
