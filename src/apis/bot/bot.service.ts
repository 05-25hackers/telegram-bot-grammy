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
            const keyboard = new InlineKeyboard().text("guruh haqida", 'me')
            ctx.reply("Salom bizni botimizga xush kelibsiz", {reply_markup: keyboard})
        })

        this.bot.callbackQuery('me', async ctx => {
            const ismlar = {
            }
            let kb = new InlineKeyboard().text("O'tkirbek", 'student1').text("Shodiyor", 'student2').text("Javohir", 'student3')
            for(let ism in ismlar) {
                kb.text(ismlar[ism], ism).row()

            }
            ctx.reply("O'tkirbek ham kuchayib ketdi", {reply_markup: kb})
        })

        this.bot.callbackQuery('student1', async ctx => {
            ctx.reply("Usmonaliyev O'tkirbek")
        })


        this.bot.callbackQuery('student2', async ctx => {
            ctx.reply("Erkinov Shodiyor")
        })


        this.bot.callbackQuery('student3', async ctx => {
            ctx.reply("Nuraliyev Javohir")
        })

        this.bot.on('message:text', async ctx => {
            ctx.reply(ctx.message.text)
        })

        this.bot.start()
    }

}