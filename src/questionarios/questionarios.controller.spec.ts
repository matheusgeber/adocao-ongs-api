import { Test, TestingModule } from '@nestjs/testing';
import { QuestionariosController } from './questionarios.controller.js';
import { QuestionariosService } from './questionarios.service.js';

describe('QuestionariosController', () => {
  let controller: QuestionariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionariosController],
      providers: [QuestionariosService],
    }).compile();

    controller = module.get<QuestionariosController>(QuestionariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
