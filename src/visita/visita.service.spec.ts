import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Perfil } from '@prisma/client';
import { vi } from 'vitest';
import { VisitaRepository } from './visita.repository.js';
import { VisitaService } from './visita.service.js';

const ong = { id: 'ong-user', perfil: Perfil.ONG, ongId: 'ong-1' };
const voluntario = { id: 'vol-1', perfil: Perfil.VOLUNTARIO, ongId: 'ong-1' };
const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

describe('VisitaService', () => {
  let service: VisitaService;
  const repository = {
    buscarAdocao: vi.fn(),
    buscarVoluntario: vi.fn(),
    buscarPorId: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    repository.buscarAdocao.mockResolvedValue({
      id: 'adocao-1',
      status: 'EM_ANALISE',
      animal: { ongId: 'ong-1' },
    });
    repository.buscarVoluntario.mockResolvedValue({
      id: 'vol-1',
      perfil: Perfil.VOLUNTARIO,
      ativo: true,
      ongId: 'ong-1',
    });

    const module = await Test.createTestingModule({
      providers: [VisitaService, { provide: VisitaRepository, useValue: repository }],
    }).compile();
    service = module.get(VisitaService);
  });

  describe('agendar', () => {
    const dto = { adocaoId: 'adocao-1', voluntarioId: 'vol-1', dataAgendada: amanha };

    it('agenda uma visita futura com voluntário da ONG', async () => {
      await service.agendar(dto, ong);
      expect(repository.criar).toHaveBeenCalledWith('adocao-1', 'vol-1', expect.any(Date));
    });

    it('só agenda para adoção em análise', async () => {
      repository.buscarAdocao.mockResolvedValue({
        id: 'adocao-1',
        status: 'CONCLUIDA',
        animal: { ongId: 'ong-1' },
      });
      await expect(service.agendar(dto, ong)).rejects.toThrow(ConflictException);
    });

    it('não aceita voluntário de outra ONG', async () => {
      repository.buscarVoluntario.mockResolvedValue({
        id: 'vol-1',
        perfil: Perfil.VOLUNTARIO,
        ativo: true,
        ongId: 'ong-2',
      });
      await expect(service.agendar(dto, ong)).rejects.toThrow(BadRequestException);
    });

    it('não aceita data no passado', async () => {
      await expect(
        service.agendar({ ...dto, dataAgendada: '2020-01-01T10:00:00Z' }, ong),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('realizar', () => {
    it('só o voluntário da visita pode registrar', async () => {
      repository.buscarPorId.mockResolvedValue({ id: 'v1', voluntarioId: 'outro', status: 'AGENDADA' });
      await expect(service.realizar('v1', { observacao: 'ok' }, voluntario)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('não registra duas vezes', async () => {
      repository.buscarPorId.mockResolvedValue({ id: 'v1', voluntarioId: 'vol-1', status: 'REALIZADA' });
      await expect(service.realizar('v1', { observacao: 'ok' }, voluntario)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
