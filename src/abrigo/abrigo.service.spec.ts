import { Test, TestingModule } from '@nestjs/testing';
import { AbrigoService } from './abrigo.service.js';

describe('AbrigoService', () => {
  let service: AbrigoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbrigoService],
    }).compile();

    service = module.get<AbrigoService>(AbrigoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
