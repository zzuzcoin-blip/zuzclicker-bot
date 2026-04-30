require('dotenv').config();
const express = require('express');
const { Telegraf, Markup } = require('telegraf');

const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('ZUZ Clicker Bot ✅'));
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Web server on port ${PORT}`));

const bot = new Telegraf(process.env.BOT_TOKEN);
const GAME_URL = process.env.GAME_URL || 'https://zuz-clicker.onrender.com';

// Клавиатура меню (всегда одна и та же)
const menuKeyboard = () => Markup.keyboard([
    ['🎮 ИГРАТЬ', '👤 ПРОФИЛЬ'],
    ['👥 ПАРТНЁРЫ', '❓ ПОМОЩЬ']
]).resize();

const gameBtn = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🎮 ОТКРЫТЬ ИГРУ', GAME_URL)]
]);

// Функция отправки меню
async function sendMenu(ctx, text) {
    await ctx.reply(text || '🏠 <b>Главное меню</b>:', {
        parse_mode: 'HTML',
        ...menuKeyboard()
    });
}

bot.start(async (ctx) => {
    await ctx.replyWithHTML(
        `✨ <b>Добро пожаловать в ZUZ Clicker!</b> ✨\n\n` +
        `⚡ Кликай по монете, копи Dust, меняй на ZUZ.\n\n` +
        `👇 Нажми кнопку, чтобы начать:`,
        gameBtn()
    );
    await sendMenu(ctx);
});

// Обработка команд
bot.command('play', async (ctx) => {
    await ctx.reply(`👇 Открой игру:`, gameBtn());
    await sendMenu(ctx);
});

bot.command('profile', async (ctx) => {
    await ctx.replyWithHTML(`<b>👤 Ваш профиль</b>\n\n🎮 Игрок: ${ctx.from.first_name}\n🆔 ID: ${ctx.from.id}`, gameBtn());
    await sendMenu(ctx);
});

bot.command('referral', async (ctx) => {
    const refLink = `https://t.me/zuzclicker_bot?start=ref_${ctx.from.id}`;
    await ctx.replyWithHTML(
        `<b>🔗 Ваша реферальная ссылка:</b>\n<code>${refLink}</code>`,
        Markup.inlineKeyboard([[Markup.button.callback('📋 КОПИРОВАТЬ', 'copy_ref')]])
    );
    await sendMenu(ctx);
});

bot.command('help', async (ctx) => {
    await ctx.replyWithHTML(
        `<b>❓ Помощь</b>\n\n` +
        `🎮 <b>Как играть?</b>\n` +
        `• Кликай по монете — получай Dust\n` +
        `• Энергия восстанавливается каждые 5 минут\n` +
        `• Чем больше кликов — тем выше уровень\n` +
        `• Обменивай Dust на реальные ZUZ (скоро)\n\n` +
        `🔗 <a href="${GAME_URL}">Открыть игру</a>`,
        { disable_web_page_preview: true }
    );
    await sendMenu(ctx);
});

// Кнопки клавиатуры
bot.hears('🎮 ИГРАТЬ', async (ctx) => {
    await ctx.reply(`👇 Открой игру:`, gameBtn());
    await sendMenu(ctx);
});

bot.hears('👤 ПРОФИЛЬ', async (ctx) => {
    await ctx.replyWithHTML(`<b>👤 Ваш профиль</b>\n\n🎮 Игрок: ${ctx.from.first_name}`, gameBtn());
    await sendMenu(ctx);
});

bot.hears('👥 ПАРТНЁРЫ', async (ctx) => {
    const refLink = `https://t.me/zuzclicker_bot?start=ref_${ctx.from.id}`;
    await ctx.replyWithHTML(
        `<b>🔗 Ваша ссылка:</b>\n<code>${refLink}</code>`,
        Markup.inlineKeyboard([[Markup.button.callback('📋 КОПИРОВАТЬ', 'copy_ref')]])
    );
    await sendMenu(ctx);
});

bot.hears('❓ ПОМОЩЬ', async (ctx) => {
    await ctx.replyWithHTML(
        `<b>❓ Помощь</b>\n\n` +
        `🎮 Кликай по монете → получай Dust\n` +
        `🔋 Энергия восстанавливается каждые 5 минут\n` +
        `🔄 Скоро: обмен Dust → ZUZ\n\n` +
        `🔗 <a href="${GAME_URL}">Открыть игру</a>`
    );
    await sendMenu(ctx);
});

// Копирование реферальной ссылки
bot.action('copy_ref', async (ctx) => {
    const refLink = `https://t.me/zuzclicker_bot?start=ref_${ctx.from.id}`;
    await ctx.answerCbQuery();
    await ctx.reply(`🔗 <code>${refLink}</code>`, { parse_mode: 'HTML' });
    await sendMenu(ctx);
});

// Любой другой текст — отправляем меню
bot.on('text', async (ctx) => {
    if (!ctx.message.text.startsWith('/')) {
        await sendMenu(ctx);
    }
});

bot.launch();
console.log('🚀 ZUZ Clicker Bot успешно запущен!');
