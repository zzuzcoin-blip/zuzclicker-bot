require('dotenv').config();
const express = require('express');
const { Telegraf, Markup } = require('telegraf');

// Веб-сервер для Render
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('ZUZ Clicker Bot ✅'));
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Web server on port ${PORT}`));

const bot = new Telegraf(process.env.BOT_TOKEN);
const GAME_URL = process.env.GAME_URL || 'https://zuz-clicker.onrender.com';

const menu = () => Markup.keyboard([
    ['🎮 ИГРАТЬ', '👤 ПРОФИЛЬ'],
    ['👥 ПАРТНЁРЫ', '❓ ПОМОЩЬ']
]).resize();

const gameBtn = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🎮 ОТКРЫТЬ ИГРУ', GAME_URL)]
]);

bot.start(async (ctx) => {
    await ctx.replyWithHTML(
        `✨ <b>Добро пожаловать в ZUZ Clicker!</b> ✨\n\n` +
        `⚡ Кликай по монете, копи Dust, меняй на ZUZ.\n\n` +
        `👇 Нажми кнопку, чтобы начать:`,
        gameBtn()
    );
    await ctx.reply(`🏠 Меню:`, menu());
});

bot.hears('🎮 ИГРАТЬ', async (ctx) => {
    await ctx.reply(`👇 Открой игру:`, gameBtn());
});

bot.hears('👤 ПРОФИЛЬ', async (ctx) => {
    await ctx.replyWithHTML(
        `<b>👤 Ваш профиль</b>\n\n` +
        `🎮 Игрок: ${ctx.from.first_name}\n` +
        `🆔 ID: ${ctx.from.id}\n\n` +
        `📊 Подробности — в игре.`,
        gameBtn()
    );
});

bot.hears('👥 ПАРТНЁРЫ', async (ctx) => {
    const refLink = `https://t.me/zuzclicker_bot?start=ref_${ctx.from.id}`;
    await ctx.replyWithHTML(
        `<b>👥 Партнёрская программа</b>\n\n` +
        `🔗 Ваша ссылка:\n<code>${refLink}</code>\n\n` +
        `🎁 5% от покупок друзей — ваши!`,
        Markup.inlineKeyboard([
            [Markup.button.callback('📋 КОПИРОВАТЬ', 'copy_ref')]
        ])
    );
});

bot.action('copy_ref', async (ctx) => {
    const refLink = `https://t.me/zuzclicker_bot?start=ref_${ctx.from.id}`;
    await ctx.answerCbQuery();
    await ctx.reply(`🔗 <code>${refLink}</code>`, { parse_mode: 'HTML' });
});

bot.hears('❓ ПОМОЩЬ', async (ctx) => {
    await ctx.replyWithHTML(
        `<b>❓ Помощь</b>\n\n` +
        `🎮 Как играть?\n` +
        `• Кликай по монете — получай Dust\n` +
        `• Энергия восстанавливается каждые 5 минут\n` +
        `• Чем больше кликов — тем выше уровень\n` +
        `• Обменивай Dust на реальные ZUZ\n\n` +
        `🔗 <a href="${GAME_URL}">Открыть игру</a>`
    );
});

bot.on('text', async (ctx) => {
    if (!ctx.message.text.startsWith('/')) {
        await ctx.reply(`🏠 Меню:`, menu());
    }
});

bot.launch();
console.log('🚀 ZUZ Clicker Bot запущен');
