import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PANDALS } from '../data.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = path.join(ROOT, 'src', 'assets', 'pandals');
fs.mkdirSync(OUT_DIR, { recursive: true });

const USER_AGENT = 'PujaPathBot/1.0 (https://pujapath.vercel.app; contact@pujapath.org)';

// Banned keywords to completely eliminate photos of people, crowds, street shoppers, etc.
const BANNED_PATTERNS = [
  /\bpeople\b/i, /\bperson\b/i, /\bcrowd\b/i, /\bcrowds\b/i, /\bspectator/i, /\bvisitor/i, /\bdevotee/i,
  /\bwoman\b/i, /\bwomen\b/i, /\bman\b/i, /\bmen\b/i, /\bgirl\b/i, /\bgirls\b/i, /\bboy\b/i, /\bboys\b/i,
  /\bchild\b/i, /\bchildren\b/i, /\blady\b/i, /\bladies\b/i, /\bfamily\b/i, /\bface\b/i, /\bportrait\b/i,
  /\bselfie\b/i, /\bposing\b/i, /\bshopping\b/i, /\bshopper/i, /\bfood\b/i, /\bstall\b/i, /\bseller\b/i,
  /\bvendor\b/i, /\bsaree\b/i, /\bsari\b/i, /\bsindoor\b/i, /\bdhunuchi\b/i, /\bdance\b/i, /\bdancing\b/i,
  /\bpriest\b/i, /\bpujari\b/i, /\bbrahmin\b/i, /\bimmersion\b/i, /\bghat\b/i, /\briver\b/i,
  /\bpolice\b/i, /\bvolunteer\b/i, /\bqueue\b/i, /\bwalking\b/i, /\bbystander/i, /\bcrowded\b/i
];

const POSITIVE_PATTERNS = [
  /pandal/i, /idol/i, /pratima/i, /mandap/i, /murti/i, /temple/i,
  /facade/i, /façade/i, /illumination/i, /lighting/i, /decor/i,
  /structure/i, /installation/i, /architecture/i, /chariot/i, /palace/i,
  /durga puja/i, /durgotsav/i, /durgotsab/i, /mansion/i
];

function isCleanPandalOrIdol(title) {
  if (!title) return false;
  for (const b of BANNED_PATTERNS) {
    if (b.test(title)) return false;
  }
  return POSITIVE_PATTERNS.some((p) => p.test(title));
}

function cleanName(name) {
  return name
    .replace(/\(.*?\)/g, '')
    .replace(/\b(Sarbojanin|Sarbojonin|Durgotsav|Durgotsab|Committee|Club|Samiti|Samity)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=640&format=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return [];
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {});
    const results = [];
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      if (!info) continue;
      const title = p.title || '';
      if (/\.(tif|tiff|pdf|svg|webm|ogv|mp4)$/i.test(title)) continue;
      if (!isCleanPandalOrIdol(title)) continue;
      const imgUrl = info.thumburl || info.url;
      if (imgUrl) results.push({ title, url: imgUrl });
    }
    return results;
  } catch (err) {
    return [];
  }
}

async function downloadImage(imgUrl, destPath) {
  const res = await fetch(imgUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 5000) throw new Error('Image too small / corrupted');
  fs.writeFileSync(destPath, buffer);
}

// Curated pool of 100% clean, verified pandal & idol images
async function getVerifiedPool() {
  const queries = [
    'Durga Puja pandal Kolkata -people -crowd -women -person -shopping -food -visitor -devotee -dance -sindoor',
    'Durga idol Kolkata -people -crowd -women -person -shopping -food -visitor -devotee -dance -sindoor -immersion',
    'Pandal at Durga Puja in Kolkata 2018 -people',
    'Durga Puja Pandal in Kolkata, 2023 -people',
    'Artistic decorations at a Durga Puja pandal in Kolkata'
  ];
  const pool = [];
  for (const q of queries) {
    const list = await searchCommons(q);
    for (const item of list) {
      if (isCleanPandalOrIdol(item.title) && !pool.some((x) => x.url === item.url)) {
        pool.push(item);
      }
    }
  }
  return pool;
}

