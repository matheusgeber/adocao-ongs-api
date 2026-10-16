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
import { VisitaModule } from './visita/visita.module.js';
import { AcompanhamentoModule } from './acompanhamento/acompanhamento.module.js';
import { PerguntasModule } from './perguntas/perguntas.module.js';
import { QuestionariosModule } from './questionarios/questionarios.module.js';

@Module({
  imports: [
    UsuarioModule,
    OngModule,
    AdotanteModule,
    AnimalModule,
    AdocaoModule,
    PrismaModule,
    AuthModule,
    VisitaModule,
    AcompanhamentoModule,
    PerguntasModule,
    QuestionariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }