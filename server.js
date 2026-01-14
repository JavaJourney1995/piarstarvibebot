// server.js
require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const crypto = require('crypto');
const path = require('path');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 3000;

// === Проверка подлинности данных из Telegram ===
function generateTelegramSecret(token) {
  return crypto.createHash('sha256').update(token).digest();
}

function validateTelegramData(data, token) {
  const secretKey = generateTelegramSecret(token);
  const hash = data.hash;
  delete data.hash;

  const dataCheckString = Object.keys(data)
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join('\n');

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return computedHash === hash;
}

// === Парсинг тела запроса ===
app.use(express.text({ type: 'application/x-www-form-urlencoded' }));
app.use(express.json());

// === Эндпоинт для проверки пользователя ===
app.post('/auth', (req, res) => {
  const token = process.env.BOT_TOKEN;
  const data = req.body;

  if (!data || !data.hash) {
    return res.status(400).json({ error: 'Нет данных' });
  }

  const isValid = validateTelegramData(data, token);

  if (!isValid) {
    return res.status(403).json({ error: 'Подделка данных!' });
  }

  res.json({
    ok: true,
    user: data.user ? JSON.parse(data.user) : null,
  });
});

// === Раздача статики (Mini App) ===
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Запуск бота ===
bot.start((ctx) => {
  ctx.reply('Привет! Нажми 🧩, чтобы открыть Mini App');
});

// Обработка данных из Mini App
bot.on('web_app_data', (ctx) => {
  const data = JSON.parse(ctx.webAppData.data);
  if (data.action === 'get_bonus') {
    ctx.replyWithHTML(`
🎁 <b>Поздравляю, ${data.first_name}!</b>

Ты получил бонус!
Спасибо, что используешь бота 💫

👉 <a href="https://t.me/piarstarvibechannel">Подпишись на канал</a>, чтобы получать больше
    `, { disable_web_page_preview: true });
  }
});

bot.launch();

app.listen(PORT, () => {
  console.log(`🛡️ Сервер запущен на http://localhost:${PORT}`);
});
