require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

// Тестовые данные
const users = [
    { telegram_id: 'test1', username: 'Sage_Leader', balance_dust: 5000, energy: 100, total_clicks: 100, level: 5, click_power: 2 }
];

// API для лидеров
app.get('/api/leaderboard', (req, res) => {
    res.json(users.map(u => ({ username: u.username, total_clicks: u.total_clicks, level: u.level })));
});

// API для логина
app.post('/api/login', (req, res) => {
    const { telegram_id, username } = req.body;
    let user = users.find(u => u.telegram_id === telegram_id);
    if (!user) {
        user = { telegram_id, username, balance_dust: 500, energy: 100, total_clicks: 0, level: 1, click_power: 1 };
        users.push(user);
        return res.json({ ...user, isNew: true });
    }
    res.json({ ...user, isNew: false });
});

// API для клика
app.post('/api/click', (req, res) => {
    const { telegram_id } = req.body;
    const user = users.find(u => u.telegram_id === telegram_id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.energy < 1) return res.json({ success: false, message: 'Нет энергии' });
    
    user.energy -= 1;
    user.balance_dust += user.click_power;
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ API запущен на порту ${PORT}`));