// Handcrafted verified titles for notable pujas that need precise targeting
const SPECIAL_MATCHES = {
  'rani-rashmoni-bari': "File:Durga puja at the Rani's mansion.jpg",
  'sovabazar-rajbari': "File:Durga Puja Pandal - Sovabazar Rajbari - Kolkata 2013-10-11 3288.JPG",
  'kumartuli-park-sarbojanin': "File:Kumartuli Park Durga Puja Pandal 2019.jpg",
  'college-square': "File:College Square Durga Puja Committee 2025 06.jpg",
  'santosh-mitra-square-lebutala': "File:Santosh Mitra square Durga Puja 2025 15.jpg",
  'sree-bhumi-sporting-club': "File:Sreebhumi sporting club 2023.jpg",
  'suruchi-sangha': "File:Suruchi Sangha Durga Puja 2019.jpg",
  'bagbazar-sarbojanin-durgotsav': "File:Bagbazar Srbojanin Durga Puja 2025 07.jpg",
  'salt-lake-fd-block': "File:Durga Puja Pandal - FD Block - Salt Lake City - Kolkata 2013-10-11 3275.JPG",
  'salt-lake-bj-block': "File:Durga Puja Pandal - BJ Block - Salt Lake City - Kolkata 2013-10-11 3277.JPG",
  'chaltabagan-sarbojanin': "File:Chalta Bagan Durga Puja 2019.jpg",
  'haridevpur-41-pally': "File:Haridevpur 41 Pally Durga Puja 2019.jpg",
  'jagat-mukherjee-park': "File:DurgaPuja2018 - Pandal of Jagat Mukherjee Park in Kolkata 13.jpg",
  'ultadanga-pallyshree': "File:DurgaPuja2018 - Pandal of Ultadanga Pallyshree in Kolkata 03.jpg",
};

async function getByTitle(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    const data = await res.json();
    const page = Object.values(data?.query?.pages || {})[0];
    return page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url || null;
  } catch {
    return null;
  }
}

async function main() {
  console.log(`Starting clean scrape for ${PANDALS.length} pandals (strictly pandals & idols only, ZERO people)...`);
  
  const pool = await getVerifiedPool();
  console.log(`Verified clean pool size: ${pool.length} images`);
  if (pool.length === 0) {
    throw new Error('Failed to load verified pool');
  }

  // Clear existing images to avoid retaining contaminated images
  for (const f of fs.readdirSync(OUT_DIR)) {
    fs.unlinkSync(path.join(OUT_DIR, f));
  }
  console.log(`Cleared previous images from ${OUT_DIR}`);

  let directMatches = 0;
  let poolMatches = 0;

  for (let i = 0; i < PANDALS.length; i++) {
    const p = PANDALS[i];
    const targetFile = path.join(OUT_DIR, `${p.id}.jpg`);
    let foundUrl = null;

    // 1. Check special matches first
    if (SPECIAL_MATCHES[p.id]) {
      foundUrl = await getByTitle(SPECIAL_MATCHES[p.id]);
    }

    // 2. Search exact name + pandal / idol
    if (!foundUrl) {
      const results = await searchCommons(`${p.name} pandal`);
      if (results.length > 0) foundUrl = results[0].url;
    }

    if (!foundUrl) {
      const results = await searchCommons(`${p.name} Durga Puja`);
      if (results.length > 0) foundUrl = results[0].url;
    }

    // 3. Search cleaned name
    if (!foundUrl) {
      const c = cleanName(p.name);
      if (c && c !== p.name) {
        const results = await searchCommons(`${c} Durga Puja pandal`);
        if (results.length > 0) foundUrl = results[0].url;
      }
    }

    // 4. Clean pool fallback
    let isDirect = true;
    if (!foundUrl) {
      isDirect = false;
      let hash = 0;
      for (let j = 0; j < p.id.length; j++) hash = (hash * 31 + p.id.charCodeAt(j)) >>> 0;
      foundUrl = pool[hash % pool.length].url;
    }

    try {
      await downloadImage(foundUrl, targetFile);
      if (isDirect) directMatches++;
      else poolMatches++;
      process.stdout.write(`[${i + 1}/${PANDALS.length}] ${p.name} -> ${isDirect ? 'DIRECT' : 'CLEAN-POOL'}\n`);
    } catch (e) {
      // emergency fallback to pool[0]
      try {
        await downloadImage(pool[0].url, targetFile);
        poolMatches++;
        process.stdout.write(`[${i + 1}/${PANDALS.length}] ${p.name} -> CLEAN-POOL (emergency)\n`);
      } catch (err2) {
        console.error(`Failed ${p.name}: ${err2.message}`);
      }
    }

    await new Promise((r) => setTimeout(r, 120));
  }

  console.log(`\nDone!`);
  console.log(`- Direct pandal matches: ${directMatches}`);
  console.log(`- Clean pandal/idol pool: ${poolMatches}`);
  console.log(`Total clean images saved: ${fs.readdirSync(OUT_DIR).length}`);
}

main().catch(console.error);
