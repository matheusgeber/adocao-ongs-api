import { SetMetadata } from '@nestjs/common';
import type { Perfil } from '@prisma/client';

export const ROLES_KEY = 'perfis';
export const Roles = (...perfis: Perfil[]) => SetMetadata(ROLES_KEY, perfis);

export const PUBLICO_KEY = 'publico';
export const Publico = () => SetMetadata(PUBLICO_KEY, true);
