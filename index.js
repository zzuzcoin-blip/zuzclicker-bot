const express = require('express');
const { Telegraf, Markup } = require('telegraf');

// === ВЕБ-СЕРВЕР ДЛЯ RENDER (РЕШАЕТ ПРОБЛЕМУ С ПОРТОМ) ===
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('ZUZ Clicker Bot is running ✅');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Web server (fake) listening on port ${PORT}`);
});
// =================================================

// === ОСНОВНОЙ КОД БОТА (НЕ ИЗМЕНИЛСЯ) ===
const bot = new Telegraf(process.env.BOT_TOKEN);
const GAME_URL = 'https://zuz-clicker.onrender.com';

// Клавиатура с командами (нижнее меню)
const menuKeyboard = () => Markup.keyboard([
    ['🎮 ИГРАТЬ', '👤 ПРОФИЛЬ'],
    ['📜 ПРАВИЛА', '👥 ПАРТНЁРЫ']
]).resize();

// Кнопка для открытия игры
const gameButton = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🎮 ОТКРЫТЬ ИГРУ', GAME_URL)]
]);

// Команда /start
bot.start(async (ctx) => {
    await ctx.replyWithHTML(
        `✨ <b>Добро пожаловать в ZUZ Clicker!</b> ✨\n\n` +
        `Кликай по золотой монете, чтобы копить Dust.\n` +
        `Обменивай Dust на реальные токены ZUZ.\n\n` +
        `👇 Нажми кнопку, чтобы начать игру:`,
        gameButton()
    );
    await ctx.reply(`🏠 <b>Главное меню</b>:`, { parse_mode: 'HTML', ...menuKeyboard() });
});

// Кнопка "ИГРАТЬ" (в нижнем меню)
bot.hears('🎮 ИГРАТЬ', async (ctx) => {
    await ctx.reply(`👇 Открой игру:`, gameButton());
    await ctx.reply(`🏠 <b>Главное меню</b>:`, { parse_mode: 'HTML', ...menuKeyboard() });
});

// Кнопка "ПРОФИЛЬ"
bot.hears('👤 ПРОФИЛЬ', async (ctx) => {
    const userId = ctx.from.id;
    await ctx.replyWithHTML(
        `<b>👤 Ваш профиль</b>\n\n` +
        `🆔 ID: ${userId}\n` +
        `📊 Баланс ZUZ можно посмотреть в игре.\n\n` +
        `👇 Открой игру:`,
        gameButton()
    );
    await ctx.reply(`🏠 <b>Главное меню</b>:`, { parse_mode: 'HTML', ...menuKeyboard() });
});

// Кнопка "ПРАВИЛА"
bot.hears('📜 ПРАВИЛА', async (ctx) => {
    await ctx.replyWithHTML(
        `<b>📜 Правила игры ZUZ Clicker</b>\n\n` +
        `• Кликай по монете — получай <b>Dust</b>\n` +
        `• Энергия восстанавливается каждые 5 минут (макс 100)\n` +
        `• Чем больше кликов — тем выше уровень и сильнее клик\n` +
        `• Ежедневный бонус — забирай каждый день!\n` +
        `• Найди секретную зону на монете — получишь 10 000 Dust!\n` +
        `• Покупай авто-кликер за Dust — он будет кликать за тебя\n` +
        `• Скоро: обмен Dust на реальные токены ZUZ\n\n` +
        `🔥 Удачи!`,
        gameButton()
    );
    await ctx.reply(`🏠 <b>Главное меню</b>:`, { parse_mode: 'HTML', ...menuKeyboard() });
});

// Кнопка "ПАРТНЁРЫ"
bot.hears('👥 ПАРТНЁРЫ', async (ctx) => {
    const userId = ctx.from.id;
    const refLink = `https://t.me/zuzclicker_bot?start=ref_${userId}`;
    await ctx.replyWithHTML(
        `<b>👥 Партнёрская программа</b>\n\n` +
        `Приглашайте друзей и получайте <b>5%</b> от их покупок Dust/ZUZ!\n\n` +
        `🔗 Ваша ссылка:\n<code>${refLink}</code>\n\n` +
        `📊 Статистика появится после подключения базы данных.`,
        Markup.inlineKeyboard([
            [Markup.button.callback('📋 КОПИРОВАТЬ', 'copy_ref')]
        ])
    );
    await ctx.reply(`🏠 <b>Главное меню</b>:`, { parse_mode: 'HTML', ...menuKeyboard() });
});

// Копирование реферальной ссылки
bot.action('copy_ref', async (ctx) => {
    const userId = ctx.from.id;
    const refLink = `https://t.me/zuzclicker_bot?start=ref_${userId}`;
    await ctx.answerCbQuery();
    await ctx.reply(`🔗 <code>${refLink}</code>`, { parse_mode: 'HTML' });
    await ctx.reply(`🏠 <b>Главное меню</b>:`, { parse_mode: 'HTML', ...menuKeyboard() });
});

// Если пользователь пишет любой текст — показываем меню
bot.on('text', async (ctx) => {
    if (!ctx.message.text.startsWith('/')) {
        await ctx.reply(`🏠 <b>Главное меню</b>:`, { parse_mode: 'HTML', ...menuKeyboard() });
    }
});

bot.launch();
console.log('✅ ZUZ Clicker Bot с меню и веб-сервером запущен');
