const express = require('express');
const router = express.Router();
const { db, getSetting } = require('../db');
const geoip = require('../geoip');

function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket.remoteAddress || '';
}

function parseUA(ua = '') {
  let device_type = 'unknown', os = '未知', browser = '未知';
  if (/iPhone|iPod/i.test(ua))      { device_type = 'ios'; os = 'iOS'; }
  else if (/iPad/i.test(ua))        { device_type = 'ios'; os = 'iPadOS'; }
  else if (/Android/i.test(ua))     { device_type = 'android'; os = 'Android ' + (/Android ([\d.]+)/.exec(ua)?.[1] || ''); }
  else if (/Windows NT/i.test(ua))  { device_type = 'desktop'; const v = /Windows NT ([\d.]+)/.exec(ua)[1];
                                      os = v === '10.0' ? 'Windows 10/11' : 'Windows ' + v; }
  else if (/Mac OS X/i.test(ua))    { device_type = 'desktop'; os = 'macOS ' + (/Mac OS X ([\d_.]+)/.exec(ua)?.[1]?.replace(/_/g,'.') || ''); }
  else if (/Linux/i.test(ua))       { device_type = 'desktop'; os = 'Linux'; }

  const b = [
    [/Edg\/([\d.]+)/, 'Edge'], [/OPR\/([\d.]+)/, 'Opera'],
    [/Chrome\/([\d.]+)/, 'Chrome'], [/Firefox\/([\d.]+)/, 'Firefox'],
    [/Version\/([\d.]+).*Safari/, 'Safari'], [/Safari\/([\d.]+)/, 'Safari'],
  ];
  for (const [re, name] of b) { const m = re.exec(ua); if (m) { browser = name + ' ' + m[1].split('.')[0]; break; } }
  return { device_type, os: os.trim(), browser };
}

async function lookupSafe(ip) {
  try { return await geoip.lookup(ip); }
  catch { return { country: null, country_name: '未知' }; }
}

router.get('/geo', async (req, res) => {
  const ip = clientIp(req);
  const geo = await lookupSafe(ip);
  res.json({ country: geo.country, country_name: geo.country_name });
});

router.get('/config', (req, res) => {
  res.json({
    heartbeat_interval: parseInt(getSetting('heartbeat_interval', '30'), 10),
    heartbeat_timeout:  parseInt(getSetting('heartbeat_timeout', '1800'), 10),
  });
});

router.post('/enter', async (req, res) => {
  try {
    const { session_id, fingerprint, lang, referrer } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    const ip = clientIp(req);
    const ua = req.headers['user-agent'] || '';
    const { device_type, os, browser } = parseUA(ua);
    const geo = await lookupSafe(ip);
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT id FROM visits WHERE session_id=?').get(session_id);
    if (existing) {
      db.prepare(`UPDATE visits SET last_seen_at=?, ip=?, country=?, country_name=?,
                  device_type=?, os=?, browser=?, user_agent=?, lang=COALESCE(?,lang) WHERE id=?`)
        .run(now, ip, geo.country, geo.country_name, device_type, os, browser, ua, lang || null, existing.id);
      return res.json({ ok: true, reused: true });
    }

    db.prepare(`INSERT INTO visits
      (session_id,fingerprint,ip,country,country_name,device_type,os,browser,user_agent,referrer,lang,
       entered_at,last_seen_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(session_id, fingerprint || '', ip, geo.country, geo.country_name, device_type, os, browser,
           ua, referrer || '', lang || '', now, now);

    res.json({ ok: true });
  } catch (e) {
    console.error('track/enter', e);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/heartbeat', (req, res) => {
  const { session_id, visible_seconds, level_reached } = req.body || {};
  if (!session_id) return res.status(400).json({ error: 'no session' });
  const now = new Date().toISOString();
  db.prepare(`UPDATE visits SET last_seen_at=?,
              visible_seconds=COALESCE(?,visible_seconds),
              level_reached=MAX(level_reached, COALESCE(?,level_reached)),
              max_level=MAX(max_level, COALESCE(?,max_level))
              WHERE session_id=?`)
    .run(now, visible_seconds ?? null, level_reached ?? null, level_reached ?? null, session_id);
  res.json({ ok: true, server_time: now });
});

router.post('/level', (req, res) => {
  const { session_id, level_reached, levels_cleared, play_seconds } = req.body || {};
  if (!session_id) return res.status(400).json({ error: 'no session' });
  const now = new Date().toISOString();
  db.prepare(`UPDATE visits SET last_seen_at=?,
              level_reached=MAX(level_reached, COALESCE(?,level_reached)),
              max_level=MAX(max_level, COALESCE(?,max_level)),
              levels_cleared=MAX(levels_cleared, COALESCE(?,levels_cleared)),
              play_seconds=MAX(play_seconds, COALESCE(?,play_seconds))
              WHERE session_id=?`)
    .run(now, level_reached ?? null, level_reached ?? null, levels_cleared ?? null, play_seconds ?? null, session_id);
  res.json({ ok: true });
});

router.post('/lang', (req, res) => {
  const { session_id, lang } = req.body || {};
  if (!session_id || !lang) return res.status(400).json({ error: 'bad req' });
  db.prepare('UPDATE visits SET lang=? WHERE session_id=?').run(lang, session_id);
  res.json({ ok: true });
});

router.post('/leave', (req, res) => {
  const { session_id, visible_seconds } = req.body || {};
  if (!session_id) return res.status(400).json({ error: 'no session' });
  const row = db.prepare('SELECT entered_at FROM visits WHERE session_id=?').get(session_id);
  if (!row) return res.json({ ok: true });
  const now = new Date().toISOString();
  const dur = Math.max(0, Math.round((Date.now() - new Date(row.entered_at).getTime()) / 1000));
  db.prepare(`UPDATE visits SET left_at=COALESCE(left_at,?), duration_sec=?,
              visible_seconds=COALESCE(?,visible_seconds) WHERE session_id=?`)
    .run(now, dur, visible_seconds ?? null, session_id);
  res.json({ ok: true });
});

module.exports = router;
