const fetch = require('node-fetch');

const cache = new Map();
const TTL = 24 * 3600 * 1000;

async function lookup(ip) {
  if (!ip) return { country: null, country_name: '未知' };
  if (ip.startsWith('127.') || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return { country: null, country_name: '内网' };
  }
  const hit = cache.get(ip);
  if (hit && Date.now() - hit.ts < TTL) return { country: hit.cc, country_name: hit.cn };

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,country&lang=zh-CN`,
      { signal: ctrl.signal }
    );
    clearTimeout(t);
    const j = await r.json();
    if (j.status === 'success') {
      const out = { country: j.countryCode, country_name: j.country || j.countryCode };
      cache.set(ip, { cc: out.country, cn: out.country_name, ts: Date.now() });
      return out;
    }
  } catch (e) { /* 降级 */ }
  return { country: null, country_name: '未知' };
}

module.exports = { lookup };