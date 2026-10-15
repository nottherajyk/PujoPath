// Static site generator: node build.mjs  →  public/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, LINES, ZONES, PANDALS, PARKING_LOTS, getParkingForPandal } from './data.mjs';
import { esc, enc, icon, makeCtx, cardHTML, placeLink, stationToPandalLink, formatWalkTime } from './src/js/shared.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'public');
const SRC = path.join(ROOT, 'src');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const copyDir = (from, to) => fs.cpSync(from, to, { recursive: true });
copyDir(path.join(SRC, 'css'), path.join(OUT, 'css'));
copyDir(path.join(SRC, 'js'), path.join(OUT, 'js'));
copyDir(path.join(SRC, 'assets'), path.join(OUT, 'assets'));
if (fs.existsSync(path.join(SRC, 'manifest.json'))) {
  fs.copyFileSync(path.join(SRC, 'manifest.json'), path.join(OUT, 'manifest.json'));
}

// ---- photos: drop <pandal-id>.jpg|jpeg|webp|png into src/assets/pandals/ and it is used automatically
const photos = {};
const pdir = path.join(SRC, 'assets', 'pandals');
for (const f of fs.existsSync(pdir) ? fs.readdirSync(pdir) : []) {
  const m = f.match(/^(.+)\.(jpe?g|webp|png)$/i);
  if (m) photos[m[1]] = `/assets/pandals/${f}`;
}

fs.copyFileSync(path.join(SRC, 'assets', 'og-image.jpg'), path.join(OUT, 'og-image.jpg'));
const data = { site: { name: SITE.name, year: SITE.year }, lines: LINES, zones: ZONES, pandals: PANDALS, photos, parking: PARKING_LOTS };
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
<symbol id="i-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></symbol>
<symbol id="i-checklist" viewBox="0 0 24 24"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></symbol>
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
<symbol id="i-car" viewBox="0 0 24 24"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 3c-.1.2-.1.4-.1.6v4.5c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></symbol>
<symbol id="i-parking" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" stroke-width="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-locate" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8" fill="none"/></symbol>
<symbol id="i-lotus" viewBox="0 0 64 64"><path d="M32 8c5 8 6 16 0 27-6-11-5-19 0-27zM12 22c9 1 16 6 19 15-9 1-16-3-19-15zM52 22c-3 12-10 16-19 15 3-9 10-14 19-15zM6 38c10-2 18 1 24 8-10 4-19 1-24-8zM58 38c-5 9-14 12-24 8 6-7 14-10 24-8zM32 50c-8 0-15 3-20 8h40c-5-5-12-8-20-8z"/></symbol>
<symbol id="i-guide" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 2-2 3.5"/><circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol>
<symbol id="i-sparkle" viewBox="0 0 24 24"><path d="m12 3 2.2 5.5L20 11l-5.8 2.5L12 19l-2.2-5.5L4 11l5.8-2.5zM19 18l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></symbol>
<symbol id="i-bolt" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></symbol>
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
  { key: 'checklist', href: '/checklist', label: 'Checklist' },
];

const KEYWORDS = ['PujoPath', 'PujaPath', 'Kolkata Durga Puja 2026', 'Durga Puja pandal hopping Kolkata', 'Kolkata pandal guide', 'Kolkata metro pandal route', 'Durga Puja route planner', 'best pandals in Kolkata 2026', 'North Kolkata pujo', 'South Kolkata pujo', 'Kolkata metro stations near pandals', 'bonedi bari pujo', 'Maddox Square', 'Sree Bhumi', 'Md Ali Park', 'Deshapriya Park'];

