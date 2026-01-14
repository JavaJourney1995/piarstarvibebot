const tg = window.Telegram?.WebApp;
const nameEl = document.getElementById('name');
const userNameEl = document.getElementById('user-name');
const userIdEl = document.getElementById('user-id');
const avatarEl = document.getElementById('avatar');
const statusEl = document.getElementById('status');
const bonusBtn = document.getElementById('bonus');
const subscribeBtn = document.getElementById('subscribe');

const colors = ['#FF9A8B', '#A5FECB', '#FFE066', '#B39DDB', '#FF8ED4'];
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

if (!tg) {
  statusEl.textContent = '❌ Откройте через Telegram!';
  statusEl.className = 'status error';
  throw new Error('Not in Telegram');
}

tg.ready();
tg.expand();

tg.BackButton.show();
tg.onEvent('backButtonClicked', () => tg.close());

// Проверка данных
async function verifyUser() {
  const data = new URLSearchParams(tg.initData);

  try {
    const res = await fetch('/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data,
    });

    const result = await res.json();

    if (result.ok && result.user) {
      const user = result.user;
      const firstName = user.first_name;

      nameEl.textContent = firstName;
      userNameEl.textContent = `${firstName}${user.last_name ? ' ' + user.last_name : ''}`;
      userIdEl.textContent = `ID: ${user.id}`;
      avatarEl.textContent = firstName[0]?.toUpperCase() || '?';
      avatarEl.style.backgroundColor = getRandomColor();

      statusEl.textContent = '✅ Аккаунт подтверждён';
      statusEl.className = 'status success';
      bonusBtn.disabled = false;
    } else {
      showError('❌ Данные подделаны');
    }
  } catch (err) {
    showError('❌ Ошибка подключения');
    console.error(err);
  }
}

function showError(msg) {
  statusEl.textContent = msg;
  statusEl.className = 'status error';
  tg.showAlert(msg);
}

// Подписаться на канал
subscribeBtn.addEventListener('click', () => {
  tg.openTelegramLink('https://t.me/piarstarvibechannel'); // ⚠️ Замени на свой канал
});

// Получить бонус
bonusBtn.addEventListener('click', () => {
  const user = tg.initDataUnsafe.user;

  tg.sendData(JSON.stringify({
    action: 'get_bonus',
    user_id: user.id,
    username: user.username,
    first_name: user.first_name,
  }));

});
