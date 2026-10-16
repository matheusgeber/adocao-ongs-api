import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SENHA_PADRAO = 'Senha@123';

async function usuario(email: string, perfil: 'ADMIN' | 'ONG' | 'VOLUNTARIO', ongId?: string) {
  const senha = await bcrypt.hash(SENHA_PADRAO, 10);
  return prisma.usuario.upsert({
    where: { email },
    update: {},
    create: { email, senha, perfil, ongId },
  });
}

async function ong(
  dados: { nome: string; cnpj: string; telefone: string; cidade: string },
  email: string,
) {
  const dono = await usuario(email, 'ONG');
  return prisma.ong.upsert({
    where: { cnpj: dados.cnpj },
    update: {},
    create: { ...dados, usuarioId: dono.id },
  });
}

async function main() {
  await usuario('admin@adocao.local', 'ADMIN');

  const patasAmigas = await ong(
    { nome: 'ONG Patas Amigas', cnpj: '12345678000190', telefone: '21999990000', cidade: 'Rio de Janeiro' },
    'ong@adocao.local',
  );
  await ong(
    { nome: 'ONG Focinhos do Bem', cnpj: '98765432000110', telefone: '21988880000', cidade: 'Niterói' },
    'ong2@adocao.local',
  );

  await usuario('voluntario@adocao.local', 'VOLUNTARIO', patasAmigas.id);

  console.log('Seed de usuários e ONGs concluído');
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
