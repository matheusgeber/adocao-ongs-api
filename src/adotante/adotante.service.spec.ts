import { Test, TestingModule } from '@nestjs/testing';
import { AdotanteService } from './adotante.service.js';

describe('AdotanteService', () => {
  let service: AdotanteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdotanteService],
    }).compile();

    service = module.get<AdotanteService>(AdotanteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
