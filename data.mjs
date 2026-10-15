// PujoPath data + site config. Edit this file, then run `node build.mjs`.

export const SITE = {
  name: 'PujoPath',
  tagline: 'Explore · Plan · Pandal Hop',
  url: 'https://pujo-path.vercel.app',
  email: 'rajgupta.yk@gmail.com',
  instagram: '@nottherajyk',
  instagramUrl: 'https://instagram.com/nottherajyk',
  year: 2026,
};

// Metro lines. Colours follow the route map; station order is top-to-bottom / west-to-east on the map.
export const LINES = [
  {
    id: 'blue',
    name: 'Blue Line',
    short: 'North-South',
    route: 'Dakshineswar – Kavi Subhash',
    color: '#1E88E5',
    text: '#fff',
    stations: ['Dakshineswar','Baranagar','Noapara','Dum Dum','Belgachia','Shyambazar','Shobhabazar Sutanuti','Girish Park','Mahatma Gandhi Road','Central','Chandni Chowk','Esplanade','Park Street','Maidan','Rabindra Sadan','Netaji Bhavan','Jatin Das Park','Kalighat','Rabindra Sarobar','Mahanayak Uttam Kumar','Netaji','Masterda Surya Sen','Gitanjali','Kavi Nazrul','Shahid Khudiram','Kavi Subhash'],
    schedule: [
      { days: 'Maha Panchami & Maha Sasthi (Oct 15–16)', service: 'Standard daytime services apply.' },
      { days: 'Maha Saptami, Maha Ashtami & Maha Navami (Oct 17–20)', service: 'Overnight services run continuously from 1:00 PM until around 4:00 AM the next morning (up to 284 trains daily).', highlight: 'overnight' },
      { days: 'Vijaya Dashami (Oct 21)', service: 'Operates from 1:00 PM to Midnight (12:00 AM).' }
    ]
  },
  {
    id: 'green',
    name: 'Green Line',
    short: 'East-West',
    route: 'Howrah Maidan – Salt Lake Sector V',
    color: '#2E8B3E',
    text: '#fff',
    stations: ['Howrah Maidan','Howrah','Mahakaran','Esplanade','Sealdah','Phoolbagan','Salt Lake Stadium','Bengal Chemical','City Centre','Central Park','Karunamoyee','Salt Lake Sector V'],
    schedule: [
      { days: 'Maha Panchami & Maha Sasthi (Oct 15–16)', service: '240 services run from 6:00 AM to 11:00 PM.' },
      { days: 'Maha Saptami, Maha Ashtami & Maha Navami (Oct 17–20)', service: '192 daily overnight services run continuously from 1:30 PM to around 3:59 AM the next morning.', highlight: 'overnight' },
      { days: 'Vijaya Dashami (Oct 21)', service: '74 reduced services operate from 1:30 PM to 10:30 PM at 15-minute intervals.' }
    ]
  },
  {
    id: 'yellow',
    name: 'Yellow Line',
    short: 'Airport',
    route: 'Noapara – Jai Hind Bimanbandar / Airport',
    color: '#F9C513',
    text: '#0F172A',
    stations: ['Noapara','Dum Dum Cantonment','Jessore Road','Jai Hind (Airport)'],
    schedule: [
      { days: 'Maha Panchami & Maha Sasthi (Oct 15–16)', service: '120 services operate from 7:18 AM to 9:20 PM (plus 5 direct airport services to Shahid Khudiram).' },
      { days: 'Maha Saptami through Maha Navami (Oct 17–20)', service: '72 daily services run between 3:00 PM and 10:53 PM.' },
      { days: 'Vijaya Dashami (Oct 21)', service: '62 services operate from 3:00 PM to 9:38 PM.' }
    ]
  },
  {
    id: 'purple',
    name: 'Purple Line',
    short: 'Joka',
    route: 'Joka – Esplanade / Majerhat route',
    color: '#8E24AA',
    text: '#fff',
    stations: ['Majerhat','Taratala','Behala Bazar','Behala Chowrasta','Sakherbazar','Thakurpukur','Joka'],
    schedule: [
      { days: 'Maha Saptami to Vijaya Dashami (Oct 17–21)', service: '38 daily services run between 3:00 PM and 10:55 PM.' }
    ]
  },
  {
    id: 'orange',
    name: 'Orange Line',
    short: 'EM Bypass',
    route: 'Kavi Subhash – Beleghata',
    color: '#E8820C',
    text: '#fff',
    stations: ['Beliaghata','Barun Sengupta','Ritwik Ghatak','VIP Bazaar','Hemanta Mukhopadhyay','Kavi Sukanta','Jyotirindra Nandi','Satyajit Ray','Kavi Subhash'],
    schedule: [
      { days: 'Maha Panchami & Maha Sasthi (Oct 15–16)', service: '62 services operate between 7:40 AM and 8:45 PM.' },
      { days: 'Maha Saptami to Vijaya Dashami (Oct 17–21)', service: 'No Metro services will operate on this line.', alert: true }
    ]
  },
];

export const ZONES = {
  north:   { label: 'North Kolkata',   title: 'North Heritage',   blurb: 'Heritage lanes, bonedi pujas and river ghats', hub: 'Shyambazar & Shobhabazar', lines: 'Blue Line' },
  south:   { label: 'South Kolkata',   title: 'South Theme Hubs', blurb: 'Theme powerhouses and late-night adda',       hub: 'Kalighat & Netaji Bhavan',  lines: 'Blue Line' },
  central: { label: 'Central Kolkata', title: 'Central Classics', blurb: 'Heritage squares around MG Road and Sealdah', hub: 'MG Road & Sealdah',         lines: 'Blue & Green Lines' },
  east:    { label: 'East Kolkata',    title: 'Salt Lake & East', blurb: 'Salt Lake, New Town and the eastern corridor',  hub: 'Salt Lake, New Town & Rajarhat', lines: 'Green & Yellow Lines' },
  bonedi:  { label: 'Bonedi Bari',     title: 'Bonedi Bari',      blurb: 'Aristocratic family pujas, centuries old',     hub: 'Sovabazar & Girish Park',   lines: 'Blue Line' },
};