const guideModalHTML = `
<div class="guide-modal-wrap" data-guide-modal aria-hidden="true">
  <div class="guide-backdrop" data-guide-dismiss></div>
  <div class="guide-dialog" role="dialog" aria-modal="true" aria-labelledby="guideModalTitle">
    <div class="guide-topbar">
      <div class="guide-step-tag">
        <span class="guide-tag-dot"></span>
        <span data-guide-step-text>Quick Guide · 1 of 4</span>
      </div>
      <button type="button" class="guide-close-btn" data-guide-dismiss aria-label="Close tutorial">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>

    <div class="guide-body">
      <!-- Slide 1: Welcome -->
      <div class="guide-slide is-active" data-guide-slide="0">
        <div class="guide-icon-box guide-icon-lotus">
          <svg viewBox="0 0 64 64" width="44" height="44" fill="#B22222"><path d="M32 8c5 8 6 16 0 27-6-11-5-19 0-27zM12 22c9 1 16 6 19 15-9 1-16-3-19-15zM52 22c-3 12-10 16-19 15 3-9 10-14 19-15zM6 38c10-2 18 1 24 8-10 4-19 1-24-8zM58 38c-5 9-14 12-24 8 6-7 14-10 24-8zM32 50c-8 0-15 3-20 8h40c-5-5-12-8-20-8z"/></svg>
        </div>
        <h2 class="guide-title" id="guideModalTitle">Welcome to PujoPath! <span class="guide-bengali">স্বাগতম</span></h2>
        <p class="guide-desc">Kolkata’s fastest, zero-lag companion for Durga Puja ${SITE.year} pandal hopping.</p>
        <div class="guide-points">
          <div class="guide-point">
            <span class="guide-point-icon">${icon('temple')}</span>
            <div><strong>210+ Verified Pandals</strong><span>North, South, Central, East, Rajarhat & historic Bonedi Baris.</span></div>
          </div>
          <div class="guide-point">
            <span class="guide-point-icon">${icon('sparkle')}</span>
            <div><strong>Themes & Crowd Rush</strong><span>Authentic themes, crowd peak times, entry gates, and nearby parking spots.</span></div>
          </div>
        </div>
      </div>

      <!-- Slide 2: Smart Route Planning & GPS -->
      <div class="guide-slide" data-guide-slide="1">
        <div class="guide-icon-box guide-icon-route">
          <svg viewBox="0 0 24 24" width="38" height="38" stroke="#D4A017" stroke-width="2.2" stroke-linecap="round" fill="none"><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/></svg>
        </div>
        <h2 class="guide-title">Smart Route Planner & GPS</h2>
        <p class="guide-desc">Find pandals between any two places or around where you stand.</p>
        <div class="guide-points">
          <div class="guide-point">
            <span class="guide-point-icon">${icon('pin')}</span>
            <div><strong>Hop Between Any Two Places</strong><span>Type any places like <em>Chinar Park</em>, <em>Gariahat</em>, <em>Howrah</em> — see pandals en route!</span></div>
          </div>
          <div class="guide-point">
            <span class="guide-point-icon">${icon('locate')}</span>
            <div><strong>"Near Me" Live GPS</strong><span>One tap finds the nearest pandals and walking minutes right around you.</span></div>
          </div>
        </div>
      </div>

      <!-- Slide 3: All-Night Metro Timings -->
      <div class="guide-slide" data-guide-slide="2">
        <div class="guide-icon-box guide-icon-metro">
          <svg viewBox="0 0 24 24" width="38" height="38" stroke="#1E88E5" stroke-width="2.2" stroke-linecap="round" fill="none"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l2-4M15 21l-2-4"/><circle cx="9" cy="14" r=".6"/><circle cx="15" cy="14" r=".6"/></svg>
        </div>
        <h2 class="guide-title">All-Night Metro Timetable</h2>
        <p class="guide-desc">Beat festival road congestion with overnight puja metro services.</p>
        <div class="guide-points">
          <div class="guide-point">
            <span class="guide-point-icon">${icon('train')}</span>
            <div><strong>Special Trains Till 4:00 AM</strong><span>Blue (North-South), Green (East-West), Orange & Purple line schedules.</span></div>
          </div>
          <div class="guide-point">
            <span class="guide-point-icon">${icon('walk')}</span>
            <div><strong>Walking Times & Exits</strong><span>Exact walking minutes and nearest metro station gates for every single pandal.</span></div>
          </div>
        </div>
      </div>

      <!-- Slide 4: Checklist & Offline PWA -->
      <div class="guide-slide" data-guide-slide="3">
        <div class="guide-icon-box guide-icon-check">
          <svg viewBox="0 0 24 24" width="38" height="38" stroke="#2E7D32" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <h2 class="guide-title">Checklist · 100% Offline</h2>
        <p class="guide-desc">Track your puja hopping progress with zero mobile network worries in crowds.</p>
        <div class="guide-points">
          <div class="guide-point">
            <span class="guide-point-icon">${icon('checklist')}</span>
            <div><strong>Tick & Track Visited Pandals</strong><span>Tap the checklist icon on any pandal to add to your plan and tick when visited.</span></div>
          </div>
          <div class="guide-point">
            <span class="guide-point-icon">${icon('bolt')}</span>
            <div><strong>Zero Accounts · Instant & Private</strong><span>Everything stays on your device. Fast, private, and works completely offline!</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stepper Dots -->
    <div class="guide-dots-row" role="tablist" aria-label="Tutorial steps">
      <button type="button" class="guide-dot is-active" data-guide-dot="0" aria-label="Step 1"></button>
      <button type="button" class="guide-dot" data-guide-dot="1" aria-label="Step 2"></button>
      <button type="button" class="guide-dot" data-guide-dot="2" aria-label="Step 3"></button>
      <button type="button" class="guide-dot" data-guide-dot="3" aria-label="Step 4"></button>
    </div>

    <!-- Bottom Actions with PROMINENT SKIP BUTTON -->
    <div class="guide-actions">
      <button type="button" class="guide-skip-link" data-guide-dismiss>Skip Tutorial</button>
      <div class="guide-btn-group">
        <button type="button" class="btn btn-ghost guide-btn-prev" data-guide-prev style="display:none">Back</button>
        <button type="button" class="btn btn-primary guide-btn-next" data-guide-next>Next →</button>
      </div>
    </div>
  </div>
</div>`;

