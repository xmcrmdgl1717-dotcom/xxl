const $ = s => document.querySelector(s);
const state = {
  page: 1,
  size: 50,
  filter: {
    date: 'today', device: 'all', level: 'all',
    country: 'all', os: 'all', browser: 'all', lang: 'all',
    from: '', to: '',
    q: '',
  },
};

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1600);
}
function fmtDuration(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m >= 60) { const h = Math.floor(m / 60); return `${h}h ${m % 60}m`; }
  return m ? `${m}m ${s}s` : `${s}s`;
}
function fmtTime(s) {
  if (!s) return '-';
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
const deviceLabel = { android:'安卓', ios:'苹果', desktop:'桌面', unknown:'未知' };
const LANG_LABEL = {
  en:'英语', zh:'简体中文', zht:'繁体中文', es:'西班牙语', ar:'阿拉伯语',
  pt:'葡萄牙语', id:'印尼语', fr:'法语', ja:'日语', ru:'俄语', de:'德语',
  ko:'韩语', vi:'越南语', tr:'土耳其语', hi:'印地语', th:'泰语', ur:'乌尔都语',
};

/* ================= 主题切换（默认浅色） ================= */
function applyTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('ddx-admin-theme', t);
  const btn = $('#btnTheme');
  if (btn) btn.textContent = (t === 'light') ? '☀️ 浅色' : '🌙 深色';
}
function initTheme() {
  const saved = localStorage.getItem('ddx-admin-theme') || 'light';
  applyTheme(saved);
}
$('#btnTheme').onclick = () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
};

async function api(path, opt = {}) {
  const r = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...opt,
  });
  if (r.status === 401) { location.href = '/admin/login'; throw new Error('unauth'); }
  return r.json();
}

/* ================= 统计卡片 ================= */
async function loadStats() {
  const q = new URLSearchParams({
    date:    state.filter.date,
    device:  state.filter.device,
    level:   state.filter.level,
    country: state.filter.country,
    os:      state.filter.os,
    browser: state.filter.browser,
    lang:    state.filter.lang,
    from:    state.filter.from,
    to:      state.filter.to,
    q:       state.filter.q,
  }).toString();
  const s = await api('/api/stats?' + q);
  $('#cVisits').textContent = s.visits;
  $('#cAndroid').textContent = s.android;
  $('#cIos').textContent = s.ios;
  $('#cDesktop').textContent = s.desktop;
  $('#cUnknown').textContent = s.unknown;
  $('#cAvg').textContent = fmtDuration(s.avg_duration);
  highlightCards();
}
function highlightCards() {
  document.querySelectorAll('.card[data-device]').forEach(c => {
    c.classList.toggle('active', c.dataset.device === state.filter.device);
  });
}
document.querySelectorAll('.card[data-device]').forEach(card => {
  card.onclick = () => {
    const dev = card.dataset.device;
    if (dev === 'all') {
      state.filter.device = 'all';
    } else {
      state.filter.device = (state.filter.device === dev) ? 'all' : dev;
    }
    state.page = 1;
    syncUI();
    refresh();
  };
});

/* ================= 动态下拉选项 ================= */
async function loadOptions() {
  const o = await api('/api/visits/options');
  fillSelect('#fCountry', o.countries);
  fillSelect('#fOs',      o.os);
  fillSelect('#fBrowser', o.browsers);
  fillSelect('#fLang',    o.langs);
  syncUI();
}
function fillSelect(sel, arr) {
  const el = $(sel);
  const cur = el.value || 'all';
  el.innerHTML = '<option value="all">全部</option>' +
    (arr || []).map(v => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
  if ([...el.options].some(o => o.value === cur)) el.value = cur;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

/* ================= 状态与 UI 双向同步 ================= */
function syncUI() {
  $('#fDate').value    = state.filter.date;
  $('#fDevice').value  = state.filter.device;
  $('#fLevel').value   = state.filter.level;
  $('#fCountry').value = state.filter.country;
  $('#fOs').value      = state.filter.os;
  $('#fBrowser').value = state.filter.browser;
  $('#fLang').value    = state.filter.lang;
  $('#fKw').value      = state.filter.q;
  $('#fPageSize').value = String(state.size);

  const showCustom = state.filter.date === 'custom';
  $('#dateRangeBox').style.display = showCustom ? '' : 'none';
  if (showCustom) {
    if (state.filter.from) $('#fFrom').value = state.filter.from;
    if (state.filter.to)   $('#fTo').value   = state.filter.to;
  }

  highlightCards();
}

/* ================= 列表 ================= */
function buildQuery() {
  return new URLSearchParams({
    date:    state.filter.date,
    device:  state.filter.device,
    level:   state.filter.level,
    country: state.filter.country,
    os:      state.filter.os,
    browser: state.filter.browser,
    lang:    state.filter.lang,
    from:    state.filter.from,
    to:      state.filter.to,
    q:       state.filter.q,
    page:    state.page,
    size:    state.size,
  }).toString();
}

function flag(cc) {
  if (!cc || cc.length !== 2) return '🏳';
  return String.fromCodePoint(...cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)));
}

async function loadList() {
  const data = await api('/api/visits?' + buildQuery());
  $('#totalHint').textContent = `共 ${data.total} 条（当前筛选）`;
  const list = $('#list');
  if (!data.rows.length) {
    list.innerHTML = '<div class="item" style="text-align:center;color:var(--muted)">暂无数据</div>';
    renderPager(0); return;
  }
  list.innerHTML = data.rows.map(r => `
    <div class="item" data-id="${r.id}">
      <div class="r1">
        <input type="checkbox" class="ck" value="${r.id}">
        <span class="fp clickable" data-search="${r.fingerprint || ''}" title="点击筛选该指纹">${r.fingerprint || '无指纹'}</span>
        <span class="tag new">${r.levels_cleared > 0 ? '已通关 ' + r.levels_cleared + ' 关' : '未通关'}</span>
        <span class="spacer"></span>
        <button class="iconbtn" data-act="detail">📄 查看明细</button>
        <button class="iconbtn red" data-act="del">🗑 删除</button>
      </div>
      <div class="r2">
        <span>🟢 进入: <b>${fmtTime(r.entered_at)}</b></span>
        <span>🔴 离开: <b>${fmtTime(r.left_at)}</b></span>
        <span>⏱ 停留: <b>${fmtDuration(r.duration_sec)}</b></span>
        <span>🎯 到第 <b>${r.level_reached}</b> 关</span>
      </div>
      <div class="r3">
        <span>#${r.id}</span>
        <span class="clickable" data-search="${r.ip || ''}" title="点击筛选该 IP">🌐 ${r.ip || '未知'}</span>
        <span class="clickable" data-filter="country" data-value="${r.country_name || ''}" title="点击筛选该国家">${flag(r.country)} ${r.country_name || '未知'}</span>
        <span class="clickable" data-device-pick="${r.device_type || ''}" title="点击筛选该设备">📱 ${deviceLabel[r.device_type] || '未知'}</span>
        <span class="clickable" data-filter="os" data-value="${r.os || ''}" title="点击筛选该系统">🖥 ${r.os || '未知'}</span>
        <span class="clickable" data-filter="browser" data-value="${r.browser || ''}" title="点击筛选该浏览器">🧭 ${r.browser || '未知'}</span>
        <span class="clickable" data-filter="lang" data-value="${r.lang || ''}" title="点击筛选该语言">🗣 ${r.lang || '未知'}</span>
      </div>
    </div>
  `).join('');
  renderPager(data.total);
  updateSelectAllState();
}

function renderPager(total) {
  const pages = Math.ceil(total / state.size) || 1;
  const p = state.page;
  const btn = (n, label = n, active = false) =>
    `<button class="${active ? 'active' : ''}" data-page="${n}">${label}</button>`;
  let html = btn(1, '«') + btn(Math.max(1, p - 1), '‹');
  for (let i = Math.max(1, p - 2); i <= Math.min(pages, p + 2); i++) html += btn(i, i, i === p);
  html += btn(Math.min(pages, p + 1), '›') + btn(pages, '»');
  $('#pager').innerHTML = html;
  $('#pager').querySelectorAll('button').forEach(b => {
    b.onclick = () => { state.page = parseInt(b.dataset.page, 10); loadList(); };
  });
}

/* ================= 全选 / 取消 ================= */
function updateSelectAllState() {
  const boxes = [...document.querySelectorAll('.ck')];
  const checked = boxes.filter(b => b.checked).length;
  const btn = $('#btnSelectAll');
  if (!btn) return;
  if (boxes.length && checked === boxes.length) btn.textContent = `☑ 已全选（${checked}）`;
  else if (checked > 0) btn.textContent = `☑ 全选当页（已选 ${checked}）`;
  else btn.textContent = `☑ 全选当页`;
}
$('#btnSelectAll').onclick = () => {
  document.querySelectorAll('.ck').forEach(b => b.checked = true);
  updateSelectAllState();
};
$('#btnClearSel').onclick = () => {
  document.querySelectorAll('.ck').forEach(b => b.checked = false);
  updateSelectAllState();
};
document.addEventListener('change', (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('ck')) {
    updateSelectAllState();
  }
});

/* ================= 明细中文化 ================= */
function renderDetail(r) {
  const rows = [
    ['记录 ID',        r.id],
    ['会话 ID',        r.session_id],
    ['浏览器指纹',      r.fingerprint || '—'],
    ['IP 地址',        r.ip || '—'],
    ['国家/地区',       (r.country_name || '未知') + (r.country ? `（${r.country}）` : '')],
    ['设备类型',        deviceLabel[r.device_type] || r.device_type || '未知'],
    ['操作系统',        r.os || '未知'],
    ['浏览器',          r.browser || '未知'],
    ['界面语言',        LANG_LABEL[r.lang] ? `${LANG_LABEL[r.lang]}（${r.lang}）` : (r.lang || '未知')],
    ['进入时间',        fmtTime(r.entered_at)],
    ['最后活跃',        fmtTime(r.last_seen_at)],
    ['离开时间',        fmtTime(r.left_at)],
    ['停留时长',        fmtDuration(r.duration_sec)],
    ['页面可见时长',     fmtDuration(r.visible_seconds)],
    ['游戏内用时',      fmtDuration(r.play_seconds)],
    ['到达关卡',        `第 ${r.level_reached} 关`],
    ['最高关卡',        `第 ${r.max_level} 关`],
    ['已通关数',        `${r.levels_cleared} 关`],
    ['访问次数',        r.visit_count],
    ['来源页面',        r.referrer || '直接访问'],
    ['User-Agent',     r.user_agent || '—'],
    ['创建时间',        fmtTime(r.created_at)],
  ];
  return '<div class="dgrid">' + rows.map(([k, v]) => `
    <div class="drow">
      <div class="dk">${k}</div>
      <div class="dv">${escapeHtml(v ?? '—')}</div>
    </div>
  `).join('') + '</div>';
}

/* ================= 列表内点击 ================= */
$('#list').addEventListener('click', async (e) => {
  if (e.target.classList.contains('ck')) return;

  const sEl = e.target.closest('[data-search]');
  if (sEl && sEl.dataset.search) { setSearch(sEl.dataset.search); return; }

  const dEl = e.target.closest('[data-device-pick]');
  if (dEl && dEl.dataset.devicePick) {
    state.filter.device = dEl.dataset.devicePick;
    state.page = 1;
    syncUI();
    refresh();
    return;
  }

  const fEl = e.target.closest('[data-filter]');
  if (fEl && fEl.dataset.filter) {
    const key = fEl.dataset.filter;
    const val = fEl.dataset.value;
    if (key in state.filter) {
      state.filter[key] = val || 'all';
      state.page = 1;
      syncUI();
      refresh();
    }
    return;
  }

  const item = e.target.closest('.item'); if (!item) return;
  const id = item.dataset.id;
  const act = e.target.dataset.act;
  if (act === 'detail') {
    const r = await api('/api/visits/' + id);
    $('#detailBody').innerHTML = renderDetail(r);
    $('#mDetail').classList.remove('hidden');
  } else if (act === 'del') {
    if (!confirm('确认删除这条记录？')) return;
    await api('/api/visits/' + id, { method: 'DELETE' });
    toast('已删除'); refresh();
  }
});

function setSearch(kw) {
  state.filter.q = kw;
  state.page = 1;
  syncUI();
  refresh();
}

/* ================= 筛选栏事件 ================= */
$('#fDate').onchange = () => {
  state.filter.date = $('#fDate').value;
  const showCustom = state.filter.date === 'custom';
  $('#dateRangeBox').style.display = showCustom ? '' : 'none';
  if (showCustom && !$('#fFrom').value) {
    const today = new Date().toISOString().slice(0, 10);
    $('#fFrom').value = today;
    $('#fTo').value = today;
    state.filter.from = today;
    state.filter.to = today;
  }
  state.page = 1;
  refresh();
};
$('#fFrom').onchange = () => { state.filter.from = $('#fFrom').value; state.page = 1; refresh(); };
$('#fTo').onchange   = () => { state.filter.to   = $('#fTo').value;   state.page = 1; refresh(); };
$('#fDevice').onchange  = () => { state.filter.device  = $('#fDevice').value;  state.page = 1; refresh(); };
$('#fLevel').onchange   = () => { state.filter.level   = $('#fLevel').value;   state.page = 1; refresh(); };
$('#fCountry').onchange = () => { state.filter.country = $('#fCountry').value; state.page = 1; refresh(); };
$('#fOs').onchange      = () => { state.filter.os      = $('#fOs').value;      state.page = 1; refresh(); };
$('#fBrowser').onchange = () => { state.filter.browser = $('#fBrowser').value; state.page = 1; refresh(); };
$('#fLang').onchange    = () => { state.filter.lang    = $('#fLang').value;    state.page = 1; refresh(); };

/* 每页条数 */
$('#fPageSize').onchange = () => {
  state.size = parseInt($('#fPageSize').value, 10) || 50;
  state.page = 1;
  loadList();
};

$('#btnSearch').onclick = () => { state.filter.q = $('#fKw').value.trim(); state.page = 1; refresh(); };
$('#fKw').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btnSearch').click(); });

$('#btnReset').onclick = () => {
  state.filter = {
    date: 'today', device: 'all', level: 'all',
    country: 'all', os: 'all', browser: 'all', lang: 'all',
    from: '', to: '', q: '',
  };
  $('#dateRangeBox').style.display = 'none';
  $('#fFrom').value = '';
  $('#fTo').value = '';
  state.page = 1;
  syncUI();
  refresh();
};

/* ================= 导出 / 批量删除 ================= */
$('#btnExport').onclick = () => {
  const q = new URLSearchParams({
    date: state.filter.date, device: state.filter.device,
    level: state.filter.level, country: state.filter.country,
    os: state.filter.os, browser: state.filter.browser,
    lang: state.filter.lang, from: state.filter.from, to: state.filter.to,
    q: state.filter.q,
  });
  location.href = '/api/visits/export/csv?' + q.toString();
};
$('#btnBatchDel').onclick = async () => {
  const ids = [...document.querySelectorAll('.ck:checked')].map(x => +x.value);
  if (!ids.length) return toast('请先勾选');
  if (!confirm(`确认删除选中的 ${ids.length} 条？`)) return;
  await api('/api/visits/batch-delete', { method: 'POST', body: JSON.stringify({ ids }) });
  toast('已删除'); refresh();
};

/* ================= 顶部按钮 ================= */
$('#btnRefresh').onclick = () => { refresh(); toast('已刷新'); };
$('#btnLogout').onclick = async () => {
  await api('/api/logout', { method: 'POST' });
  location.href = '/admin/login';
};

/* ================= 设置弹窗 ================= */
$('#btnSettings').onclick = async () => {
  const s = await api('/api/settings');
  $('#hbInterval').value = s.heartbeat_interval;
  $('#hbTimeout').value  = s.heartbeat_timeout;
  $('#rtDays').value     = s.data_retention_days;
  $('#mSettings').classList.remove('hidden');
};
document.querySelectorAll('[data-close]').forEach(b =>
  b.onclick = () => b.closest('.modal').classList.add('hidden'));
document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
  document.querySelectorAll('.tab-body').forEach(p =>
    p.classList.toggle('hidden', p.dataset.panel !== t.dataset.tab));
});
$('#btnSavePw').onclick = async () => {
  const body = {
    old_password: $('#oldPw').value,
    new_password: $('#newPw').value,
    confirm_password: $('#newPw2').value,
  };
  const r = await api('/api/settings/password', { method: 'POST', body: JSON.stringify(body) });
  if (r.error) return toast(r.error);
  toast('密码已修改，请重新登录');
  setTimeout(() => location.href = '/admin/login', 900);
};
$('#btnSaveHb').onclick = async () => {
  const body = { heartbeat_interval: $('#hbInterval').value, heartbeat_timeout: $('#hbTimeout').value };
  const r = await api('/api/settings/heartbeat', { method: 'POST', body: JSON.stringify(body) });
  toast(r.error || '已保存，新会话生效');
};
$('#btnSaveRt').onclick = async () => {
  const body = { data_retention_days: $('#rtDays').value };
  const r = await api('/api/settings/retention', { method: 'POST', body: JSON.stringify(body) });
  toast(r.error || '已保存');
};

/* ================= 统一刷新 + 启动 ================= */
function refresh() { loadStats(); loadList(); }
initTheme();
syncUI();
refresh();
loadOptions();