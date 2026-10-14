import { Test, TestingModule } from '@nestjs/testing';
import { OngController } from './ong.controller.js';
import { OngService } from './ong.service.js';

describe('OngController', () => {
  let controller: OngController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OngController],
      providers: [OngService],
    }).compile();

    controller = module.get<OngController>(OngController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
