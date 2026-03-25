import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [TasksService, PrismaService],
  controllers: [TasksController]
})
export class TasksModule {}
