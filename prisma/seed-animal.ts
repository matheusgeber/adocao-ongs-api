import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
 
async function main() {
    console.log('Iniciando seed');
 

    const ong = await prisma.ong.create({
        data: {
            nome: 'ONG Anjos de Patas',
            cnpj: '12345678000199',
            telefone: '21988887777',
            cidade: 'Rio de Janeiro',
            usuario: {
                create: {
                    email: 'contato@anjosdepatas.com',
                    senha: 'senha', 
                    perfil: 'ONG'
                }
            }
        }
    });
 
    
    const abrigo1 = await prisma.abrigo.create({
        data: {
            nome: 'Abrigo Esperança',
            cidade: 'Rio de Janeiro',
            capacidade: 20,
            ongId: ong.id,
        }
    });
 
    const abrigo2 = await prisma.abrigo.create({
        data: {
            nome: 'Refúgio Animal',
            cidade: 'Niterói',
            capacidade: 15,
            ongId: ong.id,
        }
    });
 
    const animaisData = [
        { nome: 'Rex', especie: 'CAO', porte: 'MEDIO', idadeMeses: 24, status: 'DISPONIVEL', abrigoId: abrigo1.id, ongId: ong.id },
        { nome: 'Miau', especie: 'GATO', porte: 'PEQUENO', idadeMeses: 12, status: 'DISPONIVEL', abrigoId: abrigo1.id, ongId: ong.id },
        { nome: 'Bolinha', especie: 'CAO', porte: 'PEQUENO', idadeMeses: 6, status: 'EM_PROCESSO', abrigoId: abrigo1.id, ongId: ong.id },
        { nome: 'Frajola', especie: 'GATO', porte: 'MEDIO', idadeMeses: 36, status: 'ADOTADO', abrigoId: abrigo1.id, ongId: ong.id },
        { nome: 'Thor', especie: 'CAO', porte: 'GRANDE', idadeMeses: 48, status: 'DISPONIVEL', abrigoId: abrigo1.id, ongId: ong.id },
        { nome: 'Luna', especie: 'GATO', porte: 'PEQUENO', idadeMeses: 5, status: 'EM_PROCESSO', abrigoId: abrigo2.id, ongId: ong.id },
        { nome: 'Max', especie: 'CAO', porte: 'GRANDE', idadeMeses: 18, status: 'ADOTADO', abrigoId: abrigo2.id, ongId: ong.id },
        { nome: 'Nina', especie: 'GATO', porte: 'PEQUENO', idadeMeses: 8, status: 'DISPONIVEL', abrigoId: abrigo2.id, ongId: ong.id },
        { nome: 'Bob', especie: 'CAO', porte: 'MEDIO', idadeMeses: 60, status: 'DISPONIVEL', abrigoId: abrigo2.id, ongId: ong.id },
        { nome: 'Mel', especie: 'GATO', porte: 'PEQUENO', idadeMeses: 10, status: 'EM_PROCESSO', abrigoId: abrigo2.id, ongId: ong.id },
    ];
 
    for (let i = 0; i < animaisData.length; i++) {
        const animal = await prisma.animal.create({
            data: animaisData[i] as any
        });
 
        if (i < animaisData.length - 1) {
            await prisma.registroSaude.createMany({
                data: [
                    {
                        animalId: animal.id,
                        tipo: 'VACINA',
                        descricao: animal.especie === 'CAO' ? 'V10 e Antirrábica' : 'V4 e Antirrábica',
                        data: new Date() 
                    },
                    {
                        animalId: animal.id,
                        tipo: 'CASTRACAO',
                        descricao: 'Castração realizada com sucesso',
                        data: new Date() 
                    }
                ] as any
            });
        }
    }
 
    console.log('Seed concluida');
}
 
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });