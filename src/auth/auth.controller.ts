import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegistrarDto } from './dto/registrar.dto.js';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registrar')
  @ApiOperation({ summary: 'Cria uma conta com perfil ADOTANTE' })
  registrar(@Body() dto: RegistrarDto) {
    return this.authService.registrar(dto);
  }
}
