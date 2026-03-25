import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import "dotenv/config";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL')

    if(!connectionString) throw new Error("DATABASE_URL topilmadi!")

    const pool = new Pool({
      connectionString: connectionString,
    });
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    try{
      await this.$connect()
    }catch(error){
      console.log("Prisma ulanishda Xatolik: ", error.message)
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
