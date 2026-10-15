// Static site generator: node build.mjs  →  public/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, LINES, ZONES, PANDALS } from './data.mjs';
import { esc, enc, icon, makeCtx, cardHTML, placeLink, stationToPandalLink } from './src/js/shared.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'public');
const SRC = path.join(ROOT, 'src');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const copyDir = (from, to) => fs.cpSync(from, to, { recursive: true });
copyDir(path.join(SRC, 'css'), path.join(OUT, 'css'));
copyDir(path.join(SRC, 'js'), path.join(OUT, 'js'));
copyDir(path.join(SRC, 'assets'), path.join(OUT, 'assets'));

// ---- photos: drop <pandal-id>.jpg|jpeg|webp|png into src/assets/pandals/ and it is used automatically
const photos = {};
const pdir = path.join(SRC, 'assets', 'pandals');
for (const f of fs.existsSync(pdir) ? fs.readdirSync(pdir) : []) {
  const m = f.match(/^(.+)\.(jpe?g|webp|png)$/i);
  if (m) photos[m[1]] = `/assets/pandals/${f}`;
}

fs.copyFileSync(path.join(SRC, 'assets', 'og-image.jpg'), path.join(OUT, 'og-image.jpg'));
const data = { site: { name: SITE.name, year: SITE.year }, lines: LINES, zones: ZONES, pandals: PANDALS, photos };
fs.writeFileSync(path.join(OUT, 'data.json'), JSON.stringify(data));
const ctx = makeCtx(data);

const write = (rel, html) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

// ---- SVG sprite
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
<symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></symbol>
<symbol id="i-compass" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></symbol>
<symbol id="i-train" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l2-4M15 21l-2-4"/><circle cx="9" cy="14" r=".6"/><circle cx="15" cy="14" r=".6"/></symbol>
<symbol id="i-support" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="m14.5 14.5 3.2 3.2M9.5 9.5 6.3 6.3M14.5 9.5l3.2-3.2M9.5 14.5l-3.2 3.2"/></symbol>
<symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-9.2-9.2C1.6 7.4 3.6 4.5 6.7 4.5c2 0 3.5 1 5.3 3 1.8-2 3.3-3 5.3-3 3.1 0 5.1 2.9 3.9 6.3C19.5 15.4 12 20 12 20z"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
<symbol id="i-back" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></symbol>
<symbol id="i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/></symbol>
<symbol id="i-temple" viewBox="0 0 24 24"><path d="M12 3c1.5 2 1.5 3.5 0 5-1.5-1.5-1.5-3 0-5z"/><path d="M6 21V12c0-2.2 2.7-4 6-4s6 1.8 6 4v9"/><path d="M3 21h18M10 21v-5a2 2 0 0 1 4 0v5"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
<symbol id="i-map" viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></symbol>
<symbol id="i-chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
<symbol id="i-walk" viewBox="0 0 24 24"><circle cx="13" cy="4.5" r="1.8"/><path d="m9 21 2.5-6-2-3 2-4 3 2.5 2.5.5M11.5 15l3 2.5V21M8 12l-2 3"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></symbol>
<symbol id="i-insta" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
<symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
<symbol id="i-expand" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></symbol>
<symbol id="i-lotus" viewBox="0 0 64 64"><path d="M32 8c5 8 6 16 0 27-6-11-5-19 0-27zM12 22c9 1 16 6 19 15-9 1-16-3-19-15zM52 22c-3 12-10 16-19 15 3-9 10-14 19-15zM6 38c10-2 18 1 24 8-10 4-19 1-24-8zM58 38c-5 9-14 12-24 8 6-7 14-10 24-8zM32 50c-8 0-15 3-20 8h40c-5-5-12-8-20-8z"/></symbol>
</svg>`;

const NAV = [
  { key: 'home', href: '/', label: 'Home', icon: 'home' },
  { key: 'explore', href: '/pandals', label: 'Explore', icon: 'compass' },
  { key: 'metro', href: '/metro', label: 'Metro', icon: 'train' },
  { key: 'support', href: '/support', label: 'Support', icon: 'support' },
];
const SUB = [
  { key: 'pandals', href: '/pandals', label: 'Pandals' },
  { key: 'hopping', href: '/hopping', label: 'Hopping' },
  { key: 'planner', href: '/planner', label: 'Planner' },
  { key: 'wishlist', href: '/wishlist', label: 'Wishlist' },
];

const KEYWORDS = ['PujaPath', 'Kolkata Durga Puja 2026', 'Durga Puja pandal hopping Kolkata', 'Kolkata pandal guide', 'Kolkata metro pandal route', 'Durga Puja route planner', 'best pandals in Kolkata 2026', 'North Kolkata pujo', 'South Kolkata pujo', 'Kolkata metro stations near pandals', 'bonedi bari pujo', 'Maddox Square', 'Sree Bhumi', 'Md Ali Park', 'Deshapriya Park'];

function layout({ title, desc, pathname, navKey, subKey, body, jsonld = [], page, ogImage = '/og-image.jpg', noindex = false, keywords = KEYWORDS, bodyClass = '', ogType = 'website' }) {
  const url = SITE.url + pathname;
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  const wishCount = `<span class="badge" data-wish-count data-count="0">0</span>`;
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="keywords" content="${esc(keywords.join(', '))}">
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#FAF8F5">
<meta name="view-transition" content="same-origin">
<meta name="geo.region" content="IN-WB"><meta name="geo.placename" content="Kolkata"><meta name="geo.position" content="22.5726;88.3639"><meta name="ICBM" content="22.5726, 88.3639">
<meta property="og:site_name" content="${SITE.name}"><meta property="og:type" content="${ogType}"><meta property="og:locale" content="en_IN">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.url}${ogImage}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${SITE.url}${ogImage}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap">
<link rel="stylesheet" href="/css/style.css">
<script>
(function(){
  try {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (c && (c.saveData || c.effectiveType === 'slow-2g' || c.effectiveType === '2g' || c.effectiveType === '3g' || (typeof c.downlink === 'number' && c.downlink < 1.5) || (typeof c.rtt === 'number' && c.rtt > 500))) {
      document.documentElement.classList.add('slow-network', 'reduced-motion');
    }
  } catch(e){}
})();
</script>
${ld}
</head>
<body data-page="${page}" class="${bodyClass}">
<div class="page-progress" id="pageProgress" aria-hidden="true"></div>
${sprite}
<a class="sr-only" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap">
  <a class="brand" href="/" aria-label="${SITE.name} home">${icon('lotus', 'lotus')}<span>Puja<b>Path</b></span></a>
  <nav class="top-links" aria-label="Primary">${NAV.map((n) => `<a href="${n.href}"${n.key === navKey ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}</nav>
  <a class="head-wish" href="/wishlist" aria-label="Wishlist">${icon('heart')}${wishCount}</a>
