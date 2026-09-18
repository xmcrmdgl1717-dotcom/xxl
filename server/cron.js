const cron = require('node-cron');
const { db, getSetting } = require('./db');

function start() {
  cron.schedule('*/5 * * * *', () => {
    const timeout = parseInt(getSetting('heartbeat_timeout', '1800'), 10);
    const now = Date.now();
    const rows = db.prepare(`SELECT id, entered_at, last_seen_at FROM visits WHERE left_at IS NULL`).all();
    const upd = db.prepare(`UPDATE visits SET left_at=?, duration_sec=? WHERE id=?`);
    for (const r of rows) {
      const last = new Date(r.last_seen_at).getTime();
      if (now - last > timeout * 1000) {
        const dur = Math.max(0, Math.round((last - new Date(r.entered_at).getTime()) / 1000));
        upd.run(new Date(last).toISOString(), dur, r.id);
      }
    }
  });

  cron.schedule('30 3 * * *', () => {
    const days = parseInt(getSetting('data_retention_days', '90'), 10);
    db.prepare(`DELETE FROM visits WHERE created_at < datetime('now', ?)`).run(`-${days} days`);
  });
}

module.exports = { start };