// Shortlisted car & bike parking lots under 2km radius with verified Google Maps links
export const PARKING_LOTS = [
  {
    id: 'city-centre-1',
    name: 'City Centre - 1 Parking Lot',
    serves: 'Lake Town, Sree Bhumi & Salt Lake border',
    address: 'DC Block, Sector 1, Bidhannagar, Kolkata 700064',
    mapUrl: 'https://maps.google.com/?cid=17563295945850330939',
    zone: 'east',
    matchTerms: ['lake town', 'sree bhumi', 'salt lake', 'bidhannagar', 'city centre', 'block a, lake town', 'nutan palli, lake town', 'central park', 'karunamoyee', 'sector v', 'new town', 'action area', 'labony', 'fd block', 'bj block', 'aj block', 'ak block', 'al block', 'bc block', 'cf block', 'ec block', 'hb block', 'ia block', 'bf block']
  },
  {
    id: 'bidhannagar-road-station',
    name: 'Bidhannagar Road Station Parking',
    serves: 'Ultadanga, Telengabagan, Dakshindari & Golaghata',
    address: 'CIT Scheme VII M, Ultadanga, Kolkata 700067',
    mapUrl: 'https://maps.google.com/?cid=893884134115233129',
    zone: 'north',
    matchTerms: ['ultadanga', 'telengabagan', 'telanga bagan', 'dakshindari', 'golaghata', 'gouriberia', 'karbagan', 'kabiraj bagan', 'bidhan sangha', 'sangrami']
  },
  {
    id: 'mani-square-mall',
    name: 'Mani Square Mall Parking Lot',
    serves: 'Kankurgachi, Phoolbagan & Ultadanga South',
    address: '164/1 Maniktala Main Rd, EM Bypass, Kankurgachi, Kolkata 700054',
    mapUrl: 'https://maps.google.com/?cid=4614353597257699488',
    zone: 'east',
    matchTerms: ['kankurgachi', 'kakurgachi', 'phoolbagan', 'beleghata', 'subhas sarobar', 'duttabad', 'chingrighata', 'sukanta nagar']
  },
  {
    id: 'kolkata-railway-station',
    name: 'Kolkata Railway Station Parking',
    serves: 'Tala, Belgachia & Paikpara',
    address: 'Kolkata Station Rd, Belgachia, Kolkata 700037',
    mapUrl: 'https://maps.google.com/?cid=2467030707804026516',
    zone: 'north',
    matchTerms: ['tala prattay', 'tala palli', 'tala park', 'tala baroari', 'paikpara', 'belgachia sadharan']
  },
  {
    id: 'belgachia-jheel',
    name: 'Belgachia Jheel Parking',
    serves: 'Belgachia, Tala Park & Lalabagan',
    address: 'Belgachia, Kolkata 700037',
    mapUrl: 'https://maps.google.com/?cid=14986285677002004469',
    zone: 'north',
    matchTerms: ['belgachia', 'tala park', 'lalabagan', 'patipukur', 'basak bagan']
  },
  {
    id: 'rg-kar-medical-college',
    name: 'Car Parking Area, R.G. Kar Medical College',
    serves: 'Shyambazar North & Belgachia',
    address: '16/B, Bidhan Sarani, Shyam Bazar, Kolkata 700004',
    mapUrl: 'https://maps.google.com/?cid=5987645238586288916',
    zone: 'north',
    matchTerms: ['north tridhara', 'kabitog bagan', 'friends union', 'nabin sangha', 'shyambazar']
  },
  {
    id: 'shyambazar-bidhan-sarani',
    name: 'Car Parking Space - Shyambazar Bidhan Sarani',
    serves: 'Hatibagan, Kashi Bose Lane & Nalin Sarkar St',
    address: '11/5B, Bidhan Sarani, Shyam Bazar, Kolkata 700003',
    mapUrl: 'https://maps.google.com/?cid=11684868646659812281',
    zone: 'north',
    matchTerms: ['hatibagan', 'halitbagan', 'kashi bose', 'kashibose', 'nalin sarkar', 'sikdar bagan', 'bidhan sarani', 'gouribari']
  },
  {
    id: 'bagbazar-launch-ghat',
    name: 'Bagbazar Launch Ghat Parking',
    serves: 'Bagbazar, Kumartuli & Shyambazar West',
    address: 'Strand Bank Rd, Baghbazar, Kolkata 700003',
    mapUrl: 'https://maps.google.com/?cid=7836219985060979818',
    zone: 'north',
    matchTerms: ['bagbazar', 'baghbazar', 'kumartuli', 'circular canal']
  },
  {
    id: 'shovabazar-launch-ghat',
    name: 'Shovabazar Launch Ghat Parking',
    serves: 'Sovabazar, Kumartuli, Ahiritola, Beniatola & Pathuriaghata',
    address: 'Strand Bank Rd, Shobhabazar, Kolkata 700005',
    mapUrl: 'https://maps.google.com/?cid=17466234994549195532',
    zone: 'north',
    matchTerms: ['sovabazar', 'shobhabazar', 'ahiritola', 'beniatola', 'pathuriaghata', 'pathurighata', 'malapara', 'darjipara', 'jagat mukherjee']
  },
  {
    id: 'girish-park-crossing',
    name: 'Girish Park Crossing / C.R. Avenue Service Lanes',
    serves: 'Vivekananda Rd, Darjipara, Rabindra Kanan & Chaltabagan',
    address: 'Chittaranjan Ave, Azad Hind Bag, Kolkata 700006',
    mapUrl: 'https://maps.google.com/?cid=3740601807016850862',
    zone: 'central',
    matchTerms: ['girish park', 'vivekananda rd', 'darjipara', 'rabindra kanan', 'chaltabagan', 'ghorbagan', 'shitala byam', 'beadon street', 'jorasanko', 'simla', 'tarun sporting']
  },
  {
    id: 'college-square-entrance',
    name: 'College Square Entrance Road Parking',
    serves: 'Thanthania, Chaltabagan, Md Ali Park & Santosh Mitra Square',
    address: 'College Square, Kolkata 700073',
    mapUrl: 'https://maps.google.com/?cid=6215720937787205116',
    zone: 'central',
    matchTerms: ['college square', 'thanthania', 'md ali park', 'bowbazar']
  },
  {
    id: 'school-of-tropical-medicine',
    name: 'Car Parking, School Of Tropical Medicine',
    serves: 'Central Ave, Md Ali Park & College Street',
    address: 'Calcutta Medical College, College Square, Kolkata 700073',
    mapUrl: 'https://maps.google.com/?cid=10188727487033456003',
    zone: 'central',
    matchTerms: ['central ave', 'college street', 'medical college', 'janbazar', 'taltala', 'kapalitola', 'subodh mullick']
  },
  {
    id: 'sealdah-parking',
    name: 'Sealdah Parking (Bike & Car)',
    serves: 'Santosh Mitra Square & Md Ali Park',
    address: 'Vidyapati Setu, Sealdah, Raja Bazar, Kolkata 700014',
    mapUrl: 'https://maps.google.com/?cid=6736309927221309278',
    zone: 'central',
    matchTerms: ['santosh mitra square', 'lebutala', 'muchipara', 'sealdah railway athletic', 'raja bazar']
  },
  {
    id: 'parkwiz-sealdah',
    name: 'ParkWiz Sealdah Parking Lot',
    serves: 'Santosh Mitra Square & Central Kolkata',
    address: 'Vidyapati Setu, Sealdah, Raja Bazar, Kolkata 700014',
    mapUrl: 'https://maps.google.com/?cid=522577602541710031',
    zone: 'central',
    matchTerms: ['sealdah', 'santosh mitra square', 'lebutala', 'central kolkata']
  },
  {
    id: 'diamond-plaza-mall',
    name: 'Diamond Plaza Mall Parking',
    serves: 'Nagerbazar, Mall Palli, Dum Dum Park & Shyamnagar',
    address: '68, Jessore Rd, Shyam Nagar, Satgachi, Kolkata 700055',
    mapUrl: 'https://maps.google.com/?cid=3085944755546807458',
    zone: 'north',
    matchTerms: ['nagerbazar', 'nager bazar', 'mall palli', 'dum dum park', 'dumdum park', 'shyam nagar', 'shyamnagar', 'satgachi', 'jessore road', 'bangur avenue']
  },
  {
    id: 'vip-road-haldiram-kaikhali',
    name: 'VIP Road Haldiram / Kaikhali Service Flank',
    serves: 'Kestopur, Prafulla Kanan, Baguiati & Aswininagar',
    address: '160, VIP Rd, Dhalipara, Tegharia, Kaikhali, Kolkata 700052',
    mapUrl: 'https://maps.google.com/?cid=9022347507500942852',
    zone: 'north',
    matchTerms: ['kestopur', 'prafulla kanan', 'prafullakanan', 'baguiati', 'baguihati', 'aswininagar', 'aswini nagar', 'kaikhali', 'tegharia', 'chinar park', 'bablatala', 'rajarhat', 'gopalpur', 'narayanpur']
  },
  {
    id: 'dum-dum-station',
    name: 'Dum Dum Station Parking Lot',
    serves: 'Dum Dum Rd, Laha Colony, Dakshinpara & Sinthee',
    address: 'Satpukur, Dum Dum, Kolkata 700030',
    mapUrl: 'https://maps.google.com/?cid=11217637003999295077',
    zone: 'north',
    matchTerms: ['dum dum rd', 'dum dum station', 'laha colony', 'dakshinpara', 'sinthee', 'sinthi', 'satpukur', 'dumdum tarun', 'dumdripra', 'telipukur']
  },
  {
    id: 'metrorail-car-parking-noapara',
    name: 'Metrorail Car Parking (Noapara / Dum Dum)',
    serves: 'Noapara, Netaji Colony Low Land & Sinthee',
    address: 'Bediapara, North Dumdum, Kolkata 700065',
    mapUrl: 'https://maps.google.com/?cid=1307211331691687943',
    zone: 'north',
    matchTerms: ['noapara', 'netaji colony', 'bediapara', 'forward colony', 'nowpara dadabhai']
  },
  {
    id: 'baranagar-metro-station',
    name: 'Baranagar Metro Station Parking (Dunlop)',
    serves: 'Dunlop, Rabindranagar & Baranagar',
    address: 'Dunlop, Bonhooghly, Baranagar, Kolkata 700056',
    mapUrl: 'https://maps.google.com/?cid=564109146890987406',
    zone: 'north',
    matchTerms: ['dunlop', 'rabindranagar', 'rabindra nagar', 'baranagar', 'bonhooghly', 'manasbag', 'amrita nagar', 'belgharia', 'mahua club', 'bani mandir']
  },
  {
    id: 'sodepur-railway-station',
    name: 'Sodepur Railway Station / Flyover Parking',
    serves: 'Sodepur, Sahid Colony, Bijoypur & Tarapukur',
    address: 'Sodepur Flyover, West Arunachal, Sodepur, Kolkata 700110',
    mapUrl: 'https://maps.google.com/?cid=9840790309872312459',
    zone: 'north',
    matchTerms: ['sodepur', 'sahid colony', 'bijoypur', 'tarapukur', 'agarpara', 'adarshanagar', 'nabodaya']
  },
  {
    id: 'sourav-car-parking-sodepur',
    name: 'Sourav Car Parking (Sodepur)',
    serves: 'Sodepur West, Peerless Nagar & Panihati cluster',
    address: 'Barua Para, Kalyan Nagar, Ashok Sen Nagar, Sodepur, Kolkata 700110',
    mapUrl: 'https://maps.google.com/?cid=14378157635706369181',
    zone: 'north',
    matchTerms: ['sodepur west', 'peerless nagar', 'panihati', 'kalyan nagar', 'sodepur deep prangan', 'udayan sangha']
  },
  {
    id: 'deshapriya-parking-lot',
    name: 'Deshapriya Parking Lot',
    serves: 'Deshapriya Park, Tridhara Sammilani & Maddox Square',
    address: 'Ground, Tilak Rd, Manoharpukur, Kalighat, Kolkata 700029',
    mapUrl: 'https://maps.google.com/?cid=5533824129754924408',
    zone: 'south',
    matchTerms: ['deshapriya park', 'tridhara sammilani', 'maddox square', 'manoharpukur', 'ballygunge cultural', 'hindustan park', 'hindustan club', 'samaj sebi', 'singhi park', 'ekdalia', 'badamtala', '66 pally', 'nepal bhattacharjee', 'chetla', 'kalighat', 'mudiali', 'shib mandir', 'vivekananda park athletic', 'bhowanipore 75 pally', 'paddapukur barwari', 'dhakuria', 'jodhpur park', 'selimpur', 'bosepukur', 'kasba', 'rajdanga', 'babubagan']
  },
  {
    id: 'new-alipore-sahapur',
    name: 'New Alipore Sahapur Parking Lot',
    serves: 'Suruchi Sangha',
    address: 'Sahapur, New Alipore, Kolkata 700038',
    mapUrl: 'https://maps.google.com/?cid=14406938668201904003',
    zone: 'south',
    matchTerms: ['suruchi sangha', 'new alipore', 'sahapur', 'alipore sarbojanin', 'chetla agrani', 'bhukailash']
  },
  {
    id: 'behala-chowrasta-metro',
    name: 'Behala Chowrasta Metro Station Flank',
    serves: 'Barisha Club',
    address: 'Diamond Harbour Rd, Behala Chowrasta, Kolkata 700008',
    mapUrl: 'https://maps.google.com/?cid=5606685553339919200',
    zone: 'south',
    matchTerms: ['barisha club', 'behala chowrasta', 'behala natun dal', 'behala club', 'behala 29 pally', 'behala players corner', 'barisha sarbojanin', 'sabarna roy choudhury', 'behala shibrampur', 'sakherbazar', 'behala bazar', 'sb park', 'haridevpur']
  },
  {
    id: 'kavi-nazrul-metro',
    name: 'Kavi Nazrul Metro Station Parking',
    serves: 'Naktala Udayan Sangha',
    address: '56, Nayabad Ave, Garia Bazaar, Garia, Kolkata 700084',
    mapUrl: 'https://maps.google.com/?cid=5874541501149039132',
    zone: 'south',
    matchTerms: ['naktala udayan sangha', 'naktala', 'garia', 'kavi nazrul', 'garia nabadurga', 'layalka 9 pally', 'baghajatin', 'kudghat']
  }
];

