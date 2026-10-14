import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsuarioModule } from './usuario/usuario.module.js';
import { OngModule } from './ong/ong.module.js';
import { AdotanteModule } from './adotante/adotante.module.js';
import { AnimalModule } from './animal/animal.module.js';
import { AdocaoModule } from './adocao/adocao.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    UsuarioModule,
    OngModule,
    AdotanteModule,
    AnimalModule,
    AdocaoModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }