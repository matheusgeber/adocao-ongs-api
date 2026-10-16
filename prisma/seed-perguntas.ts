import { PrismaClient, CategoriaPergunta } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Criando seed de perguntas...');
    const perguntas = [
        { texto: 'Mora em casa ou apartamento?', categoria: CategoriaPergunta.ESPACO, peso: 2 },
        { texto: 'Possui redes de proteção nas janelas?', categoria: CategoriaPergunta.ESPACO, peso: 5 },
        { texto: 'O local possui quintal murado?', categoria: CategoriaPergunta.ESPACO, peso: 3 },
        { texto: 'Quantas horas por dia o animal ficará sozinho?', categoria: CategoriaPergunta.ROTINA, peso: 4 },
        { texto: 'Quem será o principal responsável pelos passeios e alimentação?', categoria: CategoriaPergunta.ROTINA, peso: 3 },
        { texto: 'Todos os moradores da casa estão de acordo com a adoção?', categoria: CategoriaPergunta.ROTINA, peso: 5 },
        { texto: 'Possui condições financeiras para arcar com ração de qualidade e imprevistos veterinários?', categoria: CategoriaPergunta.ROTINA, peso: 5 },
        { texto: 'Já teve outros animais de estimação antes?', categoria: CategoriaPergunta.EXPERIENCIA, peso: 3 },
        { texto: 'O que fará com o animal em caso de viagem ou mudança de casa?', categoria: CategoriaPergunta.EXPERIENCIA, peso: 5 },
        { texto: 'Como planeia fazer a adaptação do novo animal?', categoria: CategoriaPergunta.EXPERIENCIA, peso: 4 },
    ];

    for (const p of perguntas) {
        await prisma.pergunta.create({ data: p });
    }

    console.log('Seed de perguntas concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });