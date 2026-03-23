import { NotFoundException } from '@nestjs/common'
import { config } from "dotenv"
import { Bot, InlineKeyboard } from 'grammy'
config()

export class BotService {
    private bot: Bot
    private token: any
    constructor(

    ) {
        this.token = process.env.BOT_TOKEN
        if (!this.token) throw new NotFoundException("Bot token does not exists")
        this.bot = new Bot(this.token)
    }

    async onModuleInit() {
        this.bot.command('start', (ctx) => {
            const keyboard = new InlineKeyboard().text("men haqimda", 'me')
            ctx.reply("Salom bizni botimizga xush kelibsiz", {reply_markup: keyboard})
        })

        this.bot.callbackQuery('me', async ctx => {

            ctx.reply("O'tkirbek ham kuchayib ketdi")
        })

        this.bot.on('message:text', async ctx => {
            ctx.reply(ctx.message.text)
        })

        this.bot.start()
    }

}