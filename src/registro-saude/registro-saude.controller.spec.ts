import { Test, TestingModule } from '@nestjs/testing';
import { RegistroSaudeController } from './registro-saude.controller.js';
import { RegistroSaudeService } from './registro-saude.service.js';

describe('RegistroSaudeController', () => {
  let controller: RegistroSaudeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistroSaudeController],
      providers: [RegistroSaudeService],
    }).compile();

    controller = module.get<RegistroSaudeController>(RegistroSaudeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
