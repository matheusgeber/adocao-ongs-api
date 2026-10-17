import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Perfil, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { paginar, respostaPaginada } from '../common/dto/paginacao.dto.js';
import { UsuarioRepository } from './usuario.repository.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { AlterarPerfilDto } from './dto/alterar-perfil.dto.js';

@Injectable()
export class UsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async listar(filtros: ListarUsuariosDto) {
    const where: Prisma.UsuarioWhereInput = {
      perfil: filtros.perfil,
      ativo: filtros.ativo,
    };
    const [dados, total] = await Promise.all([
      this.usuarioRepository.findMany(where, paginar(filtros)),
      this.usuarioRepository.count(where),
    ]);
    return respostaPaginada(dados, total, filtros);
  }

  async buscarPorId(id: string) {
    const usuario = await this.usuarioRepository.findPublicoById(id);
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  async criar(dto: CreateUsuarioDto) {
    if (await this.usuarioRepository.findByEmail(dto.email)) {
      throw new ConflictException('E-mail já cadastrado');
    }
    await this.validarOngDoVoluntario(dto.perfil, dto.ongId);

    const senha = await bcrypt.hash(dto.senha, 10);
    return this.usuarioRepository.create({
      email: dto.email,
      senha,
      perfil: dto.perfil,
      ongId: dto.perfil === Perfil.VOLUNTARIO ? dto.ongId : null,
    });
  }

  private async validarOngDoVoluntario(perfil: Perfil, ongId?: string) {
    if (
      perfil === Perfil.VOLUNTARIO &&
      !(await this.usuarioRepository.ongExiste(ongId!))
    ) {
      throw new NotFoundException('ONG do voluntário não encontrada');
    }
  }

  async atualizar(
    id: string,
    dto: UpdateUsuarioDto,
    usuarioLogado: UsuarioAutenticado,
  ) {
    if (usuarioLogado.perfil !== Perfil.ADMIN && usuarioLogado.id !== id) {
      throw new ForbiddenException(
        'Você só pode alterar o seu próprio usuário',
      );
    }
    await this.buscarPorId(id);

    if (dto.email) {
      const outro = await this.usuarioRepository.findByEmail(dto.email);
      if (outro && outro.id !== id)
        throw new ConflictException('E-mail já cadastrado');
    }

    const data: Prisma.UsuarioUncheckedUpdateInput = { email: dto.email };
    if (dto.senha) {
      data.senha = await bcrypt.hash(dto.senha, 10);
      data.refreshToken = null;
    }
    return this.usuarioRepository.updatePublico(id, data);
  }

  async alterarPerfil(id: string, dto: AlterarPerfilDto, usuarioLogado: UsuarioAutenticado) {
    if (usuarioLogado.id === id) {
      throw new ForbiddenException('Você não pode alterar o seu próprio perfil');
    }

    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    if (usuario.ongDona) {
      throw new ConflictException('Este usuário é responsável por uma ONG e não pode mudar de perfil');
    }
    if (dto.perfil !== Perfil.ADMIN) await this.garantirOutroAdminAtivo(usuario);
    await this.validarOngDoVoluntario(dto.perfil, dto.ongId);

    return this.usuarioRepository.updatePublico(id, {
      perfil: dto.perfil,
      ongId: dto.perfil === Perfil.VOLUNTARIO ? dto.ongId : null,
      refreshToken: null,
    });
  }

  async desativar(id: string) {
    const usuario = await this.buscarPorId(id);
    await this.garantirOutroAdminAtivo(usuario);
    return this.usuarioRepository.updatePublico(id, { ativo: false, refreshToken: null });
  }


  private async garantirOutroAdminAtivo(usuario: { perfil: Perfil; ativo: boolean }) {
    if (usuario.perfil !== Perfil.ADMIN || !usuario.ativo) return;
    if ((await this.usuarioRepository.contarAdminsAtivos()) <= 1) {
      throw new ConflictException('O sistema precisa de pelo menos um ADMIN ativo');
    }
  }
}
