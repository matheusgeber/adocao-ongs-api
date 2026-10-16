import {
  ConflictException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Perfil } from '@prisma/client';
import { vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdocaoRepository } from './adocao.repository.js';
import { AdocaoService } from './adocao.service.js';

const ong = { id: 'ong-1', perfil: Perfil.ONG, ongId: 'ong-1' };
const usuarioAdotante = { id: 'user-1', perfil: Perfil.ADOTANTE, ongId: null };

const adotante = { id: 'adotante-1', bloqueado: false };
const animal = {
  id: 'animal-1',
  status: 'DISPONIVEL',
  porte: 'MEDIO',
  especie: 'CAO',
  idadeMeses: 24,
  ongId: 'ong-1',
};
const questionario = (pontuacao: number, diasAtras = 10) => ({
  pontuacao,
  dataResposta: new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000),
});

describe('AdocaoService', () => {
  let service: AdocaoService;
  const repository = {
    buscarAdotantePorUsuario: vi.fn(),
    buscarAnimal: vi.fn(),
    buscarVacinas: vi.fn(),
    ultimoQuestionario: vi.fn(),
    contarAtivasDoAdotante: vi.fn(),
    contarAcompanhamentosVencidos: vi.fn(),
    reservarAnimal: vi.fn(),
    criar: vi.fn(),
    buscarPorId: vi.fn(),
    contarVisitasRealizadas: vi.fn(),
    atualizarStatus: vi.fn(),
    atualizarStatusAnimal: vi.fn(),
    rejeitarOutrasEmAnalise: vi.fn(),
    criarAcompanhamentos: vi.fn(),
  };
  const prisma = { $transaction: vi.fn((fn) => fn({})) };

  beforeEach(async () => {
    vi.clearAllMocks();
    repository.buscarAdotantePorUsuario.mockResolvedValue(adotante);
    repository.buscarAnimal.mockResolvedValue(animal);
    repository.buscarVacinas.mockResolvedValue([{ descricao: 'V10 e Antirrábica' }]);
    repository.ultimoQuestionario.mockResolvedValue(questionario(80));
    repository.contarAtivasDoAdotante.mockResolvedValue(0);
    repository.contarAcompanhamentosVencidos.mockResolvedValue(0);
    repository.reservarAnimal.mockResolvedValue(true);
    repository.criar.mockResolvedValue({ id: 'adocao-1' });

    const module = await Test.createTestingModule({
      providers: [
        AdocaoService,
        { provide: AdocaoRepository, useValue: repository },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AdocaoService);
  });

  describe('solicitar', () => {
    const dto = { animalId: 'animal-1' };

    it('cria a solicitação quando está tudo certo', async () => {
      const adocao = await service.solicitar(dto, usuarioAdotante);
      expect(adocao).toEqual({ id: 'adocao-1' });
      expect(repository.reservarAnimal).toHaveBeenCalled();
    });

    it('não deixa pedir animal que não está disponível', async () => {
      repository.buscarAnimal.mockResolvedValue({ ...animal, status: 'EM_PROCESSO' });
      await expect(service.solicitar(dto, usuarioAdotante)).rejects.toThrow(ConflictException);
    });

    it('não deixa adotar animal com menos de 6 meses', async () => {
      repository.buscarAnimal.mockResolvedValue({ ...animal, idadeMeses: 5 });
      await expect(service.solicitar(dto, usuarioAdotante)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('exige as vacinas obrigatórias da espécie', async () => {
      repository.buscarVacinas.mockResolvedValue([{ descricao: 'V10' }]);
      await expect(service.solicitar(dto, usuarioAdotante)).rejects.toThrow(
        /antirrábica/,
      );

      repository.buscarVacinas.mockResolvedValue([]);
      await expect(service.solicitar(dto, usuarioAdotante)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('aceita vacinas escritas em registros separados e sem acento', async () => {
      repository.buscarVacinas.mockResolvedValue([{ descricao: 'v10' }, { descricao: 'ANTIRABICA' }]);
      await expect(service.solicitar(dto, usuarioAdotante)).resolves.toBeDefined();
    });

    it('não exige vacina de espécie sem lista obrigatória', async () => {
      repository.buscarAnimal.mockResolvedValue({ ...animal, especie: 'COELHO' });
      repository.buscarVacinas.mockResolvedValue([]);
      await expect(service.solicitar(dto, usuarioAdotante)).resolves.toBeDefined();
    });

    it('não deixa adotante bloqueado pedir', async () => {
      repository.buscarAdotantePorUsuario.mockResolvedValue({ ...adotante, bloqueado: true });
      await expect(service.solicitar(dto, usuarioAdotante)).rejects.toThrow(ForbiddenException);
    });

    it('bloqueia quem tem acompanhamento vencido  antes do job rodar', async () => {
      repository.contarAcompanhamentosVencidos.mockResolvedValue(1);
      await expect(service.solicitar(dto, usuarioAdotante)).rejects.toThrow(ForbiddenException);
    });

    it('exige questionário respondido', async () => {
      repository.ultimoQuestionario.mockResolvedValue(null);
      await expect(service.solicitar(dto, usuarioAdotante)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('recusa questionário com mais de 6 meses', async () => {
      repository.ultimoQuestionario.mockResolvedValue(questionario(90, 200));
      await expect(service.solicitar(dto, usuarioAdotante)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('exige pontuação mínima conforme o porte', async () => {
      repository.buscarAnimal.mockResolvedValue({ ...animal, porte: 'GRANDE' });
      repository.ultimoQuestionario.mockResolvedValue(questionario(69));
      await expect(service.solicitar(dto, usuarioAdotante)).rejects.toThrow(
        UnprocessableEntityException,
      );

      repository.ultimoQuestionario.mockResolvedValue(questionario(70));
      await expect(service.solicitar(dto, usuarioAdotante)).resolves.toBeDefined();
    });

    it('limita em 2 adoções ativas por adotante', async () => {
      repository.contarAtivasDoAdotante.mockResolvedValue(2);
      await expect(service.solicitar(dto, usuarioAdotante)).rejects.toThrow(ConflictException);
    });

    it('não cria se outro pedido reservou o animal antes', async () => {
      repository.reservarAnimal.mockResolvedValue(false);
      await expect(service.solicitar(dto, usuarioAdotante)).rejects.toThrow(ConflictException);
      expect(repository.criar).not.toHaveBeenCalled();
    });
  });

  describe('aprovar', () => {
    const adocao = (status: string) => ({
      id: 'adocao-1',
      status,
      animalId: 'animal-1',
      animal,
      adotante,
    });

    it('só aprova com visita realizada', async () => {
      repository.buscarPorId.mockResolvedValue(adocao('EM_ANALISE'));
      repository.contarVisitasRealizadas.mockResolvedValue(0);
      await expect(service.aprovar('adocao-1', ong)).rejects.toThrow(ConflictException);
      expect(repository.atualizarStatus).not.toHaveBeenCalled();
    });

    it('aprova, marca o animal como adotado e rejeita as outras solicitações', async () => {
      repository.buscarPorId.mockResolvedValue(adocao('EM_ANALISE'));
      repository.contarVisitasRealizadas.mockResolvedValue(1);
      await service.aprovar('adocao-1', ong);
      expect(repository.atualizarStatus).toHaveBeenCalled();
      expect(repository.atualizarStatusAnimal).toHaveBeenCalledWith('animal-1', 'ADOTADO', {});
      expect(repository.rejeitarOutrasEmAnalise).toHaveBeenCalledWith('animal-1', 'adocao-1', {});
    });

    it('não aprova uma adoção que já terminou', async () => {
      repository.buscarPorId.mockResolvedValue(adocao('CONCLUIDA'));
      await expect(service.aprovar('adocao-1', ong)).rejects.toThrow(ConflictException);
    });

    it('não deixa outra ONG aprovar', async () => {
      repository.buscarPorId.mockResolvedValue(adocao('EM_ANALISE'));
      await expect(
        service.aprovar('adocao-1', { ...ong, ongId: 'ong-2' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('concluir', () => {
    it('cria os acompanhamentos de 30 e 90 dias', async () => {
      repository.buscarPorId.mockResolvedValue({
        id: 'adocao-1',
        status: 'APROVADA',
        animalId: 'animal-1',
        animal,
        adotante,
      });
      await service.concluir('adocao-1', ong);
      expect(repository.criarAcompanhamentos).toHaveBeenCalledWith('adocao-1', expect.any(Date), {});
    });
  });
});
