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
      ['pp_wishlist', 'pp_checklist', 'pp_plan', 'pp_recent', 'pp_pandal_filters', 'pp_hop_zone'].forEach((k) => localStorage.removeItem(k));
    } catch {}
    for (const k in mem) delete mem[k];
  }
};
window.addEventListener('storage', (e) => {
  if (e.key === 'pp_wishlist') syncWish();
  if (e.key === 'pp_user_checklist' || e.key === 'pp_user_visited' || e.key === 'pp_checklist') syncCheck();
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
const check = {
  items: () => store.get('pp_user_checklist', []),
  visited: () => store.get('pp_user_visited', []),
  hasItem: (id) => check.items().includes(id),
  isVisited: (id) => check.visited().includes(id),
  addItem(id) {
    const l = check.items();
    if (!l.includes(id)) {
      l.push(id);
      store.set('pp_user_checklist', l);
      syncCheck();
      document.dispatchEvent(new CustomEvent('check-change', { detail: { action: 'add', id } }));
      return true;
    }
    return false;
  },
  removeItem(id) {
    let l = check.items().filter((x) => x !== id);
    store.set('pp_user_checklist', l);
    let vis = check.visited().filter((x) => x !== id);
    store.set('pp_user_visited', vis);
    syncCheck();
    document.dispatchEvent(new CustomEvent('check-change', { detail: { action: 'remove', id } }));
  },
  toggleVisited(id) {
    const vis = check.visited();
    const i = vis.indexOf(id);
    let isNow = false;
    if (i >= 0) {
      vis.splice(i, 1);
    } else {
      vis.push(id);
      isNow = true;
      if (!check.hasItem(id)) {
        const l = check.items();
        l.push(id);
        store.set('pp_user_checklist', l);
      }
    }
    store.set('pp_user_visited', vis);
    syncCheck();
    document.dispatchEvent(new CustomEvent('check-change', { detail: { action: 'visit', id, isNow } }));
    return isNow;
  },
  addMultiple(ids) {
    const set = new Set(check.items());
    let added = 0;
    for (const id of ids) {
      if (!set.has(id)) {
        set.add(id);
        added++;
      }
    }
    store.set('pp_user_checklist', [...set]);
    syncCheck();
    document.dispatchEvent(new CustomEvent('check-change', { detail: { action: 'addMultiple', count: added } }));
    return added;
  },
  clear() {
    store.set('pp_user_checklist', []);
    store.set('pp_user_visited', []);
    syncCheck();
    document.dispatchEvent(new CustomEvent('check-change', { detail: { action: 'clear' } }));
  },
  list: () => check.visited(),
  has: (id) => check.isVisited(id),
  toggle: (id) => check.toggleVisited(id)
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
function syncCheck(root = document) {
  const items = new Set(check.items());
  const vis = new Set(check.visited());
  $$('[data-check-count]').forEach((b) => {
    b.textContent = vis.size;
    b.dataset.count = vis.size;
    b.title = `${vis.size} visited of ${items.size} in checklist`;
  });
  $$('[data-check-visit], [data-check-toggle]', root).forEach((b) => {
    const id = b.dataset.checkVisit || b.dataset.checkToggle;
    const isDone = vis.has(id);
    b.setAttribute('aria-pressed', String(isDone));
    b.classList.toggle('is-checked', isDone);
    const label = b.querySelector('.check-label');
    if (label) label.textContent = isDone ? '✓ Visited' : 'Mark Visited';
  });
}
document.addEventListener('click', (e) => {
  const heartBtn = e.target.closest('[data-heart]');
  if (heartBtn) {
    e.preventDefault();
    const on = wish.toggle(heartBtn.dataset.heart);
    syncWish();
    toast(on ? 'Saved to wishlist' : 'Removed from wishlist');
    document.dispatchEvent(new CustomEvent('wish-change', { detail: { id: heartBtn.dataset.heart, on } }));
    return;
  }
  const checkBtn = e.target.closest('[data-check-visit], [data-check-toggle]');
  if (checkBtn) {
    e.preventDefault();
    const id = checkBtn.dataset.checkVisit || checkBtn.dataset.checkToggle;
    const on = check.toggleVisited(id);
    syncCheck();
    toast(on ? '✓ Marked as Visited' : 'Removed from Visited');
    return;
  }
  const removeBtn = e.target.closest('[data-check-remove]');
  if (removeBtn) {
    e.preventDefault();
    const id = removeBtn.dataset.checkRemove;
    check.removeItem(id);
    toast('Removed from checklist');
    return;
  }
});
syncWish();
syncCheck();

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

  const render = { pandals, hopping, planner, wishlist, checklist, metro, map, home, support, pandal }[page];
  render?.();

  /* ================= PANDALS ================= */
  function pandals() {
    const list = $('[data-list]'), more = $('[data-more]'), note = $('[data-more-note]'), reset = $('[data-reset]');
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
    const el = { date: $('#p-date'), start: $('#p-start'), end: $('#p-end'), zone: $('#p-zone'), line: $('#p-line'), max: $('#p-max'), must: $('#p-must'), search: $('#p-search') };
    const modeBtns = $$('[data-mode]');
    const result = $('[data-result]'), itin = $('[data-itinerary]'), summary = $('[data-summary]'), more = $('[data-more]');
    const cta = $('[data-cta]'), openMaps = $('[data-open-maps]');
    const saved = store.get('pp_plan', {});
    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    let mode = saved.mode || 'zone'; let picked = new Set(saved.picked || []); let route = []; let shown = PAGE;

    function resolveStation(val) {
      if (!val) return 'Shyambazar';
      const clean = val.trim();
      if (graph.has(clean)) return clean;
      const lower = clean.toLowerCase();
      for (const s of graph.keys()) {
        if (s.toLowerCase() === lower) return s;
      }
      for (const s of graph.keys()) {
        if (s.toLowerCase().startsWith(lower)) return s;
      }
      for (const s of graph.keys()) {
        if (s.toLowerCase().includes(lower)) return s;
      }
      return 'Shyambazar';
    }

    el.date.value = saved.date && saved.date >= today.toISOString().slice(0, 10) ? saved.date : today.toISOString().slice(0, 10);
    el.start.value = saved.start || 'Shyambazar';
    if (el.end) el.end.value = saved.end || '';
    if (saved.zone) el.zone.value = saved.zone; if (saved.line) el.line.value = saved.line;
    if (saved.max) el.max.value = saved.max; if (saved.must != null) el.must.value = saved.must;

    // Station search suggestions
    const stationList = [];
    const seenStations = new Set();
    data.lines.forEach((l) => {
      l.stations.forEach((s) => {
        if (!seenStations.has(s)) {
          seenStations.add(s);
          stationList.push({ name: s, line: l.name.replace(' Line', '') });
        }
      });
    });

    function setupStationAutocomplete(inputEl, suggEl) {
      if (!inputEl || !suggEl) return;
      function render(q = '') {
        const term = q.trim().toLowerCase();
        const matches = term
          ? stationList.filter((s) => s.name.toLowerCase().includes(term) || s.line.toLowerCase().includes(term)).slice(0, 8)
          : stationList.slice(0, 8);
        if (!matches.length) {
          suggEl.innerHTML = '<div style="padding:10px 12px;font-size:13px;color:var(--muted)">No matching metro stations</div>';
        } else {
          suggEl.innerHTML = matches.map((s) => `
            <button type="button" class="station-sugg-btn" data-station-pick="${esc(s.name)}">
              <span><b>${esc(s.name)}</b></span>
              <small>${esc(s.line)} Line</small>
            </button>
          `).join('');
        }
        suggEl.hidden = false;
      }
      inputEl.addEventListener('focus', () => render(inputEl.value));
      inputEl.addEventListener('input', () => { render(inputEl.value); saveDraft(); });
      inputEl.addEventListener('change', () => {
        if (inputEl.value.trim()) inputEl.value = resolveStation(inputEl.value);
        saveDraft();
      });
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const first = $('[data-station-pick]', suggEl);
          if (first) inputEl.value = first.dataset.stationPick;
          else if (inputEl.value.trim()) inputEl.value = resolveStation(inputEl.value);
          suggEl.hidden = true;
          saveDraft();
          inputEl.blur();
        } else if (e.key === 'Escape') {
          suggEl.hidden = true;
        }
      });
      suggEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-station-pick]');
        if (!btn) return;
        inputEl.value = btn.dataset.stationPick;
        suggEl.hidden = true;
        saveDraft();
      });
    }

    const startSugg = $('[data-start-suggestions]') || $('[data-station-suggestions]');
    const endSugg = $('[data-end-suggestions]');
    setupStationAutocomplete(el.start, startSugg);
    setupStationAutocomplete(el.end, endSugg);
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.station-search-field')) {
        if (startSugg) startSugg.hidden = true;
        if (endSugg) endSugg.hidden = true;
      }
    });

    // deep links
    if (params.get('zone') && ctx.zones[params.get('zone')]) { mode = 'zone'; el.zone.value = params.get('zone'); }
    if (params.get('checklist')) { mode = 'custom'; picked = new Set(check.items()); }
    else if (params.get('wish')) { mode = 'custom'; picked = new Set(wish.list()); }
    if (params.get('add') && byId.has(params.get('add'))) { mode = 'custom'; picked.add(params.get('add')); }

    function saveDraft() {
      store.set('pp_plan', {
        mode,
        date: el.date.value,
        start: el.start.value,
        end: el.end ? el.end.value : '',
        zone: el.zone.value,
        line: el.line.value,
        max: el.max.value,
        must: el.must.value,
        picked: [...picked]
      });
    }
    for (const f of [el.date, el.start, el.end, el.zone, el.line, el.max, el.must].filter(Boolean)) {
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
      const start = resolveStation(el.start.value);
      el.start.value = start;
      const endVal = el.end ? el.end.value.trim() : '';
      const end = endVal ? resolveStation(endVal) : null;
      if (endVal && el.end) el.end.value = end;

      const hStart = hopsFrom(start);
      const hEnd = end ? hopsFrom(end) : null;

      let pool;
      if (mode === 'zone') pool = data.pandals.filter((p) => (el.zone.value === 'bonedi' ? p.bonedi : p.zone === el.zone.value));
      else if (mode === 'line') { const st = new Set(lineOf(el.line.value).stations); pool = data.pandals.filter((p) => st.has(p.station)); }
      else pool = [...picked].map((id) => byId.get(id)).filter(Boolean);

      if (mode !== 'custom') {
        const mf = el.must.value === '1';
        if (end) {
          const detour = (p) => (hStart.get(p.station) ?? 20) + (hEnd.get(p.station) ?? 20);
          pool = [...pool].sort((a, b) => (mf ? (b.must ? 1 : 0) - (a.must ? 1 : 0) : 0) || detour(a) - detour(b) || ord(a) - ord(b)).slice(0, Number(el.max.value));
        } else {
          const d = (p) => hStart.get(p.station) ?? 30;
          pool = [...pool].sort((a, b) => (mf ? (b.must ? 1 : 0) - (a.must ? 1 : 0) : 0) || d(a) - d(b) || ord(a) - ord(b)).slice(0, Number(el.max.value));
        }
      }

      if (end) {
        // Greedy sequence from start towards end
        let curr = start;
        const remaining = [...pool];
        const ordered = [];
        while (remaining.length) {
          remaining.sort((a, b) => {
            const costA = (hop(curr, a.station) ?? 10) + 0.35 * (hEnd.get(a.station) ?? 10);
            const costB = (hop(curr, b.station) ?? 10) + 0.35 * (hEnd.get(b.station) ?? 10);
            return costA - costB || (a.must ? -1 : 1);
          });
          const next = remaining.shift();
          ordered.push(next);
          curr = next.station;
        }
        route = ordered;
      } else {
        const d = (p) => hStart.get(p.station) ?? 30;
        route = pool.sort((a, b) => d(a) - d(b) || ord(a) - ord(b) || a.name.localeCompare(b.name));
      }

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
      const start = resolveStation(el.start.value);
      const endVal = el.end ? el.end.value.trim() : '';
      const end = endVal ? resolveStation(endVal) : null;
      const hStart = hopsFrom(start);

      let stations = hStart.get(route[0].station) ?? 0;
      for (let i = 1; i < route.length; i++) stations += hop(route[i - 1].station, route[i].station);
      if (end) stations += hop(route.at(-1).station, end);

      const mins = stations * 3 + route.length * 20;
      const dt = el.date.value ? new Date(el.date.value + 'T00:00') : null;
      $('[data-result-title]').textContent = dt ? `Your itinerary · ${dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}` : 'Your itinerary';
      summary.innerHTML = `<div><b>${route.length}</b><span>pandals</span></div><div><b>~${stations}</b><span>metro stations</span></div><div><b>~${Math.floor(mins / 60)}h ${mins % 60}m</b><span>estimated</span></div>`;

      const startCard = `<li class="stop-terminal start"><div class="terminal-card"><span class="terminal-badge start">Start</span><div class="terminal-info"><b>${esc(start)} Metro Station</b><span class="muted">Begin your pujo route</span></div></div></li>`;

      const stopCards = route.slice(0, shown).map((p) => {
        const line = ctx.lineByStation.get(p.station); const n = hStart.get(p.station);
        return `<li class="stop"><div class="stop-card">
          <h3><a href="/pandal/${p.id}">${esc(p.name)}</a></h3>
          <p class="muted" style="font-size:13px">${esc(p.area)}</p>
          <span class="station"><span class="dot" style="background:${line.color}"></span>${esc(p.station)} Metro${n != null ? ` · ${n === 0 ? 'your start' : n + ' station' + (n > 1 ? 's' : '') + ' from start'}` : ''}</span>
          <div class="actions"><a class="btn btn-ghost btn-sm" href="${stationToPandalLink(p)}" target="_blank" rel="noopener">${icon('walk')} Walk from station</a>${p.must ? '<span class="tag gold" style="align-self:center">Must visit</span>' : ''}</div>
          <button class="heart" type="button" aria-pressed="false" aria-label="Save ${esc(p.name)} to wishlist" data-heart="${p.id}">${icon('heart', '')}</button>
        </div></li>`;
      }).join('');

      const endCard = end ? `<li class="stop-terminal end"><div class="terminal-card"><span class="terminal-badge end">Finish</span><div class="terminal-info"><b>${esc(end)} Metro Station</b><span class="muted">Finish route & head home (~${hop(route.at(-1).station, end)} metro stops from last stop)</span></div></div></li>` : '';

      itin.innerHTML = startCard + stopCards + endCard;
      syncWish(itin);
      const left = route.length - Math.min(shown, route.length);
      more.hidden = left <= 0; more.textContent = `View more stops (${left} left)`;

      const startLabel = `${start} Metro Station, Kolkata`;
      const endLabel = end ? `${end} Metro Station, Kolkata` : null;
      const links = routeLinks(route, startLabel, endLabel);
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
    if (params.get('zone') || params.get('wish') || params.get('add') || params.get('checklist')) { if (mode !== 'custom' || picked.size) build(); }
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

  /* ================= CHECKLIST (PERSONAL HOPPING TRACKER) ================= */
  function checklist() {
    const list = $('[data-check-list]');
    const empty = $('[data-check-empty]');
    const emptyTitle = $('[data-empty-title]');
    const emptyMsg = $('[data-empty-msg]');
    const more = $('[data-check-more]');
    const searchInput = $('[data-check-search]');
    const progressBar = $('[data-progress-bar]');
    const progressText = $('[data-progress-text]');
    const statVisited = $('[data-stat-visited]');
    const statTotal = $('[data-stat-total]');
    const statLeft = $('[data-stat-left]');
    const countTabLeft = $('[data-count-tab-left]');
    const countTabVisited = $('[data-count-tab-visited]');
    const countTabAll = $('[data-count-tab-all]');
    const tabs = $$('.check-tabs .tab');
    const controls = $('[data-check-controls]');

    // Add drawer elements
    const addPanel = $('[data-add-panel]');
    const toggleAddPanelBtn = $('[data-toggle-add-panel]');
    const closeAddPanelBtn = $('[data-close-add-panel]');
    const addSearchInput = $('[data-add-search]');
    const addPickerResults = $('[data-add-picker-results]');
    const addWishBtn = $('[data-add-wish-btn]');
    const quickAddBtns = $$('[data-quick-add]');
    const planChecklistBtn = $('[data-plan-checklist]');

    let currentTab = 'left';
    let searchQuery = '';
    let shown = PAGE;

    const iconicIds = [
      'sreebhumi-sporting-club', 'santosh-mitra-square', 'bagbazar-sarbojanin',
      'ahiritola-sarbojanin', 'college-square', 'suruchi-sangha',
      'chetla-agrani-club', 'tridhara-sammilani', 'ballygunge-cultural-association',
      'mudiali-club'
    ];

    function updateStats() {
      const userItemIds = check.items();
      const userItems = userItemIds.map((id) => byId.get(id)).filter(Boolean);
      const visitedSet = new Set(check.visited());
      const totalCount = userItems.length;
      const visitedCount = userItems.filter((p) => visitedSet.has(p.id)).length;
      const leftCount = Math.max(0, totalCount - visitedCount);
      const pct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

      if (statVisited) statVisited.textContent = visitedCount;
      if (statTotal) statTotal.textContent = totalCount;
      if (statLeft) statLeft.textContent = leftCount;
      if (countTabLeft) countTabLeft.textContent = leftCount;
      if (countTabVisited) countTabVisited.textContent = visitedCount;
      if (countTabAll) countTabAll.textContent = totalCount;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) {
        if (totalCount === 0) {
          progressText.textContent = '0 pandals in your checklist · Add pandals to begin!';
        } else {
          progressText.textContent = `${pct}% completed · ${visitedCount} of ${totalCount} pandals visited`;
        }
      }

      if (addWishBtn) {
        const wishLen = wish.list().length;
        addWishBtn.hidden = wishLen === 0;
        if (wishLen > 0) addWishBtn.textContent = `❤️ + From Wishlist (${wishLen})`;
      }
    }

    function getFilteredItems() {
      const userItemIds = check.items();
      const userItems = userItemIds.map((id) => byId.get(id)).filter(Boolean);
      const visitedSet = new Set(check.visited());
      let items = userItems;

      if (currentTab === 'left') {
        items = items.filter((p) => !visitedSet.has(p.id));
      } else if (currentTab === 'visited') {
        items = items.filter((p) => visitedSet.has(p.id));
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        items = items.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.station.toLowerCase().includes(q)
        );
      }

      return items;
    }

    function drawAddPicker() {
      if (!addPickerResults) return;
      const q = addSearchInput ? addSearchInput.value.trim().toLowerCase() : '';
      let pool;
      if (q) {
        pool = data.pandals.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.station.toLowerCase().includes(q)
        ).slice(0, 15);
      } else {
        // default: show iconic + top must-visits
        pool = iconicIds.map((id) => byId.get(id)).filter(Boolean).concat(
          data.pandals.filter((p) => p.must && !iconicIds.includes(p.id)).slice(0, 8)
        );
      }

      if (!pool.length) {
        addPickerResults.innerHTML = '<div style="padding:14px;text-align:center;color:var(--muted);font-size:13px">No pandals match your search.</div>';
        return;
      }

      addPickerResults.innerHTML = pool.map((p) => {
        const isAdded = check.hasItem(p.id);
        return `
          <div class="add-picker-item">
            <div>
              <b>${esc(p.name)}</b>
              <div class="muted" style="font-size:12px">${esc(p.station)} Metro · ${esc(p.area)}</div>
            </div>
            <button type="button" class="btn ${isAdded ? 'btn-ghost' : 'btn-primary'} btn-sm" data-picker-toggle="${p.id}">
              ${isAdded ? '✓ Added' : '+ Add'}
            </button>
          </div>
        `;
      }).join('');
    }

    if (addPickerResults) {
      addPickerResults.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-picker-toggle]');
        if (!btn) return;
        const id = btn.dataset.pickerToggle;
        const p = byId.get(id);
        if (check.hasItem(id)) {
          check.removeItem(id);
          toast(`Removed ${p ? p.name : ''} from checklist`);
        } else {
          check.addItem(id);
          toast(`Added ${p ? p.name : ''} to checklist`);
        }
        drawAddPicker();
        draw();
      });
    }

    if (addSearchInput) {
      addSearchInput.addEventListener('input', drawAddPicker);
    }

    if (toggleAddPanelBtn && addPanel) {
      toggleAddPanelBtn.addEventListener('click', () => {
        const willShow = addPanel.hidden;
        addPanel.hidden = !willShow;
        toggleAddPanelBtn.setAttribute('aria-expanded', String(willShow));
        if (willShow) {
          drawAddPicker();
          if (addSearchInput) addSearchInput.focus();
        }
      });
    }

    if (closeAddPanelBtn && addPanel) {
      closeAddPanelBtn.addEventListener('click', () => {
        addPanel.hidden = true;
        if (toggleAddPanelBtn) toggleAddPanelBtn.setAttribute('aria-expanded', 'false');
      });
    }

    quickAddBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.quickAdd;
        let idsToAdd = [];
        let label = '';
        if (type === 'iconic') {
          idsToAdd = iconicIds;
          label = '10 iconic pandals';
        } else if (type === 'north') {
          idsToAdd = data.pandals.filter((p) => p.zone === 'north').slice(0, 20).map((p) => p.id);
          label = 'North Heritage pandals';
        } else if (type === 'south') {
          idsToAdd = data.pandals.filter((p) => p.zone === 'south').slice(0, 25).map((p) => p.id);
          label = 'South Highlights pandals';
        } else if (type === 'central') {
          idsToAdd = data.pandals.filter((p) => p.zone === 'central').slice(0, 15).map((p) => p.id);
          label = 'Central Heritage pandals';
        } else if (type === 'wish') {
          idsToAdd = wish.list();
          label = `${idsToAdd.length} wishlist pandals`;
        }
        if (idsToAdd.length) {
          const added = check.addMultiple(idsToAdd);
          toast(`Added ${label} to your checklist (${added} new)`);
          drawAddPicker();
          draw();
        }
      });
    });

    if (planChecklistBtn) {
      planChecklistBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const items = check.items();
        if (!items.length) {
          toast('Add some pandals to your checklist first!');
          if (addPanel) {
            addPanel.hidden = false;
            drawAddPicker();
            if (addSearchInput) addSearchInput.focus();
          }
          return;
        }
        const currentPlan = store.get('pp_plan', {});
        store.set('pp_plan', { ...currentPlan, mode: 'custom', picked: items });
        location.href = '/planner?checklist=1';
      });
    }

    const emptyAddIconic = $('[data-empty-add-iconic]');
    if (emptyAddIconic) {
      emptyAddIconic.addEventListener('click', () => {
        check.addMultiple(iconicIds);
        toast('Added 10 iconic pandals to your checklist');
        drawAddPicker();
        draw();
      });
    }

    const emptyOpenSearch = $('[data-empty-open-search]');
    if (emptyOpenSearch && addPanel) {
      emptyOpenSearch.addEventListener('click', () => {
        addPanel.hidden = false;
        drawAddPicker();
        if (addSearchInput) addSearchInput.focus();
      });
    }

    function draw(focusFrom) {
      updateStats();
      const totalUserItems = check.items().length;
      const items = getFilteredItems();

      if (totalUserItems === 0) {
        list.innerHTML = '';
        empty.hidden = false;
        if (more) more.hidden = true;
        if (controls) controls.hidden = true;
        emptyTitle.textContent = 'Your checklist is empty';
        emptyMsg.textContent = 'Add the pandals you plan to visit this Durga Puja, then mark them off as you hop!';
      } else if (items.length === 0) {
        list.innerHTML = '';
        empty.hidden = false;
        if (more) more.hidden = true;
        if (controls) controls.hidden = false;
        if (currentTab === 'visited') {
          emptyTitle.textContent = 'No pandals marked as visited yet';
          emptyMsg.textContent = 'Switch to "Left to Visit" and tap "Mark Visited" as you explore each pandal!';
        } else if (currentTab === 'left') {
          emptyTitle.textContent = '🎉 Congratulations! Checklist Completed!';
          emptyMsg.textContent = 'You have visited every single pandal on your personal checklist!';
        } else {
          emptyTitle.textContent = 'No matching pandals in your checklist';
          emptyMsg.textContent = 'Try adjusting your search query.';
        }
      } else {
        empty.hidden = true;
        if (controls) controls.hidden = false;
        list.innerHTML = items.slice(0, shown).map((p) => cardHTML(p, ctx, { isChecklistPage: true })).join('');
        syncWish(list);
        syncCheck(list);
        const left = items.length - shown;
        if (more) {
          more.hidden = left <= 0;
          more.textContent = `View more (${left} left)`;
        }
        if (focusFrom != null) $$('.card h3 a', list)[focusFrom]?.focus();
      }
    }

    tabs.forEach((t) => {
      t.addEventListener('click', () => {
        tabs.forEach((tb) => {
          tb.setAttribute('aria-selected', String(tb === t));
        });
        currentTab = t.dataset.tab;
        shown = PAGE;
        draw();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.trim();
        shown = PAGE;
        draw();
      });
    }

    if (more) {
      more.addEventListener('click', () => {
        const f = shown;
        shown += PAGE;
        draw(f);
      });
    }

    const clearBtn = $('[data-clear-check]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all pandals from your checklist?')) {
          check.clear();
          syncCheck();
          drawAddPicker();
          draw();
          toast('Checklist cleared');
        }
      });
    }

    document.addEventListener('check-change', () => draw());
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
      const sched = l.schedule?.length ? `<div class="metro-schedule-card">
        <div class="metro-sched-head">
          <span class="sched-icon" style="background:${l.color}22;color:${l.color}">${icon('clock')}</span>
          <div>
            <b>${esc(l.name)} · Special Puja Schedule</b>
            <span class="sched-sub">Official Kolkata Metro Puja Timings (Oct 15–21, 2026)</span>
          </div>
        </div>
        <div class="metro-sched-list">
          ${l.schedule.map((s) => `
            <div class="metro-sched-item${s.alert ? ' alert' : ''}${s.highlight === 'overnight' ? ' overnight' : ''}">
              <div class="sched-days-wrap">
                <span class="sched-days">${esc(s.days)}</span>
                ${s.highlight === 'overnight' ? '<span class="sched-pill green">Overnight Train Service</span>' : ''}
                ${s.alert ? '<span class="sched-pill red">No Service</span>' : ''}
              </div>
              <p class="sched-service">${esc(s.service)}</p>
            </div>
          `).join('')}
        </div>
      </div>` : '';
      view.innerHTML = `<div class="line-banner" style="--lc:${l.color};--lt:${l.text}"><div><b>${l.name}</b><span>${esc(l.stations[0])} ↔ ${esc(l.stations.at(-1))} · ${l.stations.length} stations</span></div></div>${sched}<ol class="stations" style="--lc:${l.color}">${items}</ol>`;
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
  const reveals = document.querySelectorAll('.section, .metro-promo-card, .footer-compact, .footer-grid, .local-data-card');
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

