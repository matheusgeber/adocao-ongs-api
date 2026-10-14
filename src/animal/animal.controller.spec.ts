import { Test, TestingModule } from '@nestjs/testing';
import { AnimalController } from './animal.controller.js';
import { AnimalService } from './animal.service.js';

describe('AnimalController', () => {
  let controller: AnimalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnimalController],
      providers: [AnimalService],
    }).compile();

    controller = module.get<AnimalController>(AnimalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
