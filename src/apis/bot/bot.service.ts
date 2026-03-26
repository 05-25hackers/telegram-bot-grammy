import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { Bot, InlineKeyboard, Context } from 'grammy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class BotService implements OnModuleInit {
    private bot: Bot;
    private userSteps = new Map<number, string>();
    private userData = new Map<number, any>();
    private taskSteps = new Map<number, string>();
    private taskData = new Map<number, any>();

    constructor(
        private readonly userService: UsersService,
        private readonly tasksService: TasksService,
        private readonly configService: ConfigService,
    ) {
        const token = this.configService.get<string>('BOT_TOKEN');
        if (!token) {
            throw new Error("BOT_TOKEN topilmadi");
        }
        this.bot = new Bot(token);
    }

    async onModuleInit() {
        this.bot.catch((err) => {
            console.error("BOT ERROR:", err);
        });

        // START COMMAND
        this.bot.command('start', async (ctx) => {
            const chatId = ctx.chatId;
            const existingUser = await this.userService.findByChatId(chatId);

            if (existingUser) return ctx.reply(`${existingUser.name} Siz uje ro'yhat dan o'tgan siz endi task qo'shishingiz mumkin!`)

            const keyboard = new InlineKeyboard().text("Ro'yxatdan o'tish", 'register');
            await ctx.reply("Assalomu alaykum! Botdan foydalanish uchun ro'yxatdan o'ting.", { reply_markup: keyboard });
        });

        // REGISTER CALLBACK
        this.bot.callbackQuery('register', async (ctx) => {
            const chatId = ctx.chatId;
            if (!chatId) return;

            const existingUser = await this.userService.findByChatId(chatId);
            if (existingUser) return ctx.answerCallbackQuery({ text: "Siz allaqachon o'tgansiz" });

            this.userSteps.set(chatId, 'name');
            this.userData.set(chatId, { chatId });
            await ctx.reply("Ismingizni kiriting:");
            await ctx.answerCallbackQuery();
        });

        // ADD TASK COMMAND
        this.bot.command('add', async (ctx) => {
            const chatId = ctx.chatId;
            const user = await this.userService.findByChatId(chatId);

            if (!user) {
                return ctx.reply("Avval ro'yxatdan o'ting /start");
            }

            this.taskSteps.set(chatId, 'task_name');
            this.taskData.set(chatId, { chatId });
            await ctx.reply("Vazifa nomini kiriting:");
        });

        // MY INFO COMMAND
        this.bot.command('mi', async (ctx) => {
            const user = await this.userService.findByChatId(ctx.chatId);
            if (!user) return ctx.reply("Ro'yxatdan o'tilmagan.");

            await ctx.reply(`Sizning ma'lumotlaringiz:\nID: ${user.id}\nIsm: ${user.name}\nFamiliya: ${user.surname}\nTelefon: ${user.phone}`);
        });

        // MY TASKS COMMAND
        this.bot.command('mytasks', async (ctx) => {
            const tasks = await this.tasksService.findByChatId(ctx.chatId);
            if (tasks.length === 0) return ctx.reply("Vazifalar topilmadi.");

            const list = tasks.map((t, i) => `${i + 1}. ${t.name}\nDaraja: ${t.importanceLevel}\nIzoh: ${t.description}`).join('\n\n');
            await ctx.reply(list);
        });

        // ALL USERS (ADMIN)
        this.bot.command('users', async (ctx) => {
            const users = await this.userService.findAll();
            if (users.length === 0) return ctx.reply("Foydalanuvchilar yo'q.");

            const list = users.map(u => `${u.name} ${u.surname} (${u.phone})`).join('\n');
            await ctx.reply(list);
        });

        // MESSAGE HANDLER
        this.bot.on('message:text', async (ctx) => {
            const chatId = ctx.chatId;
            const text = ctx.message.text;

            // Ro'yxatdan o'tish mantiqi
            if (this.userSteps.has(chatId)) {
                const step = this.userSteps.get(chatId);
                const data = this.userData.get(chatId);

                if (step === 'name') {
                    data.name = text;
                    this.userSteps.set(chatId, 'surname');
                    return ctx.reply("Familiyangizni kiriting:");
                }

                if (step === 'surname') {
                    data.surname = text;
                    this.userSteps.set(chatId, 'phone');
                    return ctx.reply("Telefon raqamingizni kiriting:");
                }

                if (step === 'phone') {
                    data.phone = text;
                    const newUser = await this.userService.create(data);
                    this.userSteps.delete(chatId);
                    this.userData.delete(chatId);
                    return ctx.reply(`Muvaffaqiyatli saqlandi: ${newUser.name} ${newUser.surname}`);
                }
            }

            // Task qo'shish mantiqi
            if (this.taskSteps.has(chatId)) {
                const step = this.taskSteps.get(chatId);
                const data = this.taskData.get(chatId);

                if (step === 'task_name') {
                    data.name = text;
                    this.taskSteps.set(chatId, 'description');
                    return ctx.reply("Vazifa tavsifini yozing:");
                }

                if (step === 'description') {
                    data.description = text;
                    this.taskSteps.set(chatId, 'importance');
                    const keyboard = new InlineKeyboard()
                        .text("Past", "low").text("O'rta", "medium").text("Yuqori", "high");
                    return ctx.reply("Muhimlik darajasini tanlang:", { reply_markup: keyboard });
                }
            }
        });

        // IMPORTANCE CALLBACK
        this.bot.callbackQuery(['low', 'medium', 'high'], async (ctx) => {
            const chatId = ctx.chatId;
            if (!chatId) return;

            const data = this.taskData.get(chatId);
            if (!data) return;

            data.importanceLevel = ctx.callbackQuery.data;
            await this.tasksService.create(data);

            this.taskSteps.delete(chatId);
            this.taskData.delete(chatId);

            await ctx.editMessageText("Vazifa muvaffaqiyatli saqlandi.");
            await ctx.answerCallbackQuery();
        });

        this.bot.start();
    }
}