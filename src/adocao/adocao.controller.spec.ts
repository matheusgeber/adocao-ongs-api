import { Test, TestingModule } from '@nestjs/testing';
import { AdocaoController } from './adocao.controller.js';
import { AdocaoService } from './adocao.service.js';

describe('AdocaoController', () => {
  let controller: AdocaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdocaoController],
      providers: [{ provide: AdocaoService, useValue: {} }],
    }).compile();

    controller = module.get<AdocaoController>(AdocaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
