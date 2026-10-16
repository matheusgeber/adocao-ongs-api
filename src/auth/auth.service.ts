import { ConflictException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsuarioRepository } from '../usuario/usuario.repository.js';
import { RegistrarDto } from './dto/registrar.dto.js';


@Injectable()
export class AuthService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async registrar(dto: RegistrarDto) {
    const existente = await this.usuarioRepository.findByEmail(dto.email);
    if (existente) throw new ConflictException('E-mail já cadastrado');

    const senha = await bcrypt.hash(dto.senha, 10);
    return this.usuarioRepository.create({ email: dto.email, senha, perfil: 'ADOTANTE' });
  }
}
