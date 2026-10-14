import { Test, TestingModule } from '@nestjs/testing';
import { AdocaoService } from './adocao.service.js';

describe('AdocaoService', () => {
  let service: AdocaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdocaoService],
    }).compile();

    service = module.get<AdocaoService>(AdocaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
