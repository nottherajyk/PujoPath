import { makeCtx, cardHTML, esc, icon, routeLinks, stationToPandalLink, placeLink } from '/js/shared.js';

const PAGE = 10;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- storage (never throws) ---------- */
const mem = {};
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return k in mem ? mem[k] : d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { mem[k] = v; } },
  remove(k) { try { localStorage.removeItem(k); } catch { delete mem[k]; } },
  clearApp() {
    try {
      ['pp_wishlist', 'pp_plan', 'pp_recent', 'pp_pandal_filters', 'pp_hop_zone'].forEach((k) => localStorage.removeItem(k));
    } catch {}
    for (const k in mem) delete mem[k];
  }
};
window.addEventListener('storage', (e) => {
  if (e.key === 'pp_wishlist') syncWish();
});
const wish = {
  list: () => store.get('pp_wishlist', []),
  has: (id) => wish.list().includes(id),
  toggle(id) {
    const l = wish.list(); const i = l.indexOf(id);
    if (i >= 0) l.splice(i, 1); else l.push(id);
    store.set('pp_wishlist', l); return i < 0;
  },
  clear() { store.set('pp_wishlist', []); },
};

/* ---------- UI helpers ---------- */
let toastTimer;
function toast(msg) {
  const t = $('[data-toast]'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}
function syncWish(root = document) {
  const l = new Set(wish.list());
  $$('[data-heart]', root).forEach((b) => b.setAttribute('aria-pressed', String(l.has(b.dataset.heart))));
  $$('[data-wish-count]').forEach((b) => { b.textContent = l.size; b.dataset.count = l.size; });
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-heart]'); if (!b) return;
  e.preventDefault();
  const on = wish.toggle(b.dataset.heart);
  syncWish();
  toast(on ? 'Saved to wishlist' : 'Removed from wishlist');
  document.dispatchEvent(new CustomEvent('wish-change', { detail: { id: b.dataset.heart, on } }));
});
syncWish();

const params = new URLSearchParams(location.search);
const setParams = (obj) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) if (v) p.set(k, v);
  const s = p.toString();
  history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
};

/* ---------- data ---------- */
const data = await fetch('/data.json').then((r) => r.json()).catch(() => null);
const page = document.body.dataset.page;
if (!data) { const m = $('main'); if (m && page !== 'pandal') m.insertAdjacentHTML('beforeend', '<div class="wrap"><div class="empty"><h3>Couldn’t load pandal data</h3><p>Check your connection and refresh.</p></div></div>'); }
else init();

