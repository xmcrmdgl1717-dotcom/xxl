const express = require('express');
const router = express.Router();
const { db } = require('../db');

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

router.get('/', (req, res) => {
  const { sql, params } = buildWhere(req.query);
  const row = db.prepare(`
    SELECT
      COUNT(*) AS visits,
      SUM(CASE WHEN device_type='android' THEN 1 ELSE 0 END) AS android,
      SUM(CASE WHEN device_type='ios'     THEN 1 ELSE 0 END) AS ios,
      SUM(CASE WHEN device_type='desktop' THEN 1 ELSE 0 END) AS desktop,
      SUM(CASE WHEN device_type='unknown' OR device_type IS NULL THEN 1 ELSE 0 END) AS unknown,
      ROUND(AVG(NULLIF(duration_sec,0))) AS avg_duration
    FROM visits
    ${sql}
  `).get(...params);

  res.json({
    visits: row.visits || 0,
    android: row.android || 0,
    ios: row.ios || 0,
    desktop: row.desktop || 0,
    unknown: row.unknown || 0,
    avg_duration: row.avg_duration || 0,
  });
});

module.exports = router;