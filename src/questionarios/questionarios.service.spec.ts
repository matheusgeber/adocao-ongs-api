import { Test, TestingModule } from '@nestjs/testing';
import { QuestionariosService } from './questionarios.service.js';

describe('QuestionariosService', () => {
  let service: QuestionariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionariosService],
    }).compile();

    service = module.get<QuestionariosService>(QuestionariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
