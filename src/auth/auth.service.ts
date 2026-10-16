import { ConflictException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsuarioRepository } from '../usuario/usuario.repository.js';
import { RegistrarDto } from './dto/registrar.dto.js';
import { UnauthorizedException } from '@nestjs/common'; // junte ao import que já existe
import jwt from 'jsonwebtoken';
import { createHash, randomUUID } from 'node:crypto';
import { LoginDto } from './dto/login.dto.js';

type UsuarioComOng = NonNullable<Awaited<ReturnType<UsuarioRepository['findByEmail']>>>;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async registrar(dto: RegistrarDto) {
    const existente = await this.usuarioRepository.findByEmail(dto.email);
    if (existente) throw new ConflictException('E-mail já cadastrado');

    const senha = await bcrypt.hash(dto.senha, 10);
    return this.usuarioRepository.create({ email: dto.email, senha, perfil: 'ADOTANTE' });
  }

    async login(dto: LoginDto) {
    const usuario = await this.usuarioRepository.findByEmail(dto.email);
    const senhaOk = usuario ? await bcrypt.compare(dto.senha, usuario.senha) : false;

    if (!usuario || !senhaOk) throw new UnauthorizedException('E-mail ou senha inválidos');
    if (!usuario.ativo) throw new UnauthorizedException('Usuário desativado');

    return this.gerarTokens(usuario);
  }

  private async gerarTokens(usuario: UsuarioComOng) {
    const accessToken = jwt.sign(
      { perfil: usuario.perfil, ongId: usuario.ongDona?.id ?? usuario.ongId },
      process.env.JWT_SECRET as string,
      {
        subject: usuario.id,
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'],
      },
    );

    const refreshToken = jwt.sign({}, process.env.JWT_REFRESH_SECRET as string, {
      subject: usuario.id,
      jwtid: randomUUID(),
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
    });

    await this.usuarioRepository.update(usuario.id, { refreshToken: hashToken(refreshToken) });
    return { accessToken, refreshToken };
  }

    async refresh(refreshToken: string) {
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const usuario = await this.usuarioRepository.findById(payload.sub as string);
    if (!usuario || !usuario.ativo || usuario.refreshToken !== hashToken(refreshToken)) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    return this.gerarTokens(usuario);
  }


}
