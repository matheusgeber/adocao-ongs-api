import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsuarioModule } from './usuario/usuario.module.js';
import { OngModule } from './ong/ong.module.js';
import { AdotanteModule } from './adotante/adotante.module.js';
import { AnimalModule } from './animal/animal.module.js';
import { AdocaoModule } from './adocao/adocao.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'adocao-ongs-api',
    }),
    UsuarioModule,
    OngModule,
    AdotanteModule,
    AnimalModule,
    AdocaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
