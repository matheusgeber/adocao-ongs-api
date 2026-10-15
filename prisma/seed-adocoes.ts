import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

// Dados pra demonstrar adoções, visitas e acompanhamentos.
// Pode rodar mais de uma vez: tudo usa id fixo ou campo único.
const prisma = new PrismaClient();

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const diasAtras = (dias: number) => new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
const diasDepois = (dias: number) => diasAtras(-dias);

async function usuario(email: string, perfil: 'ADMIN' | 'ONG' | 'VOLUNTARIO' | 'ADOTANTE', senha: string, ongId?: string) {
  return prisma.usuario.upsert({
    where: { email },
    update: {},
    create: { email, perfil, senha: await bcrypt.hash(senha, 10), ongId },
  });
}

async function main() {
  const senha = 'Senha@123';

  await usuario('admin@adocao.local', 'ADMIN', senha);
  const usuarioOng = await usuario('ong@adocao.local', 'ONG', senha);

  const ong = await prisma.ong.upsert({
    where: { cnpj: '12345678000190' },
    update: {},
    create: {
      nome: 'ONG Patas Amigas',
      cnpj: '12345678000190',
      telefone: '21999990000',
      cidade: 'Rio de Janeiro',
      usuarioId: usuarioOng.id,
    },
  });

  const voluntario = await usuario('voluntario@adocao.local', 'VOLUNTARIO', senha, ong.id);

  const abrigo = await prisma.abrigo.upsert({
    where: { id: id(1) },
    update: {},
    create: { id: id(1), nome: 'Abrigo Central', cidade: 'Rio de Janeiro', capacidade: 20, ongId: ong.id },
  });

  const animais = [
    { id: id(10), nome: 'Rex', porte: 'GRANDE', status: 'DISPONIVEL' },
    { id: id(11), nome: 'Mel', porte: 'PEQUENO', status: 'DISPONIVEL' },
    { id: id(12), nome: 'Thor', porte: 'MEDIO', status: 'EM_PROCESSO' },
    { id: id(13), nome: 'Luna', porte: 'MEDIO', status: 'ADOTADO' },
    { id: id(14), nome: 'Bolt', porte: 'PEQUENO', status: 'ADOTADO' },
    { id: id(15), nome: 'Nina', porte: 'GRANDE', status: 'DISPONIVEL' },
  ] as const;
  for (const a of animais) {
    await prisma.animal.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, especie: 'Cachorro', idadeMeses: 24, castrado: true, ongId: ong.id, abrigoId: abrigo.id },
    });
  }

  // adotantes: Ana (pontuação alta), Bruno (pontuação média) e Carla (tem acompanhamento atrasado)
  const adotantes = [
    { n: 20, nome: 'Ana Souza', cpf: '11111111111', email: 'ana@adocao.local', pontos: 85 },
    { n: 21, nome: 'Bruno Lima', cpf: '22222222222', email: 'bruno@adocao.local', pontos: 45 },
    { n: 22, nome: 'Carla Dias', cpf: '33333333333', email: 'carla@adocao.local', pontos: 70 },
  ];
  for (const a of adotantes) {
    const u = await usuario(a.email, 'ADOTANTE', senha);
    await prisma.adotante.upsert({
      where: { cpf: a.cpf },
      update: {},
      create: { id: id(a.n), nome: a.nome, cpf: a.cpf, telefone: '21988887777', pontuacaoQuestionario: a.pontos, usuarioId: u.id },
    });
    await prisma.questionario.upsert({
      where: { id: id(a.n + 10) },
      update: {},
      create: { id: id(a.n + 10), pontuacao: a.pontos, dataResposta: diasAtras(20), adotanteId: id(a.n) },
    });
  }

  // Ana quer o Thor: em análise, já com visita realizada (dá pra aprovar na hora)
  await prisma.adocao.upsert({
    where: { id: id(30) },
    update: {},
    create: { id: id(30), status: 'EM_ANALISE', adotanteId: id(20), animalId: id(12) },
  });
  await prisma.visita.upsert({
    where: { id: id(40) },
    update: {},
    create: {
      id: id(40),
      dataAgendada: diasAtras(2),
      status: 'REALIZADA',
      observacao: 'Casa com quintal, família tranquila com o Thor.',
      adocaoId: id(30),
      voluntarioId: voluntario.id,
    },
  });

  // Ana adotou o Bolt há 80 dias: 30 dias feito, 90 dias vence em 10 dias
  await prisma.adocao.upsert({
    where: { id: id(31) },
    update: {},
    create: {
      id: id(31),
      status: 'CONCLUIDA',
      dataSolicitacao: diasAtras(100),
      dataAprovacao: diasAtras(85),
      dataConclusao: diasAtras(80),
      adotanteId: id(20),
      animalId: id(14),
    },
  });
  await prisma.acompanhamento.upsert({
    where: { id: id(50) },
    update: {},
    create: { id: id(50), tipo: 'DIAS_30', dataPrevista: diasAtras(50), dataRealizada: diasAtras(49), status: 'REALIZADO', observacao: 'Bolt está bem adaptado.', adocaoId: id(31) },
  });
  await prisma.acompanhamento.upsert({
    where: { id: id(51) },
    update: {},
    create: { id: id(51), tipo: 'DIAS_90', dataPrevista: diasDepois(10), adocaoId: id(31) },
  });

  // Carla adotou a Luna há 40 dias e ninguém registrou o acompanhamento de 30 dias (atrasado)
  await prisma.adocao.upsert({
    where: { id: id(32) },
    update: {},
    create: {
      id: id(32),
      status: 'CONCLUIDA',
      dataSolicitacao: diasAtras(60),
      dataAprovacao: diasAtras(45),
      dataConclusao: diasAtras(40),
      adotanteId: id(22),
      animalId: id(13),
    },
  });
  await prisma.acompanhamento.upsert({
    where: { id: id(52) },
    update: {},
    create: { id: id(52), tipo: 'DIAS_30', dataPrevista: diasAtras(10), adocaoId: id(32) },
  });
  await prisma.acompanhamento.upsert({
    where: { id: id(53) },
    update: {},
    create: { id: id(53), tipo: 'DIAS_90', dataPrevista: diasDepois(50), adocaoId: id(32) },
  });

  // exemplos de adoções encerradas
  await prisma.adocao.upsert({
    where: { id: id(33) },
    update: {},
    create: { id: id(33), status: 'CANCELADA', adotanteId: id(21), animalId: id(15) },
  });
  await prisma.adocao.upsert({
    where: { id: id(34) },
    update: {},
    create: { id: id(34), status: 'REJEITADA', adotanteId: id(20), animalId: id(15) },
  });
}

main()
  .then(() => console.log('Seed de adoções concluído'))
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
