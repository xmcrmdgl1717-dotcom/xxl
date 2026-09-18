require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const { getSetting } = require('./db');
const auth = require('./auth');
const cron = require('./cron');
const trackRouter = require('./routes/track');
const statsRouter = require('./routes/stats');
const visitsRouter = require('./routes/visits');
const settingsRouter = require('./routes/settings');

const app = express();
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());
app.use(session({
  name: 'ddx.sid',
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 3600 * 1000,
  },
}));

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin-login.html'));
});

app.post('/api/login', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
           || req.socket.remoteAddress || '';
  const lock = auth.checkLock(ip);
  if (lock.locked) return res.status(429).json({ error: `失败次数过多，请于 ${lock.until} 后重试` });

  const { password } = req.body || {};
  if (!password || !auth.verifyPassword(password)) {
    const r = auth.recordFail(ip);
    return res.status(401).json({ error: '密码错误', remaining: Math.max(0, 5 - r.fails) });
  }
  auth.clearFail(ip);
  req.session.admin = true;
  const needChange = getSetting('password_changed', '0') === '0';
  res.json({ ok: true, needChange });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.use('/api/track', trackRouter);

app.use('/api/stats',    auth.requireAuth, statsRouter);
app.use('/api/visits',   auth.requireAuth, visitsRouter);
app.use('/api/settings', auth.requireAuth, settingsRouter);

app.get('/admin', auth.requireAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')));
app.get('/admin/', auth.requireAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')));
app.get('/admin.css', auth.requireAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.css')));
app.get('/admin.js', auth.requireAuth, (req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.js')));

app.use(express.static(path.join(__dirname, '..', 'public'), { index: 'index.html' }));
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

cron.start();
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`✅ server running: http://localhost:${PORT}`);
  console.log(`   游戏页: http://localhost:${PORT}/`);
  console.log(`   后台:   http://localhost:${PORT}/admin/login`);
  console.log(`   默认密码: ${process.env.ADMIN_PASSWORD || 'admin123456'}`);
});