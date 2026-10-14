/*
  Warnings:

  - You are about to drop the column `vistoria30DiasRealizada` on the `Adocao` table. All the data in the column will be lost.
  - You are about to drop the column `vistoria90DiasRealizada` on the `Adocao` table. All the data in the column will be lost.
  - You are about to drop the column `disponivel` on the `Animal` table. All the data in the column will be lost.
  - Added the required column `cidade` to the `Ong` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusAnimal" AS ENUM ('DISPONIVEL', 'EM_PROCESSO', 'ADOTADO');

-- CreateEnum
CREATE TYPE "TipoRegistroSaude" AS ENUM ('VACINA', 'CASTRACAO', 'CONSULTA');

-- CreateEnum
CREATE TYPE "CategoriaPergunta" AS ENUM ('ESPACO', 'ROTINA', 'EXPERIENCIA');

-- CreateEnum
CREATE TYPE "TipoAcompanhamento" AS ENUM ('DIAS_30', 'DIAS_90');

-- AlterEnum
ALTER TYPE "StatusAdocao" ADD VALUE 'CANCELADA';

-- AlterTable
ALTER TABLE "Adocao" DROP COLUMN "vistoria30DiasRealizada",
DROP COLUMN "vistoria90DiasRealizada",
ADD COLUMN     "dataAprovacao" TIMESTAMP(3),
ADD COLUMN     "dataConclusao" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Animal" DROP COLUMN "disponivel",
ADD COLUMN     "abrigoId" TEXT,
ADD COLUMN     "castrado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "StatusAnimal" NOT NULL DEFAULT 'DISPONIVEL';

-- AlterTable
ALTER TABLE "Ong" ADD COLUMN     "cidade" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "bloqueadoAte" TIMESTAMP(3),
ADD COLUMN     "ongId" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "tentativasLogin" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Abrigo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "ongId" TEXT NOT NULL,

    CONSTRAINT "Abrigo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroSaude" (
    "id" TEXT NOT NULL,
    "tipo" "TipoRegistroSaude" NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "animalId" TEXT NOT NULL,

    CONSTRAINT "RegistroSaude_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pergunta" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "categoria" "CategoriaPergunta" NOT NULL,
    "peso" INTEGER NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Pergunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questionario" (
    "id" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "dataResposta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisado" BOOLEAN NOT NULL DEFAULT false,
    "observacaoOng" TEXT,
    "adotanteId" TEXT NOT NULL,

    CONSTRAINT "Questionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resposta" (
    "id" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "questionarioId" TEXT NOT NULL,
    "perguntaId" TEXT NOT NULL,

    CONSTRAINT "Resposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visita" (
    "id" TEXT NOT NULL,
    "dataAgendada" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGENDADA',
    "observacao" TEXT,
    "adocaoId" TEXT NOT NULL,
    "voluntarioId" TEXT NOT NULL,

    CONSTRAINT "Visita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acompanhamento" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAcompanhamento" NOT NULL,
    "dataPrevista" TIMESTAMP(3) NOT NULL,
    "dataRealizada" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "adocaoId" TEXT NOT NULL,

    CONSTRAINT "Acompanhamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_ongId_fkey" FOREIGN KEY ("ongId") REFERENCES "Ong"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abrigo" ADD CONSTRAINT "Abrigo_ongId_fkey" FOREIGN KEY ("ongId") REFERENCES "Ong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_abrigoId_fkey" FOREIGN KEY ("abrigoId") REFERENCES "Abrigo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroSaude" ADD CONSTRAINT "RegistroSaude_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questionario" ADD CONSTRAINT "Questionario_adotanteId_fkey" FOREIGN KEY ("adotanteId") REFERENCES "Adotante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_questionarioId_fkey" FOREIGN KEY ("questionarioId") REFERENCES "Questionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "Pergunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_adocaoId_fkey" FOREIGN KEY ("adocaoId") REFERENCES "Adocao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acompanhamento" ADD CONSTRAINT "Acompanhamento_adocaoId_fkey" FOREIGN KEY ("adocaoId") REFERENCES "Adocao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
