import { Module } from '@nestjs/common';
import { AdocaoService } from './adocao.service.js';
import { AdocaoController } from './adocao.controller.js';

@Module({
  controllers: [AdocaoController],
  providers: [AdocaoService],
})
export class AdocaoModule {}
