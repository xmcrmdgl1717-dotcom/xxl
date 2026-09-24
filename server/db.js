const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'game.db'));
try { db.pragma('journal_mode = WAL'); } catch (e) {}

db.exec(`
CREATE TABLE IF NOT EXISTS visits (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id    TEXT NOT NULL,
  fingerprint   TEXT,
  ip            TEXT,
  country       TEXT,
  country_name  TEXT,
  device_type   TEXT,
  os            TEXT,
  browser       TEXT,
  user_agent    TEXT,
  referrer      TEXT,
  lang          TEXT,
  level_reached INTEGER DEFAULT 1,
  max_level     INTEGER DEFAULT 1,
  levels_cleared INTEGER DEFAULT 0,
  entered_at    DATETIME NOT NULL,
  last_seen_at  DATETIME NOT NULL,
  left_at       DATETIME,
  duration_sec  INTEGER DEFAULT 0,
  visible_seconds INTEGER DEFAULT 0,
  play_seconds  INTEGER DEFAULT 0,
  visit_count   INTEGER DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_session ON visits(session_id);
CREATE INDEX IF NOT EXISTS idx_visits_created ON visits(created_at);
CREATE INDEX IF NOT EXISTS idx_visits_fp      ON visits(fingerprint);
CREATE INDEX IF NOT EXISTS idx_visits_ip      ON visits(ip);
CREATE INDEX IF NOT EXISTS idx_visits_device  ON visits(device_type);
CREATE INDEX IF NOT EXISTS idx_visits_level   ON visits(level_reached);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip           TEXT PRIMARY KEY,
  fails        INTEGER DEFAULT 0,
  locked_until DATETIME
);
`);

function getSetting(key, def = null) {
  const row = db.prepare('SELECT value FROM settings WHERE key=?').get(key);
  return row ? row.value : def;
}
function setSetting(key, value) {
  db.prepare(`INSERT INTO settings(key,value,updated_at) VALUES(?,?,CURRENT_TIMESTAMP)
              ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`)
    .run(key, String(value));
}

if (!getSetting('admin_password_hash')) {
  const plain = process.env.ADMIN_PASSWORD || 'admin123456';
  setSetting('admin_password_hash', bcrypt.hashSync(plain, 10));
  setSetting('password_changed', '0');
}
if (!getSetting('heartbeat_interval'))  setSetting('heartbeat_interval', '30');
if (!getSetting('heartbeat_timeout'))   setSetting('heartbeat_timeout', '1800');
if (!getSetting('data_retention_days')) setSetting('data_retention_days', '90');

module.exports = { db, getSetting, setSetting };