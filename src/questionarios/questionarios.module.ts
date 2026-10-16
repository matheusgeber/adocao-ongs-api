import { Module } from '@nestjs/common';
import { QuestionariosService } from './questionarios.service.js';
import { QuestionariosController } from './questionarios.controller.js';
import { QuestionariosRepository } from './questionarios.repository.js';

@Module({
  controllers: [QuestionariosController],
  providers: [QuestionariosService, QuestionariosRepository],
})
export class QuestionariosModule { }
