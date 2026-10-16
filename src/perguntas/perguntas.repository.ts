import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class PerguntasRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.PerguntaUncheckedCreateInput) {
        return this.prisma.pergunta.create({ data });
    }

    async findMany(skip?: number, take?: number, where?: Prisma.PerguntaWhereInput) {
        return this.prisma.pergunta.findMany({ skip, take, where });
    }

    async count(where?: Prisma.PerguntaWhereInput) {
        return this.prisma.pergunta.count({ where });
    }

    async findById(id: string) {
        return this.prisma.pergunta.findUnique({ where: { id } });
    }

    async update(id: string, data: Prisma.PerguntaUpdateInput) {
        return this.prisma.pergunta.update({ where: { id }, data });
    }

    async delete(id: string) {
        return this.prisma.pergunta.delete({ where: { id } });
    }
}