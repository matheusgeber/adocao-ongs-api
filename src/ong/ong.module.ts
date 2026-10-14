import { Module } from '@nestjs/common';
import { OngService } from './ong.service.js';
import { OngController } from './ong.controller.js';

@Module({
  controllers: [OngController],
  providers: [OngService],
})
export class OngModule {}
