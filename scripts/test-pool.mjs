const USER_AGENT = 'PujaPathBot/1.0';

async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=640&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  const data = await res.json();
  return Object.values(data?.query?.pages || {}).map((p) => p.title);
}

const queries = [
  'Durga Puja pandal Kolkata -people -crowd -women -person -shopping -food -visitor -devotee -dance -sindoor',
  'Durga idol Kolkata -people -crowd -women -person -shopping -food -visitor -devotee -dance -sindoor -immersion',
  'Pandal at Durga Puja in Kolkata 2018 -people',
  'Durga Puja Pandal in Kolkata, 2023 -people',
  'Artistic decorations at a Durga Puja pandal in Kolkata'
];

async function run() {
  for (const q of queries) {
    console.log('QUERY:', q);
    const titles = await searchCommons(q);
    titles.forEach((t) => console.log('  ', t));
  }
}
run();
