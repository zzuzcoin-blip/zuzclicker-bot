require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Логин / регистрация
app.post('/api/login', async (req, res) => {
    const { telegram_id, username } = req.body;
    let { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegram_id)
        .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });

    if (!user) {
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ telegram_id, username, balance_dust: 500, energy: 100 }])
            .select()
            .single();
        if (insertError) return res.status(500).json({ error: insertError.message });
        return res.json({ ...newUser, isNew: true });
    }

    // Восстановление энергии
    const now = Math.floor(Date.now() / 1000);
    const lastRefill = user.last_energy_refill || now;
    const elapsed = Math.floor((now - lastRefill) / 60);
    let newEnergy = Math.min(100, user.energy + elapsed);

    if (newEnergy !== user.energy) {
        await supabase
            .from('users')
            .update({ energy: newEnergy, last_energy_refill: now })
            .eq('telegram_id', telegram_id);
        user.energy = newEnergy;
    }

    res.json({ ...user, isNew: false });
});

// Клик
app.post('/api/click', async (req, res) => {
    const { telegram_id, clickX, clickY } = req.body;
    const now = Math.floor(Date.now() / 1000);

    // Получаем пользователя
    let { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegram_id)
        .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    // Восстановление энергии
    const lastRefill = user.last_energy_refill || now;
    const elapsed = Math.floor((now - lastRefill) / 60);
    let newEnergy = Math.min(100, user.energy + elapsed);

    if (newEnergy < 1) {
        return res.json({ success: false, message: 'Нет энергии' });
    }

    newEnergy -= 1;
    const newDust = user.balance_dust + user.click_power;
    const newClicks = (user.total_clicks || 0) + 1;
    const newLevel = Math.floor(newClicks / 10) + 1;
    const newClickPower = 1 + Math.floor((newLevel - 1) / 10);

    // Обновляем пользователя
    const { error: updateError } = await supabase
        .from('users')
        .update({
            balance_dust: newDust,
            energy: newEnergy,
            total_clicks: newClicks,
            level: newLevel,
            click_power: newClickPower,
            last_energy_refill: now
        })
        .eq('telegram_id', telegram_id);

    if (updateError) {
        console.error('Update error:', updateError);
        return res.status(500).json({ error: updateError.message });
    }

    res.json({
        success: true,
        dust: newDust,
        energy: newEnergy,
        level: newLevel,
        clickPower: newClickPower,
        totalClicks: newClicks
    });
});

// Лидерборд
app.get('/api/leaderboard', async (req, res) => {
    const { data: leaders, error } = await supabase
        .from('users')
        .select('username, total_clicks, level')
        .order('total_clicks', { ascending: false })
        .limit(10);
    if (error) return res.status(500).json({ error: error.message });
    res.json(leaders);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ API on port ${PORT}`));
