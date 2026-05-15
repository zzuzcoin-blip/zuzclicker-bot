const express = require('express');
const { Telegraf, Markup } = require('telegraf');

// === Проверка токена (чтобы не было 401) ===
if (!process.env.BOT_TOKEN) {
    console.error('❌ Ошибка: переменная BOT_TOKEN не задана!');
    process.exit(1);
}

// === Веб-сервер для Render ===
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('✅ ZUZ Clicker Bot is running'));
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Web server on port ${PORT}`));

// === Бот ===
const bot = new Telegraf(process.env.BOT_TOKEN);
const GAME_URL = 'https://zuz-clicker.onrender.com';

// Главная клавиатура (меню под полем ввода)
const mainMenu = () => Markup.keyboard([
    ['🎮 ИГРАТЬ', '👤 ПРОФИЛЬ'],
    ['📜 ПРАВИЛА', '👥 ПАРТНЁРЫ']
]).resize();

// Кнопка для открытия игры (inline)
const gameButton = () => Markup.inlineKeyboard([
    [Markup.button.webApp('🎮 ОТКРЫТЬ ИГРУ', GAME_URL)]
]);

// Функция отправки меню
async function sendMenu(ctx) {
    await ctx.reply(`🏠 *Главное меню:*`, { parse_mode: 'Markdown', ...mainMenu() });
}

// ========== ОБРАБОТЧИКИ ==========
bot.start(async (ctx) => {
    await ctx.replyWithHTML(
        `✨ <b>Добро пожаловать в ZUZ Clicker!</b> ✨\n\n` +
        `Кликай по монете → получай Dust.\n` +
        `Обменивай Dust на реальные ZUZ.\n\n` +
        `👇 Нажми кнопку, чтобы начать:`,
        gameButton()
    );
    await sendMenu(ctx);
});

bot.command('menu', async (ctx) => {
    await ctx.reply(`🔄 Восстанавливаю меню...`);
    await sendMenu(ctx);
});

bot.hears('🎮 ИГРАТЬ', async (ctx) => {
    await ctx.reply(`👇 Открой игру:`, gameButton());
    await sendMenu(ctx);
});

bot.hears('👤 ПРОФИЛЬ', async (ctx) => {
    const userId = ctx.from.id;
    await ctx.replyWithHTML(
        `<b>👤 Твой профиль</b>\n\n` +
        `🆔 ID: <code>${userId}</code>\n` +
        `🎮 Игрок: ${ctx.from.first_name}\n\n` +
        `📊 Баланс ZUZ можно посмотреть в игре.`,
        gameButton()
    );
    await sendMenu(ctx);
});

bot.hears('📜 ПРАВИЛА', async (ctx) => {
    await ctx.replyWithHTML(
        `<b>📜 Правила ZUZ Clicker</b>\n\n` +
        `• Кликай по монете → получай Dust\n` +
        `• Энергия восстанавливается каждые 5 минут (макс 100)\n` +
        `• Чем выше уровень — тем сильнее клик\n` +
        `• Ежедневный бонус — забирай каждый день!\n` +
        `• Найди секретную зону → +10 000 Dust!\n` +
        `• Авто-кликер кликает за тебя\n` +
        `• Скоро: обмен Dust → ZUZ`
    );
    await sendMenu(ctx);
});

bot.hears('👥 ПАРТНЁРЫ', async (ctx) => {
    const userId = ctx.from.id;
    const refLink = `https://t.me/zuzclicker_bot?start=ref_${userId}`;
    await ctx.replyWithHTML(
        `<b>👥 Партнёрская программа</b>\n\n` +
        `Приглашай друзей и получай <b>5%</b> от их покупок!\n\n` +
        `🔗 Твоя ссылка:\n<code>${refLink}</code>\n\n` +
        `📊 Статистика появится в ближайшее время.`,
        Markup.inlineKeyboard([
            [Markup.button.callback('📋 КОПИРОВАТЬ', 'copy_ref')]
        ])
    );
    await sendMenu(ctx);
});

bot.action('copy_ref', async (ctx) => {
    const userId = ctx.from.id;
    const refLink = `https://t.me/zuzclicker_bot?start=ref_${userId}`;
    await ctx.answerCbQuery();
    await ctx.reply(`🔗 <code>${refLink}</code>`, { parse_mode: 'HTML' });
    await sendMenu(ctx);
});

// Если пользователь пишет что-то не из команд — показываем меню
bot.on('text', async (ctx) => {
    if (!ctx.message.text.startsWith('/')) {
        await sendMenu(ctx);
    }
});

// === Запуск бота ===
(async () => {
    try {
        await bot.telegram.deleteWebhook();
        await bot.launch();
        console.log('✅ ZUZ Clicker Bot успешно запущен');
    } catch (err) {
        console.error('❌ Ошибка запуска бота:', err);
        process.exit(1);
    }
})();

// Корректное завершение
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
