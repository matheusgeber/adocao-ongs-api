import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdotanteRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.AdotanteUncheckedCreateInput) {
        return this.prisma.adotante.create({ data });
    }

    async findMany(skip?: number, take?: number, where?: Prisma.AdotanteWhereInput) {
        return this.prisma.adotante.findMany({ skip, take, where });
    }

    async findById(id: string) {
        return this.prisma.adotante.findUnique({ where: { id } });
    }

    async update(id: string, data: Prisma.AdotanteUpdateInput) {
        return this.prisma.adotante.update({ where: { id }, data });
    }

    async delete(id: string) {
        return this.prisma.adotante.delete({ where: { id } });
    }

    async count(where?: Prisma.AdotanteWhereInput) {
        return this.prisma.adotante.count({ where });
    }
}