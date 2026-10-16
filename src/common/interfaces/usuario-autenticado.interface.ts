import type { Perfil } from '@prisma/client';

export interface UsuarioAutenticado {
  id: string;
  perfil: Perfil;
  ongId: string | null;
}
