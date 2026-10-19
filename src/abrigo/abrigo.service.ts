import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { AbrigoRepository } from './abrigo.repository.js';
import { CreateAbrigoDto } from './dto/create-abrigo.dto.js';
import { UpdateAbrigoDto } from './dto/update-abrigo.dto.js';
import { ListAbrigoDto } from './dto/list-abrigo.dto.js';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { OngRepository } from '../ong/ong.repository.js';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AbrigoService {
  constructor(
    private readonly abrigoRepository: AbrigoRepository,
    private readonly ongRepository: OngRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findAll(dto: ListAbrigoDto) {
    const { dados, total } = await this.abrigoRepository.findMany(dto);
    return { abrigos: dados, total };
  }

  async findOne(id: string) {
    const abrigo = await this.abrigoRepository.findById(id);
    if (!abrigo) throw new NotFoundException('Abrigo não encontrado');
    return abrigo;
  }

  async create(dto: CreateAbrigoDto, usuario: UsuarioAutenticado) {
    const ongId = await this.ongIdDoUsuario(usuario);
    const abrigo = await this.abrigoRepository.create({ ...dto, ongId });
    await this.limparCache();
    return abrigo;
  }

  async update(id: string, dto: UpdateAbrigoDto, usuario: UsuarioAutenticado) {
    const abrigo = await this.findOne(id);
    await this.garantirDona(abrigo.ongId, usuario);
    const atualizado = await this.abrigoRepository.update(id, dto);
    await this.limparCache();
    return atualizado;
  }

  async remove(id: string, usuario: UsuarioAutenticado) {
    const abrigo = await this.findOne(id);
    await this.garantirDona(abrigo.ongId, usuario);
    await this.abrigoRepository.delete(id);
    await this.limparCache();
  }

  private async ongIdDoUsuario(usuario: UsuarioAutenticado) {
    const ong = await this.ongRepository.findByUsuarioId(usuario.id);
    if (!ong) throw new ForbiddenException('Usuário não é dono de uma ONG');
    return ong.id;
  }

  private async garantirDona(ongIdDoAbrigo: string, usuario: UsuarioAutenticado) {
    const ongId = await this.ongIdDoUsuario(usuario);
    if (ongId !== ongIdDoAbrigo) {
      throw new ForbiddenException('Este abrigo pertence a outra ONG');
    }
  }

  private async limparCache() {
    await this.cache.clear();
  }
}
