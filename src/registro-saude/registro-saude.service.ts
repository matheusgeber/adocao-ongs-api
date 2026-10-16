import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { Perfil } from '@prisma/client';
import { RegistroSaudeRepository } from './registro-saude.repository.js';
import { CreateRegistroSaudeDto } from './dto/create-registro-saude.dto.js';
import { UpdateRegistroSaudeDto } from './dto/update-registro-saude.dto.js';
import { ListRegistroSaudeDto } from './dto/list-registro-saude.dto.js';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { AnimalRepository } from '../animal/animal.repository.js';
import { OngRepository } from '../ong/ong.repository.js';

@Injectable()
export class RegistroSaudeService {
  constructor(
    private readonly registroSaudeRepository: RegistroSaudeRepository,
    private readonly animalRepository: AnimalRepository,
    private readonly ongRepository: OngRepository,
  ) {}

  async findAll(dto: ListRegistroSaudeDto) {
    const { dados, total } = await this.registroSaudeRepository.findMany(dto);
    return { registros: dados, total };
  }

  async findOne(id: string) {
    const registro = await this.registroSaudeRepository.findById(id);
    if (!registro) throw new NotFoundException('Registro de saúde não encontrado');
    return registro;
  }

  async create(dto: CreateRegistroSaudeDto, usuario: UsuarioAutenticado) {
    await this.garantirAnimalDaOng(dto.animalId, usuario);
    return this.registroSaudeRepository.create(dto);
  }

  async update(
    id: string,
    dto: UpdateRegistroSaudeDto,
    usuario: UsuarioAutenticado,
  ) {
    const registro = await this.findOne(id);
    await this.garantirAnimalDaOng(registro.animalId, usuario);
    return this.registroSaudeRepository.update(id, dto);
  }

  async remove(id: string, usuario: UsuarioAutenticado) {
    const registro = await this.findOne(id);
    await this.garantirAnimalDaOng(registro.animalId, usuario);
    await this.registroSaudeRepository.delete(id);
  }

  private async ongIdDoUsuario(usuario: UsuarioAutenticado) {
    if (usuario.perfil === Perfil.VOLUNTARIO) {
      const ongId = await this.registroSaudeRepository.findOngIdDoVoluntario(
        usuario.id,
      );
      if (!ongId) {
        throw new ForbiddenException('Voluntário não está ligado a uma ONG');
      }
      return ongId;
    }
    const ong = await this.ongRepository.findByUsuarioId(usuario.id);
    if (!ong) throw new ForbiddenException('Usuário não é dono de uma ONG');
    return ong.id;
  }

  private async garantirAnimalDaOng(animalId: string, usuario: UsuarioAutenticado) {
    const animal = await this.animalRepository.findById(animalId);
    if (!animal) throw new NotFoundException('Animal não encontrado');
    const ongId = await this.ongIdDoUsuario(usuario);
    if (animal.ongId !== ongId) {
      throw new ForbiddenException('Este animal pertence a outra ONG');
    }
  }
}
