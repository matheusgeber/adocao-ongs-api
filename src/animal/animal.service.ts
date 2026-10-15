import { ForbiddenException, Injectable,NotFoundException} from '@nestjs/common';
import { Perfil } from '@prisma/client';
import { AnimalRepository } from './animal.repository.js';
import { CreateAnimalDto } from './dto/create-animal.dto.js';
import { UpdateAnimalDto } from './dto/update-animal.dto.js';
import { TransferirAnimalDto } from './dto/transferir-animal.dto.js';
import { ListAnimalDto } from './dto/list-animal.dto.js';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { OngRepository } from '../ong/ong.repository.js';

@Injectable()
export class AnimalService {
  constructor(private readonly animalRepository: AnimalRepository, private readonly ongRepository: OngRepository) {}

  async findAll(dto: ListAnimalDto) {
    const { dados, total } = await this.animalRepository.findMany(dto);
    return { animais: dados, total };
  }

  async findOne(id: string) {
    const animal = await this.animalRepository.findById(id);
    if (!animal) throw new NotFoundException('Animal não encontrado');
    return animal;
  }

  async create(dto: CreateAnimalDto, usuario: UsuarioAutenticado) {
    const ongId = await this.ongIdDoUsuario(usuario);
    return this.animalRepository.create({ ...dto, ongId });
  }

  async update(id: string, dto: UpdateAnimalDto, usuario: UsuarioAutenticado) {
    const animal = await this.findOne(id);
    await this.garantirDona(animal.ongId, usuario);
    return this.animalRepository.update(id, dto);
  }

  async transferir(
    id: string,
    dto: TransferirAnimalDto,
    usuario: UsuarioAutenticado,
  ) {
    const animal = await this.findOne(id);
    await this.garantirDona(animal.ongId, usuario);
    return this.animalRepository.update(id, { abrigoId: dto.abrigoId });
  }

  async remove(id: string, usuario: UsuarioAutenticado) {
    const animal = await this.findOne(id);
    if (usuario.perfil !== Perfil.ADMIN) {
      await this.garantirDona(animal.ongId, usuario);
    }
    await this.animalRepository.delete(id);
  }

  private async ongIdDoUsuario(usuario: UsuarioAutenticado) {
    const ong = await this.ongRepository.findByUsuarioId(usuario.id);
    if (!ong) throw new ForbiddenException('Usuário não é dono de uma ONG');
    return ong.id;
  }

  private async garantirDona(ongIdDoAnimal: string, usuario: UsuarioAutenticado) {
    const ongId = await this.ongIdDoUsuario(usuario);
    if (ongId !== ongIdDoAnimal) {
      throw new ForbiddenException('Este animal pertence a outra ONG');
    }
  }
}