function init() {
  const ctx = makeCtx(data);
  const byId = new Map(data.pandals.map((p) => [p.id, p]));
  const lineOf = (id) => data.lines.find((l) => l.id === id);

  // order used to sort pandals along the network
  const stationOrder = new Map();
  data.lines.forEach((l, li) => l.stations.forEach((s, i) => { if (!stationOrder.has(s)) stationOrder.set(s, li * 100 + i); }));
  const ord = (p) => stationOrder.get(p.station) ?? 9999;

  // network graph (interchanges share a station name)
  const graph = new Map();
  const link = (a, b) => { (graph.get(a) || graph.set(a, new Set()).get(a)).add(b); (graph.get(b) || graph.set(b, new Set()).get(b)).add(a); };
  data.lines.forEach((l) => l.stations.forEach((s, i) => { if (!graph.has(s)) graph.set(s, new Set()); if (i) link(l.stations[i - 1], s); }));
  const hopCache = new Map();
  function hopsFrom(start) {
    if (hopCache.has(start)) return hopCache.get(start);
    const d = new Map([[start, 0]]); const q = [start];
    while (q.length) { const c = q.shift(); for (const n of graph.get(c) || []) if (!d.has(n)) { d.set(n, d.get(c) + 1); q.push(n); } }
    hopCache.set(start, d); return d;
  }
  const hop = (a, b) => hopsFrom(a).get(b) ?? 30;

  const render = { pandals, hopping, planner, wishlist, metro, map, home, support, pandal }[page];
  render?.();

  /* ================= PANDALS ================= */
  function pandals() {
    const list = $('[data-list]'), more = $('[data-more]'), note = $('[data-more-note]'), count = $('[data-count]'), reset = $('[data-reset]');
    const els = { q: $('#q'), zone: $('#f-zone'), line: $('#f-line'), type: $('#f-type'), walk: $('#f-walk') };
    const savedFilters = store.get('pp_pandal_filters', {});
    for (const k of Object.keys(els)) {
      if (params.get(k)) els[k].value = params.get(k);
      else if (savedFilters[k] && !location.search) els[k].value = savedFilters[k];
    }
    let shown = PAGE, results = [];

    const hay = (p) => `${p.name} ${p.area} ${p.station} ${ctx.zones[p.zone].label} ${p.theme || ''}`.toLowerCase();
    function apply(keepShown) {
      const q = els.q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const lineSt = els.line.value ? new Set(lineOf(els.line.value).stations) : null;
      const maxWalk = Number(els.walk.value) || 0;
      results = data.pandals.filter((p) =>
        q.every((t) => hay(p).includes(t)) &&
        (!els.zone.value || p.zone === els.zone.value) &&
        (!lineSt || lineSt.has(p.station)) &&
        (!els.type.value || (els.type.value === 'must' ? p.must : els.type.value === 'bonedi' ? p.bonedi : !!p.theme)) &&
        (!maxWalk || (p.walkMin && p.walkMin <= maxWalk)));
      if (!els.q.value && !els.zone.value && !els.line.value && !els.type.value && !els.walk.value) results.sort((a, b) => (b.must ? 1 : 0) - (a.must ? 1 : 0));
      if (!keepShown) shown = PAGE;
      draw();
      const active = Object.values(els).some((e) => e.value);
      reset.hidden = !active;
      const filterState = { q: els.q.value.trim(), zone: els.zone.value, line: els.line.value, type: els.type.value, walk: els.walk.value };
      store.set('pp_pandal_filters', filterState);
      setParams(filterState);
    }
    function draw(focusFrom) {
      const slice = results.slice(0, shown);
      list.innerHTML = slice.length ? slice.map((p) => cardHTML(p, ctx)).join('') : `<div class="empty" style="grid-column:1/-1"><h3>No pandals match</h3><p>Try a different spelling, area or metro station.</p><button class="btn btn-primary" type="button" data-reset-inline>Clear filters</button></div>`;
      syncWish(list);
      count.textContent = results.length ? `Showing ${slice.length} of ${results.length} pandals` : '0 pandals';
      const left = results.length - slice.length;
      more.hidden = left <= 0; note.textContent = left > 0 ? `${left} more to explore` : '';
      more.textContent = `View more pandals`;
      if (focusFrom != null) $$('.card h3 a', list)[focusFrom]?.focus({ preventScroll: false });
    }
    more.addEventListener('click', () => { const from = shown; shown += PAGE; draw(from); });
    let t; els.q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => apply(), 120); });
    for (const k of ['zone', 'line', 'type', 'walk']) els[k].addEventListener('change', () => apply());
    const clear = () => { Object.values(els).forEach((e) => (e.value = '')); store.remove('pp_pandal_filters'); apply(); };
    reset.addEventListener('click', clear);
    list.addEventListener('click', (e) => { if (e.target.closest('[data-reset-inline]')) clear(); });
    apply();
  }

  /* ================= HOPPING ================= */
  function hopping() {
    const chips = $$('[data-zone]'), view = $('[data-zone-view]'), pick = $('[data-zone-pick]');
    const list = $('[data-list]'), more = $('[data-more]'), note = $('[data-more-note]');
    let zone = '', shown = PAGE, items = [];
    function draw(focusFrom) {
      const slice = items.slice(0, shown);
      list.innerHTML = slice.map((p) => cardHTML(p, ctx)).join('');
      syncWish(list);
      const left = items.length - slice.length;
      more.hidden = left <= 0; note.textContent = left > 0 ? `${left} more stops in this zone` : `All ${items.length} stops shown`;
      if (focusFrom != null) $$('.card h3 a', list)[focusFrom]?.focus();
    }
    function select(z) {
      if (!ctx.zones[z]) { view.hidden = true; pick.hidden = false; chips.forEach((c) => c.setAttribute('aria-pressed', 'false')); store.remove('pp_hop_zone'); return; }
      zone = z; shown = PAGE;
      store.set('pp_hop_zone', z);
      items = data.pandals.filter((p) => (z === 'bonedi' ? p.bonedi : p.zone === z)).sort((a, b) => ord(a) - ord(b) || (b.must ? 1 : 0) - (a.must ? 1 : 0));
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.zone === z)));
      $('[data-zone-title]').textContent = ctx.zones[z].title;
      $('[data-zone-blurb]').textContent = `${items.length} pandals · ${ctx.zones[z].blurb}. Hub: ${ctx.zones[z].hub} (${ctx.zones[z].lines}).`;
      $('[data-plan-link]').href = `/planner?zone=${z}`;
      const first = routeLinks(items.slice(0, 10))[0];
      const fr = $('[data-first-route]'); first ? (fr.href = first) : fr.setAttribute('hidden', '');
      view.hidden = false; pick.hidden = true;
      setParams({ zone: z }); draw();
    }
    chips.forEach((c) => c.addEventListener('click', () => select(c.dataset.zone)));
    more.addEventListener('click', () => { const f = shown; shown += PAGE; draw(f); });
    const initialZone = params.get('zone') || store.get('pp_hop_zone', '');
    select(initialZone);
  }

  /* ================= PLANNER ================= */
  function planner() {
    const form = $('[data-plan-form]');
    const el = { date: $('#p-date'), start: $('#p-start'), zone: $('#p-zone'), line: $('#p-line'), max: $('#p-max'), must: $('#p-must'), search: $('#p-search') };
    const modeBtns = $$('[data-mode]');
    const result = $('[data-result]'), itin = $('[data-itinerary]'), summary = $('[data-summary]'), more = $('[data-more]');
    const cta = $('[data-cta]'), openMaps = $('[data-open-maps]');
    const saved = store.get('pp_plan', {});
    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    let mode = saved.mode || 'zone'; let picked = new Set(saved.picked || []); let route = []; let shown = PAGE;

    el.date.value = saved.date && saved.date >= today.toISOString().slice(0, 10) ? saved.date : today.toISOString().slice(0, 10);
    el.start.value = saved.start || 'Shyambazar';
    if (saved.zone) el.zone.value = saved.zone; if (saved.line) el.line.value = saved.line;
    if (saved.max) el.max.value = saved.max; if (saved.must != null) el.must.value = saved.must;

    // deep links
    if (params.get('zone') && ctx.zones[params.get('zone')]) { mode = 'zone'; el.zone.value = params.get('zone'); }
    if (params.get('wish')) { mode = 'custom'; picked = new Set(wish.list()); }
    if (params.get('add') && byId.has(params.get('add'))) { mode = 'custom'; picked.add(params.get('add')); }

    function saveDraft() {
      store.set('pp_plan', { mode, date: el.date.value, start: el.start.value, zone: el.zone.value, line: el.line.value, max: el.max.value, must: el.must.value, picked: [...picked] });
    }
    for (const f of [el.date, el.start, el.zone, el.line, el.max, el.must]) {
      f.addEventListener('change', saveDraft);
    }

    function setMode(m) {
      mode = m;
      modeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
      $$('[data-opt]').forEach((o) => (o.hidden = o.dataset.opt !== m));
      $('[data-opt-limit]').hidden = m === 'custom';
      saveDraft();
      if (m === 'custom') drawPicker();
    }
    modeBtns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

    function drawPicker() {
      const q = el.search.value.trim().toLowerCase();
      const pool = q ? data.pandals.filter((p) => `${p.name} ${p.area} ${p.station}`.toLowerCase().includes(q)) : [...picked].map((id) => byId.get(id)).filter(Boolean).concat(data.pandals.filter((p) => p.must && !picked.has(p.id)));
      const rows = pool.slice(0, 10);
      $('[data-picker]').innerHTML = rows.map((p) => `<button type="button" class="pick" aria-pressed="${picked.has(p.id)}" data-pick="${p.id}"><span><b>${esc(p.name)}</b><br><small class="muted">${esc(p.station)} · ${esc(p.area)}</small></span><span aria-hidden="true">${picked.has(p.id) ? '✓' : '+'}</span></button>`).join('') || '<p class="count-note">No matches.</p>';
      $('[data-picked-note]').textContent = `${picked.size} selected${q ? '' : ': search to add more'}`;
    }
    $('[data-picker]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]'); if (!b) return;
      picked.has(b.dataset.pick) ? picked.delete(b.dataset.pick) : picked.add(b.dataset.pick);
      saveDraft();
      drawPicker();
    });
    el.search.addEventListener('input', drawPicker);
    $('[data-use-wish]').addEventListener('click', () => { wish.list().forEach((id) => picked.add(id)); saveDraft(); drawPicker(); toast(`${wish.list().length} wishlist pandals added`); });

    function build() {
      const start = el.start.value; const h = hopsFrom(start);
      const d = (p) => h.get(p.station) ?? 30;
      let pool;
      if (mode === 'zone') pool = data.pandals.filter((p) => (el.zone.value === 'bonedi' ? p.bonedi : p.zone === el.zone.value));
      else if (mode === 'line') { const st = new Set(lineOf(el.line.value).stations); pool = data.pandals.filter((p) => st.has(p.station)); }
      else pool = [...picked].map((id) => byId.get(id)).filter(Boolean);
      if (mode !== 'custom') {
        const mf = el.must.value === '1';
        pool = [...pool].sort((a, b) => (mf ? (b.must ? 1 : 0) - (a.must ? 1 : 0) : 0) || d(a) - d(b) || ord(a) - ord(b)).slice(0, Number(el.max.value));
      }
      route = pool.sort((a, b) => d(a) - d(b) || ord(a) - ord(b) || a.name.localeCompare(b.name));
      shown = PAGE;
      saveDraft();
      draw();
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function draw(focusFrom) {
      if (!route.length) {
        itin.innerHTML = '<li class="empty">No pandals to route yet. Pick a zone, line or some pandals.</li>'; summary.innerHTML = ''; cta.classList.remove('show'); more.hidden = true; return;
      }
      const start = el.start.value, h = hopsFrom(start);
      let stations = h.get(route[0].station) ?? 0;
      for (let i = 1; i < route.length; i++) stations += hop(route[i - 1].station, route[i].station);
      const mins = stations * 3 + route.length * 20;
      const dt = el.date.value ? new Date(el.date.value + 'T00:00') : null;
      $('[data-result-title]').textContent = dt ? `Your itinerary · ${dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}` : 'Your itinerary';
      summary.innerHTML = `<div><b>${route.length}</b><span>pandals</span></div><div><b>~${stations}</b><span>metro stations</span></div><div><b>~${Math.floor(mins / 60)}h ${mins % 60}m</b><span>estimated</span></div>`;
      itin.innerHTML = route.slice(0, shown).map((p) => {
        const line = ctx.lineByStation.get(p.station); const n = h.get(p.station);
        return `<li class="stop"><div class="stop-card">
          <h3><a href="/pandal/${p.id}">${esc(p.name)}</a></h3>
          <p class="muted" style="font-size:13px">${esc(p.area)}</p>
          <span class="station"><span class="dot" style="background:${line.color}"></span>${esc(p.station)} Metro${n != null ? ` · ${n === 0 ? 'your start' : n + ' station' + (n > 1 ? 's' : '') + ' from start'}` : ''}</span>
          <div class="actions"><a class="btn btn-ghost btn-sm" href="${stationToPandalLink(p)}" target="_blank" rel="noopener">${icon('walk')} Walk from station</a>${p.must ? '<span class="tag gold" style="align-self:center">Must visit</span>' : ''}</div>
          <button class="heart" type="button" aria-pressed="false" aria-label="Save ${esc(p.name)} to wishlist" data-heart="${p.id}">${icon('heart', '')}</button>
        </div></li>`;
      }).join('');
      syncWish(itin);
      const left = route.length - Math.min(shown, route.length);
      more.hidden = left <= 0; more.textContent = `View more stops (${left} left)`;
      const links = routeLinks(route, `${start} Metro Station, Kolkata`);
      openMaps.href = links[0]; openMaps.innerHTML = `${icon('map')} Open route in Google Maps${links.length > 1 ? ' (part 1 of ' + links.length + ')' : ''}`;
      $$('.extra-part').forEach((n) => n.remove());
      links.slice(1).forEach((u, i) => summary.insertAdjacentHTML('afterend', `<p class="extra-part count-note" style="margin:8px 0">Long route: <a href="${u}" target="_blank" rel="noopener" style="text-decoration:underline">open part ${i + 2} of ${links.length} in Maps</a></p>`));
      cta.classList.add('show');
      if (focusFrom != null) $$('.stop-card h3 a', itin)[focusFrom]?.focus();
    }
    more.addEventListener('click', () => { const f = shown; shown += PAGE; draw(f); });
    form.addEventListener('submit', (e) => { e.preventDefault(); build(); });
    $('[data-build]').addEventListener('click', (e) => { e.preventDefault(); build(); });
    setMode(mode);
    if (params.get('zone') || params.get('wish') || params.get('add')) { if (mode !== 'custom' || picked.size) build(); }
  }

  /* ================= WISHLIST ================= */
  function wishlist() {
    const list = $('[data-list]'), empty = $('[data-empty]'), more = $('[data-more]'), actions = $('[data-wish-actions]');
    let shown = PAGE;
    function draw(focusFrom) {
      const items = wish.list().map((id) => byId.get(id)).filter(Boolean);
      empty.hidden = items.length > 0; actions.hidden = !items.length;
      list.innerHTML = items.slice(0, shown).map((p) => cardHTML(p, ctx)).join('');
      syncWish(list);
      const left = items.length - shown; more.hidden = left <= 0; more.textContent = `View more (${left} left)`;
      if (focusFrom != null) $$('.card h3 a', list)[focusFrom]?.focus();
    }
    document.addEventListener('wish-change', () => draw());
    more.addEventListener('click', () => { const f = shown; shown += PAGE; draw(f); });
    $('[data-clear]').addEventListener('click', () => { if (confirm('Remove all saved pandals?')) { wish.clear(); draw(); syncWish(); } });
    draw();
  }

  /* ================= METRO ================= */
  function metro() {
    const view = $('[data-line-view]'), tabs = $$('[data-line]');
    function show(id) {
      const l = lineOf(id) || data.lines[0];
      tabs.forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.line === l.id)));
      setParams({ line: l.id });
      const items = l.stations.map((s) => {
        const ps = data.pandals.filter((p) => p.station === s);
        const inter = (ctx.linesByStation.get(s) || []).filter((x) => x.id !== l.id);
        return `<li class="stn"><button class="stn-head" type="button" aria-expanded="false" data-stn="${esc(s)}">
            <span class="name">${esc(s)}${inter.length ? `<span class="interchange">${inter.map((x) => x.name.replace(' Line', '')).join(' · ')}</span>` : ''}<span class="sub">${ps.length ? `${ps.length} pandal${ps.length > 1 ? 's' : ''} nearby` : 'No pandals listed yet'}</span></span>${icon('chev', 'icon chev')}</button>
          <div class="panel" hidden></div></li>`;
      }).join('');
      view.innerHTML = `<div class="line-banner" style="--lc:${l.color};--lt:${l.text}"><div><b>${l.name}</b><span>${esc(l.stations[0])} ↔ ${esc(l.stations.at(-1))} · ${l.stations.length} stations</span></div></div><ol class="stations" style="--lc:${l.color}">${items}</ol>`;
    }
    tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.line)));
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-stn]');
      if (b) {
        const panel = b.nextElementSibling; const open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', String(!open)); panel.hidden = open;
        if (!open && !panel.dataset.ready) { panel.dataset.ready = 1; panel._items = data.pandals.filter((p) => p.station === b.dataset.stn); panel._shown = 0; fillPanel(panel); }
        return;
      }
      const m = e.target.closest('[data-panel-more]');
      if (m) fillPanel(m.closest('.panel'));
    });
    function fillPanel(panel) {
      panel.querySelector('[data-panel-more]')?.remove();
      const items = panel._items;
      if (!items.length) { panel.innerHTML = '<p class="count-note">No pandals listed near this station yet.</p>'; return; }
      const next = items.slice(panel._shown, panel._shown + PAGE); panel._shown += next.length;
      panel.insertAdjacentHTML('beforeend', next.map((p) => `<a href="/pandal/${p.id}"><span><b>${esc(p.name)}</b><small>${esc(p.area)}</small></span><span aria-hidden="true">→</span></a>`).join(''));
      const left = items.length - panel._shown;
      if (left > 0) panel.insertAdjacentHTML('beforeend', `<button class="btn btn-ghost btn-sm" type="button" data-panel-more>View more (${left} left)</button>`);
    }
    // minimap (image only loads when expanded)
    const mm = $('[data-minimap]'), tog = $('[data-mm-toggle]'), body = $('#mm-body'), img = $('[data-mm-img]');
    function mmSet(open) {
      tog.setAttribute('aria-expanded', String(open)); body.hidden = !open;
      if (open && !img.src) img.src = img.dataset.src;
      $('.mm-text span', mm).textContent = open ? 'Tap to collapse' : 'Tap to expand the route map';
    }
    tog.addEventListener('click', () => mmSet(body.hidden));
    $('[data-mm-close]').addEventListener('click', () => { mmSet(false); tog.focus(); });
    show(params.get('line') || 'blue');
  }

  /* ================= MAP ================= */
  function map() {
    const view = $('[data-map-view]'), img = $('[data-map-img]');
    let z = 1;
    const set = (v) => { z = Math.min(4, Math.max(1, v)); img.style.width = z * 100 + '%'; };
    $$('[data-zoom]').forEach((b) => b.addEventListener('click', () => set(b.dataset.zoom === 'in' ? z + 0.5 : b.dataset.zoom === 'out' ? z - 0.5 : 1)));
    let drag = null;
    view.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, y: e.clientY, l: view.scrollLeft, t: view.scrollTop }; view.setPointerCapture(e.pointerId); });
    view.addEventListener('pointermove', (e) => { if (!drag) return; view.scrollLeft = drag.l - (e.clientX - drag.x); view.scrollTop = drag.t - (e.clientY - drag.y); });
    view.addEventListener('pointerup', () => (drag = null));
  }

  /* ================= HOME ================= */
  function home() {
    const loader = $('#homeLoader');
    if (loader) {
      const isReduced = document.documentElement.classList.contains('reduced-motion') || document.documentElement.classList.contains('slow-network');
      const dismiss = () => {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 420);
      };
      if (isReduced) {
        loader.remove();
      } else {
        setTimeout(dismiss, 380);
      }
    }

    const scroll = $('[data-iconic]');
    const prevBtn = $('[data-scroll-prev]');
    const nextBtn = $('[data-scroll-next]');
    if (scroll && prevBtn && nextBtn) {
      const step = () => (scroll.querySelector('.card')?.offsetWidth || 300) + 16;
      prevBtn.addEventListener('click', () => scroll.scrollBy({ left: -step(), behavior: 'smooth' }));
      nextBtn.addEventListener('click', () => scroll.scrollBy({ left: step(), behavior: 'smooth' }));
    }
  }

  /* ================= SUPPORT ================= */
  function support() {
    const wishEl = $('[data-stat-wish]');
    const planEl = $('[data-stat-plan]');
    const recentEl = $('[data-stat-recent]');
    const clearBtn = $('[data-clear-local]');

    function refreshStats() {
      const w = store.get('pp_wishlist', []);
      const p = store.get('pp_plan', null);
      const r = store.get('pp_recent', []);
      if (wishEl) wishEl.textContent = `${w.length} saved pandal${w.length === 1 ? '' : 's'}`;
      if (planEl) {
        if (p && (p.picked?.length || p.zone || p.line)) {
          planEl.textContent = p.mode === 'custom' ? `Custom route (${p.picked?.length || 0} stops)` : `${p.zone ? ctx.zones[p.zone]?.title || p.zone : p.line || 'Configured'} route`;
        } else {
          planEl.textContent = 'No route saved yet';
        }
      }
      if (recentEl) recentEl.textContent = `${r.length} pandal${r.length === 1 ? '' : 's'}`;
    }
    refreshStats();

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all your locally saved pandals, routes and preferences from this device?')) {
          store.clearApp();
          syncWish();
          refreshStats();
          toast('Local data cleared from this browser');
        }
      });
    }
  }

  /* ================= PANDAL DETAIL ================= */
  function pandal() {
    const m = location.pathname.match(/\/pandal\/([^\/]+)/);
    if (m && m[1]) {
      const id = m[1];
      const recents = store.get('pp_recent', []).filter((x) => x !== id);
      recents.unshift(id);
      store.set('pp_recent', recents.slice(0, 20));
    }
  }
}

