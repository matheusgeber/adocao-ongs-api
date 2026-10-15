import { Test, TestingModule } from '@nestjs/testing';
import { RegistroSaudeService } from './registro-saude.service.js';

describe('RegistroSaudeService', () => {
  let service: RegistroSaudeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistroSaudeService],
    }).compile();

    service = module.get<RegistroSaudeService>(RegistroSaudeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
