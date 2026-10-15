import { makeCtx, cardHTML, esc, icon, routeLinks, stationToPandalLink, placeLink } from '/js/shared.js';
import { STATION_COORDS, KOLKATA_PLACES, haversine, getPandalCoords, resolvePlaceCoords, findNearbyPandals, findPandalsOnRoute, getCurrentLocation, setUserGps, getUserGps } from '/js/geo.js';

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

// One-time automatic migration of any legacy wishlist items into personal checklist
try {
  const legacyWish = store.get('pp_wishlist', []);
  if (Array.isArray(legacyWish) && legacyWish.length > 0) {
    const cur = store.get('pp_user_checklist', []);
    const merged = Array.from(new Set([...cur, ...legacyWish]));
    store.set('pp_user_checklist', merged);
    store.remove('pp_wishlist');
  }
} catch (e) {}

window.addEventListener('storage', (e) => {
  if (e.key === 'pp_user_checklist' || e.key === 'pp_user_visited' || e.key === 'pp_checklist') syncCheck();
});

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

// Backwards compatibility alias for any legacy scripts
const wish = {
  list: () => check.items(),
  has: (id) => check.hasItem(id),
  toggle(id) {
    if (check.hasItem(id)) { check.removeItem(id); return false; }
    check.addItem(id); return true;
  },
  clear() { check.clear(); }
};

