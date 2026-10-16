import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

// pode rodar mais de uma vez: usa id fixo ou campo único
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
    { id: id(10), nome: 'Rex', porte: 'GRANDE', status: 'DISPONIVEL', idadeMeses: 24 },
    { id: id(11), nome: 'Mel', porte: 'PEQUENO', status: 'DISPONIVEL', idadeMeses: 24 },
    { id: id(12), nome: 'Thor', porte: 'MEDIO', status: 'EM_PROCESSO', idadeMeses: 24 },
    { id: id(13), nome: 'Luna', porte: 'MEDIO', status: 'ADOTADO', idadeMeses: 24 },
    { id: id(14), nome: 'Bolt', porte: 'PEQUENO', status: 'ADOTADO', idadeMeses: 24 },
    { id: id(15), nome: 'Nina', porte: 'GRANDE', status: 'DISPONIVEL', idadeMeses: 24 },
    { id: id(16), nome: 'Pipoca', porte: 'PEQUENO', status: 'DISPONIVEL', idadeMeses: 3 },
    { id: id(17), nome: 'Fred', porte: 'MEDIO', status: 'DISPONIVEL', idadeMeses: 24 },
  ] as const;
  for (const a of animais) {
    await prisma.animal.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, especie: 'Cachorro', castrado: true, ongId: ong.id, abrigoId: abrigo.id },
    });
  }

  // Pipoca (filhote) e Fred (sem vacina) ficam de fora pra mostrar a regra de saúde
  const comVacina = animais.filter((a) => a.id !== id(16) && a.id !== id(17));
  for (const [i, a] of comVacina.entries()) {
    await prisma.registroSaude.upsert({
      where: { id: id(60 + i) },
      update: {},
      create: { id: id(60 + i), tipo: 'VACINA', descricao: 'V10 e Antirrábica', data: diasAtras(90), animalId: a.id },
    });
  }

  // Ana (pontuação alta), Bruno (média) e Carla (acompanhamento atrasado)
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

  // Ana e Thor: em análise, com visita realizada
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

  // Ana e Bolt: adoção de 80 dias atrás
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

  // Carla e Luna: acompanhamento de 30 dias atrasado
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

  // adoções encerradas
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
