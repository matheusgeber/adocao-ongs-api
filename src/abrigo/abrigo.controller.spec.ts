import { Test, TestingModule } from '@nestjs/testing';
import { AbrigoController } from './abrigo.controller.js';
import { AbrigoService } from './abrigo.service.js';

describe('AbrigoController', () => {
  let controller: AbrigoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AbrigoController],
      providers: [AbrigoService],
    }).compile();

    controller = module.get<AbrigoController>(AbrigoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