/* ---------- Scroll-reveal animation ---------- */
if (!document.documentElement.classList.contains('reduced-motion')) {
  const reveals = document.querySelectorAll('.section, .metro-promo-card, .footer-grid, .local-data-card');
  if (reveals.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => { el.classList.add('reveal'); obs.observe(el); });
  }
}

/* ---------- Dynamic network detection ---------- */
try {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn && conn.addEventListener) {
    const checkNet = () => {
      const slow = conn.saveData
        || conn.effectiveType === 'slow-2g'
        || conn.effectiveType === '2g'
        || conn.effectiveType === '3g'
        || (typeof conn.downlink === 'number' && conn.downlink < 1.5)
        || (typeof conn.rtt === 'number' && conn.rtt > 500);
      document.documentElement.classList.toggle('slow-network', slow);
      document.documentElement.classList.toggle('reduced-motion', slow);
    };
    conn.addEventListener('change', checkNet);
  }
} catch(e) {}

/* ---------- Smooth navigation transitions & Top progress bar ---------- */
const progressBar = $('#pageProgress');
function startPageProgress() {
  if (!progressBar || document.documentElement.classList.contains('reduced-motion') || document.documentElement.classList.contains('slow-network')) return;
  progressBar.classList.remove('finishing');
  progressBar.classList.add('animating');
  progressBar.style.width = '75%';
}
function finishPageProgress() {
  if (!progressBar) return;
  progressBar.classList.add('finishing');
  setTimeout(() => {
    progressBar.classList.remove('animating', 'finishing');
    progressBar.style.width = '0%';
  }, 220);
}

finishPageProgress();

window.addEventListener('pageshow', () => {
  finishPageProgress();
  const m = $('#main');
  if (m) m.style.opacity = '1';
});

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.target === '_blank' || a.hasAttribute('download')) return;

  try {
    const targetUrl = new URL(a.href, location.href);
    if (targetUrl.origin !== location.origin) return;
    if (targetUrl.pathname === location.pathname && targetUrl.search === location.search && targetUrl.hash) return;

    startPageProgress();
    const m = $('#main');
    if (m && !document.documentElement.classList.contains('reduced-motion') && !document.documentElement.classList.contains('slow-network')) {
      m.style.transition = 'opacity .18s ease';
      m.style.opacity = '0.75';
    }
  } catch {}
});
