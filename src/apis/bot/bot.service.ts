import { Injectable, NotFoundException } from '@nestjs/common'
import { config } from "dotenv"
import { Bot, InlineKeyboard } from 'grammy'
import { UsersService } from '../users/users.service'
import { CreateUserDto } from '../users/dto'
config()

@Injectable()
export class BotService {
    private bot: Bot
    private token: any
    private steps = new Map()
    private userData :CreateUserDto = {name: '', surname: '', phone: '', chatId: 0}
    constructor(
        private readonly userService: UsersService
    ) {
        this.token = process.env.BOT_TOKEN
        if (!this.token) throw new NotFoundException("Bot token does not exists")
        this.bot = new Bot(this.token)
    }

    async onModuleInit() {
        this.bot.command('start', (ctx) => {
            const keyboard = new InlineKeyboard().text("Ro'yhatdan o'tish", 'register')
            ctx.reply("Salom bizni botimizga xush kelibsiz", { reply_markup: keyboard })
        })
        this.bot.callbackQuery('register', ctx => {
            this.steps.set('step', 'name')
            ctx.reply("Iltimos ismingizni kiriting:")
        })
        this.bot.on("message:text", async ctx => {
            const step = this.steps.get('step')
            if (!step) return ctx.reply("Invalid message")
            if (step == 'name') {
                this.userData['name'] = ctx.message.text
                this.steps.set('step', 'surname')
                ctx.reply("Iltimos familiyangizni kiriting:")
            } else if (step == 'surname') {
                this.userData['surname'] = ctx.message.text
                this.steps.set('step', 'phone')
                ctx.reply("Iltimos telefon raqamingizni kiriting:")
            } else if (step == 'phone') {
                this.userData['phone'] = ctx.message.text
                this.userData['chatId'] = ctx.chatId
                this.steps.clear()
                const data = await this.userService.create(this.userData)
                const message = `Siz muvaffaqiyatli ro'yhatdan o'tdingiz. Sizning ma'lumotlaringiz: 
ism: ${data.name}
familiya: ${data.surname},
telefon: ${data.phone},`
                ctx.reply(message)
            }

        })
        this.bot.start()
    }

}