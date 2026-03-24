import { Module } from '@nestjs/common';

import { BotService } from './bot.service';
import { UsersService } from '../users/users.service';

@Module({
    providers: [BotService, UsersService],
    exports: [BotService],
})
export class BotModule { }