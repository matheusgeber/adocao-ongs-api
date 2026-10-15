import { TipoAcompanhamento } from '@prisma/client';

export const DIAS_POR_TIPO: Record<TipoAcompanhamento, number> = {
  DIAS_30: 30,
  DIAS_90: 90,
};

export function somarDias(data: Date, dias: number) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}
