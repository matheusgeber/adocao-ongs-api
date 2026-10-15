import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsuarioModule } from '../usuario/usuario.module.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UsuarioModule]
})
export class AuthModule {}
