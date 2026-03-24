import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './apis/bot/bot.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './apis/users/users.module';
import { UsersService } from './apis/users/users.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    BotModule,
    UsersModule,
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService, UsersService],
})
export class AppModule { }
