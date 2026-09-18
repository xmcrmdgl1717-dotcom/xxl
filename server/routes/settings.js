const express = require('express');
const router = express.Router();
const { getSetting, setSetting } = require('../db');
const { verifyPassword, setPassword } = require('../auth');

router.get('/', (req, res) => {
  res.json({
    heartbeat_interval: parseInt(getSetting('heartbeat_interval', '30'), 10),
    heartbeat_timeout:  parseInt(getSetting('heartbeat_timeout', '1800'), 10),
    data_retention_days: parseInt(getSetting('data_retention_days', '90'), 10),
    password_changed: getSetting('password_changed', '0') === '1',
  });
});

router.post('/password', (req, res) => {
  const { old_password, new_password, confirm_password } = req.body || {};
  if (!old_password || !new_password) return res.status(400).json({ error: '参数不完整' });
  if (new_password.length < 8) return res.status(400).json({ error: '新密码至少 8 位' });
  if (new_password !== confirm_password) return res.status(400).json({ error: '两次输入不一致' });
  if (!verifyPassword(old_password)) return res.status(400).json({ error: '旧密码错误' });

  setPassword(new_password);
  req.session.destroy(() => {});
  res.json({ ok: true, relogin: true });
});

router.post('/heartbeat', (req, res) => {
  const { heartbeat_interval, heartbeat_timeout } = req.body || {};
  const iv = parseInt(heartbeat_interval, 10);
  const to = parseInt(heartbeat_timeout, 10);
  if (!(iv >= 5 && iv <= 600)) return res.status(400).json({ error: '间隔需在 5~600 秒' });
  if (!(to >= 60 && to <= 86400)) return res.status(400).json({ error: '超时需在 60~86400 秒' });
  setSetting('heartbeat_interval', iv);
  setSetting('heartbeat_timeout', to);
  res.json({ ok: true });
});

router.post('/retention', (req, res) => {
  const days = parseInt(req.body?.data_retention_days, 10);
  if (!(days >= 1 && days <= 3650)) return res.status(400).json({ error: '保留天数需在 1~3650' });
  setSetting('data_retention_days', days);
  res.json({ ok: true });
});

module.exports = router;
