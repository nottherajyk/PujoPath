// Helpers shared by the build script (Node) and the browser. No DOM access here.
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const enc = encodeURIComponent;

export function makeCtx(data) {
  const lineByStation = new Map();
  const linesByStation = new Map();
  for (const l of data.lines) {
    for (const s of l.stations) {
      if (!lineByStation.has(s)) lineByStation.set(s, l);
      if (!linesByStation.has(s)) linesByStation.set(s, []);
      linesByStation.get(s).push(l);
    }
  }
  return { data, lineByStation, linesByStation, zones: data.zones };
}

export const icon = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

export function formatWalkTime(min) {
  if (!min) return '';
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}m walk` : `${h}h walk`;
  }
  return `${min} min walk`;
}

export function placeLink(p) {
  return `https://www.google.com/maps/search/?api=1&query=${enc(`${p.name}, ${p.area}, Kolkata`)}`;
}
export function stationToPandalLink(p) {
  const mode = p.walkMin && p.walkMin > 25 ? '' : '&travelmode=walking';
  return `https://www.google.com/maps/dir/?api=1&origin=${enc(`${p.station} Metro Station, Kolkata`)}&destination=${enc(`${p.name}, ${p.area}, Kolkata`)}${mode}`;
}
// Google Maps allows an origin, a destination and up to 9 waypoints per link.
export function routeLinks(stops, startLabel, endLabel) {
  const q = (p) => `${p.name}, ${p.area}, Kolkata`;
  const chunks = [];
  for (let i = 0; i < stops.length; i += 8) chunks.push(stops.slice(i, i + 8));
  return chunks.map((chunk, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === chunks.length - 1;
    const origin = isFirst && startLabel ? startLabel : (isFirst ? q(chunk[0]) : q(chunks[idx - 1].at(-1)));
    const rest = isFirst && !startLabel ? chunk.slice(1) : chunk;

    let dest;
    let viaStops;
    if (isLast && endLabel) {
      dest = endLabel;
      viaStops = rest;
    } else {
      dest = rest.at(-1) ? q(rest.at(-1)) : null;
      viaStops = rest.slice(0, -1);
    }

    const via = viaStops.map(q).join('|');
    if (!dest) return null;
    return `https://www.google.com/maps/dir/?api=1&origin=${enc(origin)}&destination=${enc(dest)}${via ? `&waypoints=${enc(via)}` : ''}&travelmode=walking`;
  }).filter(Boolean);
}

export function photoFor(p, data) { return data.photos?.[p.id] || null; }

export function cardHTML(p, ctx, opts = {}) {
  const line = ctx.lineByStation.get(p.station);
  const photo = photoFor(p, ctx.data);
  const thumb = photo
    ? `<img src="${esc(photo)}" alt="${esc(p.name)} Durga Puja pandal, ${esc(p.area)}" loading="lazy" decoding="async" width="400" height="300">`
    : `<div class="ph" aria-hidden="true">${icon('lotus', '')}</div>`;
  const zone = ctx.zones[p.zone]?.label || '';
  const walkLabel = p.walkMin ? ` · ~${formatWalkTime(p.walkMin)}` : '';
  const showTheme = !opts.hideTheme && p.theme;
  let actionButtons = '';
  if (opts.isChecklistPage) {
    actionButtons = `<div class="card-checklist-actions">
      <button class="card-check-btn" type="button" aria-pressed="false" data-check-visit="${p.id}" aria-label="Mark ${esc(p.name)} as visited">${icon('check')}<span class="check-label">Mark Visited</span></button>
      <a class="btn btn-ghost btn-sm" href="${stationToPandalLink(p)}" target="_blank" rel="noopener">${icon('walk')} Walk</a>
      <button class="btn-check-remove" type="button" data-check-remove="${p.id}" title="Remove from checklist" aria-label="Remove ${esc(p.name)} from checklist">${icon('trash')} Remove</button>
    </div>`;
  } else if (opts.showCheck) {
    actionButtons = `<button class="card-check-btn" type="button" aria-pressed="false" data-check-visit="${p.id}" data-check-toggle="${p.id}" aria-label="Mark ${esc(p.name)} as visited">${icon('check')}<span class="check-label">Mark Visited</span></button>`;
  }
  return `<article class="card" data-id="${p.id}">
  <div class="thumb">${thumb}</div>
  <div class="body">
    <h3><a href="/pandal/${p.id}">${esc(p.name)}</a></h3>
    <p class="area">${esc(p.area)} · ${esc(zone)}</p>
    ${showTheme ? `<p class="theme">${esc(p.theme)}</p>` : ''}
    <div class="meta">
      <span class="station"><span class="dot" style="background:${line.color}"></span>${esc(p.station)} Metro${walkLabel}</span>
      ${p.must ? '<span class="tag gold">Must visit</span>' : ''}${p.bonedi ? '<span class="tag">Bonedi</span>' : ''}
    </div>
    ${actionButtons}
  </div>
  ${opts.isChecklistPage ? '' : `<button class="card-check-toggle" type="button" aria-pressed="false" aria-label="Add ${esc(p.name)} to checklist" title="Add to checklist" data-checklist-toggle="${p.id}">${icon('checklist')}</button>`}
</article>`;
}
