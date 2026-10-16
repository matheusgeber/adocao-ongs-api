import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createHash, randomUUID } from 'node:crypto';
import { UsuarioRepository } from '../usuario/usuario.repository.js';
import { RegistrarDto } from './dto/registrar.dto.js';
import { LoginDto } from './dto/login.dto.js';

type UsuarioComOng = NonNullable<
  Awaited<ReturnType<UsuarioRepository['findByEmail']>>
>;

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');
const LIMITE_TENTATIVAS = 5;
const MINUTOS_BLOQUEIO = 15;

const contaBloqueada = (minutos: number) =>
  new HttpException(
    `Conta bloqueada por excesso de tentativas. Tente novamente em ${minutos} minuto(s)`,
    HttpStatus.LOCKED,
  );


@Injectable()
export class AuthService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async registrar(dto: RegistrarDto) {
    const existente = await this.usuarioRepository.findByEmail(dto.email);
    if (existente) throw new ConflictException('E-mail já cadastrado');

    const senha = await bcrypt.hash(dto.senha, 10);
    return this.usuarioRepository.create({
      email: dto.email,
      senha,
      perfil: 'ADOTANTE',
    });
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepository.findByEmail(dto.email);
    if (!usuario) throw new UnauthorizedException('E-mail ou senha inválidos');

    if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
      const restante = Math.ceil((usuario.bloqueadoAte.getTime() - Date.now()) / 60_000);
      throw contaBloqueada(restante);
    }

    if (!(await bcrypt.compare(dto.senha, usuario.senha))) {
      const { tentativasLogin } = await this.usuarioRepository.incrementarTentativasLogin(usuario.id);
      if (tentativasLogin >= LIMITE_TENTATIVAS) {
        await this.usuarioRepository.update(usuario.id, {
          tentativasLogin: 0,
          bloqueadoAte: new Date(Date.now() + MINUTOS_BLOQUEIO * 60_000),
        });
        throw contaBloqueada(MINUTOS_BLOQUEIO);
      }
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    if (!usuario.ativo) throw new UnauthorizedException('Usuário desativado');

    if (usuario.tentativasLogin > 0 || usuario.bloqueadoAte) {
      await this.usuarioRepository.update(usuario.id, { tentativasLogin: 0, bloqueadoAte: null });
    }
    return this.gerarTokens(usuario);
  }


  private async gerarTokens(usuario: UsuarioComOng) {
    const accessToken = jwt.sign(
      { perfil: usuario.perfil, ongId: usuario.ongDona?.id ?? usuario.ongId },
      process.env.JWT_SECRET as string,
      {
        subject: usuario.id,
        expiresIn: (process.env.JWT_EXPIRES_IN ??
          '15m') as jwt.SignOptions['expiresIn'],
      },
    );

    const refreshToken = jwt.sign(
      {},
      process.env.JWT_REFRESH_SECRET as string,
      {
        subject: usuario.id,
        jwtid: randomUUID(),
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ??
          '7d') as jwt.SignOptions['expiresIn'],
      },
    );

    await this.usuarioRepository.update(usuario.id, {
      refreshToken: hashToken(refreshToken),
    });
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string,
      ) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const usuario = await this.usuarioRepository.findById(
      payload.sub as string,
    );
    if (
      !usuario ||
      !usuario.ativo ||
      usuario.refreshToken !== hashToken(refreshToken)
    ) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    return this.gerarTokens(usuario);
  }

  async logout(usuarioId: string) {
    await this.usuarioRepository.update(usuarioId, { refreshToken: null });
  }

  async me(usuarioId: string) {
    const usuario = await this.usuarioRepository.findPublicoById(usuarioId);
    if (!usuario) throw new UnauthorizedException('Usuário não encontrado');
    return usuario;
  }
}
