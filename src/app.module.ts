import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsuarioModule } from './usuario/usuario.module.js';
import { OngModule } from './ong/ong.module.js';
import { AdotanteModule } from './adotante/adotante.module.js';
import { AnimalModule } from './animal/animal.module.js';
import { AdocaoModule } from './adocao/adocao.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AbrigoModule } from './abrigo/abrigo.module.js';
import { RegistroSaudeModule } from './registro-saude/registro-saude.module.js';
import { VisitaModule } from './visita/visita.module.js';
import { AcompanhamentoModule } from './acompanhamento/acompanhamento.module.js';
import { PerguntasModule } from './perguntas/perguntas.module.js';
import { QuestionariosModule } from './questionarios/questionarios.module.js';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';

@Module({
  imports: [
    UsuarioModule,
    OngModule,
    AdotanteModule,
    AnimalModule,
    AdocaoModule,
    PrismaModule,
    AuthModule,
    AbrigoModule,
    RegistroSaudeModule,
    VisitaModule,
    AcompanhamentoModule,
    PerguntasModule,
    QuestionariosModule,
    CacheModule.register({isGlobal: true, ttl: 60000})
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule { }