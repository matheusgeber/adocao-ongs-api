import { Test, TestingModule } from '@nestjs/testing';
import { PerguntasService } from './perguntas.service.js';

describe('PerguntasService', () => {
  let service: PerguntasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerguntasService],
    }).compile();

    service = module.get<PerguntasService>(PerguntasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
