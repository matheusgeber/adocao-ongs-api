import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, Perfil } from '@prisma/client';
import { paginar, respostaPaginada } from '../common/dto/paginacao.dto.js';
import { OngRepository } from './ong.repository.js';
import { ListarOngsDto } from './dto/listar-ongs.dto.js';
import bcrypt from 'bcrypt';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { CreateOngDto } from './dto/create-ong.dto.js';
import { UpdateOngDto } from './dto/update-ong.dto.js';

@Injectable()
export class OngService {
  constructor(private readonly ongRepository: OngRepository) {}

  async listar(filtros: ListarOngsDto) {
    const where: Prisma.OngWhereInput = {
      nome: filtros.nome
        ? { contains: filtros.nome, mode: 'insensitive' }
        : undefined,
      cidade: filtros.cidade
        ? { contains: filtros.cidade, mode: 'insensitive' }
        : undefined,
      usuario: { ativo: true },

    };
    const [dados, total] = await Promise.all([
      this.ongRepository.findMany(where, paginar(filtros)),
      this.ongRepository.count(where),
    ]);
    return respostaPaginada(dados, total, filtros);
  }

  async buscarPorId(id: string) {
    const ong = await this.ongRepository.findById(id);
    if (!ong) throw new NotFoundException('ONG não encontrada');
    return ong;
  }

  async criar(dto: CreateOngDto) {
    if (await this.ongRepository.findByCnpj(dto.cnpj)) {
      throw new ConflictException('CNPJ já cadastrado');
    }
    if (await this.ongRepository.emailEmUso(dto.email)) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const { email, senha, ...dados } = dto;
    const senhaHash = await bcrypt.hash(senha, 10);
    return this.ongRepository.createComUsuario(dados, {
      email,
      senha: senhaHash,
    });
  }

  async atualizar(id: string, dto: UpdateOngDto, usuario: UsuarioAutenticado) {
    await this.buscarPorId(id);
    if (usuario.perfil === Perfil.ONG && usuario.ongId !== id) {
      throw new ForbiddenException('Você só pode alterar a sua própria ONG');
    }
    return this.ongRepository.update(id, dto);
  }

  async remover(id: string) {
    const ong = await this.buscarPorId(id);
    if (!ong.usuario.ativo) throw new ConflictException('A ONG já está desativada');

    const [animaisEmProcesso, acompanhamentosPendentes] =
      await this.ongRepository.contarPendencias(id);
    if (animaisEmProcesso > 0) {
      throw new ConflictException(
        `A ONG possui ${animaisEmProcesso} animal(is) em processo de adoção`,
      );
    }
    if (acompanhamentosPendentes > 0) {
      throw new ConflictException(
        `A ONG possui ${acompanhamentosPendentes} acompanhamento(s) pós-adoção pendente(s)`,
      );
    }

    await this.ongRepository.desativar(id, ong.usuarioId);
  }

}
