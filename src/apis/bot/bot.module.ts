import { Module } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { BotService } from './bot.service';
import { UsersService } from '../users/users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PrismaModule, ConfigModule],
    providers: [BotService, UsersService, TasksService],
    exports: [BotService],
})
export class BotModule { }