/* ---------- UI helpers ---------- */
let toastTimer;
function toast(msg) {
  const t = $('[data-toast]'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}
function syncCheck(root = document) {
  const items = new Set(check.items());
  const vis = new Set(check.visited());
  $$('[data-check-count], [data-wish-count]').forEach((b) => {
    b.textContent = items.size;
    b.dataset.count = items.size;
    b.title = `${items.size} in checklist (${vis.size} visited)`;
  });
  $$('[data-checklist-toggle], [data-heart]', root).forEach((b) => {
    const id = b.dataset.checklistToggle || b.dataset.heart;
    const inCheck = items.has(id);
    b.setAttribute('aria-pressed', String(inCheck));
    b.classList.toggle('is-in-checklist', inCheck);
    b.title = inCheck ? 'In your checklist (tap to remove)' : 'Add to checklist';
    b.setAttribute('aria-label', inCheck ? 'Remove from checklist' : 'Add to checklist');
    const label = b.querySelector('.checklist-btn-label');
    if (label) {
      if (b.classList.contains('btn-detail-check-toggle')) {
        label.textContent = inCheck ? '✓ In your checklist (tap to remove)' : 'Add to my checklist';
      } else {
        label.textContent = inCheck ? '✓ In Checklist' : 'Add to Checklist';
      }
    }
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
function syncWish(root = document) {
  syncCheck(root);
}
document.addEventListener('click', (e) => {
  const cardCheckBtn = e.target.closest('[data-checklist-toggle], [data-heart]');
  if (cardCheckBtn) {
    e.preventDefault();
    const id = cardCheckBtn.dataset.checklistToggle || cardCheckBtn.dataset.heart;
    if (check.hasItem(id)) {
      check.removeItem(id);
      syncCheck();
      toast('Removed from checklist');
    } else {
      check.addItem(id);
      syncCheck();
      toast('Added to checklist');
    }
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

  if (page === 'wishlist') { location.replace('/checklist'); return; }
  const render = { pandals, hopping, planner, checklist, metro, map, home, support, pandal, parking }[page];
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
      syncCheck(list);
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
      syncCheck(list);
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
    let mode = saved.mode || 'zone'; let picked = new Set(saved.picked || []); let route = []; let shown = PAGE; let currentOnRoute = [];

    function isKnownStation(val) {
      if (!val) return false;
      const clean = val.trim().toLowerCase();
      for (const s of graph.keys()) {
        if (s.toLowerCase() === clean) return true;
      }
      return false;
    }

    function getStationMatch(val) {
      if (!val) return null;
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
      return null;
    }

    function resolveStation(val) {
      return getStationMatch(val) || 'Shyambazar';
    }

    function findAnchorStation(val) {
      if (!val) return 'Shyambazar';
      const clean = val.trim();
      const stMatch = getStationMatch(clean);
      if (stMatch) return stMatch;

      const placeRes = resolvePlaceCoords(clean);
      if (placeRes && placeRes.station) return placeRes.station;

      if (placeRes && placeRes.coords) {
        let nearest = 'Shyambazar';
        let minDist = Infinity;
        for (const [st, c] of Object.entries(STATION_COORDS)) {
          const d = haversine(placeRes.coords[0], placeRes.coords[1], c[0], c[1]);
          if (d < minDist) {
            minDist = d;
            nearest = st;
          }
        }
        return nearest;
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

    function setupStationAutocomplete(inputEl, suggEl, isEnd = false) {
      if (!inputEl || !suggEl) return;
      function render(q = '') {
        const term = q.trim().toLowerCase();
        const results = [];
        const isCustom = mode === 'custom';

        if (term) {
          if (isCustom) {
            results.push({
              name: q.trim(),
              desc: isEnd ? 'Custom finish place for hopping' : 'Custom starting place for hopping',
              badge: 'Custom'
            });
          }

          // 1. Metro stations
          stationList.filter((s) => s.name.toLowerCase().includes(term) || s.line.toLowerCase().includes(term))
            .slice(0, 6)
            .forEach((s) => results.push({ name: s.name, desc: `${s.line} Line Metro`, badge: 'Metro' }));

          // 2. Comprehensive Kolkata Places (200+ locations)
          const seenNames = new Set(results.map((r) => r.name.toLowerCase()));
          KOLKATA_PLACES.filter((p) => {
            const n = p.name.toLowerCase();
            return (n.includes(term) || p.desc.toLowerCase().includes(term) || p.terms.some((t) => t.includes(term))) && !seenNames.has(n);
          }).slice(0, 8).forEach((p) => {
            seenNames.add(p.name.toLowerCase());
            results.push({ name: p.name, desc: p.desc, badge: p.badge || 'Place' });
          });

          // 3. Pandal Areas
          for (const p of data.pandals) {
            const a = p.area.toLowerCase();
            if (a.includes(term) && !seenNames.has(a)) {
              seenNames.add(a);
              if (results.length < 14) {
                results.push({ name: p.area, desc: `Near ${p.station} Metro`, badge: 'Area' });
              }
            }
          }
        } else {
          if (isCustom) {
            KOLKATA_PLACES.slice(0, 6).forEach((p) => results.push({ name: p.name, desc: p.desc, badge: p.badge || 'Place' }));
          }
          stationList.slice(0, 8).forEach((s) => results.push({ name: s.name, desc: `${s.line} Line Metro`, badge: 'Metro' }));
        }

        if (!results.length) {
          suggEl.innerHTML = '<div style="padding:10px 12px;font-size:13px;color:var(--muted)">Type any place, landmark or station in Kolkata</div>';
        } else {
          suggEl.innerHTML = results.map((r) => `
            <button type="button" class="station-sugg-btn" data-place-pick="${esc(r.name)}">
              <span><b>${esc(r.name)}</b>${r.desc ? `<small class="muted" style="margin-left:6px">${esc(r.desc)}</small>` : ''}</span>
              <span class="station-sugg-tag ${(r.badge || 'metro').toLowerCase()}">${esc(r.badge || 'Metro')}</span>
            </button>
          `).join('');
        }
        suggEl.hidden = false;
      }

      inputEl.addEventListener('focus', () => render(inputEl.value));
      inputEl.addEventListener('input', () => { render(inputEl.value); saveDraft(); updateEnroutePreview(); });
      inputEl.addEventListener('change', () => {
        if (mode !== 'custom' && inputEl.value.trim()) {
          const match = getStationMatch(inputEl.value);
          if (match) inputEl.value = match;
        }
        saveDraft();
        updateEnroutePreview();
      });
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          suggEl.hidden = true;
          saveDraft();
          updateEnroutePreview();
          inputEl.blur();
        } else if (e.key === 'Escape') {
          suggEl.hidden = true;
        }
      });
      suggEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-place-pick]');
        if (!btn) return;
        inputEl.value = btn.dataset.placePick;
        suggEl.hidden = true;
        saveDraft();
        updateEnroutePreview();
      });
    }

    const startSugg = $('[data-start-suggestions]') || $('[data-station-suggestions]');
    const endSugg = $('[data-end-suggestions]');
    setupStationAutocomplete(el.start, startSugg, false);
    setupStationAutocomplete(el.end, endSugg, true);
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.station-search-field')) {
        if (startSugg) startSugg.hidden = true;
        if (endSugg) endSugg.hidden = true;
      }
    });

    // Geolocation and en-route preview handlers
    const locateBtn = $('[data-start-locate]');
    locateBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      locateBtn.classList.add('loading');
      try {
        const loc = await getCurrentLocation();
        el.start.value = loc.label;
        toast(`Location detected: ${loc.label}`);
        saveDraft();
        updateEnroutePreview();
      } catch (err) {
        toast(err.message || 'Could not get location');
      } finally {
        locateBtn.classList.remove('loading');
      }
    });

    const nearMeBtn = $('[data-near-me]');
    nearMeBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      nearMeBtn.disabled = true;
      const origHtml = nearMeBtn.innerHTML;
      nearMeBtn.innerHTML = `${icon('locate')} <span>Detecting GPS...</span>`;
      try {
        const loc = await getCurrentLocation();
        setMode('custom');
        el.start.value = loc.label;
        if (el.end) el.end.value = '';
        const limit = Number(el.max?.value || 8);
        const nearest = findNearbyPandals(loc.coords, data.pandals, 4.5, limit);
        picked.clear();
        nearest.forEach((n) => picked.add(n.pandal.id));
        saveDraft();
        drawPicker();
        updateEnroutePreview();
        build();
        toast(`Found ${nearest.length} pandals near your location!`);
      } catch (err) {
        toast(err.message || 'Could not get location');
      } finally {
        nearMeBtn.disabled = false;
        nearMeBtn.innerHTML = origHtml;
      }
    });

    const swapBtn = $('[data-swap-endpoints]');
    swapBtn?.addEventListener('click', () => {
      const temp = el.start.value;
      el.start.value = el.end ? el.end.value : '';
      if (el.end) el.end.value = temp;
      saveDraft();
      updateEnroutePreview();
      toast('Swapped start and finish places');
    });

    function updateEnroutePreview() {
      const enrouteBox = $('[data-enroute-box]');
      if (!enrouteBox) return;

      if (mode !== 'custom') {
        enrouteBox.hidden = true;
        currentOnRoute = [];
        drawPicker();
        return;
      }

      const startVal = el.start.value.trim();
      const endVal = el.end ? el.end.value.trim() : '';

      if (!startVal) {
        enrouteBox.hidden = true;
        currentOnRoute = [];
        drawPicker();
        return;
      }

      const startRes = resolvePlaceCoords(startVal);
      const endRes = endVal ? resolvePlaceCoords(endVal) : null;
      if (!startRes) {
        enrouteBox.hidden = true;
        currentOnRoute = [];
        drawPicker();
        return;
      }

      const limit = Number(el.max?.value || 10);
      const onRoute = findPandalsOnRoute(startRes.coords, endRes ? endRes.coords : null, data.pandals, limit);

      if (!onRoute.length) {
        enrouteBox.hidden = true;
        currentOnRoute = [];
        drawPicker();
        return;
      }

      // If user hasn't selected anything yet, default select the discovered corridor pandals
      if (picked.size === 0) {
        onRoute.forEach((p) => picked.add(p.id));
      }

      currentOnRoute = onRoute;

      const titleEl = $('[data-enroute-title]');
      const subEl = $('[data-enroute-subtitle]');
      const chipsEl = $('[data-enroute-chips]');
      const toggleAllBtn = $('[data-enroute-toggle-all]');

      if (endRes) {
        if (titleEl) titleEl.textContent = `${onRoute.length} pandals on your way from ${startRes.name} to ${endRes.name}`;
        if (subEl) subEl.textContent = `Tap any pandal to toggle, or click "Build my route" below`;
      } else {
        if (titleEl) titleEl.textContent = `${onRoute.length} pandals near ${startRes.name}`;
        if (subEl) subEl.textContent = `Closest pandals near your starting place`;
      }

      const allPicked = onRoute.length > 0 && onRoute.every((p) => picked.has(p.id));
      if (toggleAllBtn) {
        toggleAllBtn.textContent = allPicked ? 'Deselect all' : 'Select all';
      }

      if (chipsEl) {
        chipsEl.innerHTML = onRoute.map((p) => {
          const isSelected = picked.has(p.id);
          const pCoords = getPandalCoords(p);
          const dist = haversine(startRes.coords[0], startRes.coords[1], pCoords[0], pCoords[1]);
          const distStr = dist < 0.05 ? 'Nearby' : (dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`);
          return `<button type="button" class="enroute-chip" aria-pressed="${isSelected}" data-enroute-pick="${p.id}" title="${esc(p.name)} (${esc(p.area)})">
            <span>${isSelected ? '✓' : '+'} <b>${esc(p.name)}</b></span>
            <span class="chip-dist">${distStr}</span>
          </button>`;
        }).join('');
      }

      enrouteBox.hidden = false;
      drawPicker();
    }

    const enrouteChips = $('[data-enroute-chips]');
    enrouteChips?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-enroute-pick]');
      if (!btn) return;
      const id = btn.dataset.enroutePick;
      if (picked.has(id)) picked.delete(id);
      else picked.add(id);
      saveDraft();
      drawPicker();
      updateEnroutePreview();
    });

    const enrouteToggleAllBtn = $('[data-enroute-toggle-all]');
    enrouteToggleAllBtn?.addEventListener('click', () => {
      const startVal = el.start.value.trim();
      const endVal = el.end ? el.end.value.trim() : '';
      const startRes = resolvePlaceCoords(startVal);
      const endRes = endVal ? resolvePlaceCoords(endVal) : null;
      if (!startRes) return;
      const limit = Number(el.max?.value || 10);
      const onRoute = findPandalsOnRoute(startRes.coords, endRes ? endRes.coords : null, data.pandals, limit);
      const allPicked = onRoute.length > 0 && onRoute.every((p) => picked.has(p.id));
      if (allPicked) {
        onRoute.forEach((p) => picked.delete(p.id));
        toast('Removed corridor pandals from selection');
      } else {
        onRoute.forEach((p) => picked.add(p.id));
        toast(`Added ${onRoute.length} corridor pandals to your plan`);
      }
      saveDraft();
      drawPicker();
      updateEnroutePreview();
    });

    // deep links
    if (params.get('zone') && ctx.zones[params.get('zone')]) { mode = 'zone'; el.zone.value = params.get('zone'); }
    if (params.get('checklist') || params.get('wish')) { mode = 'custom'; picked = new Set(check.items()); }
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
      f.addEventListener('change', () => { saveDraft(); updateEnroutePreview(); });
    }

    function setMode(m) {
      mode = m;
      modeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
      $$('[data-opt]').forEach((o) => (o.hidden = o.dataset.opt !== m));

      const startLabel = $('[data-start-label]');
      const endLabel = $('[data-end-label]');
      const startHint = $('[data-start-hint]');
      const endHint = $('[data-end-hint]');

      if (m === 'custom') {
        if (startLabel) startLabel.textContent = 'Start from place / station';
        el.start.placeholder = 'e.g. Chinar Park, Rajarhat, or any place in Kolkata';
        if (endLabel) endLabel.textContent = 'End at place / station';
        if (el.end) el.end.placeholder = 'e.g. City Centre 2, Home, or any place in Kolkata';
        if (startHint) startHint.textContent = 'Choose any start place in Kolkata or use current GPS location';
        if (endHint) endHint.textContent = 'Where you want to end your hopping — pandals on the way are found automatically';
      } else if (m === 'line') {
        if (startLabel) startLabel.textContent = 'Start station on this line';
        el.start.placeholder = 'e.g. Shyambazar';
        if (endLabel) endLabel.textContent = 'End station on this line';
        if (el.end) el.end.placeholder = 'e.g. Kalighat, or leave empty';
        if (startHint) startHint.textContent = 'Select starting station on the selected metro line';
        if (endHint) endHint.textContent = 'Optional destination station on this line';
      } else {
        if (startLabel) startLabel.textContent = 'Start from station or area';
        el.start.placeholder = 'e.g. Shyambazar';
        if (endLabel) endLabel.textContent = 'End at station';
        if (el.end) el.end.placeholder = 'e.g. Kalighat, or leave empty';
        if (startHint) startHint.textContent = 'Nearest metro station or area to begin hopping';
        if (endHint) endHint.textContent = 'Optional station where you want to end';
      }

      saveDraft();
      updateEnroutePreview();
      drawPicker();
    }
    modeBtns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

    function drawPicker() {
      const isCorridorActive = mode === 'custom' && currentOnRoute.length > 0;
      const customLabel = $('[data-custom-label]');
      const customHint = $('[data-custom-hint]');
      const extraWrap = $('[data-extra-wrap]');
      const extraChips = $('[data-extra-chips]');
      const pickerEl = $('[data-picker]');
      const noteEl = $('[data-picked-note]');
      if (!pickerEl) return;

      const q = el.search.value.trim().toLowerCase();
      const onRouteIds = new Set(currentOnRoute.map((p) => p.id));
      const corridorPicked = currentOnRoute.filter((p) => picked.has(p.id));
      const extraPickedIds = [...picked].filter((id) => !onRouteIds.has(id));

      if (isCorridorActive) {
        if (customLabel) customLabel.textContent = 'Add extra pandals (Optional)';
        if (customHint) {
          customHint.textContent = 'Want to detour to other pandals? Search here or add from your checklist.';
          customHint.style.display = 'block';
        }

        // Render extra stops added if any
        if (extraWrap && extraChips) {
          if (extraPickedIds.length > 0) {
            extraChips.innerHTML = extraPickedIds.map((id) => {
              const p = byId.get(id);
              if (!p) return '';
              return `<span class="extra-chip">
                <span><b>${esc(p.name)}</b> <small class="muted">(${esc(p.area)})</small></span>
                <button type="button" class="extra-chip-remove" data-remove-extra="${p.id}" aria-label="Remove ${esc(p.name)}" title="Remove stop">✕</button>
              </span>`;
            }).join('');
            extraWrap.hidden = false;
          } else {
            extraWrap.hidden = true;
            extraChips.innerHTML = '';
          }
        }

        if (!q) {
          // When not searching and corridor is active, DO NOT show duplicate corridor pandals
          pickerEl.innerHTML = '';
          pickerEl.hidden = true;
          if (noteEl) {
            if (extraPickedIds.length > 0) {
              noteEl.textContent = `${corridorPicked.length} on corridor + ${extraPickedIds.length} extra stop${extraPickedIds.length > 1 ? 's' : ''} (${corridorPicked.length + extraPickedIds.length} total selected)`;
            } else {
              noteEl.textContent = `${corridorPicked.length} corridor pandal${corridorPicked.length !== 1 ? 's' : ''} selected: search above to add extra detours`;
            }
          }
          return;
        }

        // When searching with corridor active:
        pickerEl.hidden = false;
        const matches = data.pandals.filter((p) => `${p.name} ${p.area} ${p.station}`.toLowerCase().includes(q));
        const rows = matches.slice(0, 10);
        if (!rows.length) {
          pickerEl.innerHTML = '<p class="count-note" style="padding:10px 12px;margin:0">No matching pandals found.</p>';
        } else {
          pickerEl.innerHTML = rows.map((p) => {
            const isPicked = picked.has(p.id);
            const isOnRoute = onRouteIds.has(p.id);
            return `<button type="button" class="pick" aria-pressed="${isPicked}" data-pick="${p.id}">
              <span class="pick-info">
                <span><b>${esc(p.name)}</b>${isOnRoute ? ' <span class="on-corridor-badge">On corridor</span>' : ''}</span>
                <small class="muted">${esc(p.station)} · ${esc(p.area)}</small>
              </span>
              <span class="pick-icon" aria-hidden="true">${isPicked ? '✓' : '+'}</span>
            </button>`;
          }).join('');
        }

        if (noteEl) {
          noteEl.textContent = `${matches.length} search match${matches.length === 1 ? '' : 'es'} · ${corridorPicked.length} corridor + ${extraPickedIds.length} extra selected`;
        }

      } else {
        // Standard Custom Picker (no corridor active)
        if (customLabel) customLabel.textContent = 'Choose pandals';
        if (customHint) customHint.style.display = 'none';
        if (extraWrap) extraWrap.hidden = true;
        pickerEl.hidden = false;

        const pool = q
          ? data.pandals.filter((p) => `${p.name} ${p.area} ${p.station}`.toLowerCase().includes(q))
          : [...picked].map((id) => byId.get(id)).filter(Boolean).concat(data.pandals.filter((p) => p.must && !picked.has(p.id)));
        const rows = pool.slice(0, 10);
        pickerEl.innerHTML = rows.map((p) => `
          <button type="button" class="pick" aria-pressed="${picked.has(p.id)}" data-pick="${p.id}">
            <span class="pick-info"><b>${esc(p.name)}</b><small class="muted">${esc(p.station)} · ${esc(p.area)}</small></span>
            <span class="pick-icon" aria-hidden="true">${picked.has(p.id) ? '✓' : '+'}</span>
          </button>
        `).join('') || '<p class="count-note">No matches.</p>';
        if (noteEl) {
          noteEl.textContent = `${picked.size} selected${q ? '' : ': search to add more'}`;
        }
      }
    }

    $('[data-picker]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]'); if (!b) return;
      picked.has(b.dataset.pick) ? picked.delete(b.dataset.pick) : picked.add(b.dataset.pick);
      saveDraft();
      drawPicker();
      updateEnroutePreview();
    });

    const extraWrapEl = $('[data-extra-wrap]');
    extraWrapEl?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-extra]');
      if (!btn) return;
      const id = btn.dataset.removeExtra;
      picked.delete(id);
      saveDraft();
      drawPicker();
      updateEnroutePreview();
      const p = byId.get(id);
      toast(`Removed ${p ? p.name : 'pandal'} from extra stops`);
    });

    el.search.addEventListener('input', drawPicker);
    const useChecklistBtn = $('[data-use-checklist]') || $('[data-use-wish]');
    useChecklistBtn?.addEventListener('click', () => {
      const items = check.items();
      if (!items.length) {
        toast('Your checklist is empty. Add pandals to your checklist first!');
        return;
      }
      items.forEach((id) => picked.add(id));
      saveDraft();
      drawPicker();
      updateEnroutePreview();
      toast(`${items.length} checklist pandal${items.length === 1 ? '' : 's'} added`);
    });

    function build() {
      const startVal = el.start.value.trim() || 'Shyambazar';
      const endVal = el.end ? el.end.value.trim() : '';
      const isCustomMode = mode === 'custom';

      const isStartStation = isKnownStation(startVal);
      const isEndStation = endVal ? isKnownStation(endVal) : false;

      const start = isStartStation ? getStationMatch(startVal) : (isCustomMode ? startVal : resolveStation(startVal));
      if (!isCustomMode && isStartStation) el.start.value = start;

      const end = endVal ? (isEndStation ? getStationMatch(endVal) : (isCustomMode ? endVal : resolveStation(endVal))) : null;
      if (!isCustomMode && endVal && isEndStation && el.end) el.end.value = end;

      const startStation = isStartStation ? start : findAnchorStation(startVal);
      const endStation = end ? (isEndStation ? end : findAnchorStation(endVal)) : null;

      const hStart = hopsFrom(startStation);
      const hEnd = endStation ? hopsFrom(endStation) : null;

      let pool;
      if (mode === 'zone') {
        pool = data.pandals.filter((p) => (el.zone.value === 'bonedi' ? p.bonedi : p.zone === el.zone.value));
      } else if (mode === 'line') {
        const st = new Set(lineOf(el.line.value).stations);
        pool = data.pandals.filter((p) => st.has(p.station));
      } else {
        // Custom Mode
        if (picked.size > 0) {
          pool = [...picked].map((id) => byId.get(id)).filter(Boolean);
        } else {
          // Automatic discovery of pandals on the way between Start and End places!
          const startRes = resolvePlaceCoords(startVal);
          const endRes = endVal ? resolvePlaceCoords(endVal) : null;
          const limit = Number(el.max?.value || 8);
          pool = findPandalsOnRoute(startRes?.coords, endRes?.coords, data.pandals, limit);
          pool.forEach((p) => picked.add(p.id));
          drawPicker();
          updateEnroutePreview();
        }
      }

      if (mode !== 'custom') {
        const mf = el.must.value === '1';
        if (endStation) {
          const detour = (p) => (hStart.get(p.station) ?? 20) + (hEnd.get(p.station) ?? 20);
          pool = [...pool].sort((a, b) => (mf ? (b.must ? 1 : 0) - (a.must ? 1 : 0) : 0) || detour(a) - detour(b) || ord(a) - ord(b)).slice(0, Number(el.max.value));
        } else {
          const d = (p) => hStart.get(p.station) ?? 30;
          pool = [...pool].sort((a, b) => (mf ? (b.must ? 1 : 0) - (a.must ? 1 : 0) : 0) || d(a) - d(b) || ord(a) - ord(b)).slice(0, Number(el.max.value));
        }
      }

      if (endStation || endVal) {
        // Sequence stops greedily from startStation/startCoords towards endStation/endCoords
        const startRes = resolvePlaceCoords(startVal);
        let currCoords = startRes ? startRes.coords : [22.6033, 88.3703];
        let currStation = startStation;
        const remaining = [...pool];
        const ordered = [];
        while (remaining.length) {
          remaining.sort((a, b) => {
            const cA = getPandalCoords(a);
            const cB = getPandalCoords(b);
            const distA = haversine(currCoords[0], currCoords[1], cA[0], cA[1]);
            const distB = haversine(currCoords[0], currCoords[1], cB[0], cB[1]);
            const metroCostA = (hop(currStation, a.station) ?? 10) + 0.35 * (hEnd ? (hEnd.get(a.station) ?? 10) : 0);
            const metroCostB = (hop(currStation, b.station) ?? 10) + 0.35 * (hEnd ? (hEnd.get(b.station) ?? 10) : 0);
            return (distA - distB) * 0.7 + (metroCostA - metroCostB) * 0.3 || (a.must ? -1 : 1);
          });
          const next = remaining.shift();
          ordered.push(next);
          currCoords = getPandalCoords(next);
          currStation = next.station;
        }
        route = ordered;
      } else {
        const startRes = resolvePlaceCoords(startVal);
        let currCoords = startRes ? startRes.coords : [22.6033, 88.3703];
        let currStation = startStation;
        const remaining = [...pool];
        const ordered = [];
        while (remaining.length) {
          remaining.sort((a, b) => {
            const cA = getPandalCoords(a);
            const cB = getPandalCoords(b);
            const distA = haversine(currCoords[0], currCoords[1], cA[0], cA[1]);
            const distB = haversine(currCoords[0], currCoords[1], cB[0], cB[1]);
            return distA - distB || (hop(currStation, a.station) ?? 10) - (hop(currStation, b.station) ?? 10) || ord(a) - ord(b);
          });
          const next = remaining.shift();
          ordered.push(next);
          currCoords = getPandalCoords(next);
          currStation = next.station;
        }
        route = ordered;
      }

      shown = PAGE;
      saveDraft();
      draw();
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function draw(focusFrom) {
      if (!route.length) {
        itin.innerHTML = '<li class="empty">No pandals found on this route yet. Try another starting area or pick pandals.</li>'; summary.innerHTML = ''; cta.classList.remove('show'); more.hidden = true; return;
      }
      const startVal = el.start.value.trim() || 'Shyambazar';
      const endVal = el.end ? el.end.value.trim() : '';
      const isStartStation = isKnownStation(startVal);
      const isEndStation = endVal ? isKnownStation(endVal) : false;
      const startStation = isStartStation ? getStationMatch(startVal) : findAnchorStation(startVal);
      const endStation = endVal ? (isEndStation ? getStationMatch(endVal) : findAnchorStation(endVal)) : null;

      const hStart = hopsFrom(startStation);

      let stations = hStart.get(route[0].station) ?? 0;
      for (let i = 1; i < route.length; i++) stations += hop(route[i - 1].station, route[i].station);
      if (endStation) stations += hop(route.at(-1).station, endStation);

      const mins = stations * 3 + route.length * 20;
      const dt = el.date.value ? new Date(el.date.value + 'T00:00') : null;
      $('[data-result-title]').textContent = dt ? `Your itinerary · ${dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}` : 'Your itinerary';
      
      const metroPart = stations > 0 ? `<div><b>~${stations}</b><span>metro stops</span></div>` : '';
      summary.innerHTML = `<div><b>${route.length}</b><span>pandals</span></div>${metroPart}<div><b>~${Math.floor(mins / 60)}h ${mins % 60}m</b><span>estimated</span></div>`;

      const startBadge = isStartStation ? 'Metro Start' : 'Start Place';
      const startTitle = isStartStation ? `${esc(startStation)} Metro Station` : esc(startVal);
      const startSubtitle = isStartStation ? 'Metro start point · Begin your pujo route' : 'Starting place · Begin your hopping route';
      const startCard = `<li class="stop-terminal start"><div class="terminal-card"><span class="terminal-badge start">${startBadge}</span><div class="terminal-info"><b>${startTitle}</b><span class="muted">${startSubtitle}</span></div></div></li>`;

      const startRes = resolvePlaceCoords(startVal);
      const startCoords = startRes ? startRes.coords : [22.6033, 88.3703];

      const stopCards = route.slice(0, shown).map((p, i) => {
        const line = ctx.lineByStation.get(p.station);
        const n = hStart.get(p.station);

        const prevCoords = i === 0 ? startCoords : getPandalCoords(route[i - 1]);
        const curCoords = getPandalCoords(p);
        const legDist = haversine(prevCoords[0], prevCoords[1], curCoords[0], curCoords[1]);
        const legDistStr = legDist < 0.05 ? 'Nearby (~50m)' : (legDist < 1 ? `~${Math.round(legDist * 1000)}m` : `~${legDist.toFixed(1)}km`);
        const legWalkMin = legDist < 0.05 ? 1 : Math.max(2, Math.round(legDist * 12));

        return `<li class="stop"><span class="stop-num">${i + 1}</span><div class="stop-card">
          <h3><a href="/pandal/${p.id}">${esc(p.name)}</a></h3>
          <p class="muted" style="font-size:13px">${esc(p.area)} · <span class="leg-dist-badge">${icon('walk')} ${legDistStr} (${legWalkMin} min)</span></p>
          <span class="station"><span class="dot" style="background:${line.color}"></span>${esc(p.station)} Metro${n != null ? ` · ${n === 0 ? 'near start' : n + ' stop' + (n > 1 ? 's' : '') + ' from start'}` : ''}</span>
          <div class="actions"><a class="btn btn-ghost btn-sm" href="${stationToPandalLink(p)}" target="_blank" rel="noopener">${icon('walk')} Walk from station</a>${p.must ? '<span class="tag gold" style="align-self:center">Must visit</span>' : ''}</div>
          <button class="card-check-toggle" type="button" aria-pressed="false" aria-label="Add ${esc(p.name)} to checklist" title="Add to checklist" data-checklist-toggle="${p.id}">${icon('checklist')}</button>
        </div></li>`;
      }).join('');

      let endCard = '';
      if (endVal) {
        const endBadge = isEndStation ? 'Metro Finish' : 'Finish Place';
        const endTitle = isEndStation ? `${esc(endStation)} Metro Station` : esc(endVal);
        const endSubtitle = isEndStation
          ? `Finish route & head home (~${hop(route.at(-1).station, endStation)} metro stops from last pandal)`
          : `Custom finish place · End your hopping & head home`;
        endCard = `<li class="stop-terminal end"><div class="terminal-card"><span class="terminal-badge end">${endBadge}</span><div class="terminal-info"><b>${endTitle}</b><span class="muted">${endSubtitle}</span></div></div></li>`;
      }

      function formatLabelForMaps(val, isStation) {
        if (!val) return null;
        const clean = val.trim();
        const userGps = getUserGps();
        if (userGps && (clean.toLowerCase().includes('my location') || clean.toLowerCase().includes('current location'))) {
          return `${userGps.coords[0]},${userGps.coords[1]}`;
        }
        if (isStation) return `${clean} Metro Station, Kolkata`;
        if (clean.toLowerCase().includes('kolkata')) return clean;
        return `${clean}, Kolkata`;
      }

      const startLabel = formatLabelForMaps(startVal, isStartStation);
      const endLabel = endVal ? formatLabelForMaps(endVal, isEndStation) : null;
      const links = routeLinks(route, startLabel, endLabel);
      const mapsBtnHtml = `<a class="btn btn-primary btn-block" href="${links[0]}" target="_blank" rel="noopener">${icon('map')} Open route in Google Maps${links.length > 1 ? ' (part 1 of ' + links.length + ')' : ''}</a>`;

      summary.innerHTML = `<div class="summary-stats"><div><b>${route.length}</b><span>pandals</span></div>${metroPart}<div><b>~${Math.floor(mins / 60)}h ${mins % 60}m</b><span>estimated</span></div></div><div class="summary-maps-action">${mapsBtnHtml}</div>`;

      const footerCtaCard = `<li class="stop-terminal-cta">${mapsBtnHtml}</li>`;
      itin.innerHTML = startCard + stopCards + endCard + footerCtaCard;
      syncCheck(itin);
      const left = route.length - Math.min(shown, route.length);
      more.hidden = left <= 0; more.textContent = `View more stops (${left} left)`;

      openMaps.href = links[0]; openMaps.innerHTML = `${icon('map')} Open route in Google Maps${links.length > 1 ? ' (part 1 of ' + links.length + ')' : ''}`;
      $$('.extra-part').forEach((n) => n.remove());
      links.slice(1).forEach((u, i) => summary.insertAdjacentHTML('afterend', `<p class="extra-part count-note" style="margin:8px 0">Long route: <a href="${u}" target="_blank" rel="noopener" style="text-decoration:underline">open part ${i + 2} of ${links.length} in Maps</a></p>`));
      
      const pwaPrompt = document.querySelector('.install-prompt');
      if (pwaPrompt) pwaPrompt.classList.remove('show');
      cta.classList.add('show');
      if (focusFrom != null) $$('.stop-card h3 a', itin)[focusFrom]?.focus();
    }
    more.addEventListener('click', () => { const f = shown; shown += PAGE; draw(f); });
    form.addEventListener('submit', (e) => { e.preventDefault(); build(); });
    $('[data-build]').addEventListener('click', (e) => { e.preventDefault(); build(); });
    setMode(mode);
    updateEnroutePreview();
    if (params.get('zone') || params.get('wish') || params.get('add') || params.get('checklist')) { if (mode !== 'custom' || picked.size) build(); }
  }

  /* ================= WISHLIST ================= */
  function wishlist() {
    location.replace('/checklist');
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
      'tridhara-sammilani', 'sreebhumi-sporting-club', 'sree-bhumi-sporting-club',
      'santosh-mitra-square', 'santosh-mitra-square-lebutala', 'bagbazar-sarbojanin',
      'bagbazar-sarbojanin-durgotsav', 'ahiritola-sarbojanin', 'ahiritola-sarbojanin-durgotsav',
      'college-square', 'suruchi-sangha',
      'chetla-agrani-club', 'ballygunge-cultural-association',
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

    function hideAddPanel() {
      if (!addPanel) return;
      addPanel.hidden = true;
      if (toggleAddPanelBtn) {
        toggleAddPanelBtn.innerHTML = `${icon('plus')} Add Pandals`;
        toggleAddPanelBtn.setAttribute('aria-expanded', 'false');
        toggleAddPanelBtn.classList.remove('btn-done-mode');
      }
      const controls = $('[data-check-controls]');
      if (controls && check.items().length > 0) {
        controls.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function showAddPanel() {
      if (!addPanel) return;
      addPanel.hidden = false;
      if (toggleAddPanelBtn) {
        toggleAddPanelBtn.innerHTML = `${icon('check')} Done Adding`;
        toggleAddPanelBtn.setAttribute('aria-expanded', 'true');
        toggleAddPanelBtn.classList.add('btn-done-mode');
      }
      drawAddPicker();
      if (addSearchInput) addSearchInput.focus();
    }

    if (toggleAddPanelBtn && addPanel) {
      toggleAddPanelBtn.addEventListener('click', () => {
        if (addPanel.hidden) {
          showAddPanel();
        } else {
          hideAddPanel();
        }
      });
    }

    if (closeAddPanelBtn) {
      closeAddPanelBtn.addEventListener('click', hideAddPanel);
    }

    const closeAddPanelBottomBtn = $('[data-close-add-panel-bottom]');
    if (closeAddPanelBottomBtn) {
      closeAddPanelBottomBtn.addEventListener('click', hideAddPanel);
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
        } else if (type === 'east') {
          idsToAdd = data.pandals.filter((p) => p.zone === 'east').slice(0, 15).map((p) => p.id);
          label = 'East & Salt Lake pandals';
        } else if (type === 'bonedi') {
          idsToAdd = data.pandals.filter((p) => p.bonedi).slice(0, 15).map((p) => p.id);
          label = 'Bonedi Bari heritage pujas';
        }
        if (idsToAdd.length) {
          const added = check.addMultiple(idsToAdd);
          toast(`Added ${label} to your checklist (${added} new)`);
          hideAddPanel();
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
        hideAddPanel();
        draw();
      });
    }

    const emptyOpenSearch = $('[data-empty-open-search]');
    if (emptyOpenSearch && addPanel) {
      emptyOpenSearch.addEventListener('click', () => {
        showAddPanel();
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
          emptyTitle.textContent = 'Congratulations! Checklist Completed!';
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
          hideAddPanel();
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
    const checkEl = $('[data-stat-check]') || $('[data-stat-wish]');
    const planEl = $('[data-stat-plan]');
    const recentEl = $('[data-stat-recent]');
    const clearBtn = $('[data-clear-local]');

    function refreshStats() {
      const items = check.items();
      const visited = check.visited();
      const p = store.get('pp_plan', null);
      const r = store.get('pp_recent', []);
      if (checkEl) checkEl.textContent = `${items.length} in checklist (${visited.length} visited)`;
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
          check.clear();
          syncCheck();
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

  /* ================= PARKING ================= */
  function parking() {
    const searchInput = $('[data-parking-search]');
    const chips = $$('[data-parking-chips] button');
    const cards = $$('[data-parking-grid] .parking-dir-card');
    let currentZone = '';
    let searchQuery = '';

    function filterParking() {
      const q = searchQuery.toLowerCase().trim();
      cards.forEach((card) => {
        const matchesZone = !currentZone || card.dataset.zone === currentZone;
        const cardText = `${card.dataset.name} ${card.dataset.serves} ${card.dataset.address}`.toLowerCase();
        const matchesQuery = !q || cardText.includes(q);
        card.style.display = matchesZone && matchesQuery ? '' : 'none';
      });
    }

    chips.forEach((btn) => {
      btn.addEventListener('click', () => {
        chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        currentZone = btn.dataset.zone || '';
        filterParking();
      });
    });

    if (searchInput) {
      let t;
      searchInput.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          searchQuery = searchInput.value;
          filterParking();
        }, 120);
      });
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
  const scrollBtn = e.target.closest('.scroll-down-btn');
  if (scrollBtn) {
    e.preventDefault();
    const target = document.querySelector('#spotlight') || document.querySelector('.home-sheet');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try { history.replaceState(null, '', '#spotlight'); } catch {}
    }
    return;
  }

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

/* ---------- Scroll visibility for Header, Bottom Nav, and Hero Scroll Cue (60/120fps optimized) ---------- */
function initScrollUI() {
  const nav = $('.bottom-nav');
  const header = $('.site-header');
  const heroCue = $('.hero-bottom-cue');
  if (!nav && !header && !heroCue) return;

  let ticking = false;
  let lastNavVisible = null;
  let lastHeaderScrolled = null;
  let lastHeroCueHidden = null;
  let isShortPage = false;

  const checkShortPage = () => {
    isShortPage = (document.documentElement.scrollHeight <= window.innerHeight + 80) && (document.body.dataset.page !== 'home');
  };
  checkShortPage();
  window.addEventListener('resize', checkShortPage, { passive: true });

  const update = () => {
    ticking = false;
    const y = window.scrollY || document.documentElement.scrollTop;

    if (heroCue) {
      const hideCue = (y > 20);
      if (hideCue !== lastHeroCueHidden) {
        lastHeroCueHidden = hideCue;
        heroCue.classList.toggle('is-hidden', hideCue);
      }
    }

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

  // Polite delay so user interacts smoothly with page first; wait for guide dismissal
  setTimeout(() => {
    if (localStorage.getItem('pujopath_install_prompt')) return;
    if (!store.get('pp_guide_dismissed', false)) return;

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
  }, 4000);
}
initInstallBanner();

/* ---------- App Guide / Onboarding Tutorial (First-time visitors) ---------- */
function initGuide() {
  if (typeof window === 'undefined') return;
  const modal = $('[data-guide-modal]');
  if (!modal) return;

  const slides = $$('[data-guide-slide]', modal);
  const dots = $$('[data-guide-dot]', modal);
  const stepText = $('[data-guide-step-text]', modal);
  const btnPrev = $('[data-guide-prev]', modal);
  const btnNext = $('[data-guide-next]', modal);
  let currentStep = 0;

  function showStep(idx) {
    currentStep = Math.max(0, Math.min(idx, slides.length - 1));
    slides.forEach((s, i) => {
      const active = (i === currentStep);
      s.classList.toggle('is-active', active);
      s.style.display = active ? 'flex' : 'none';
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach((d, i) => {
      const active = (i === currentStep);
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (stepText) {
      stepText.textContent = `Quick Guide · ${currentStep + 1} of ${slides.length}`;
    }
    if (btnPrev) {
      btnPrev.style.display = currentStep > 0 ? 'inline-flex' : 'none';
    }
    if (btnNext) {
      if (currentStep === slides.length - 1) {
        btnNext.textContent = 'Start Hopping →';
        btnNext.classList.add('guide-finish-btn');
      } else {
        btnNext.textContent = 'Next →';
        btnNext.classList.remove('guide-finish-btn');
      }
    }
  }

  function openGuide() {
    showStep(0);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeGuide(markDismissed = true) {
    if (markDismissed) {
      store.set('pp_guide_dismissed', true);
    }
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  // Dismiss listeners: "Skip Tutorial", close (x) button, and backdrop click
  $$('[data-guide-dismiss]', modal).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeGuide(true);
    });
  });

  // Next / Finish button
  btnNext?.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentStep < slides.length - 1) {
      showStep(currentStep + 1);
    } else {
      closeGuide(true);
    }
  });

  // Previous button
  btnPrev?.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  });

  // Step indicator dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      showStep(i);
    });
  });

  // Keyboard navigation: Escape to exit/skip, Left/Right arrows for steps
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeGuide(true);
    } else if (e.key === 'ArrowRight') {
      if (currentStep < slides.length - 1) showStep(currentStep + 1);
    } else if (e.key === 'ArrowLeft') {
      if (currentStep > 0) showStep(currentStep - 1);
    }
  });

  // Global event delegation for manual trigger buttons across the site
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-guide]');
    if (trigger) {
      e.preventDefault();
      openGuide();
    }
  });

  // Auto-launch for first-time visitors after smooth page load delay (500ms)
  try {
    const isDismissed = store.get('pp_guide_dismissed', false);
    const forceGuide = window.location.search.includes('guide=1') || window.location.hash === '#guide';
    if (!isDismissed || forceGuide) {
      setTimeout(() => {
        if (!store.get('pp_guide_dismissed', false) || forceGuide) {
          openGuide();
        }
      }, 500);
    }
  } catch (e) {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGuide);
} else {
  initGuide();
}


