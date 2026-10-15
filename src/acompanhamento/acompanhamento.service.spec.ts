import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Perfil } from '@prisma/client';
import { vi } from 'vitest';
import { AcompanhamentoRepository } from './acompanhamento.repository.js';
import { AcompanhamentoService } from './acompanhamento.service.js';

const ong = { id: 'ong-user', perfil: Perfil.ONG, ongId: 'ong-1' };

describe('AcompanhamentoService', () => {
  let service: AcompanhamentoService;
  const repository = {
    buscarVencidos: vi.fn(),
    marcarAtrasados: vi.fn(),
    buscarAdocao: vi.fn(),
    buscarPorTipo: vi.fn(),
    buscarPorId: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    contarVencidosDoAdotante: vi.fn(),
    desbloquearAdotante: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AcompanhamentoService,
        { provide: AcompanhamentoRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(AcompanhamentoService);
  });

  describe('marcarVencidos', () => {
    it('não faz nada quando não tem vencido', async () => {
      repository.buscarVencidos.mockResolvedValue([]);
      expect(await service.marcarVencidos()).toBe(0);
      expect(repository.marcarAtrasados).not.toHaveBeenCalled();
    });

    it('marca os vencidos e bloqueia cada adotante uma vez só', async () => {
      repository.buscarVencidos.mockResolvedValue([
        { id: 'a1', adocao: { adotanteId: 'ad-1' } },
        { id: 'a2', adocao: { adotanteId: 'ad-1' } },
        { id: 'a3', adocao: { adotanteId: 'ad-2' } },
      ]);
      expect(await service.marcarVencidos()).toBe(3);
      expect(repository.marcarAtrasados).toHaveBeenCalledWith(['a1', 'a2', 'a3'], ['ad-1', 'ad-2']);
    });
  });

  describe('criar', () => {
    it('só cria para adoção concluída', async () => {
      repository.buscarAdocao.mockResolvedValue({
        id: 'adocao-1',
        status: 'APROVADA',
        dataConclusao: null,
        animal: { ongId: 'ong-1' },
      });
      await expect(
        service.criar({ adocaoId: 'adocao-1', tipo: 'DIAS_30' }, ong),
      ).rejects.toThrow(ConflictException);
    });

    it('calcula a data prevista a partir da conclusão', async () => {
      const dataConclusao = new Date('2026-01-01T12:00:00Z');
      repository.buscarAdocao.mockResolvedValue({
        id: 'adocao-1',
        status: 'CONCLUIDA',
        dataConclusao,
        animal: { ongId: 'ong-1' },
      });
      repository.buscarPorTipo.mockResolvedValue(null);

      await service.criar({ adocaoId: 'adocao-1', tipo: 'DIAS_90' }, ong);

      const { dataPrevista } = repository.criar.mock.calls[0][0];
      const dias = Math.round((dataPrevista.getTime() - dataConclusao.getTime()) / 86400000);
      expect(dias).toBe(90);
    });
  });

  describe('registrar', () => {
    const acompanhamento = {
      id: 'a1',
      status: 'ATRASADO',
      adocao: { adotanteId: 'ad-1', animal: { ongId: 'ong-1' } },
    };

    it('desbloqueia o adotante quando era o último atrasado', async () => {
      repository.buscarPorId.mockResolvedValue(acompanhamento);
      repository.contarVencidosDoAdotante.mockResolvedValue(0);
      await service.registrar('a1', {}, ong);
      expect(repository.desbloquearAdotante).toHaveBeenCalledWith('ad-1');
    });

    it('mantém o bloqueio se ainda tem atrasado', async () => {
      repository.buscarPorId.mockResolvedValue(acompanhamento);
      repository.contarVencidosDoAdotante.mockResolvedValue(1);
      await service.registrar('a1', {}, ong);
      expect(repository.desbloquearAdotante).not.toHaveBeenCalled();
    });

    it('não registra duas vezes', async () => {
      repository.buscarPorId.mockResolvedValue({ ...acompanhamento, status: 'REALIZADO' });
      await expect(service.registrar('a1', {}, ong)).rejects.toThrow(ConflictException);
    });
  });
});