export function getParkingForPandal(p) {
  const text = (p.name + ' ' + p.area + ' ' + p.station + ' ' + (p.theme || '')).toLowerCase();
  const matched = [];
  for (const lot of PARKING_LOTS) {
    if (lot.matchTerms.some((t) => text.includes(t))) {
      matched.push(lot);
    }
  }
  if (matched.length === 0) {
    const zoneLots = PARKING_LOTS.filter((l) => l.zone === p.zone);
    if (zoneLots.length > 0) matched.push(zoneLots[0]);
  }
  return matched;
}

// Compact source rows: name | area | zone | nearest station | flags
// flags: m = must visit, b = bonedi bari, t:<theme>, w:<walk minutes, only where a source gave one>
const rows = `
Maddox Square|Ritchie Road, Ballygunge|south|Netaji Bhavan|m,w:14,t:Traditional sabeki idol under a grand open-park pavilion
Suruchi Sangha|New Alipore|south|Kalighat|m,w:28,t:Celebrated theme powerhouse showcasing Bengal's living cultural motifs
Deshapriya Park|Rashbehari Avenue, Kalighat|south|Kalighat|m,w:11,t:Grand Indian architectural marvel and divine radiance
Tridhara Sammilani|Manoharpukur Road, Ballygunge|south|Kalighat|m,w:8,t:Pioneering South Kolkata theme innovation with deep socio-cultural narratives
Barisha Club|Barisha|south|Sakherbazar|m,w:8,t:Voices of Earth: solace, shelter and resilience
Naktala Udayan Sangha|Naktala|south|Gitanjali|m,w:10,t:Large-scale theme installation
Md Ali Park|Mahatma Gandhi Road|central|Mahatma Gandhi Road|m,w:5,t:Dravidian Chola temple architecture with a 60-ft stone-carving replica
Santosh Mitra Square (Lebutala)|Lebutala, Sealdah|central|Sealdah|m,w:7,t:Spheres of the Cosmos: lasers, glass and celestial divinity
Sree Bhumi Sporting Club|Lake Town, VIP Road|north|Belgachia|m,w:30,t:Hawa Mahal of Jaipur: honeycomb façade and royal chandelier
Tala Prattay|Tala, Shyambazar|north|Shyambazar|m,w:9,t:Biyojon (Detachment)
North Tridhara|Shyambazar|north|Shyambazar|
Kabitog Bagan|Shyambazar|north|Shyambazar|
Nalin Sarkar Street|Shyambazar|north|Shyambazar|
Friends Union|Shyambazar|north|Shyambazar|
Nabin Sangha|Shyambazar|north|Shyambazar|
Kashibose Lane|Shyambazar|north|Shyambazar|
Halitbagan Sarbojanin|Halitbagan|north|Shyambazar|
Halitbagan Nabin Pally|Halitbagan|north|Shyambazar|
Hatibagan Sarbojanin Durgotsav|Hatibagan|north|Shyambazar|
Gouribari Sarbojanin|Shyambazar|north|Shyambazar|
Sikdar Bagan|Sikdar Bagan|north|Shyambazar|
Bidhan Sarani Alitas|Bidhan Sarani|north|Shyambazar|
Telanga Bagan|Telanga Bagan|north|Shyambazar|
Hatibagan Nabinpally|Hatibagan|north|Shyambazar|
Kashi Bose Lane Durga Puja|Hatibagan|north|Shyambazar|
Bagbazar Sarbojanin Durgotsav|Bagbazar, Circular Canal Bank|north|Shyambazar|m,w:10,t:Century-old traditional sabeki idol, daker saaj and historic Bagbazar Ghat immersion
Karbagan Sarbojanin Durga Puja|Karbagan, Ultadanga|north|Shyambazar|
Gouriberia Sarbojonin|Gouriberia, Ultadanga|north|Shyambazar|
Ultadanga Yuba Brindra|Ultadanga|north|Shyambazar|
Ultadanga Pallyshree|Ultadanga|north|Shyambazar|
Telengabagan|Telengabagan, Ultadanga|north|Shyambazar|
Ultadanga Sangrami|Ultadanga|north|Shyambazar|
Kabiraj Bagan|Ultadanga|north|Shyambazar|
Ultadanga Bidhan Sangha|Ultadanga|north|Shyambazar|
Tala Palli Sadharan|Tala Post Office|north|Belgachia|
Tala Park 15 Pally|Tala Park, Paikpara|north|Belgachia|
Paikpara 31 Pally Sadharan|Paikpara|north|Belgachia|
Dakshindari Youth|Dakshindari|north|Belgachia|
Belgachia Sadharan Durgautsav|Belgachia|north|Belgachia|
Tala Baroari|Tala|north|Belgachia|
Dumdum Tarun Dal|Dum Dum|north|Belgachia|
Golaghata Sammilani|Golaghata, VIP Road|north|Belgachia|
Laketown Adhibasi Brindra|Lake Town, VIP Road|north|Belgachia|
Laketown Netaji Sporting Club|Lake Town, VIP Road|north|Belgachia|
Lake Town Adibasi Brinda|Block A, Lake Town|north|Belgachia|
Laketown Nutan Palli Pradeep Sangha|Nutan Palli, Lake Town|north|Belgachia|
Dum Dum Park Sarbojonin (Bypass)|Dum Dum Park, Salt Lake Bypass|north|Belgachia|
Dumdum Park Yuvak Brinda|Dum Dum Park|north|Belgachia|
Basak Bagan|Basak Bagan, Patipukur|north|Belgachia|
Patipukur Adi Sarbojonin|Patipukur, Bangur Avenue|north|Belgachia|
Lalabagan Nababankur|Lalabagan|north|Girish Park|
Pathurighata 5 er Pally|Pathurighata|north|Girish Park|
Tarun Sporting Club|Girish Park|north|Girish Park|
Ghorbagan Sarbojanin|Ghorbagan|north|Girish Park|
Rabindra Kanan|Girish Park|north|Girish Park|
Shitala Byam Samity|Girish Park|north|Girish Park|
Chaltabagan Sarbojanin|Chaltabagan|north|Girish Park|
Chaltabagan Durga Puja Committee|Chaltabagan|north|Girish Park|
Chaltabagan Lohapatty|Chaltabagan|north|Girish Park|
Chhatu Babu Latu Babu Bari|Beadon Street|north|Girish Park|b
Shib Krishna Daw Bari|Jorasanko|north|Girish Park|b
Darjipara Mitra Bari|Darjipara|north|Shobhabazar Sutanuti|b
Pathuriaghata Khelat Ghosh Bari|Pathuriaghata|north|Shobhabazar Sutanuti|b
Malapara Adi Mallick Bari|Malapara, Jorabagan|north|Shobhabazar Sutanuti|b
Sovabazar Rajbari|Sovabazar|north|Shobhabazar Sutanuti|b
Beniatola|Beniatola, Sovabazar|north|Shobhabazar Sutanuti|
Ahiritola Sarbojanin Durgotsav|Ahiritola, Shobhabazar|north|Shobhabazar Sutanuti|m,w:11,t:Legendary North Kolkata giant celebrating art, craft and riverbank heritage
Jagat Mukherjee Park|Sovabazar|north|Shobhabazar Sutanuti|
Ahiritola Jubak Brindra|Ahiritola, Ganges Bank|north|Shobhabazar Sutanuti|
Kumartuli Park Sarbojanin|Kumartuli, Sovabazar|north|Shobhabazar Sutanuti|m
Kumartuli Sarbojanin Durgotsav|Kumartuli, Shobhabazar|north|Shobhabazar Sutanuti|
Shobhabajar Sarbojanin|Sovabazar|north|Shobhabazar Sutanuti|
Thanthania Dutta Bari|Thanthania|north|Mahatma Gandhi Road|b
Dumdum Tarun Sangha|Dum Dum|north|Dum Dum|
Dumdum Park Sarbojanin|Dum Dum Park|north|Dum Dum|
Dumdum Park Bharat Chakra|Dum Dum Park|north|Dum Dum|
Dumdum Park Yubak Brindra|Dum Dum Park|north|Dum Dum|
Dumdripra Durgautsav|Dumdripra|north|Dum Dum|
Masterda Smriti Sangha|Kestopur, VIP Road|north|Dum Dum|
Acharya Prafulla Kanan Adibasi Brinda|Prafulla Kanan, Kestopur|north|Dum Dum|
Kestopur AK Block|AK Block, Kestopur|north|Dum Dum|
Samarpally AB Block|Samarpally, Kestopur|north|Dum Dum|
Kamal Park Sarbojonin|Kamal Park, Kestopur|north|Dum Dum|
Prafullakanan Paschim Adhibasibrinda|Prafullakanan Paschim, Kestopur|north|Dum Dum|
Motkerbari Sarbojonin|Motkerbari, Kestopur|north|Dum Dum|
Aswininagar Bandhumahal Club|Aswini Nagar, Baguihati|north|Dum Dum|
Nirvik Sangha|Baguihati, VIP Road|north|Dum Dum|
Shastri Bagan Sporting Club|Shastri Bagan, Baguihati|north|Dum Dum|
Railpukur United Club|Railpukur, Baguihati|north|Dum Dum|
Dakshinpara Durgotsab|Dakshinpara, Baguihati|north|Dum Dum|
Laha Colony Bibek Sangha|Laha Colony, Satgachi|north|Dum Dum|
Telipukur Yuva Sangha|Telipukur, Satgachi|north|Dum Dum|
Nager Bazar Jessore Road Adibasi Brinda|Jessore Road, Nagerbazar|north|Dum Dum|
Dum Dum Mall Palli Club|Mall Palli, Nagerbazar|north|Dum Dum|
Sinthi Munshir Bagan|Munshir Bagan, Sinthi|north|Dum Dum|
Sinthi Bandhudal|Sinthi More, BT Road|north|Dum Dum|
Sinthi Agragami|Sinthi|north|Dum Dum|
Netaji Colony Lawland|Noapara|north|Noapara|
Nowpara Dadabhai Sangha|Noapara|north|Noapara|
Forward Colony|Noapara|north|Noapara|
Baranagar Dada Bhai Sangha|Baranagar, Sinthi More|north|Noapara|
Baranagar Netaji Colony Low Land|Baranagar, Sinthi More|north|Baranagar|
Rabindranagar Yubak Brinda (Dunlop)|Rabindra Nagar, Dunlop|north|Baranagar|
Manasbag|Manasbag, Belgharia|north|Baranagar|
Amrita Nagar|Amrita Nagar, Belgharia|north|Baranagar|
Mahua Club|Belgharia|north|Baranagar|
Bani Mandir|Belgharia|north|Baranagar|
Adarshanagar Sarbojanin|Adarshanagar, Agarpara|north|Dakshineswar|
Tarapukur Adi Sarbajanin|Tarapukur, Agarpara|north|Dakshineswar|
Tarapukur Paschimpally|Tarapukur, Agarpara|north|Dakshineswar|
Udayan Sangha Club (Sodepur)|Sodepur Station Road|north|Dakshineswar|
Sodepur Deep Prangan|Station Road, Sodepur|north|Dakshineswar|
Sahid Colony|Sahid Colony, Sodepur|north|Dakshineswar|
Sodepur Nabodaya Sangha|Nabodaya, Sodepur|north|Dakshineswar|
Bijoypur Sarbojanin Durga|Bijoypur, Sodepur|north|Dakshineswar|
Kakurgachi Yubak Brindra|Kankurgachi|east|Phoolbagan|
Kakurgachi Mitali Sangha|Kankurgachi|east|Phoolbagan|
College Square|College Street, Bowbazar|central|Central|m,w:6,t:Illuminated fairytale palace floating on the heritage tank with grand reflections
Simla Vyayam Samiti|Simla, Vivekananda Road|central|Girish Park|m,w:5,t:Legendary swadeshi tradition and traditional warrior-style pratima
Bowbazar Sarbojanin|Bowbazar, BB Ganguly Street|central|Central|w:4,t:Vibrant heritage community puja with traditional daker saaj
Sealdah Railway Athletic Club|Sealdah Station Area|central|Sealdah|w:5,t:Creative architectural replica and illumination
Subodh Mullick Square|Wellington, Dharmatala|central|Central|w:6,t:Heritage square puja celebrated for artistic themes
Janbazar Sammilani|Janbazar, Corporation Street|central|Chandni Chowk|w:5,t:Historic community celebration in the heart of Kolkata
Muchipara Sarbojanin|Muchipara, Sealdah|central|Sealdah|w:8,t:Vibrant traditional festivities and intricate lighting
Taltala Sarbojanin|Taltala, Surendranath Banerjee Road|central|Chandni Chowk|w:7,t:Artistic wooden and cane craftsmanship
Kapalitola Sarbojanin|Kapalitola Lane, Bowbazar|central|Central|w:4,t:Traditional neighbourhood puja with classical Bengali rituals
Rani Rashmoni Bari|Janbazar, SN Banerjee Road|central|Central|b,m,w:6,t:Historic 18th-century zamindar puja visited by Sri Ramakrishna Paramahamsa
Bowbazar Chandra Bari|Bowbazar|central|Central|b,w:5,t:Aristocratic family puja featuring exquisite centuries-old silver throne
Thanthania Sarbojanin|College Street / MG Road|central|Mahatma Gandhi Road|w:5,t:Classic neighbourhood festival steps from Thanthania temple
Ekdalia Evergreen Club|Gariahat, Dover Lane|south|Kalighat|m,w:18,t:Grand replication of ancient temples with dazzling Chandannagar illumination
Singhi Park|Dover Lane, Gariahat|south|Kalighat|m,w:18,t:Imposing Rajasthani and South Indian stone temple replicas and opulent chandeliers
Ballygunge Cultural Association|Jatin Das Road, Lake Market|south|Kalighat|m,w:9,t:Avant-garde Bengali folk art installations and thoughtful sociological themes
Chetla Agrani Club|Chetla|south|Kalighat|m,w:12,t:Masterclass artistic installations by leading contemporary sculptors and painters
Mudiali Club|Southern Avenue, Lake|south|Rabindra Sarobar|m,w:6,t:Refined classical elegance, eco-friendly natural materials and pristine sabeki idol
Shib Mandir Sarbojanin|Southern Avenue, Lake|south|Rabindra Sarobar|m,w:7,t:Stunning experimental architecture with organic and sustainable art elements
Badamtala Ashar Sangha|Nepal Bhattacharjee Street, Kalighat|south|Kalighat|m,w:4,t:Trailblazing theme pioneer creating immersive multi-sensory experiences
66 Pally|Kalighat, Nepal Bhattacharjee Street|south|Kalighat|m,w:5,t:Deeply evocative cultural themes and traditional Bengali craftsmanship
Nepal Bhattacharjee Street Club|Kalighat|south|Kalighat|w:4,t:Vibrant neighbourhood theme installation steps from Rashbehari
Hindustan Park Sarbojanin|Hindustan Park, Gariahat|south|Kalighat|m,w:14,t:Pioneering rural Bengal heritage themes and artisan craft revival
Hindustan Club|Gariahat|south|Kalighat|w:14,t:Celebrated modern artistic pandal with illuminated pathways
Samaj Sebi Sangha|Lake View Road, Gariahat|south|Kalighat|m,w:11,t:Socially conscious, inclusive themes with tactile and sensory exhibits
Bosepukur Sitala Mandir|Kasba, Bosepukur|south|Hemanta Mukhopadhyay|m,w:14,t:Legendary trendsetter known for astonishing earthen and craft creations
Bosepukur Parijat Club|Kasba|south|Hemanta Mukhopadhyay|w:12,t:Thought-provoking urban theme installation
Rajdanga Naba Uday Sangha|Rajdanga, Kasba|south|Hemanta Mukhopadhyay|m,w:11,t:Monumental architectural theme with hand-carved wood and terracotta textures
Babubagan Club|Dhakuria, Selimpur|south|Rabindra Sarobar|m,w:15,t:Spectacular replica of ancient Indian temples carved from coins, glass and brass
Selimpur Pally|Selimpur, Dhakuria|south|Rabindra Sarobar|m,w:18,t:Imaginative visual installations exploring human existence and folklore
Jodhpur Park Sarbojanin|Jodhpur Park|south|Rabindra Sarobar|m,w:21,t:One of South Kolkata's biggest thematic pandals featuring grand open pavilions
95 Pally Jodhpur Park|Jodhpur Park|south|Rabindra Sarobar|w:19,t:Intricate traditional artisanal work and atmospheric lighting
Vivekananda Park Athletic Club|Southern Avenue|south|Rabindra Sarobar|w:8,t:Lakeside cultural pandal with classical idol and serene surroundings
41 Pally Haridevpur|Haridevpur, Tollygunge|south|Mahanayak Uttam Kumar|m,w:30,t:Expansive rural Bengal thematic village and moving dioramas
Ajeya Sangha Haridevpur|Haridevpur, Tollygunge|south|Mahanayak Uttam Kumar|w:32,t:Innovative socio-cultural art installation
Behala Natun Dal|Behala Chowrasta|south|Behala Chowrasta|m,w:6,t:Magnificent experimental theme installations with grand sculptural ensembles
Behala Club|Behala Chowrasta|south|Behala Chowrasta|w:5,t:Traditional heritage celebration with rhythmic dhak performances
Behala 29 Pally|Behala, Diamond Harbour Road|south|Behala Bazar|w:6,t:Vibrant modern theme with innovative environmental motifs
Behala Players Corner|Behala Chowrasta|south|Behala Chowrasta|w:8,t:Famous sports-personality-affiliated puja known for royal celebration
Kudghat Pragati Sangha|Kudghat, Tollygunge|south|Netaji|w:9,t:Expressive theme installations highlighting Bengal folk traditions
Garia Nabadurga|Garia, Kanungo Park|south|Kavi Nazrul|w:8,t:Nine forms of Durga depicted in breathtaking artistic details
Layalka 9 Pally|Jadavpur, Baghajatin|south|Kavi Nazrul|w:16,t:Ecological and conservation themes crafted from sustainable materials
Baghajatin Tarun Sangha|Baghajatin, Jadavpur|south|Kavi Subhash|w:17,t:Grand community pandal with classical Bengali ambiance
Bhowanipore 75 Pally|Bhowanipore|south|Netaji Bhavan|m,w:6,t:Showcase of classical Bengal handicraft traditions and heritage idols
Paddapukur Barwari|Bhowanipore, Lansdowne|south|Netaji Bhavan|w:7,t:One of Bhowanipore's historic barowari pujas with traditional rituals
Alipore Sarbojanin|Alipore|south|Kalighat|w:18,t:Lush open pandal with regal golden ornaments and peaceful adda
SB Park Sarbojanin|State Bank Park, Thakurpukur|south|Thakurpukur|m,w:8,t:Major South-Western theme attraction drawing immense crowds
Barisha Sarbojanin|Barisha|south|Sakherbazar|w:7,t:Traditional heritage barowari celebration with vibrant musical events
Sabarna Roy Choudhury Bari (Atchala)|Barisha, Diamond Harbour Road|south|Sakherbazar|b,m,w:8,t:Kolkata's oldest Durga Puja established in 1610 featuring the unique Durga Panchayan idol
Bhukailash Rajbari|Khidirpur, Diamond Harbour Road|south|Majerhat|b,w:10,t:Royal family puja in historic 18th-century palace grounds between twin Shiva temples
Behala Shibrampur Baroari|Shibrampur, Behala|south|Sakherbazar|w:20,t:Historic community celebration in greater Behala
Salt Lake FD Block|FD Block, Sector III, Salt Lake|east|Central Park|m,w:10,t:Monumental fantasy castles, palace replicas and illuminated dreamscapes
Salt Lake BJ Block|BJ Block, Sector II, Salt Lake|east|Karunamoyee|m,w:7,t:Grand thematic architecture, massive sculptures and artisan installations
Salt Lake AJ Block|AJ Block, Sector II, Salt Lake|east|Karunamoyee|w:6,t:Intricate woodwork and temple replica in serene park setting
Salt Lake AK Block|AK Block, Sector II, Salt Lake|east|Karunamoyee|m,w:5,t:Vibrant folk art themes and exquisite shola and bell-metal ornaments
Salt Lake AL Block|AL Block, Sector II, Salt Lake|east|Karunamoyee|w:7,t:Cozy community puja known for artistic pandal design and family warmth
Salt Lake BC Block|BC Block, Sector I, Salt Lake|east|City Centre|w:6,t:Classical architecture replica steps from City Centre Mall
Salt Lake CF Block|CF Block, Sector I, Salt Lake|east|Central Park|w:7,t:Artistic theme exploring ecological harmony and heritage craft
Salt Lake EC Block|EC Block, Sector I, Salt Lake|east|City Centre|w:5,t:Stunning illuminated mandap with traditional Bengali devotion
Salt Lake HB Block|HB Block, Sector III, Salt Lake|east|Karunamoyee|w:8,t:Architectural splendour inspired by historic Indian monuments
Salt Lake Labony Estate|Sector I, Salt Lake|east|City Centre|m,w:6,t:Heritage housing estate puja famed for grand fair and traditional ambiance
Salt Lake IA Block|IA Block, Sector III, Salt Lake|east|Central Park|w:10,t:Artisan theme celebrating Indian classical heritage
Salt Lake BF Block|BF Block, Sector I, Salt Lake|east|City Centre|w:7,t:Graceful lighting and hand-painted thematic depictions
Beleghata 33 Pally|Beleghata Main Road|east|Phoolbagan|m,w:9,t:Thought-provoking nostalgic themes depicting Old Calcutta life
Beleghata Sandhani Club|Subhas Sarobar, Beleghata|east|Phoolbagan|m,w:10,t:Breathtaking waterfront pandal installations beside Subhas Sarobar lake
Phoolbagan Sarbojanin|Phoolbagan Crossing|east|Phoolbagan|w:3,t:Vibrant crossroads puja with spectacular street lighting
Kankurgachi Ramkrishna Samiti|Kankurgachi|east|Phoolbagan|w:6,t:Devotional classical pandal inspired by temple sanctums
Duttabad Sarbojanin|Salt Lake Bypass, Near Stadium|east|Salt Lake Stadium|w:5,t:Energetic community celebration near the iconic Salt Lake Stadium
Sukanta Nagar Sarbojanin|Chingrighata, EM Bypass|east|Beliaghata|w:8,t:Colourful artisan pandal near the eastern bypass corridor
New Town Sarbojanin Durgotsav|City Square, Action Area 1, New Town|east|Salt Lake Sector V|m,w:45,t:Flagship smart-city celebration at City Square with monumental architectural installations, cultural carnival and dazzling illumination
New Town CE Block Sarbojanin|CE Block, Action Area 1, New Town|east|Salt Lake Sector V|w:38,t:Artistic community puja renowned for innovative eco-friendly craftsmanship and vibrant block camaraderie
Uniworld City Cultural Association|Action Area 3, New Town|east|Salt Lake Sector V|w:135,t:Grand residential mega-township celebration celebrated for majestic classical idols, musical nights and festive adda
Balaka Abasan Durgotsab|Balaka Abasan, Action Area 1, New Town|east|Salt Lake Sector V|w:35,t:Pioneering New Town housing society puja celebrated for warmth, traditional rituals and lively community feast
New Town CD Block Sarbojanin|CD Block, Action Area 1, New Town|east|Salt Lake Sector V|w:40,t:Expressive socio-cultural themes created with intricate handcrafted natural materials
Chinar Park Sarbojanin Durgotsab|Chinar Park, Rajarhat Main Road|east|Jai Hind (Airport)|m,w:55,t:Major arterial crossroads powerhouse renowned for imposing temple facades and dazzling Chandannagar illumination
Gopalpur Sarbojanin Durgotsab|Gopalpur, Rajarhat|east|Jai Hind (Airport)|w:70,t:Century-old traditional community puja blending deep heritage rituals with artistic mandap artistry
Narayanpur Sabuj Sangha|Narayanpur, Rajarhat|east|Jai Hind (Airport)|w:60,t:Celebrated club puja drawing massive festive crowds for its imposing sculptures and cultural exhibits
Bablatala Sarbojanin Durgotsav|Bablatala, Rajarhat Main Road|east|Jai Hind (Airport)|w:45,t:Vibrant neighbourhood celebration connecting Rajarhat and VIP corridor with spectacular festive lighting
Rajarhat Kalipark Sarbojanin|Kalipark, Rajarhat Main Road|east|Jai Hind (Airport)|w:50,t:Popular community puja known for colorful artistic themes and enthusiastic neighbourhood participation
`.trim().split('\n');

export const slugify = (s) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/\(.*?\)/g, (m) => ' ' + m.slice(1, -1) + ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const PANDALS = rows.map((row) => {
  const [name, area, zone, station, flags = ''] = row.split('|');
  const p = { id: slugify(name), name, area, zone, station };
  // theme text may contain commas, so split flags carefully
  const themeMatch = flags.match(/t:(.*)$/);
  const head = themeMatch ? flags.slice(0, themeMatch.index) : flags;
  if (themeMatch) p.theme = themeMatch[1].trim();
  head.split(',').map((x) => x.trim()).filter(Boolean).forEach((f) => {
    if (f === 'm') p.must = true;
    else if (f === 'b') p.bonedi = true;
    else if (f.startsWith('w:')) p.walkMin = Number(f.slice(2));
  });
  return p;
});

// Sanity: every pandal's station must exist on a line; ids must be unique.
const known = new Set(LINES.flatMap((l) => l.stations));
const ids = new Set();
for (const p of PANDALS) {
  if (!known.has(p.station)) throw new Error(`Unknown station "${p.station}" for ${p.name}`);
  if (ids.has(p.id)) throw new Error(`Duplicate id ${p.id}`);
  ids.add(p.id);
}
