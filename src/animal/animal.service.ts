import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException, } from '@nestjs/common';
import { Perfil, TipoRegistroSaude } from '@prisma/client';
import { AnimalRepository } from './animal.repository.js';
import { CreateAnimalDto } from './dto/create-animal.dto.js';
import { UpdateAnimalDto } from './dto/update-animal.dto.js';
import { TransferirAnimalDto } from './dto/transferir-animal.dto.js';
import { ListAnimalDto } from './dto/list-animal.dto.js';
import { StatusAnimal } from './entities/animal.entity.js';
import { IDADE_MINIMA_MESES, normalizar, vacinasObrigatorias } from './regras/vacinas-obrigatorias.js';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface.js';
import { OngRepository } from '../ong/ong.repository.js';
import { AbrigoRepository } from '../abrigo/abrigo.repository.js';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AnimalService {
  constructor(
    private readonly animalRepository: AnimalRepository,
    private readonly ongRepository: OngRepository,
    private readonly abrigoRepository: AbrigoRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) { }

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
    if (dto.abrigoId) await this.garantirCapacidade(dto.abrigoId, ongId);
    const animal = await this.animalRepository.create({ ...dto, ongId });
    await this.limparCache();
    return animal;
  }

  async update(id: string, dto: UpdateAnimalDto, usuario: UsuarioAutenticado) {
    const animal = await this.findOne(id);
    await this.garantirDona(animal.ongId, usuario);
    if (dto.status === StatusAnimal.DISPONIVEL) {
      this.garantirAptoParaAdocao(animal);
    }
    const atualizado = await this.animalRepository.update(id, dto);
    await this.limparCache();
    return atualizado;
  }

  async transferir(
    id: string,
    dto: TransferirAnimalDto,
    usuario: UsuarioAutenticado,
  ) {
    const animal = await this.findOne(id);
    await this.garantirDona(animal.ongId, usuario);
    this.garantirNaoEmProcesso(animal.status, 'transferido');
    if (animal.abrigoId !== dto.abrigoId) {
      await this.garantirCapacidade(dto.abrigoId, animal.ongId);
    }
    const transferido = await this.animalRepository.update(id, {
      abrigoId: dto.abrigoId,
    });
    await this.limparCache();
    return transferido;
  }

  async remove(id: string, usuario: UsuarioAutenticado) {
    const animal = await this.findOne(id);
    if (usuario.perfil !== Perfil.ADMIN) {
      await this.garantirDona(animal.ongId, usuario);
    }
    this.garantirNaoEmProcesso(animal.status, 'excluído');
    await this.animalRepository.delete(id);
    await this.limparCache();
  }

  private async garantirCapacidade(abrigoId: string, ongIdDoAnimal: string) {
    const abrigo = await this.abrigoRepository.findById(abrigoId);
    if (!abrigo) throw new NotFoundException('Abrigo não encontrado');
    if (abrigo.ongId !== ongIdDoAnimal) {
      throw new ForbiddenException('Este abrigo pertence a outra ONG');
    }
    const ocupacao =
      await this.animalRepository.countNaoAdotadosPorAbrigo(abrigoId);
    if (ocupacao >= abrigo.capacidade) {
      throw new ConflictException(
        `Abrigo lotado: ${ocupacao} de ${abrigo.capacidade} vagas ocupadas`,
      );
    }
  }

  private garantirAptoParaAdocao(animal: {
    idadeMeses: number;
    especie: string;
    registrosSaude: { tipo: TipoRegistroSaude; descricao: string }[];
  }) {
    if (animal.idadeMeses < IDADE_MINIMA_MESES) return;

    const faltando: string[] = [];

    for (const vacina of vacinasObrigatorias(animal.especie)) {
      const tem = animal.registrosSaude.some(
        (r) =>
          r.tipo === TipoRegistroSaude.VACINA &&
          normalizar(r.descricao).includes(normalizar(vacina)),
      );
      if (!tem) faltando.push(`vacina ${vacina}`);
    }

    const temCastracao = animal.registrosSaude.some(
      (r) => r.tipo === TipoRegistroSaude.CASTRACAO,
    );
    if (!temCastracao) faltando.push('castração');

    if (faltando.length > 0) {
      throw new UnprocessableEntityException(
        `O animal não pode ficar DISPONIVEL. Falta registrar: ${faltando.join(', ')}`,
      );
    }
  }

  private garantirNaoEmProcesso(status: string, acao: string) {
    if (status === StatusAnimal.EM_PROCESSO) {
      throw new ConflictException(
        `Animal em processo de adoção não pode ser ${acao}`,
      );
    }
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

  private async limparCache() {
    await this.cache.clear();
  }
}