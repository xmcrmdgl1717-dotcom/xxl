const bcrypt = require('bcryptjs');
const { db, getSetting, setSetting } = require('./db');

function requireAuth(req, res, next) {
  if (req.session && req.session.admin) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'unauthorized' });
  return res.redirect('/admin/login');
}

function checkLock(ip) {
  const row = db.prepare('SELECT * FROM login_attempts WHERE ip=?').get(ip);
  if (!row) return { locked: false, fails: 0 };
  if (row.locked_until && new Date(row.locked_until) > new Date()) {
    return { locked: true, until: row.locked_until, fails: row.fails };
  }
  return { locked: false, fails: row.fails };
}

function recordFail(ip) {
  const row = db.prepare('SELECT * FROM login_attempts WHERE ip=?').get(ip);
  const fails = (row?.fails || 0) + 1;
  const locked = fails >= 5 ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : null;
  db.prepare(`INSERT INTO login_attempts(ip,fails,locked_until) VALUES(?,?,?)
              ON CONFLICT(ip) DO UPDATE SET fails=excluded.fails, locked_until=excluded.locked_until`)
    .run(ip, fails, locked);
  return { fails, locked };
}

function clearFail(ip) {
  db.prepare('DELETE FROM login_attempts WHERE ip=?').run(ip);
}

function verifyPassword(plain) {
  const hash = getSetting('admin_password_hash');
  return bcrypt.compareSync(plain, hash);
}

function setPassword(plain) {
  setSetting('admin_password_hash', bcrypt.hashSync(plain, 10));
  setSetting('password_changed', '1');
}

module.exports = { requireAuth, checkLock, recordFail, clearFail, verifyPassword, setPassword };