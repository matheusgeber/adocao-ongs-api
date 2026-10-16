import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegistrarDto } from './dto/registrar.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Publico } from '../common/decorators/roles.decorator.js';
import { UsuarioLogado } from '../common/decorators/usuario-logado.decorator.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Publico()
  @Post('registrar')
  @ApiOperation({ summary: 'Cria uma conta com perfil ADOTANTE' })
  registrar(@Body() dto: RegistrarDto) {
    return this.authService.registrar(dto);
  }

  @Publico()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Devolve um token de acesso (15 min) e um refresh token (7 dias)',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Publico()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Troca um refresh token válido por um novo par de tokens',
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Invalida o refresh token do usuário logado' })
  logout(@UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.authService.logout(usuario.id);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Dados do usuário logado' })
  me(@UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.authService.me(usuario.id);
  }
}
