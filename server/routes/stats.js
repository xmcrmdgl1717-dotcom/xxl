const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/', (req, res) => {
  const today = "date(created_at) = date('now')";
  const row = db.prepare(`
    SELECT
      COUNT(*) AS visits,
      SUM(CASE WHEN device_type='android' THEN 1 ELSE 0 END) AS android,
      SUM(CASE WHEN device_type='ios'     THEN 1 ELSE 0 END) AS ios,
      SUM(CASE WHEN device_type='desktop' THEN 1 ELSE 0 END) AS desktop,
      SUM(CASE WHEN device_type='unknown' OR device_type IS NULL THEN 1 ELSE 0 END) AS unknown,
      ROUND(AVG(NULLIF(duration_sec,0))) AS avg_duration,
      SUM(CASE WHEN ${today} THEN 1 ELSE 0 END) AS today_visits
    FROM visits
  `).get();
  res.json({
    visits: row.visits || 0,
    android: row.android || 0,
    ios: row.ios || 0,
    desktop: row.desktop || 0,
    unknown: row.unknown || 0,
    avg_duration: row.avg_duration || 0,
    today_visits: row.today_visits || 0,
  });
});

module.exports = router;