/* ---------- Scroll visibility for Header and Bottom Nav (60/120fps optimized) ---------- */
function initScrollUI() {
  const nav = $('.bottom-nav');
  const header = $('.site-header');
  if (!nav && !header) return;

  let ticking = false;
  let lastNavVisible = null;
  let lastHeaderScrolled = null;
  let isShortPage = false;

  const checkShortPage = () => {
    isShortPage = (document.documentElement.scrollHeight <= window.innerHeight + 80) && (document.body.dataset.page !== 'home');
  };
  checkShortPage();
  window.addEventListener('resize', checkShortPage, { passive: true });

  const update = () => {
    ticking = false;
    const y = window.scrollY || document.documentElement.scrollTop;

    if (nav) {
      const showNav = (y > 60 || isShortPage);
      if (showNav !== lastNavVisible) {
        lastNavVisible = showNav;
        nav.classList.toggle('is-visible', showNav);
        const banner = document.querySelector('.install-prompt');
        if (banner) banner.classList.toggle('above-nav', showNav);
      }
    }

    if (header) {
      const showHeader = (y > 20);
      if (showHeader !== lastHeaderScrolled) {
        lastHeaderScrolled = showHeader;
        header.classList.toggle('is-scrolled', showHeader);
      }
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}
initScrollUI();

/* ---------- Install Shortcut Banner (First-time mobile phone visitors) ---------- */
function initInstallBanner() {
  if (typeof window === 'undefined') return;

  // Don't show if already running as standalone shortcut/PWA
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    return;
  }
  // Don't show if already dismissed or installed
  if (localStorage.getItem('pujopath_install_prompt')) {
    return;
  }
  // Don't show on large desktop displays
  if (window.innerWidth >= 900) {
    return;
  }

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Polite delay of 2.5s so user interacts smoothly with page first
  setTimeout(() => {
    if (localStorage.getItem('pujopath_install_prompt')) return;

    const banner = document.createElement('div');
    banner.className = 'install-prompt';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Add PujoPath Shortcut to Home Screen');
    banner.innerHTML = `
      <div class="install-main">
        <div class="install-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="26" height="26" fill="#D4A017"><path d="M32 8c5 8 6 16 0 27-6-11-5-19 0-27zM12 22c9 1 16 6 19 15-9 1-16-3-19-15zM52 22c-3 12-10 16-19 15 3-9 10-14 19-15zM6 38c10-2 18 1 24 8-10 4-19 1-24-8zM58 38c-5 9-14 12-24 8 6-7 14-10 24-8zM32 50c-8 0-15 3-20 8h40c-5-5-12-8-20-8z"/></svg>
        </div>
        <div class="install-text">
          <div class="install-title">Install PujoPath</div>
          <div class="install-desc">Add home screen shortcut for quick offline access</div>
        </div>
        <div class="install-actions">
          <button type="button" class="btn-install" id="btnInstallApp">Install</button>
          <button type="button" class="btn-dismiss-x" id="btnDismissApp" aria-label="Close install prompt">✕</button>
        </div>
      </div>
      <div class="install-guide" id="installGuide" hidden>
        <p>Tap <strong>Share</strong> at the bottom of Safari, then choose <strong>Add to Home Screen ⊞</strong></p>
        <button type="button" class="btn-guide-close" id="btnGuideClose">Got it</button>
      </div>
    `;

    document.body.appendChild(banner);

    const nav = document.querySelector('.bottom-nav');
    if (nav && nav.classList.contains('is-visible')) {
      banner.classList.add('above-nav');
    }

    requestAnimationFrame(() => {
      banner.classList.add('show');
    });

    const dismiss = () => {
      localStorage.setItem('pujopath_install_prompt', 'dismissed');
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 400);
    };

    banner.querySelector('#btnDismissApp')?.addEventListener('click', dismiss);

    const btnInstall = banner.querySelector('#btnInstallApp');
    btnInstall?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        try {
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            localStorage.setItem('pujopath_install_prompt', 'installed');
          }
        } catch {}
        deferredPrompt = null;
        dismiss();
      } else if (isIOS) {
        const guide = banner.querySelector('#installGuide');
        if (guide) {
          guide.hidden = false;
          btnInstall.style.display = 'none';
          guide.querySelector('#btnGuideClose')?.addEventListener('click', dismiss);
        }
      } else {
        const guide = banner.querySelector('#installGuide');
        if (guide) {
          guide.innerHTML = `
            <p>Tap browser menu (<strong>⋮</strong>), then choose <strong>Install app</strong> or <strong>Add to Home screen</strong></p>
            <button type="button" class="btn-guide-close" id="btnGuideClose">Got it</button>
          `;
          guide.hidden = false;
          btnInstall.style.display = 'none';
          guide.querySelector('#btnGuideClose')?.addEventListener('click', dismiss);
        }
      }
    });
  }, 2500);
}
initInstallBanner();

