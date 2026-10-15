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

export function placeLink(p) {
  return `https://www.google.com/maps/search/?api=1&query=${enc(`${p.name}, ${p.area}, Kolkata`)}`;
}
export function stationToPandalLink(p) {
  return `https://www.google.com/maps/dir/?api=1&origin=${enc(`${p.station} Metro Station, Kolkata`)}&destination=${enc(`${p.name}, ${p.area}, Kolkata`)}&travelmode=walking`;
}
// Google Maps allows an origin, a destination and up to 9 waypoints per link.
export function routeLinks(stops, startLabel) {
  const q = (p) => `${p.name}, ${p.area}, Kolkata`;
  const chunks = [];
  for (let i = 0; i < stops.length; i += 10) chunks.push(stops.slice(i, i + 10));
  return chunks.map((chunk, idx) => {
    const origin = idx === 0 && startLabel ? startLabel : (idx === 0 ? q(chunk[0]) : q(chunks[idx - 1].at(-1)));
    const rest = idx === 0 && !startLabel ? chunk.slice(1) : chunk;
    const dest = rest.at(-1);
    const via = rest.slice(0, -1).map(q).join('|');
    if (!dest) return null;
    return `https://www.google.com/maps/dir/?api=1&origin=${enc(origin)}&destination=${enc(q(dest))}${via ? `&waypoints=${enc(via)}` : ''}&travelmode=walking`;
  }).filter(Boolean);
}

export function photoFor(p, data) { return data.photos?.[p.id] || null; }

export function cardHTML(p, ctx, opts = {}) {
  const line = ctx.lineByStation.get(p.station);
  const photo = photoFor(p, ctx.data);
  const thumb = photo
    ? `<img src="${esc(photo)}" alt="${esc(p.name)} Durga Puja pandal, ${esc(p.area)}" loading="lazy" width="400" height="300">`
    : `<div class="ph" aria-hidden="true">${icon('lotus', '')}</div>`;
  const zone = ctx.zones[p.zone]?.label || '';
  return `<article class="card" data-id="${p.id}">
  <div class="thumb">${thumb}</div>
  <div class="body">
    <h3><a href="/pandal/${p.id}">${esc(p.name)}</a></h3>
    <p class="area">${esc(p.area)} · ${esc(zone)}</p>
    ${p.theme ? `<p class="theme">${esc(p.theme)}</p>` : ''}
    <div class="meta">
      <span class="station"><span class="dot" style="background:${line.color}"></span>${esc(p.station)} Metro${p.walkMin ? ` · ~${p.walkMin} min walk` : ''}</span>
      ${p.must ? '<span class="tag gold">Must visit</span>' : ''}${p.bonedi ? '<span class="tag">Bonedi</span>' : ''}
    </div>
  </div>
  <button class="heart" type="button" aria-pressed="false" aria-label="Save ${esc(p.name)} to wishlist" data-heart="${p.id}">${icon('heart', '')}</button>
</article>`;
}
