require('dotenv').config();
const express = require('express');
const { Telegraf, Markup } = require('telegraf');

// ========== ВЕБ-СЕРВЕР ДЛЯ RENDER ==========
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('ZUZ Clicker Bot ✅'));
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Web server on port ${PORT}`));

// ========== КОНФИГУРАЦИЯ БОТА ==========
const bot = new Telegraf(process.env.BOT_TOKEN);
const GAME_URL = process.env.GAME_URL || 'https://zuz-clicker.onrender.com';

// Клавиатуры
const menu = () => Markup.keyboard([
    ['🎮 ИГРАТЬ', '👤 ПРОФИЛЬ'],
    ['👥 ПАРТНЁРЫ', '❓ ПОМОЩЬ']
]).resize();

const gameBtn = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🎮 ОТКРЫТЬ ИГРУ', GAME_URL)]
]);

// ========== ОБРАБОТЧИКИ КОМАНД ==========
bot.start(async (ctx) => {
    await ctx.replyWithHTML(
        `✨ <b>Добро пожаловать в ZUZ Clicker!</b> ✨\n\n` +
        `⚡ Кликай по монете, копи <b>Dust</b>, меняй на <b>ZUZ</b>.\n\n` +
        `👇 Нажми кнопку, чтобы начать:`,
        gameBtn()
    );
    await ctx.reply(`🏠 <b>Главное меню</b>:`, { parse_mode: 'HTML', ...menu() });
});

bot.hears('🎮 ИГРАТЬ', async (ctx) => {
    await ctx.reply(`👇 Открой игру:`, gameBtn());
});

bot.hears('👤 ПРОФИЛЬ', async (ctx) => { // <-- ИСПРАВЛЕННАЯ СТРОКА!
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
        `🎮 <b>Как играть?</b>\n` +
        `• Кликай по монете — получай <b>Dust</b>\n` +
        `• Энергия восстанавливается каждые 5 минут\n` +
        `• Чем больше кликов — тем выше уровень\n` +
        `• Обменивай <b>Dust</b> на реальные <b>ZUZ</b>\n\n` +
        `🔗 <a href="${GAME_URL}">Открыть игру</a>`,
        { disable_web_page_preview: true }
    );
});

// Ответ на любые другие сообщения
bot.on('text', async (ctx) => {
    if (!ctx.message.text.startsWith('/')) {
        await ctx.reply(`🏠 <b>Главное меню</b>:`, { parse_mode: 'HTML', ...menu() });
    }
});

bot.launch();
console.log('🚀 ZUZ Clicker Bot успешно запущен!');
