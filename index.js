const express = require('express');
const app = express();
app.use(express.json());

// CORS — разрешаем запросы с любого источника
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Временное хранилище (пока без Supabase)
const users = new Map();

// API для лидеров
app.get('/api/leaderboard', (req, res) => {
    const leaders = Array.from(users.values())
        .sort((a, b) => b.total_clicks - a.total_clicks)
        .slice(0, 10)
        .map(u => ({ username: u.username, total_clicks: u.total_clicks, level: u.level }));
    res.json(leaders);
});

// API для логина / регистрации
app.post('/api/login', (req, res) => {
    const { telegram_id, username } = req.body;
    if (!users.has(telegram_id)) {
        users.set(telegram_id, {
            telegram_id,
            username: username || "Игрок",
            balance_dust: 500,
            energy: 100,
            total_clicks: 0,
            level: 1,
            click_power: 1,
            last_energy_refill: Math.floor(Date.now() / 1000)
        });
        return res.json({ ...users.get(telegram_id), isNew: true });
    }
    const user = users.get(telegram_id);
    res.json({ ...user, isNew: false });
});

// API для клика
app.post('/api/click', (req, res) => {
    const { telegram_id, clickX, clickY } = req.body;
    const user = users.get(telegram_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = Math.floor(Date.now() / 1000);
    const elapsed = Math.floor((now - user.last_energy_refill) / 60);
    user.energy = Math.min(100, user.energy + elapsed);
    user.last_energy_refill = now;

    if (user.energy < 1) {
        return res.json({ success: false, message: '⛔ Нет энергии! Подожди 5 минут' });
    }

    user.energy -= 1;
    const dustGain = user.click_power;
    user.balance_dust += dustGain;
    user.total_clicks += 1;
    user.level = Math.floor(user.total_clicks / 10) + 1;
    user.click_power = 1 + Math.floor((user.level - 1) / 10);

    res.json({
        success: true,
        dust: user.balance_dust,
        energy: user.energy,
        level: user.level,
        clickPower: user.click_power,
        totalClicks: user.total_clicks
    });
});

// Заглушки для остальных API (если нужны)
app.post('/api/daily', (req, res) => {
    res.json({ success: false, message: 'Ежедневный бонус пока не работает' });
});

app.post('/api/buy_auto_miner', (req, res) => {
    res.json({ success: false, message: 'Авто-кликер пока не работает' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ ZUZ Clicker API on port ${PORT}`);
});
