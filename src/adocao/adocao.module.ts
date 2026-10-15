import { Module } from '@nestjs/common';
import { AdocaoController } from './adocao.controller.js';
import { AdocaoRepository } from './adocao.repository.js';
import { AdocaoService } from './adocao.service.js';

@Module({
  controllers: [AdocaoController],
  providers: [AdocaoService, AdocaoRepository],
  exports: [AdocaoRepository],
})
export class AdocaoModule {}
