import { Module } from '@nestjs/common';
import { OngService } from './ong.service.js';
import { OngController } from './ong.controller.js';
import { OngRepository } from './ong.repository.js';

@Module({
  controllers: [OngController],
  providers: [OngService, OngRepository],
  exports: [OngService, OngRepository],
})
export class OngModule { }
