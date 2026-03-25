import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateTaskDto) {
        return await this.prisma.task.create({
            data: {
                name: data.name,
                description: data.description,
                importanceLevel: data.importanceLevel,
                chatId: data.chatId as any,
            },
        });
    }

    async findAll() {
        return await this.prisma.task.findMany();
    }

    async findByChatId(chatId: number) {
        return await this.prisma.task.findMany({
            where: { chatId: chatId as any },
        });
    }

    async findOne(id: string) {
        return await this.prisma.task.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: UpdateTaskDto) {
        const { chatId, ...rest } = data;
        return await this.prisma.task.update({
            where: { id },
            data: {
                ...rest,
                name: (data as any).name,
                chatId: chatId ? (chatId as any) : undefined,
            },
        });
    }

    async delete(id: string) {
        return await this.prisma.task.delete({
            where: { id },
        });
    }
}