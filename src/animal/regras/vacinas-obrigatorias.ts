export const IDADE_MINIMA_MESES = 6;

export const VACINAS_OBRIGATORIAS: Record<string, string[]> = {
  cao: ['V10', 'antirrábica'],
  gato: ['V4', 'antirrábica'],
};

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function vacinasObrigatorias(especie: string): string[] {
  const chave = normalizar(especie);
  return VACINAS_OBRIGATORIAS[chave === 'cachorro' ? 'cao' : chave] ?? [];
}