</div></header>
<main id="main">
${body}
</main>
<footer class="site-footer"><div class="wrap">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="brand">${icon('lotus', 'lotus')}<span>Puja<b>Path</b></span></div>
      <p>Kolkata's definitive Durga Puja guide, pandal directory and metro route planner.</p>
    </div>
    <div class="footer-links">
      <b>Quick links</b>
      <nav aria-label="Footer quick links"><a href="/pandals">All Pandals</a><a href="/hopping">Explore Zones</a><a href="/planner">Route Planner</a><a href="/metro">Metro Guide</a><a href="/map">Metro Map</a><a href="/support">Support</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a></nav>
    </div>
    <div class="footer-meta">
      <b>Durga Puja ${SITE.year}</b>
      <p>Pandal timings and metro schedules are community-sourced and subject to change. Confirm with local committees.</p>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© ${SITE.year} ${SITE.name}. Built with devotion for Kolkata Durga Puja. Local device storage, zero advertising tracking.</p>
  </div>
</div></footer>
<nav class="bottom-nav" aria-label="Primary mobile">${NAV.map((n) => `<a href="${n.href}"${n.key === navKey ? ' aria-current="page"' : ''}>${icon(n.icon)}<span>${n.label}</span></a>`).join('')}</nav>
<div class="toast" role="status" aria-live="polite" data-toast></div>
<script type="module" src="/js/app.js"></script>
</body>
</html>`;
}

const subnav = (active) => `<nav class="subnav" aria-label="Explore sections">${SUB.map((s) => `<a href="${s.href}"${s.key === active ? ' aria-current="page"' : ''}>${s.label}${s.key === 'wishlist' ? `<span class="badge" data-wish-count data-count="0">0</span>` : ''}</a>`).join('')}</nav>`;

const total = PANDALS.length;
const musts = PANDALS.filter((p) => p.must);
const zoneCount = (k) => PANDALS.filter((p) => (k === 'bonedi' ? p.bonedi : p.zone === k)).length;
const zoneImg = { north: '/assets/photo-reflection.webp', south: '/assets/photo-gold.webp', central: '/assets/hero.webp', east: '/assets/photo-gold.webp', bonedi: '/assets/photo-reflection.webp' };
const zoneCard = (k) => `<a class="zone" href="/hopping?zone=${k}"><img src="${zoneImg[k]}" alt="" loading="lazy" width="600" height="400"><div><b>${esc(ZONES[k].title)}</b><span>${zoneCount(k)} pandals · ${esc(ZONES[k].hub)}</span><span>${esc(ZONES[k].lines)}</span><p class="go">Start hopping →</p></div></a>`;

const org = { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url, inLanguage: 'en-IN', potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/pandals?q={search_term_string}`, 'query-input': 'required name=search_term_string' } };
const crumbs = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE.url + p })) });

