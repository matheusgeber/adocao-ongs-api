import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionariosRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.QuestionarioUncheckedCreateInput) {
        return this.prisma.questionario.create({ data });
    }

    async findMany(skip?: number, take?: number, where?: Prisma.QuestionarioWhereInput) {
        return this.prisma.questionario.findMany({
            skip,
            take,
            where,
            include: { respostas: true }
        });
    }

    async count(where?: Prisma.QuestionarioWhereInput) {
        return this.prisma.questionario.count({ where });
    }

    async findById(id: string) {
        return this.prisma.questionario.findUnique({
            where: { id },
            include: { respostas: true }
        });
    }

    async update(id: string, data: Prisma.QuestionarioUpdateInput) {
        return this.prisma.questionario.update({ where: { id }, data });
    }

    async delete(id: string) {
        return this.prisma.questionario.delete({ where: { id } });
    }
}