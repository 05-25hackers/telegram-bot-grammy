import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }


    async findAll() { }
    async create(data: CreateUserDto) { 
        return await this.prisma.user.create({
            data: {
                ...data
            }
        })
    }
    async update() { }
    async findOne() { }
    async delete() { }
}
