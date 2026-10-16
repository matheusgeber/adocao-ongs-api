import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegistrarDto } from './dto/registrar.dto.js';
import { LoginDto } from './dto/login.dto.js';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registrar')
  @ApiOperation({ summary: 'Cria uma conta com perfil ADOTANTE' })
  registrar(@Body() dto: RegistrarDto) {
    return this.authService.registrar(dto);
  }

    @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Devolve um token de acesso (15 min) e um refresh token (7 dias)' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

}