// ================= HOME =================
write('index.html', layout({
  title: `${SITE.name}: Kolkata Durga Puja ${SITE.year} Pandal Guide & Metro Route Planner`,
  desc: `Explore ${total}+ Kolkata Durga Puja ${SITE.year} pandals, find the nearest metro station, plan a pandal-hopping route by zone or metro line and save your favourites.`,
  pathname: '/', navKey: 'home', page: 'home', jsonld: [org],
  body: `
<div class="home-loader" id="homeLoader" aria-hidden="true">
  <div class="home-loader-inner">
    <div class="home-loader-icon">
      ${icon('lotus', 'lotus')}
      <div class="loader-pulse"></div>
    </div>
    <div class="home-loader-brand">Puja<b>Path</b></div>
    <p class="home-loader-text">Loading Kolkata’s Durga Puja guide…</p>
    <div class="home-loader-bar"><div class="home-loader-fill"></div></div>
  </div>
</div>
<section class="hero">
  <img class="hero-img" src="/assets/hero-night.webp" alt="Illuminated Durga Puja pandal at night with a golden idol and red banners, crowds filming" width="1672" height="941" fetchpriority="high">
  <div class="wrap">
    <div class="hero-content">
      <p class="eyebrow">Your Kolkata Durga Puja guide</p>
      <h1>Explore <em>Kolkata’s</em> Pandals</h1>
      <p class="lead">Discover ${total}+ pandals, plan your route, travel smart with the metro and make the most of this Durga Puja.</p>
      <form class="search" action="/pandals" method="get" role="search">
        ${icon('search', 'icon icon-l')}
        <label class="sr-only" for="hq">Search pandals, areas or metro stations</label>
        <input id="hq" name="q" type="search" placeholder="Search pandals, areas, stations…" autocomplete="off" enterkeyhint="search">
        <button type="submit" aria-label="Search">${icon('arrow')}</button>
      </form>
      <div class="quick">
        <a href="/pandals">${icon('temple')}<b>Explore Pandals</b><span>${total} listed</span></a>
        <a href="/planner">${icon('route')}<b>Plan Your Route</b><span>By zone or metro</span></a>
        <a href="/metro">${icon('train')}<b>Metro Guide</b><span>Lines and stations</span></a>
        <a href="/wishlist">${icon('heart')}<b>Save to Wishlist</b><span>Your favourites</span></a>
      </div>
    </div>
  </div>
</section>
<div class="home-sheet">
  <div class="wrap">
    <section class="section" aria-labelledby="iconic">
      <div class="section-head">
        <div><span class="kicker">In the spotlight</span><h2 id="iconic">Iconic pandals of ${SITE.year}</h2></div>
        <div class="spotlight-actions">
          <div class="carousel-nav" aria-label="Carousel navigation">
            <button type="button" class="carousel-btn prev" data-scroll-prev aria-label="Scroll left">${icon('arrow')}</button>
            <button type="button" class="carousel-btn next" data-scroll-next aria-label="Scroll right">${icon('arrow')}</button>
          </div>
          <a class="link-more" href="/pandals?type=must">See all</a>
        </div>
      </div>
      <div class="h-scroll" data-iconic>${musts.slice(0, 12).map((p) => cardHTML(p, ctx)).join('')}</div>
    </section>
    <section class="section" aria-labelledby="zones">
      <div class="section-head"><div><span class="kicker">Pandal hopping</span><h2 id="zones">Explore by zone</h2></div></div>
      <p class="muted" style="margin:-6px 0 16px">Pick a zone to see its pandals in metro order, with walking directions between stops.</p>
      <div class="zones">${['north', 'south', 'central', 'east', 'bonedi'].map(zoneCard).join('')}</div>
    </section>
    <section class="section section-metro-promo" aria-labelledby="why">
      <div class="metro-promo-card">
        <div class="metro-promo-info">
          <span class="kicker" style="color:var(--gold)">Smart Metro Transit</span>
          <h2 id="why">Pandal hopping, the metro way</h2>
          <p class="muted">Kolkata’s Durga Puja streets see millions of devotees. PujaPath links every major pandal to its closest metro gate, groups them into North, South, Central, and East circuits, and computes seamless multi-stop walking routes in Google Maps.</p>
          <div class="metro-pills">
            <span class="metro-pill"><span class="dot" style="background:#1E88E5"></span>Blue Line · 26 stations</span>
            <span class="metro-pill"><span class="dot" style="background:#2E8B3E"></span>Green Line · 12 stations</span>
            <span class="metro-pill"><span class="dot" style="background:#E8820C"></span>Orange Line · 9 stations</span>
            <span class="metro-pill"><span class="dot" style="background:#8E24AA"></span>Purple Line · 7 stations</span>
          </div>
          <div class="btn-row" style="margin-top:20px">
            <a class="btn btn-primary" href="/planner">${icon('route')} Launch Route Planner</a>
            <a class="btn btn-ghost" href="/metro">${icon('train')} View Metro Stations</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>`,
}));

