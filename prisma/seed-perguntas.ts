import { PrismaClient, CategoriaPergunta } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
    console.log('Criando seed de perguntas...');
    const dadosPerguntas = [
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
    const perguntasCriadas = [];
    for (const p of dadosPerguntas) {
        const pergunta = await prisma.pergunta.create({ data: p });
        perguntasCriadas.push(pergunta);
    }

    console.log('Gerando hash da senha padrão');
    const senhaHash = await bcrypt.hash('senha', 10);

    console.log('Criando usuário ADMIN...');
    await prisma.usuario.create({
        data: {
            email: 'admin@teste.com',
            senha: senhaHash,
            perfil: 'ADMIN'
        }
    });

    console.log('Criando usuário ONG...');
    await prisma.usuario.create({
        data: {
            email: 'ong@teste.com',
            senha: senhaHash,
            perfil: 'ONG'
        }
    });

    console.log('Criando seed de adotantes, usuários ADOTANTE e questionários...');
    for (let i = 1; i <= 3; i++) {

        const adotante = await prisma.adotante.create({
            data: {
                nome: `Adotante Teste ${i}`,
                cpf: `1112223334${i}`,
                telefone: `99988877${i}`,
                usuario: {
                    create: {
                        email: `adotante${i}@teste.com`,
                        senha: senhaHash,
                        perfil: 'ADOTANTE'
                    }
                }
            }
        });

        const respostasParaCriar = perguntasCriadas.map(p => ({
            perguntaId: p.id,
            valor: Math.floor(Math.random() * 5) + 1
        }));

        let pontuacaoAbsoluta = 0;
        let pontuacaoMaxima = 0;
        perguntasCriadas.forEach((p, index) => {
            pontuacaoAbsoluta += respostasParaCriar[index].valor * p.peso;
            pontuacaoMaxima += 5 * p.peso;
        });
        const pontuacaoFinal = Math.round((pontuacaoAbsoluta / pontuacaoMaxima) * 100);

        await prisma.questionario.create({
            data: {
                adotanteId: adotante.id,
                pontuacao: pontuacaoFinal,
                respostas: {
                    create: respostasParaCriar
                }
            }
        });

        await prisma.adotante.update({
            where: { id: adotante.id },
            data: { pontuacaoQuestionario: pontuacaoFinal }
        });
    }

    console.log('Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });