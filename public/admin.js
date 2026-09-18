const $ = s => document.querySelector(s);
const state = { page: 1, size: 20, filter: { date:'today', device:'all', level:'all', q:'' } };

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1600);
}
function fmtDuration(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m >= 60) { const h = Math.floor(m / 60); return `${h}h${m % 60}m`; }
  return m ? `${m}m ${s}s` : `${s}s`;
}
function fmtTime(s) {
  if (!s) return '-';
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
const deviceLabel = { android:'安卓', ios:'苹果', desktop:'桌面', unknown:'未知' };

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
  const s = await api('/api/stats');
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

/* ================= 卡片点击切换设备筛选 ================= */
document.querySelectorAll('.card[data-device]').forEach(card => {
  card.onclick = () => {
    const dev = card.dataset.device;
    state.filter.device = (state.filter.device === dev) ? 'all' : dev;
    state.page = 1;
    syncUI();
    refresh();
  };
});

/* ================= 状态与 UI 双向同步 ================= */
function syncUI() {
  $('#fDate').value   = state.filter.date;
  $('#fDevice').value = state.filter.device;
  $('#fLevel').value  = state.filter.level;
  $('#fKw').value     = state.filter.q;
  highlightCards();
}

/* ================= 列表 ================= */
function buildQuery() {
  return new URLSearchParams({
    date:   state.filter.date,
    device: state.filter.device,
    level:  state.filter.level,
    q:      state.filter.q,
    page:   state.page,
    size:   state.size,
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
    list.innerHTML = '<div class="item" style="text-align:center;color:#7c8aa0">暂无数据</div>';
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
        <span class="clickable" data-search="${r.country_name || ''}" title="点击筛选该国家">${flag(r.country)} ${r.country_name || '未知'}</span>
        <span class="clickable" data-device-pick="${r.device_type || ''}" title="点击筛选该设备">📱 ${deviceLabel[r.device_type] || '未知'}</span>
        <span class="clickable" data-search="${r.os || ''}" title="点击筛选该系统">🖥 ${r.os || '未知'}</span>
        <span class="clickable" data-search="${r.browser || ''}" title="点击筛选该浏览器">🧭 ${r.browser || '未知'}</span>
        <span class="clickable" data-search="${r.lang || ''}" title="点击筛选该语言">🗣 ${r.lang || '未知'}</span>
      </div>
    </div>
  `).join('');
  renderPager(data.total);
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

/* ================= 列表内点击 ================= */
$('#list').addEventListener('click', async (e) => {
  // 通用搜索字段
  const sEl = e.target.closest('[data-search]');
  if (sEl && sEl.dataset.search) { setSearch(sEl.dataset.search); return; }

  // 设备：同步到下拉
  const dEl = e.target.closest('[data-device-pick]');
  if (dEl && dEl.dataset.devicePick) {
    state.filter.device = dEl.dataset.devicePick;
    state.page = 1;
    syncUI();
    refresh();
    return;
  }

  const item = e.target.closest('.item'); if (!item) return;
  const id = item.dataset.id;
  const act = e.target.dataset.act;
  if (act === 'detail') {
    const r = await api('/api/visits/' + id);
    $('#detailBody').textContent = JSON.stringify(r, null, 2);
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
$('#fDate').onchange   = () => { state.filter.date   = $('#fDate').value;   state.page = 1; refresh(); };
$('#fDevice').onchange = () => { state.filter.device = $('#fDevice').value; state.page = 1; refresh(); };
$('#fLevel').onchange  = () => { state.filter.level  = $('#fLevel').value;  state.page = 1; refresh(); };
$('#btnSearch').onclick = () => { state.filter.q = $('#fKw').value.trim(); state.page = 1; refresh(); };
$('#fKw').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btnSearch').click(); });
$('#btnReset').onclick = () => {
  state.filter = { date:'today', device:'all', level:'all', q:'' };
  state.page = 1;
  syncUI();
  refresh();
};

/* ================= 导出 / 批量删除 ================= */
$('#btnExport').onclick = () => {
  const q = new URLSearchParams({
    date: state.filter.date, device: state.filter.device,
    level: state.filter.level, q: state.filter.q,
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
syncUI();
refresh();