// ================= PANDALS =================
write('pandals/index.html', layout({
  title: `All Kolkata Durga Puja ${SITE.year} Pandals: Search by Zone & Metro Station | ${SITE.name}`,
  desc: `Browse ${total}+ Kolkata Durga Puja ${SITE.year} pandals. Filter by North, South, Central or East Kolkata, metro line and pandal type, and find the nearest metro station.`,
  pathname: '/pandals', navKey: 'explore', page: 'pandals',
  jsonld: [crumbs([['Home', '/'], ['Pandals', '/pandals']]), { '@context': 'https://schema.org', '@type': 'ItemList', name: `Kolkata Durga Puja ${SITE.year} pandals`, itemListElement: PANDALS.slice(0, 10).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE.url}/pandal/${p.id}`, name: p.name })) }],
  body: `<div class="wrap">
  <div class="page-title"><h1>Kolkata Pandals ${SITE.year}</h1><p>${total} pandals with their nearest metro station. Tap the heart to save a pandal.</p></div>
  ${subnav('pandals')}
  <div class="filters" data-filters>
    <div class="search-lite">${icon('search')}<label class="sr-only" for="q">Search pandals</label><input class="input" id="q" type="search" placeholder="Search pandals, areas, stations" autocomplete="off"></div>
    <div class="row r4">
      <div class="field"><label for="f-zone">Zone</label><select class="select" id="f-zone"><option value="">All zones</option>${['north', 'south', 'central', 'east'].map((k) => `<option value="${k}">${ZONES[k].label}</option>`).join('')}</select></div>
      <div class="field"><label for="f-line">Metro line</label><select class="select" id="f-line"><option value="">Any line</option>${LINES.map((l) => `<option value="${l.id}">${l.name}</option>`).join('')}</select></div>
      <div class="field"><label for="f-type">Type</label><select class="select" id="f-type"><option value="">All types</option><option value="must">Must visit</option><option value="bonedi">Bonedi Bari (heritage)</option><option value="theme">Themed 2026</option></select></div>
      <div class="field"><label for="f-walk">Distance</label><select class="select" id="f-walk"><option value="">Any distance</option><option value="10">Walk ≤ 10 min*</option><option value="20">Walk ≤ 20 min*</option></select></div>
    </div>
    <p class="count-note">*Walk times are listed only for pandals where a time is known.</p>
  </div>
  <div class="result-bar"><span data-count aria-live="polite"></span><button type="button" data-reset hidden>Clear filters</button></div>
  <div class="list" data-list>${PANDALS.slice(0, 10).map((p) => cardHTML(p, ctx)).join('')}</div>
  <div class="more-wrap"><button class="btn btn-ghost" type="button" data-more>View more pandals</button><span class="count-note" data-more-note></span></div>
</div>`,
}));

// ================= HOPPING =================
write('hopping/index.html', layout({
  title: `Durga Puja Pandal Hopping in Kolkata: North, South, Central & East Circuits | ${SITE.name}`,
  desc: 'Explore Kolkata Durga Puja by zone. Pick North Heritage, South Theme Hubs, Central Classics, Salt Lake & East or Bonedi Bari and hop between pandals in metro-station order.',
  pathname: '/hopping', navKey: 'explore', page: 'hopping',
  jsonld: [crumbs([['Home', '/'], ['Pandals', '/pandals'], ['Hopping', '/hopping']])],
  body: `<div class="wrap">
  <div class="page-title"><h1>Explore by zone</h1><p>Pick a circuit. Stops are ordered along the metro line so you waste less time travelling.</p></div>
  ${subnav('hopping')}
  <div class="chips" role="group" aria-label="Zone" data-zone-chips>${['north', 'south', 'central', 'east', 'bonedi'].map((k) => `<button class="chip" type="button" aria-pressed="false" data-zone="${k}">${ZONES[k].title}</button>`).join('')}</div>
  <section data-zone-view hidden style="margin-top:18px">
    <div class="panel-card" style="margin-bottom:14px"><div><h2 data-zone-title style="font-size:26px"></h2><p class="muted" data-zone-blurb></p></div>
      <div class="btn-row"><a class="btn btn-primary" data-plan-link href="/planner">${icon('route')} Plan this zone</a><a class="btn btn-ghost" data-first-route target="_blank" rel="noopener">${icon('map')} First 10 in Maps</a></div></div>
    <div class="list" data-list></div>
    <div class="more-wrap"><button class="btn btn-ghost" type="button" data-more>View more stops</button><span class="count-note" data-more-note></span></div>
  </section>
  <section data-zone-pick style="margin-top:18px"><div class="zones">${['north', 'south', 'central', 'east', 'bonedi'].map(zoneCard).join('')}</div></section>
</div>`,
}));

// ================= PLANNER =================
const stationOptions = LINES.flatMap((l) => l.stations.map((s) => [s, l]))
  .filter(([s], i, a) => a.findIndex(([x]) => x === s) === i)
  .map(([s, l]) => `<option value="${esc(s)}">${esc(s)} (${l.name.replace(' Line', '')})</option>`).join('');
write('planner/index.html', layout({
  title: `Durga Puja Route Planner Kolkata: Build a Pandal Hopping Itinerary | ${SITE.name}`,
  desc: 'Plan your Kolkata Durga Puja route. Choose a date, starting metro station and zone, and get an ordered pandal itinerary with estimated time and Google Maps directions.',
  pathname: '/planner', navKey: 'explore', page: 'planner', bodyClass: 'has-cta',
  jsonld: [crumbs([['Home', '/'], ['Pandals', '/pandals'], ['Planner', '/planner']])],
  body: `<div class="wrap">
  <div class="page-title"><h1>Plan your pujo route</h1><p>Choose where you start and what you want to see. We order the stops by metro proximity.</p></div>
  ${subnav('planner')}
  <form class="panel-card" data-plan-form onsubmit="return false">
    <div class="seg" role="group" aria-label="Build route by"><button type="button" aria-pressed="true" data-mode="zone">By zone</button><button type="button" aria-pressed="false" data-mode="line">By metro</button><button type="button" aria-pressed="false" data-mode="custom">Custom</button></div>
    <div class="two">
      <div class="field"><label for="p-date">Date</label><input class="input" id="p-date" type="date"></div>
      <div class="field"><label for="p-start">Starting station</label><select class="select" id="p-start">${stationOptions}</select></div>
    </div>
    <div class="field" data-opt="zone"><label for="p-zone">Zone</label><select class="select" id="p-zone">${['north', 'south', 'central', 'east', 'bonedi'].map((k) => `<option value="${k}">${ZONES[k].title}</option>`).join('')}</select></div>
    <div class="field" data-opt="line" hidden><label for="p-line">Metro line</label><select class="select" id="p-line">${LINES.map((l) => `<option value="${l.id}">${l.name} (${l.short})</option>`).join('')}</select></div>
    <div data-opt="custom" hidden class="field"><label for="p-search">Choose pandals</label><input class="input" id="p-search" type="search" placeholder="Search to add pandals" autocomplete="off"><div class="picker-results" data-picker></div><p class="count-note" data-picked-note></p>
      <button type="button" class="btn btn-ghost btn-sm" data-use-wish>${icon('heart')} Use my wishlist</button></div>
    <div class="two" data-opt-limit>
      <div class="field"><label for="p-max">Number of stops</label><select class="select" id="p-max"><option>5</option><option selected>8</option><option>10</option><option>15</option><option>20</option></select></div>
      <div class="field"><label for="p-must">Priority</label><select class="select" id="p-must"><option value="1">Must-visits first</option><option value="0">Closest first</option></select></div>
    </div>
    <button class="btn btn-primary btn-block" type="submit" data-build>${icon('route')} Build my route</button>
  </form>
  <section data-result hidden style="margin-top:22px" aria-live="polite">
    <div class="section-head"><h2 data-result-title style="font-size:24px">Your itinerary</h2></div>
    <div class="summary" data-summary></div>
    <p class="count-note" style="margin:8px 0 16px">Estimates: ~3 min per metro station and ~20 min per pandal. Real queues and walking times vary — use Maps for live directions.</p>
    <ol class="itinerary" data-itinerary></ol>
    <div class="more-wrap"><button class="btn btn-ghost" type="button" data-more hidden>View more stops</button></div>
  </section>
</div>
<div class="sticky-cta" data-cta><div class="wrap"><a class="btn btn-primary btn-block" data-open-maps target="_blank" rel="noopener">${icon('map')} Open route in Google Maps</a></div></div>`,
}));

// ================= WISHLIST =================
write('wishlist/index.html', layout({
  title: `My Wishlist: Saved Durga Puja Pandals | ${SITE.name}`,
  desc: 'Your saved Kolkata Durga Puja pandals. Turn your wishlist into a metro-friendly pandal hopping route.',
  pathname: '/wishlist', navKey: 'explore', page: 'wishlist', noindex: true,
  body: `<div class="wrap">
  <div class="page-title"><h1>My wishlist</h1><p>Saved on this device only.</p></div>
  ${subnav('wishlist')}
  <div class="btn-row" data-wish-actions hidden style="margin-bottom:14px"><a class="btn btn-primary" href="/planner?wish=1">${icon('route')} Plan a route</a><button class="btn btn-ghost" type="button" data-clear>Clear all</button></div>
  <div class="list" data-list></div>
  <div class="empty" data-empty hidden><h3>No saved pandals yet</h3><p>Tap the heart on any pandal to save it here.</p><a class="btn btn-primary" href="/pandals">Explore pandals</a></div>
  <div class="more-wrap"><button class="btn btn-ghost" type="button" data-more hidden>View more</button></div>
</div>`,
}));

// ================= METRO =================
write('metro/index.html', layout({
  title: `Kolkata Metro Lines & Stations Near Durga Puja Pandals ${SITE.year} | ${SITE.name}`,
  desc: 'Kolkata Metro guide for Durga Puja: Blue, Green, Orange, Yellow and Purple lines, every station with nearby pandals, and an expandable metro route map.',
  pathname: '/metro', navKey: 'metro', page: 'metro',
  jsonld: [crumbs([['Home', '/'], ['Metro', '/metro']])],
  body: `<div class="wrap">
  <div class="page-title"><h1>Metro, with less friction</h1><p>Pick a line, open a station and see which pandals are nearby.</p></div>
  <div class="minimap" data-minimap>
    <button type="button" aria-expanded="false" aria-controls="mm-body" data-mm-toggle>
      <img class="mm-thumb" src="/assets/metro-map-small.webp" alt="" width="64" height="64">
      <span class="mm-text"><b>Metro map preview</b><span>Tap to expand the route map</span></span>
      ${icon('chev', 'icon chev')}
    </button>
    <div class="mm-body" id="mm-body" hidden>
      <img data-mm-img data-src="/assets/metro-map.webp" alt="Kolkata Metro route map showing the Blue, Orange, Green, Yellow and Purple lines with interchanges" width="2000" height="2000">
      <div class="mm-actions"><a class="btn btn-ghost btn-sm" href="/map">${icon('expand')} Full screen map</a><button class="btn btn-ghost btn-sm" type="button" data-mm-close>Collapse</button></div>
    </div>
  </div>
  <div class="line-tabs" role="group" aria-label="Metro line" data-line-tabs>${LINES.map((l) => `<button class="line-tab" type="button" aria-pressed="false" data-line="${l.id}" style="--lc:${l.color};--lt:${l.text}"><span class="dot"></span>${l.name.replace(' Line', '')}</button>`).join('')}</div>
  <div data-line-view></div>
  <div class="notice" style="margin:20px 0"><b>Timings:</b> first and last train times and Puja-special services are announced by Kolkata Metro Railway each year, so they are not listed here. Check the official Metro Railway notice or call the helpline <a href="tel:139"><b>139</b></a> before you travel. Some sections of the Orange, Yellow and Purple lines may be partly under construction — the map shows the planned network.</div>
</div>`,
}));

// ================= MAP =================
write('map/index.html', layout({
  title: `Kolkata Metro Route Map: Blue, Green, Orange, Yellow & Purple Lines | ${SITE.name}`,
  desc: 'Zoomable Kolkata Metro route map with all five lines, interchanges, airport and railway connections. Use it to plan Durga Puja pandal hopping.',
  pathname: '/map', navKey: 'metro', page: 'map',
  jsonld: [crumbs([['Home', '/'], ['Metro', '/metro'], ['Map', '/map']])],
  body: `<div class="wrap">
  <div class="page-title" style="padding-bottom:0"><h1>Metro route map</h1></div>
  <div class="map-tools"><button class="btn btn-ghost" type="button" data-zoom="out" aria-label="Zoom out">${icon('minus')}</button><button class="btn btn-ghost" type="button" data-zoom="in" aria-label="Zoom in">${icon('plus')}</button><button class="btn btn-ghost" type="button" data-zoom="reset">Reset</button><a class="btn btn-ghost" href="/metro" style="margin-left:auto">Stations</a></div>
  <div class="map-view" data-map-view tabindex="0" aria-label="Scrollable metro map"><img data-map-img src="/assets/metro-map.webp" alt="Kolkata Metro route map showing the Blue, Orange, Green, Yellow and Purple lines" width="2000" height="2000"></div>
  <p class="count-note" style="margin-top:8px">Pinch or use the buttons to zoom, drag to move around.</p>
</div>`,
}));

// ================= SUPPORT =================
write('support/index.html', layout({
  title: `Support & Contact | ${SITE.name}`,
  desc: `Contact ${SITE.name} for corrections, new pandal suggestions or feedback about the Kolkata Durga Puja guide.`,
  pathname: '/support', navKey: 'support', page: 'support',
  body: `<div class="wrap">
  <div class="page-title"><h1>Support & Contact</h1><p>Spotted a wrong detail or want a pandal added? Reach out directly.</p></div>
  <div class="contact">
    <a href="mailto:${esc(SITE.email)}">${icon('mail')}<div><b>Email</b><span>${esc(SITE.email)}</span></div></a>
    <a href="${esc(SITE.instagramUrl)}" target="_blank" rel="noopener">${icon('insta')}<div><b>Instagram</b><span>${esc(SITE.instagram)}</span></div></a>
  </div>
  <div class="local-data-card" data-local-card>
    <div class="local-data-head">
      <div>
        <h3>Your Device Storage</h3>
        <p class="muted" style="font-size:14px;margin-top:4px">PujaPath automatically saves your wishlist, custom itineraries and filter settings locally in your browser. All data stays private on your phone or computer.</p>
      </div>
    </div>
    <div class="local-stats">
      <div class="local-stat"><b>Wishlist</b><span data-stat-wish>Loading…</span></div>
      <div class="local-stat"><b>Route Planner</b><span data-stat-plan>Loading…</span></div>
      <div class="local-stat"><b>Recently Viewed</b><span data-stat-recent>Loading…</span></div>
    </div>
    <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap">
      <button type="button" class="btn btn-ghost btn-sm" data-clear-local>${icon('trash')} Clear my local data</button>
    </div>
  </div>
</div>`,
}));

// ================= PANDAL DETAIL PAGES =================
for (const p of PANDALS) {
  const line = ctx.lineByStation.get(p.station);
  const zone = ZONES[p.zone];
  const photo = photos[p.id];
  const same = PANDALS.filter((x) => x.station === p.station && x.id !== p.id).slice(0, 4);
  const descr = `${p.name} (${p.area}, ${zone.label}): Kolkata Durga Puja ${SITE.year}. Nearest metro: ${p.station}${p.walkMin ? ` (about ${p.walkMin} min walk)` : ''}.${p.theme ? ` Theme: ${p.theme}.` : ''} Get directions and nearby pandals.`;
  const ld = [
    crumbs([['Home', '/'], ['Pandals', '/pandals'], [p.name, `/pandal/${p.id}`]]),
    { '@context': 'https://schema.org', '@type': 'TouristAttraction', name: `${p.name} Durga Puja`, description: descr, touristType: 'Durga Puja pandal hopping', url: `${SITE.url}/pandal/${p.id}`, address: { '@type': 'PostalAddress', streetAddress: p.area, addressLocality: 'Kolkata', addressRegion: 'West Bengal', addressCountry: 'IN' }, ...(photo ? { image: SITE.url + photo } : {}), hasMap: placeLink(p) },
  ];
  write(`pandal/${p.id}/index.html`, layout({
    title: `${p.name} Durga Puja ${SITE.year}: Nearest Metro & Directions | ${SITE.name}`,
    desc: descr, pathname: `/pandal/${p.id}`, navKey: 'explore', page: 'pandal', ogType: 'article', jsonld: ld,
    keywords: [p.name, `${p.name} ${SITE.year}`, `${p.name} Durga Puja`, `${p.station} metro`, `${zone.label} pujo`, ...KEYWORDS],
    ogImage: photo || '/og-image.jpg',
    body: `<div class="detail-hero">
  ${photo ? `<img src="${esc(photo)}" alt="${esc(p.name)} Durga Puja pandal" width="1200" height="630">` : `<div class="ph" aria-hidden="true">${icon('lotus', '')}</div>`}
  <a class="back" href="/pandals" aria-label="Back to pandals">${icon('back')}</a>
  <button class="heart" type="button" aria-pressed="false" aria-label="Save ${esc(p.name)} to wishlist" data-heart="${p.id}">${icon('heart', '')}</button>
</div>
<div class="detail-body"><div class="wrap">
  <p class="crumbs"><a href="/">Home</a> / <a href="/pandals">Pandals</a> / ${esc(p.name)}</p>
  <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${p.must ? '<span class="tag gold">Must visit</span>' : ''}${p.bonedi ? '<span class="tag">Bonedi Bari</span>' : ''}<span class="tag sand">${esc(zone.label)}</span></div>
  <h1 style="margin-top:10px">${esc(p.name)}</h1>
  <p class="muted" style="margin-top:6px">${esc(p.area)}, Kolkata</p>
  ${p.theme ? `<div class="panel-card" style="margin-top:16px"><div><span class="label">${SITE.year} theme</span><p style="font-family:var(--font-head);font-size:20px;margin-top:4px">${esc(p.theme)}</p></div></div>` : ''}
  <div class="info">
    <div class="row">${icon('train')}<div><b><span class="dot" style="background:${line.color};margin-right:6px"></span>${esc(p.station)} Metro Station</b><span>${esc(line.name)}${(ctx.linesByStation.get(p.station).length > 1) ? ' · interchange' : ''}</span></div></div>
    <div class="row">${icon('walk')}<div><b>${p.walkMin ? `About ${p.walkMin} min walk` : 'Walking time varies'}</b><span>${p.walkMin ? 'Estimate from the station' : 'Open directions for the live walking time'}</span></div></div>
  </div>
  <div class="btn-row"><a class="btn btn-primary" href="${stationToPandalLink(p)}" target="_blank" rel="noopener">${icon('route')} Directions</a><a class="btn btn-ghost" href="${placeLink(p)}" target="_blank" rel="noopener">${icon('pin')} View on Maps</a></div>
  <a class="btn btn-ghost btn-block" style="margin-top:10px" href="/planner?add=${p.id}">${icon('plus')} Add to my route</a>
  ${same.length ? `<section class="section"><div class="section-head"><h2 style="font-size:22px">Also near ${esc(p.station)}</h2></div><div class="list">${same.map((x) => cardHTML(x, ctx)).join('')}</div></section>` : ''}
</div></div>`,
  }));
}

// ================= PRIVACY =================
write('privacy/index.html', layout({
  title: `Privacy Policy | ${SITE.name}`,
  desc: `Privacy policy for ${SITE.name}. Learn how your device storage and preferences are handled with zero tracking.`,
  pathname: '/privacy', navKey: 'support', page: 'privacy',
  body: `<div class="wrap">
  <div class="page-title"><h1>Privacy Policy</h1><p>Effective Date: October 2026. Your privacy is respected and protected.</p></div>
  <div class="legal-content">
    <section>
      <h2>1. Local Device Storage</h2>
      <p>PujaPath operates on a local-first architecture. Your saved wishlist pandals, custom route planner itineraries, and filter preferences are saved exclusively in your browser's local storage (localStorage). This data remains entirely on your personal device and is never uploaded, tracked, or sold to third parties.</p>
    </section>
    <section>
      <h2>2. No Account or Tracking Required</h2>
      <p>PujaPath does not require account creation, passwords, phone numbers, or social media logins. We do not use third-party marketing trackers, cross-site profiling cookies, or behavioral advertising scripts.</p>
    </section>
    <section>
      <h2>3. Technical Logs</h2>
      <p>When you access our static website, standard hosting server logs may capture technical request metadata (such as IP address, browser type, and requested URL) solely for security, DDoS prevention, and content delivery verification.</p>
    </section>
    <section>
      <h2>4. Managing and Clearing Your Data</h2>
      <p>You can clear your locally saved data at any time either by clearing your browser cache and cookies or by visiting our <a href="/support" style="text-decoration:underline">Support & Contact page</a> and clicking "Clear my local data".</p>
    </section>
    <section>
      <h2>5. Contact Us</h2>
      <p>If you have questions regarding this Privacy Policy, please contact us directly via email at <a href="mailto:${esc(SITE.email)}" style="text-decoration:underline">${esc(SITE.email)}</a> or on Instagram at <a href="${esc(SITE.instagramUrl)}" target="_blank" rel="noopener" style="text-decoration:underline">${esc(SITE.instagram)}</a>.</p>
    </section>
  </div>
</div>`,
}));

// ================= TERMS =================
write('terms/index.html', layout({
  title: `Terms of Service | ${SITE.name}`,
  desc: `Terms of service and community usage guidelines for ${SITE.name} Durga Puja guide and metro planner.`,
  pathname: '/terms', navKey: 'support', page: 'terms',
  body: `<div class="wrap">
  <div class="page-title"><h1>Terms of Service</h1><p>Effective Date: October 2026. Guidelines for using PujaPath.</p></div>
  <div class="legal-content">
    <section>
      <h2>1. Informational & Community Guide</h2>
      <p>PujaPath is a community-driven cultural guide and navigational aid created to help visitors and devotees celebrate Kolkata Durga Puja. Pandal details, themes, nearest metro gates, and walking estimates are compiled from public announcements, committee releases, and verified visitor reports.</p>
    </section>
    <section>
      <h2>2. Transit Schedules & Police Restrictions</h2>
      <p>Kolkata Metro schedules, gate operational hours, and Kolkata Police traffic regulations (such as one-way pedestrian corridors and vehicular diversions) are determined by the respective municipal and transit authorities. Please verify live announcements during festive days.</p>
    </section>
    <section>
      <h2>3. Intellectual Property & Attribution</h2>
      <p>Durga Puja idols, pandal architectures, lighting installations, and committee names are the intellectual and artistic creations of the respective puja committees, artists, and sculptors. PujaPath respects creative heritage and presents information for cultural appreciation.</p>
    </section>
    <section>
      <h2>4. Limitation of Liability</h2>
      <p>PujaPath is provided free of charge on an "as is" and "as available" basis. While we strive for accuracy, PujaPath assumes no liability for unforeseen route changes, transit delays, or temporary pandal closures.</p>
    </section>
    <section>
      <h2>5. Inquiries & Corrections</h2>
      <p>To report an updated timing, correct a metro gate detail, or suggest a pandal addition, please visit our <a href="/support" style="text-decoration:underline">Support page</a> or email <a href="mailto:${esc(SITE.email)}" style="text-decoration:underline">${esc(SITE.email)}</a>.</p>
    </section>
  </div>
</div>`,
}));

// ================= 404, robots, sitemap, favicon, vercel config =================
write('404.html', layout({
  title: `Page not found | ${SITE.name}`, desc: 'This page could not be found.', pathname: '/404', navKey: 'home', page: '404', noindex: true,
  body: `<div class="wrap"><div class="empty" style="margin-top:32px"><h3>Page not found</h3><p>That link doesn’t lead anywhere. Try exploring the pandals instead.</p><a class="btn btn-primary" href="/pandals">Explore pandals</a></div></div>`,
}));

const today = new Date().toISOString().slice(0, 10);
const urls = [['/', 1.0], ['/pandals', 0.9], ['/hopping', 0.8], ['/planner', 0.8], ['/metro', 0.8], ['/map', 0.6], ['/support', 0.3], ['/privacy', 0.3], ['/terms', 0.3], ...PANDALS.map((p) => [`/pandal/${p.id}`, p.must ? 0.7 : 0.5])];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, pr]) => `  <url><loc>${SITE.url}${u}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /wishlist\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#B22222"/><g fill="#D4A017" transform="translate(8 6) scale(.75)"><path d="M32 8c5 8 6 16 0 27-6-11-5-19 0-27zM12 22c9 1 16 6 19 15-9 1-16-3-19-15zM52 22c-3 12-10 16-19 15 3-9 10-14 19-15zM6 38c10-2 18 1 24 8-10 4-19 1-24-8zM58 38c-5 9-14 12-24 8 6-7 14-10 24-8zM32 50c-8 0-15 3-20 8h40c-5-5-12-8-20-8z"/></g></svg>`);
fs.writeFileSync(path.join(ROOT, 'vercel.json'), JSON.stringify({
  buildCommand: 'node build.mjs', outputDirectory: 'public', cleanUrls: true, trailingSlash: false,
  headers: [
    { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/(css|js)/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' }] },
  ],
}, null, 2));

console.log(`Built ${PANDALS.length} pandals → ${urls.length} URLs in public/`);