function layout({ title, desc, pathname, navKey, subKey, body, jsonld = [], page, ogImage = '/og-image.jpg', noindex = false, keywords = KEYWORDS, bodyClass = '', ogType = 'website' }) {
  const url = SITE.url + pathname;
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
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
<link rel="apple-touch-icon" href="/favicon.svg">
<link rel="manifest" href="/manifest.json">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="PujoPath">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Poppins:wght@400;500;600;700&display=swap">
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
  <a class="brand" href="/" aria-label="${SITE.name} home">${icon('lotus', 'lotus')}<span>Pujo<b>Path</b></span></a>
  <nav class="top-links" aria-label="Primary">${NAV.map((n) => `<a href="${n.href}"${n.key === navKey ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}</nav>
  <div class="head-actions">
    <button type="button" class="head-btn head-guide" data-open-guide aria-label="App Guide" title="How to use PujoPath">${icon('guide')}</button>
    <a class="head-btn head-check" href="/checklist" aria-label="Pandal Checklist" title="My Pandal Checklist">${icon('checklist')}<span class="badge badge-check" data-check-count data-count="0">0</span></a>
  </div>
</div></header>
<main id="main">
${body}
</main>
<footer class="site-footer"><div class="wrap">
  <div class="footer-compact">
    <div class="footer-top">
      <a class="brand" href="/" aria-label="${SITE.name} home">${icon('lotus', 'lotus')}<span>Pujo<b>Path</b></span></a>
      <p class="footer-tagline">Kolkata’s Durga Puja ${SITE.year} guide & metro route planner.</p>
    </div>
    <nav class="footer-nav" aria-label="Footer quick links">
      <a href="/pandals">Pandals</a>
      <a href="/hopping">Zones</a>
      <a href="/planner">Planner</a>
      <a href="/checklist">Checklist</a>
      <a href="/metro">Metro</a>
      <a href="/parking">Parking</a>
      <a href="/map">Map</a>
      <button type="button" class="footer-btn-link" data-open-guide>App Guide</button>
      <a href="/support">Support</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </nav>
    <div class="footer-bottom">
      <p>© ${SITE.year} ${SITE.name} · Local device storage, zero ad tracking.</p>
    </div>
  </div>
</div></footer>
<nav class="bottom-nav" aria-label="Primary mobile">${NAV.map((n) => `<a href="${n.href}"${n.key === navKey ? ' aria-current="page"' : ''}>${icon(n.icon)}<span>${n.label}</span></a>`).join('')}</nav>
<div class="toast" role="status" aria-live="polite" data-toast></div>
${guideModalHTML}
<script type="module" src="/js/app.js"></script>
</body>
</html>`;
}

const subnav = (active) => `<nav class="subnav" aria-label="Explore sections">${SUB.map((s) => `<a class="subnav-item subnav-${s.key}" href="${s.href}"${s.key === active ? ' aria-current="page"' : ''}>${s.label}${s.key === 'checklist' ? `<span class="badge badge-check" data-check-count data-count="0">0</span>` : ''}</a>`).join('')}</nav>`;

const total = PANDALS.length;
const musts = PANDALS.filter((p) => p.must);
const ICONIC_IDS = [
  'tridhara-sammilani',
  'sree-bhumi-sporting-club',
  'santosh-mitra-square-lebutala',
  'bagbazar-sarbojanin-durgotsav',
  'ahiritola-sarbojanin-durgotsav',
  'college-square',
  'suruchi-sangha',
  'chetla-agrani-club',
  'ballygunge-cultural-association',
  'mudiali-club',
];
const iconicPandals = ICONIC_IDS.map((id) => PANDALS.find((p) => p.id === id)).filter(Boolean);
const zoneCount = (k) => PANDALS.filter((p) => (k === 'bonedi' ? p.bonedi : p.zone === k)).length;
const zoneImg = { north: '/assets/photo-reflection.webp', south: '/assets/photo-gold.webp', central: '/assets/hero.webp', east: '/assets/photo-gold.webp', bonedi: '/assets/photo-reflection.webp' };
const zoneCard = (k) => `<a class="zone" href="/hopping?zone=${k}"><img src="${zoneImg[k]}" alt="" loading="lazy" decoding="async" width="600" height="400"><div><b>${esc(ZONES[k].title)}</b><span>${zoneCount(k)} pandals · ${esc(ZONES[k].hub)}</span><span>${esc(ZONES[k].lines)}</span><p class="go">Start hopping →</p></div></a>`;

const org = { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url, inLanguage: 'en-IN', potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/pandals?q={search_term_string}`, 'query-input': 'required name=search_term_string' } };
const crumbs = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE.url + p })) });

// ================= HOME =================
write('index.html', layout({
  title: `${SITE.name}: Hop More. Miss Less. | Kolkata Durga Puja ${SITE.year} Route Planner`,
  desc: `Explore ${total}+ Kolkata Durga Puja ${SITE.year} pandals, find the nearest metro station, plan a pandal-hopping route by zone or metro line and save your favourites.`,
  pathname: '/', navKey: 'home', page: 'home', jsonld: [org],
  body: `
<div class="home-loader" id="homeLoader" aria-hidden="true">
  <div class="home-loader-inner">
    <div class="home-loader-icon">
      ${icon('lotus', 'lotus')}
      <div class="loader-pulse"></div>
    </div>
    <div class="home-loader-brand">Pujo<b>Path</b></div>
    <p class="home-loader-text">Loading Kolkata’s Durga Puja guide…</p>
    <div class="home-loader-bar"><div class="home-loader-fill"></div></div>
  </div>
</div>
<section class="hero">
  <img class="hero-img" src="/assets/hero-night.webp" alt="Illuminated Durga Puja pandal at night with a golden idol and red banners, crowds filming" width="1672" height="941" fetchpriority="high">
  <div class="wrap">
    <div class="hero-content">
      <button type="button" class="hero-guide-badge" data-open-guide aria-label="First time here? Take a quick app tour">
        ${icon('guide')} First time here? Quick Guide <span>&rarr;</span>
      </button>
      <h1>Hop More. <em>Miss Less.</em></h1>
      <p class="lead">Your pandal-hopping plan, sorted. Discover the must-sees, map your route, and fit more Pujo into every night.</p>
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
        <a href="/checklist">${icon('checklist')}<b>Create Checklist</b><span>Track your hops</span></a>
      </div>
    </div>
  </div>
  <div class="hero-bottom-cue">
    <a class="scroll-down-btn" href="#spotlight" aria-label="Scroll down to explore pandals, zones, and itineraries" title="Scroll down">
      <span class="scroll-cue-icon" aria-hidden="true">${icon('chev')}</span>
    </a>
  </div>
</section>
<div class="home-sheet" id="spotlight">
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
      <div class="h-scroll" data-iconic>${iconicPandals.map((p) => cardHTML(p, ctx, { hideTheme: true })).join('')}</div>
    </section>
    <section class="section" aria-labelledby="zones">
      <div class="section-head"><div><span class="kicker">Pandal hopping</span><h2 id="zones">Explore by zone</h2></div></div>
      <p class="muted" style="margin:-6px 0 16px">Metro circuits with walking directions between pandals.</p>
      <div class="zones">${['north', 'south', 'central', 'east', 'bonedi'].map(zoneCard).join('')}</div>
    </section>
    <section class="section section-metro-promo" aria-labelledby="why">
      <div class="metro-promo-card">
        <div class="metro-promo-info">
          <span class="kicker" style="color:var(--gold)">Smart Metro Transit</span>
          <h2 id="why">Pandal hopping, the metro way</h2>
          <p class="muted">Verified station walk times, route planning, and easy multi-stop Google Maps directions across Kolkata’s metro lines.</p>
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
  <div class="page-title"><h1>Kolkata Pandals ${SITE.year}</h1><p>${total} pandals with their nearest metro station. Tap the checklist icon to plan & track your visits.</p></div>
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
  <div class="result-bar" style="justify-content:flex-end"><button type="button" data-reset hidden>Clear filters</button></div>
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
const stationDatalist = LINES.flatMap((l) => l.stations.map((s) => [s, l]))
  .filter(([s], i, a) => a.findIndex(([x]) => x === s) === i)
  .map(([s, l]) => `<option value="${esc(s)}">${esc(s)} (${l.name.replace(' Line', '')} Line)</option>`).join('');
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
      <div class="field" data-opt="zone"><label for="p-zone">Zone</label><select class="select" id="p-zone">${['north', 'south', 'central', 'east', 'bonedi'].map((k) => `<option value="${k}">${ZONES[k].title}</option>`).join('')}</select></div>
      <div class="field" data-opt="line" hidden><label for="p-line">Metro line</label><select class="select" id="p-line">${LINES.map((l) => `<option value="${l.id}">${l.name} (${l.short})</option>`).join('')}</select></div>
    </div>
    <div class="two">
      <div class="field station-search-field">
        <label for="p-start"><span data-start-label>Start from station or place</span></label>
        <div class="station-search-box">
          <input class="input" id="p-start" type="search" placeholder="e.g. Shyambazar, Chinar Park, or any place" autocomplete="off" value="Shyambazar" enterkeyhint="done" style="padding-left:38px;padding-right:38px">
          ${icon('search', 'icon icon-l')}
          <button type="button" class="station-locate-btn" data-start-locate title="Use my current GPS location" aria-label="Use my current GPS location">${icon('locate')}</button>
          <div class="station-suggestions" data-start-suggestions hidden></div>
        </div>
        <span class="muted" data-start-hint style="font-size:11.5px;margin-top:3px;display:block">Nearest metro station or area to begin hopping</span>
      </div>
      <div class="field station-search-field">
        <label for="p-end"><span data-end-label>End at station or place</span> <span class="muted" style="font-weight:400;font-size:12px">(Optional)</span></label>
        <div class="station-search-box">
          <input class="input" id="p-end" type="search" placeholder="e.g. Kalighat, City Centre 2, or leave empty" autocomplete="off" value="" enterkeyhint="done" style="padding-left:38px">
          ${icon('search', 'icon icon-l')}
          <div class="station-suggestions" data-end-suggestions hidden></div>
        </div>
        <span class="muted" data-end-hint style="font-size:11.5px;margin-top:3px;display:block">Where you want to end your hopping</span>
      </div>
    </div>
    <div class="route-quick-chips">
      <button type="button" class="chip-action-btn" data-near-me>${icon('locate')} <span>Find pandals near my location</span></button>
      <button type="button" class="chip-action-btn" data-swap-endpoints title="Swap start and finish places">${icon('route')} <span>Swap Start & End</span></button>
    </div>
    <div class="enroute-box" data-enroute-box hidden>
      <div class="enroute-header">
        <span class="enroute-icon">${icon('sparkle')}</span>
        <div class="enroute-info">
          <b data-enroute-title>Pandals on your way</b>
          <span class="muted" data-enroute-subtitle>Directly between start and end</span>
        </div>
        <button type="button" class="btn btn-sm btn-ghost" data-enroute-toggle-all>Select all</button>
      </div>
      <div class="enroute-chips" data-enroute-chips></div>
    </div>
    <div data-opt="custom" hidden class="field">
      <label for="p-search" data-custom-label>Choose pandals</label>
      <span class="muted" data-custom-hint style="font-size:12px;margin:-4px 0 8px;display:none"></span>
      <input class="input" id="p-search" type="search" placeholder="Search to add pandals" autocomplete="off">
      <div class="extra-picked-wrap" data-extra-wrap hidden>
        <div class="extra-picked-title">${icon('pin')} <span>Extra stops added</span></div>
        <div class="extra-chips" data-extra-chips></div>
      </div>
      <div class="picker-results" data-picker></div>
      <p class="count-note" data-picked-note></p>
      <button type="button" class="btn btn-ghost btn-sm" data-use-checklist>${icon('checklist')} Use my checklist</button>
    </div>
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

// ================= WISHLIST (REDIRECT TO CHECKLIST) =================
write('wishlist/index.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=/checklist">
<link rel="canonical" href="${SITE.url}/checklist">
<title>Redirecting to Checklist | ${SITE.name}</title>
<script>location.replace('/checklist');</script>
</head>
<body><p>Redirecting to <a href="/checklist">Pandal Checklist</a>...</p></body>
</html>`);

// ================= CHECKLIST (VISITED TRACKER) =================
write('checklist/index.html', layout({
  title: `Pandal Checklist: Visited & Remaining Pandals | ${SITE.name}`,
  desc: 'Track which Kolkata Durga Puja pandals you have already visited and see what is left to hop. Offline, private, on your device.',
  pathname: '/checklist', navKey: 'explore', page: 'checklist', noindex: true,
  body: `<div class="wrap">
  <div class="page-title">
    <h1>Pandal Checklist</h1>
    <p>Build your personalized pandal hopping checklist and track what you've visited.</p>
  </div>
  ${subnav('checklist')}

  <div class="tracker-summary" data-tracker-card>
    <div class="tracker-stats">
      <div class="stat-box stat-visited">
        <span class="stat-num" data-stat-visited>0</span>
        <span class="stat-label">Visited</span>
      </div>
      <div class="stat-divider">/</div>
      <div class="stat-box stat-total">
        <span class="stat-num" data-stat-total>0</span>
        <span class="stat-label">In Checklist</span>
      </div>
      <div class="stat-divider">·</div>
      <div class="stat-box stat-left">
        <span class="stat-num" data-stat-left>0</span>
        <span class="stat-label">Left</span>
      </div>
    </div>
    <div class="tracker-progress-track">
      <div class="tracker-progress-fill" data-progress-bar style="width: 0%"></div>
    </div>
    <div class="tracker-progress-text" data-progress-text>0 pandals in your checklist · Add pandals to begin!</div>
  </div>

  <div class="check-actions-bar" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:16px">
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button type="button" class="btn btn-primary btn-sm" data-toggle-add-panel aria-expanded="false">${icon('plus')} Add Pandals</button>
      <a href="/planner" class="btn btn-ghost btn-sm" data-plan-checklist>${icon('route')} Plan route for checklist</a>
    </div>
    <button type="button" class="btn btn-ghost btn-sm" data-clear-check title="Reset checklist">${icon('trash')} Clear</button>
  </div>

  <div class="checklist-add-panel" data-add-panel hidden>
    <div class="panel-card" style="margin-top:14px;padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h3 style="font-size:16px;margin:0">Add Pandals to Your Checklist</h3>
        <button type="button" class="btn btn-primary btn-sm" data-close-add-panel>${icon('check')} Done Adding</button>
      </div>
      <div class="search" style="margin:0 0 10px">
        <span class="icon-l">${icon('search')}</span>
        <input type="search" placeholder="Search pandal, area, or metro station…" data-add-search autocomplete="off">
      </div>
      <div class="chips" style="margin-bottom:12px;overflow-x:auto;padding-bottom:4px">
        <button type="button" class="chip" data-quick-add="iconic">⭐ + Top 10 Iconic</button>
        <button type="button" class="chip" data-quick-add="north">+ North Heritage</button>
        <button type="button" class="chip" data-quick-add="south">+ South Highlights</button>
        <button type="button" class="chip" data-quick-add="central">+ Central Heritage</button>
        <button type="button" class="chip" data-quick-add="east">+ East & Salt Lake</button>
        <button type="button" class="chip" data-quick-add="bonedi">+ Bonedi Bari</button>
      </div>
      <div class="add-picker-results" data-add-picker-results style="max-height:280px;overflow-y:auto;display:grid;gap:8px"></div>
      <div class="add-panel-footer" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">
        <button type="button" class="btn btn-primary btn-block" data-close-add-panel-bottom>${icon('check')} Done Adding Pandals</button>
      </div>
    </div>
  </div>

  <div class="check-controls" data-check-controls>
    <div class="tabs check-tabs" role="tablist">
      <button class="tab" type="button" role="tab" aria-selected="true" data-tab="left">Left to Visit (<span data-count-tab-left>0</span>)</button>
      <button class="tab" type="button" role="tab" aria-selected="false" data-tab="visited">Visited (<span data-count-tab-visited>0</span>)</button>
      <button class="tab" type="button" role="tab" aria-selected="false" data-tab="all">All (<span data-count-tab-all>0</span>)</button>
    </div>

    <div class="check-filter-row" data-check-filter-row>
      <div class="search check-search">
        <span class="icon-l">${icon('search')}</span>
        <input type="search" placeholder="Filter your checklist…" data-check-search aria-label="Filter pandals in checklist">
      </div>
    </div>
  </div>

  <div class="list check-list" data-check-list style="margin-top:var(--s4)"></div>

  <div class="empty" data-check-empty hidden>
    <div class="empty-icon" style="margin:0 auto 12px;width:52px;height:52px;border-radius:50%;background:rgba(212,160,23,0.15);color:var(--sindoor);display:grid;place-items:center">${icon('checklist')}</div>
    <h3 data-empty-title>Your checklist is empty</h3>
    <p data-empty-msg>Add the pandals you plan to visit this Durga Puja, then mark them off as you hop!</p>
    <div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button type="button" class="btn btn-primary" data-empty-add-iconic>⭐ Add Kolkata Top 10</button>
      <button type="button" class="btn btn-ghost" data-empty-open-search>Browse & Add</button>
    </div>
  </div>

  <div class="more-wrap"><button class="btn btn-ghost" type="button" data-check-more hidden>View more</button></div>
</div>`,
}));

const initialLine = LINES[0];
const initialItems = initialLine.stations.map((s) => {
  const ps = PANDALS.filter((p) => p.station === s);
  const inter = (ctx.linesByStation.get(s) || []).filter((x) => x.id !== initialLine.id);
  return `<li class="stn"><button class="stn-head" type="button" aria-expanded="false" data-stn="${esc(s)}">
      <span class="name">${esc(s)}${inter.length ? `<span class="interchange">${inter.map((x) => x.name.replace(' Line', '')).join(' · ')}</span>` : ''}<span class="sub">${ps.length ? `${ps.length} pandal${ps.length > 1 ? 's' : ''} nearby` : 'No pandals listed yet'}</span></span>${icon('chev', 'icon chev')}</button>
    <div class="panel" hidden></div></li>`;
}).join('');
const initialSched = initialLine.schedule?.length ? `<div class="metro-schedule-card">
  <div class="metro-sched-head">
    <span class="sched-icon" style="background:${initialLine.color}22;color:${initialLine.color}">${icon('clock')}</span>
    <div>
      <b>${esc(initialLine.name)} · Special Puja Schedule</b>
      <span class="sched-sub">Official Kolkata Metro Puja Timings (Oct 15–21, 2026)</span>
    </div>
  </div>
  <div class="metro-sched-list">
    ${initialLine.schedule.map((s) => `
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
const initialLineHTML = `<div class="line-banner" style="--lc:${initialLine.color};--lt:${initialLine.text}"><div><b>${initialLine.name}</b><span>${esc(initialLine.stations[0])} ↔ ${esc(initialLine.stations.at(-1))} · ${initialLine.stations.length} stations</span></div></div>${initialSched}<ol class="stations" style="--lc:${initialLine.color}">${initialItems}</ol>`;

write('metro/index.html', layout({
  title: `Kolkata Metro Lines & Stations Near Durga Puja Pandals ${SITE.year} | ${SITE.name}`,
  desc: 'Kolkata Metro guide for Durga Puja: Blue, Green, Orange, Yellow and Purple lines, special Puja overnight timings, every station with nearby pandals, and an expandable metro route map.',
  pathname: '/metro', navKey: 'metro', page: 'metro',
  jsonld: [crumbs([['Home', '/'], ['Metro', '/metro']])],
  body: `<div class="wrap">
  <div class="page-title"><h1>Metro, with less friction</h1><p>Pick a line, view the special Puja schedule, and tap any station to see nearby pandals.</p></div>
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
  <div class="line-tabs" role="group" aria-label="Metro line" data-line-tabs>${LINES.map((l, i) => `<button class="line-tab" type="button" aria-pressed="${i === 0 ? 'true' : 'false'}" data-line="${l.id}" style="--lc:${l.color};--lt:${l.text}"><span class="dot"></span>${l.name.replace(' Line', '')}</button>`).join('')}</div>
  <div data-line-view>${initialLineHTML}</div>
  <div class="notice" style="margin:20px 0"><b>Official Helpline & Travel Guidance:</b> Special overnight and festive services operate throughout Kolkata Durga Puja (Oct 15–21, 2026). Metro services on the Blue and Green lines run overnight continuously till ~4:00 AM on Saptami, Ashtami and Navami. For live train status or emergency inquiries, call Kolkata Metro Railway Helpline at <a href="tel:139"><b>139</b></a>. Please verify interchange gate restrictions during peak festive hours.</div>
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

// ================= PARKING =================
write('parking/index.html', layout({
  title: `Kolkata Durga Puja ${SITE.year} Parking Lots: Car & Bike Parking Near Pandals | ${SITE.name}`,
  desc: `Find verified car and two-wheeler parking spaces within 2km radius of Kolkata Durga Puja pandals. Direct Google Maps navigation links for ${PARKING_LOTS.length} shortlisted parking spots across North, South, Central & East Kolkata.`,
  pathname: '/parking', navKey: 'explore', page: 'parking',
  jsonld: [crumbs([['Home', '/'], ['Parking', '/parking']])],
  body: `<div class="wrap">
  <div class="page-title">
    <h1>Durga Puja Parking Guide ${SITE.year}</h1>
    <p>Shortlisted parking spaces under 2 km radius for visitors travelling via cars and two-wheelers. Tap "Open Location" for direct Google Maps navigation.</p>
  </div>
  <div class="filters" style="margin-top:14px">
    <div class="search-lite">${icon('search')}<label class="sr-only" for="pq">Search parking</label><input class="input" id="pq" type="search" placeholder="Search by parking lot, area or pandal…" autocomplete="off" data-parking-search></div>
    <div class="chips" role="group" aria-label="Filter parking by zone" style="margin-top:10px" data-parking-chips>
      <button class="chip" type="button" aria-pressed="true" data-zone="">All (${PARKING_LOTS.length})</button>
      <button class="chip" type="button" aria-pressed="false" data-zone="north">North (${PARKING_LOTS.filter((l) => l.zone === 'north').length})</button>
      <button class="chip" type="button" aria-pressed="false" data-zone="south">South (${PARKING_LOTS.filter((l) => l.zone === 'south').length})</button>
      <button class="chip" type="button" aria-pressed="false" data-zone="central">Central (${PARKING_LOTS.filter((l) => l.zone === 'central').length})</button>
      <button class="chip" type="button" aria-pressed="false" data-zone="east">East &amp; Salt Lake (${PARKING_LOTS.filter((l) => l.zone === 'east').length})</button>
    </div>
  </div>
  <div class="parking-grid" data-parking-grid>
    ${PARKING_LOTS.map((lot) => `
      <article class="parking-dir-card" data-zone="${lot.zone}" data-name="${esc(lot.name.toLowerCase())}" data-serves="${esc(lot.serves.toLowerCase())}" data-address="${esc(lot.address.toLowerCase())}">
        <div>
          <div class="parking-card-head" style="border-bottom:none;margin-bottom:8px;padding-bottom:0">
            <span class="parking-dir-badge">${lot.zone.toUpperCase()} KOLKATA</span>
            <span class="parking-radius-tag">&lt; 2 km radius</span>
          </div>
          <div class="parking-item-main" style="margin-top:6px">
            <div class="parking-lot-icon" aria-hidden="true">${icon('parking')}</div>
            <div class="parking-info">
              <h2 class="parking-lot-name" style="font-size:16px">${esc(lot.name)}</h2>
              <p class="parking-address">${esc(lot.address)}</p>
            </div>
          </div>
          <div class="parking-serves" style="margin-top:12px;background:rgba(250,248,245,0.7);padding:8px 10px;border-radius:8px;border:1px solid rgba(230,217,198,0.5)">
            <b>Pandals &amp; Areas Served:</b>
            <p style="margin:2px 0 0;color:var(--navy);font-size:12.5px">${esc(lot.serves)}</p>
          </div>
        </div>
        <div style="margin-top:14px">
          <a class="btn btn-parking btn-block" href="${esc(lot.mapUrl)}" target="_blank" rel="noopener">
            ${icon('pin')} Open Location in Maps
          </a>
        </div>
      </article>
    `).join('')}
  </div>
  <div class="notice" style="margin:28px 0 20px">
    <b>Kolkata Police Traffic Advisory:</b> During peak festive hours (Panchami through Dashami, 4:00 PM to 4:00 AM), arterial roads like VIP Road, Rashbehari Avenue, and Central Avenue may implement one-way traffic regulations. Park only in authorized or designated lots and note down your parking spot location before walking to pandals.
  </div>
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
        <p class="muted" style="font-size:14px;margin-top:4px">PujoPath automatically saves your checklist, custom itineraries and filter settings locally in your browser. All data stays private on your phone or computer.</p>
      </div>
    </div>
    <div class="local-stats">
      <div class="local-stat"><b>Checklist</b><span data-stat-check>Loading…</span></div>
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
  const walkMeta = p.walkMin ? ` (about ${formatWalkTime(p.walkMin)})` : '';
  const descr = `${p.name} (${p.area}, ${zone.label}): Kolkata Durga Puja ${SITE.year}. Nearest metro: ${p.station}${walkMeta}.${p.theme ? ` Theme: ${p.theme}.` : ''} Get directions and nearby pandals.`;
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
  ${photo ? `<img src="${esc(photo)}" alt="${esc(p.name)} Durga Puja pandal" decoding="async" width="1200" height="630">` : `<div class="ph" aria-hidden="true">${icon('lotus', '')}</div>`}
  <a class="back" href="/pandals" aria-label="Back to pandals">${icon('back')}</a>
  <button class="card-check-toggle" type="button" aria-pressed="false" aria-label="Add ${esc(p.name)} to checklist" title="Add to checklist" data-checklist-toggle="${p.id}">${icon('checklist')}</button>
</div>
<div class="detail-body"><div class="wrap">
  <p class="crumbs"><a href="/">Home</a> / <a href="/pandals">Pandals</a> / ${esc(p.name)}</p>
  <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${p.must ? '<span class="tag gold">Must visit</span>' : ''}${p.bonedi ? '<span class="tag">Bonedi Bari</span>' : ''}<span class="tag sand">${esc(zone.label)}</span></div>
  <h1 style="margin-top:10px">${esc(p.name)}</h1>
  <p class="muted" style="margin-top:6px">${esc(p.area)}, Kolkata</p>
  <div style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
    <button class="btn btn-sm btn-check-action" type="button" data-check-toggle="${p.id}" aria-pressed="false">${icon('check')}<span class="check-label">Mark as Visited</span></button>
    <button class="btn btn-sm btn-add-checklist" type="button" data-checklist-toggle="${p.id}" aria-pressed="false">${icon('checklist')}<span class="checklist-btn-label">Add to Checklist</span></button>
  </div>
  ${p.theme ? `<div class="panel-card" style="margin-top:16px"><div><span class="label">${SITE.year} theme</span><p style="font-family:var(--font-head);font-size:20px;margin-top:4px">${esc(p.theme)}</p></div></div>` : ''}
  <div class="info">
    <div class="row">${icon('train')}<div><b><span class="dot" style="background:${line.color};margin-right:6px"></span>${esc(p.station)} Metro Station</b><span>${esc(line.name)}${(ctx.linesByStation.get(p.station).length > 1) ? ' · interchange' : ''}</span></div></div>
    <div class="row">${icon('walk')}<div><b>${p.walkMin ? `About ${formatWalkTime(p.walkMin)}` : 'Walking time varies'}</b><span>${p.walkMin ? (p.walkMin > 25 ? 'Estimate from the station · Auto/transit recommended' : 'Estimate from the station') : 'Open directions for the live walking time'}</span></div></div>
  </div>
  <div class="btn-row"><a class="btn btn-primary" href="${stationToPandalLink(p)}" target="_blank" rel="noopener">${icon('route')} Directions</a><a class="btn btn-ghost" href="${placeLink(p)}" target="_blank" rel="noopener">${icon('pin')} View on Maps</a></div>
  <button class="btn btn-ghost btn-block btn-detail-check-toggle" type="button" data-checklist-toggle="${p.id}" aria-pressed="false" style="margin-top:10px">${icon('checklist')}<span class="checklist-btn-label">Add to my checklist</span></button>
  <a class="btn btn-ghost btn-block" style="margin-top:10px" href="/planner?add=${p.id}">${icon('plus')} Add to my route</a>

  <section class="parking-section" aria-labelledby="parking-head-${p.id}">
    <div class="parking-panel">
      <div class="parking-card-head">
        <div class="parking-title-group">
          <span class="parking-badge-icon" aria-hidden="true">${icon('car')}</span>
          <div>
            <h2 id="parking-head-${p.id}" class="parking-title">Nearby Parking (Cars &amp; Bikes)</h2>
            <span class="parking-subtitle">Shortlisted spots under 2 km radius for road travelers</span>
          </div>
        </div>
        <span class="parking-radius-tag">&lt; 2 km radius</span>
      </div>
      <div class="parking-items">
        ${getParkingForPandal(p).map((lot) => `
          <div class="parking-item">
            <div class="parking-item-main">
              <div class="parking-lot-icon" aria-hidden="true">${icon('parking')}</div>
              <div class="parking-info">
                <b class="parking-lot-name">${esc(lot.name)}</b>
                <p class="parking-address">${esc(lot.address)}</p>
                <span class="parking-serves"><b>Serves:</b> ${esc(lot.serves)}</span>
              </div>
            </div>
            <a class="btn btn-parking" href="${esc(lot.mapUrl)}" target="_blank" rel="noopener">
              ${icon('pin')} Open Location
            </a>
          </div>
        `).join('')}
      </div>
      <div class="parking-footer-links">
        <a class="parking-dir-link" href="/parking">${icon('car')} View all ${PARKING_LOTS.length} Kolkata Pujo parking lots →</a>
      </div>
    </div>
  </section>
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
      <p>PujoPath operates on a local-first architecture. Your saved pandal checklist, custom route planner itineraries, and filter preferences are saved exclusively in your browser's local storage (localStorage). This data remains entirely on your personal device and is never uploaded, tracked, or sold to third parties.</p>
    </section>
    <section>
      <h2>2. No Account or Tracking Required</h2>
      <p>PujoPath does not require account creation, passwords, phone numbers, or social media logins. We do not use third-party marketing trackers, cross-site profiling cookies, or behavioral advertising scripts.</p>
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
  <div class="page-title"><h1>Terms of Service</h1><p>Effective Date: October 2026. Guidelines for using PujoPath.</p></div>
  <div class="legal-content">
    <section>
      <h2>1. Informational & Community Guide</h2>
      <p>PujoPath is a community-driven cultural guide and navigational aid created to help visitors and devotees celebrate Kolkata Durga Puja. Pandal details, themes, nearest metro gates, and walking estimates are compiled from public announcements, committee releases, and verified visitor reports.</p>
    </section>
    <section>
      <h2>2. Transit Schedules & Police Restrictions</h2>
      <p>Kolkata Metro schedules, gate operational hours, and Kolkata Police traffic regulations (such as one-way pedestrian corridors and vehicular diversions) are determined by the respective municipal and transit authorities. Please verify live announcements during festive days.</p>
    </section>
    <section>
      <h2>3. Intellectual Property & Attribution</h2>
      <p>Durga Puja idols, pandal architectures, lighting installations, and committee names are the intellectual and artistic creations of the respective puja committees, artists, and sculptors. PujoPath respects creative heritage and presents information for cultural appreciation.</p>
    </section>
    <section>
      <h2>4. Limitation of Liability</h2>
      <p>PujoPath is provided free of charge on an "as is" and "as available" basis. While we strive for accuracy, PujoPath assumes no liability for unforeseen route changes, transit delays, or temporary pandal closures.</p>
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
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /checklist\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#B22222"/><g fill="#D4A017" transform="translate(8 6) scale(.75)"><path d="M32 8c5 8 6 16 0 27-6-11-5-19 0-27zM12 22c9 1 16 6 19 15-9 1-16-3-19-15zM52 22c-3 12-10 16-19 15 3-9 10-14 19-15zM6 38c10-2 18 1 24 8-10 4-19 1-24-8zM58 38c-5 9-14 12-24 8 6-7 14-10 24-8zM32 50c-8 0-15 3-20 8h40c-5-5-12-8-20-8z"/></g></svg>`);
fs.writeFileSync(path.join(ROOT, 'vercel.json'), JSON.stringify({
  buildCommand: 'node build.mjs', outputDirectory: 'public', cleanUrls: true, trailingSlash: false,
  headers: [
    { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/(css|js)/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' }] },
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; frame-ancestors 'none'; form-action 'self';" }
      ]
    }
  ],
}, null, 2) + '\n');

console.log(`Built ${PANDALS.length} pandals → ${urls.length} URLs in public/`);
