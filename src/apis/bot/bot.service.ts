import { Injectable, NotFoundException } from '@nestjs/common'
import { config } from "dotenv"
import { Bot, InlineKeyboard } from 'grammy'
import { CreateUserDto } from '../users/dto'
import { UsersService } from '../users/users.service'
import { TasksService } from '../tasks/tasks.service'
import { ConfigService } from '@nestjs/config'
config()

@Injectable()
export class BotService {
    private bot: Bot
    private token: any
    private steps = new Map<number, string>()
    private userData = new Map<number, CreateUserDto>()
    constructor(
        private readonly userService: UsersService,
        private readonly tasksService: TasksService,
        private readonly configService: ConfigService,

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

        this.bot.command('users', async (ctx) => {
            const users = await this.userService.findAll();
            if (users.length === 0) {
                ctx.reply("Hech qanday foydalanuvchi topilmadi.");
            } else {
                const userList = users.map(user => `
Ism: ${user.name}
Familiya: ${user.surname || 'Noma\'lum'}
Telefon: ${user.phone}`).join('\n');
                ctx.reply(`Barcha foydalanuvchilar:\n${userList}`);
            }
        })
        this.bot.command('mi', async (ctx) => {
            const user = await this.userService.findByChatId(ctx.chatId);
            if (!user) {
                ctx.reply("Siz ro'yhatdan o'tmagansiz.");
            } else {
                const message = `Sizning ma'lumotlaringiz:\nID: ${user.id}\nIsm: ${user.name}\nFamiliya: ${user.surname || 'Noma\'lum'}\nTelefon: ${user.phone}`;
                ctx.reply(message);
            }
        })
        this.bot.callbackQuery('register', ctx => {
            const chatId = ctx.chatId
            if (!chatId) throw new Error("Xatolik chiqdi")

            this.steps.set(chatId, 'name')
            this.userData.set(chatId, { name: '', surname: '', phone: '', chatId })

            ctx.reply("Iltimos ismingizni kiriting:")
        })
        this.bot.on("message:text", async ctx => {
            const chatId = ctx.chatId

            const step = this.steps.get(chatId)
            if (!step) return ctx.reply("Invalid message")
            if (step == 'name') {
                this.userData['name'] = ctx.message.text
                this.steps.set(chatId, 'surname')
                ctx.reply("Iltimos familiyangizni kiriting:")
            } else if (step == 'surname') {
                this.userData['surname'] = ctx.message.text
                this.steps.set(chatId, 'phone')
                ctx.reply("Iltimos telefon raqamingizni kiriting:")
            } else if (step == 'phone') {
                this.userData['phone'] = ctx.message.text
                this.userData['chatId'] = ctx.chatId
                this.steps.clear()
                if (this.userData) throw new Error("Bu User allaqachin mavjud")
                const data = await this.userService.create(this.userData)
                const message = `Siz muvaffaqiyatli ro'yhatdan o'tdingiz. Sizning ma'lumotlaringiz: 
ism: ${data.name}
familiya: ${data.surname},
telefon: ${data.phone},`
                ctx.reply(message)
            }
        })

        this.bot.command('mytasks', async (ctx) => {
            const chatId = ctx.from?.id;
            if (!chatId) return;

            const tasks = await this.tasksService.findByChatId(chatId);
            if (tasks.length === 0) {
                return ctx.reply("Sizda hali vazifalar mavjud emas.");
            }

            const taskList = tasks
                .map((taskList, id) => `${id + 1}. ${taskList.name}\nDaraja: ${taskList.importanceLevel}\nIzoh: ${taskList.description || '-'}`)
                .join('\n\n');

            await ctx.reply(`Sizning vazifalaringiz:\n\n${taskList}`);
        });

        this.bot.command('add', async (ctx) => {
            const chatId = ctx.from?.id;
            if (!chatId) return;

            const taskTitle = ctx.match;
            if (!taskTitle) {
                return ctx.reply("Vazifa nomini yozing. Masalan: /add Bozorga borish");
            }

            try {
                await this.tasksService.create({
                    name: taskTitle,
                    importanceLevel: 'medium' as any,
                    chatId: chatId,
                    description: '',
                });
                await ctx.reply("Vazifa muvaffaqiyatli qo'shildi!");
            } catch (error) {
                await ctx.reply("Vazifa qo'shishda xatolik yuz berdi.");
            }
        });

        this.bot.start()
    }

}