const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { stringify } = require('csv-stringify/sync');

function buildWhere(q) {
  const where = []; const params = [];
  const { date, from, to, device, level, country, os, browser, lang, q: kw } = q;

  if (date === 'today') where.push("date(entered_at) = date('now')");
  else if (date === '7d')  where.push("entered_at >= datetime('now','-7 days')");
  else if (date === '30d') where.push("entered_at >= datetime('now','-30 days')");
  else if (date === 'custom' && from && to) {
    where.push("date(entered_at) >= date(?) AND date(entered_at) <= date(?)");
    params.push(from, to);
  }

  if (device  && device  !== 'all') { where.push('device_type = ?'); params.push(device); }
  if (country && country !== 'all') { where.push('country_name = ?'); params.push(country); }
  if (os      && os      !== 'all') { where.push('os = ?');           params.push(os); }
  if (browser && browser !== 'all') { where.push('browser = ?');      params.push(browser); }
  if (lang    && lang    !== 'all') { where.push('lang = ?');         params.push(lang); }

  if (level && level !== 'all') {
    if (level === '3+') where.push('level_reached >= 3');
    else { where.push('level_reached = ?'); params.push(parseInt(level, 10)); }
  }

  if (kw) {
    where.push(`(
      ip LIKE ? OR
      fingerprint LIKE ? OR
      country LIKE ? OR
      country_name LIKE ? OR
      os LIKE ? OR
      browser LIKE ? OR
      lang LIKE ? OR
      device_type LIKE ?
    )`);
    const like = `%${kw}%`;
    params.push(like, like, like, like, like, like, like, like);
  }

  return { sql: where.length ? 'WHERE ' + where.join(' AND ') : '', params };
}

router.get('/options', (req, res) => {
  const rows = (col) =>
    db.prepare(`SELECT DISTINCT ${col} AS v FROM visits WHERE ${col} IS NOT NULL AND ${col} != '' ORDER BY v`).all().map(r => r.v);
  res.json({
    countries: rows('country_name'),
    os:        rows('os'),
    browsers:  rows('browser'),
    langs:     rows('lang'),
  });
});

router.get('/export/csv', (req, res) => {
  const { sql, params } = buildWhere(req.query);
  const rows = db.prepare(`SELECT * FROM visits ${sql} ORDER BY entered_at DESC`).all(...params);
  const csv = stringify(rows, {
    header: true,
    columns: ['id','session_id','fingerprint','ip','country','country_name','device_type','os','browser',
              'lang','level_reached','max_level','levels_cleared','entered_at','left_at','duration_sec',
              'visible_seconds','play_seconds','referrer','user_agent']
  });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="visits.csv"');
  res.send('\ufeff' + csv);
});

router.get('/', (req, res) => {
  const { sql, params } = buildWhere(req.query);
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const size = Math.min(100, Math.max(1, parseInt(req.query.size || '20', 10)));
  const total = db.prepare(`SELECT COUNT(*) c FROM visits ${sql}`).get(...params).c;
  const rows = db.prepare(`SELECT * FROM visits ${sql} ORDER BY entered_at DESC LIMIT ? OFFSET ?`)
    .all(...params, size, (page - 1) * size);
  res.json({ total, page, size, rows });
});

router.post('/batch-delete', (req, res) => {
  const ids = req.body?.ids || [];
  if (!ids.length) return res.json({ ok: true, deleted: 0 });
  const stmt = db.prepare('DELETE FROM visits WHERE id=?');
  const tx = db.transaction((list) => list.forEach(id => stmt.run(id)));
  tx(ids);
  res.json({ ok: true, deleted: ids.length });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM visits WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM visits WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;