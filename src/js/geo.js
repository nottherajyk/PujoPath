// Kolkata Geographic & Route Engine for PujoPath
// Provides comprehensive coordinates, place resolution, GPS geolocation,
// and smart en-route / nearby pandal discovery.

// Exact coordinates for all Kolkata Metro Stations
export const STATION_COORDS = {
  // Blue Line (North-South)
  'Dakshineswar': [22.6533, 88.3580],
  'Baranagar': [22.6416, 88.3664],
  'Noapara': [22.6288, 88.3847],
  'Dum Dum': [22.6219, 88.3934],
  'Belgachia': [22.6046, 88.3812],
  'Shyambazar': [22.6033, 88.3703],
  'Shobhabazar Sutanuti': [22.5962, 88.3644],
  'Girish Park': [22.5861, 88.3603],
  'Mahatma Gandhi Road': [22.5804, 88.3601],
  'Central': [22.5694, 88.3563],
  'Chandni Chowk': [22.5658, 88.3541],
  'Esplanade': [22.5639, 88.3516],
  'Park Street': [22.5528, 88.3516],
  'Maidan': [22.5456, 88.3496],
  'Rabindra Sadan': [22.5385, 88.3468],
  'Netaji Bhavan': [22.5323, 88.3464],
  'Jatin Das Park': [22.5235, 88.3475],
  'Kalighat': [22.5181, 88.3469],
  'Rabindra Sarobar': [22.5085, 88.3458],
  'Mahanayak Uttam Kumar': [22.4988, 88.3458],
  'Netaji': [22.4862, 88.3470],
  'Masterda Surya Sen': [22.4761, 88.3533],
  'Gitanjali': [22.4674, 88.3619],
  'Kavi Nazrul': [22.4589, 88.3744],
  'Shahid Khudiram': [22.4507, 88.3842],
  'Kavi Subhash': [22.4419, 88.3980],

  // Green Line (East-West)
  'Howrah Maidan': [22.5838, 88.3262],
  'Howrah': [22.5847, 88.3426],
  'Mahakaran': [22.5717, 88.3486],
  'Sealdah': [22.5672, 88.3712],
  'Phoolbagan': [22.5714, 88.3892],
  'Salt Lake Stadium': [22.5711, 88.4042],
  'Bengal Chemical': [22.5815, 88.4072],
  'City Centre': [22.5888, 88.4089],
  'Central Park': [22.5902, 88.4162],
  'Karunamoyee': [22.5880, 88.4239],
  'Salt Lake Sector V': [22.5802, 88.4332],

  // Yellow Line (Airport)
  'Dum Dum Cantonment': [22.6375, 88.4103],
  'Jessore Road': [22.6464, 88.4289],
  'Jai Hind (Airport)': [22.6517, 88.4418],

  // Purple Line (Joka - Majerhat)
  'Joka': [22.4385, 88.3039],
  'Thakurpukur': [22.4566, 88.3088],
  'Sakherbazar': [22.4722, 88.3128],
  'Behala Chowrasta': [22.4892, 88.3168],
  'Behala Bazar': [22.4975, 88.3189],
  'Taratala': [22.5083, 88.3214],
  'Majerhat': [22.5186, 88.3261],

  // Orange Line (Kavi Subhash - Ruby)
  'Satyajit Ray': [22.4647, 88.4011],
  'Jyotirindra Nandi': [22.4820, 88.4018],
  'Kavi Sukanta': [22.4965, 88.4019],
  'Hemanta Mukhopadhyay': [22.5140, 88.4022],
  'VIP Bazar': [22.5280, 88.4005],
  'Beliaghata': [22.5410, 88.3985]
};

// Comprehensive Kolkata Places & Neighborhoods Database (Over 200 places)
export const KOLKATA_PLACES = [
  // Rajarhat, Chinar Park & Airport Corridor
  { name: 'Chinar Park', coords: [22.6256, 88.4468], desc: 'Rajarhat Main Road & Tegharia Crossing', badge: 'Hub', terms: ['chinar park', 'chinar', 'tegharia crossing', 'chinar park crossing'] },
  { name: 'City Centre 2', coords: [22.6280, 88.4550], desc: 'Action Area IID · Mall & Parking', badge: 'Mall', terms: ['city centre 2', 'city centre ii', 'cc2', 'action area iid'] },
  { name: 'Rajarhat Chowmatha', coords: [22.6231, 88.4827], desc: 'Rajarhat Main Rd & 211 Bus Terminus', badge: 'Hub', terms: ['rajarhat chowmatha', 'rajarhat crossing', 'chowmatha rajarhat'] },
  { name: 'Kalipark', coords: [22.6242, 88.4485], desc: 'Rajarhat Main Rd, Near Chinar Park', badge: 'Place', terms: ['kalipark', 'kali park'] },
  { name: 'Rajarhat', coords: [22.6231, 88.4827], desc: 'Rajarhat Main Road & Township Hub', badge: 'Hub', terms: ['rajarhat'] },
  { name: 'Dashadrone', coords: [22.6245, 88.4498], desc: 'Rajarhat Main Rd, Near Chinar Park', badge: 'Place', terms: ['dashadrone', 'dasadrone'] },
  { name: 'Tegharia', coords: [22.6220, 88.4410], desc: 'VIP Rd Connector & Rajarhat Road', badge: 'Place', terms: ['tegharia', 'tegharia shitalatala', 'sahabagan'] },
  { name: 'Arjunpur', coords: [22.6170, 88.4350], desc: 'Near Baguiati-Tegharia & Chinar Park', badge: 'Place', terms: ['arjunpur', 'arjunpur amra sabai'] },
  { name: 'Kaikhali', coords: [22.6320, 88.4380], desc: 'VIP Rd & Airport-Rajarhat Gateway', badge: 'Place', terms: ['kaikhali', 'kaikhali crossing', 'kaikhali bus stand'] },
  { name: 'Bablatala', coords: [22.6240, 88.4590], desc: 'Rajarhat Main Rd & Sourav Ganguly Ave', badge: 'Place', terms: ['bablatala', 'bablataala'] },
  { name: 'Salua', coords: [22.6250, 88.4430], desc: 'Rajarhat Main Rd, Near Chinar Park', badge: 'Place', terms: ['salua', 'salua crossing'] },
  { name: 'Gopalpur', coords: [22.6300, 88.4680], desc: 'Rajarhat suburban corridor', badge: 'Place', terms: ['gopalpur', 'gopalpur house'] },
  { name: 'Narayanpur', coords: [22.6360, 88.4750], desc: 'Rajarhat North corridor', badge: 'Place', terms: ['narayanpur', 'narayanpur battala'] },
  { name: 'Tentultala', coords: [22.6235, 88.4520], desc: 'Rajarhat Main Rd & Tentultala', badge: 'Place', terms: ['tentultala', 'tentultala crossing'] },
  { name: 'Bishnupur', coords: [22.6285, 88.4890], desc: 'Rajarhat Heritage & Bonedi Bari', badge: 'Place', terms: ['bishnupur', 'rajarhat bishnupur', 'mitra bari'] },
  { name: 'Atghara', coords: [22.6248, 88.4530], desc: 'Near Chinar Park & Dashadrone', badge: 'Place', terms: ['atghara', 'atghora'] },
  { name: 'Jyangra', coords: [22.6185, 88.4440], desc: 'Rajarhat-Baguiati Link', badge: 'Place', terms: ['jyangra', 'jyangra chowmatha'] },
  { name: 'Reckjoani', coords: [22.6240, 88.4980], desc: 'Rajarhat Suburban Main Road', badge: 'Place', terms: ['reckjoani', 'rekjoani'] },
  { name: 'Kolkata Airport (CCU)', coords: [22.6517, 88.4418], desc: 'Netaji Subhash Chandra Bose Intl Airport', badge: 'Terminal', terms: ['airport', 'kolkata airport', 'ccu', 'dum dum airport', 'biman bandar', 'jai hind airport'] },
  { name: 'Haldiram VIP Road', coords: [22.6260, 88.4350], desc: 'VIP Rd & Tegharia Flank', badge: 'Hub', terms: ['haldiram', 'haldirams', 'vip road haldiram', 'haldiram crossing'] },

  // New Town
  { name: 'New Town City Square', coords: [22.5855, 88.4680], desc: 'Action Area 1 · New Town Cultural Hub', badge: 'Hub', terms: ['new town city square', 'city square', 'new town', 'action area 1', 'action area i'] },
  { name: 'Eco Park Gate 1', coords: [22.6030, 88.4710], desc: 'Major Arterial Rd · Action Area 2', badge: 'Hub', terms: ['eco park', 'ecopark', 'action area 2', 'action area ii', 'eco park gate 1'] },
  { name: 'Uniworld City', coords: [22.5700, 88.4890], desc: 'Action Area 3 · Mega Township', badge: 'Place', terms: ['uniworld city', 'uniworld', 'action area 3', 'action area iii'] },
  { name: 'Biswa Bangla Gate', coords: [22.5930, 88.4720], desc: 'Kolkata Gate · Hanging Restaurant', badge: 'Hub', terms: ['biswa bangla gate', 'kolkata gate', 'hanging restaurant'] },
  { name: 'Ecospace New Town', coords: [22.5850, 88.4750], desc: 'Action Area 2 · IT Corridor', badge: 'Place', terms: ['ecospace', 'eco space', 'amity university new town'] },
  { name: 'Axis Mall', coords: [22.5840, 88.4620], desc: 'Action Area 1 · New Town Mall', badge: 'Mall', terms: ['axis mall', 'axis mall new town'] },
  { name: 'Mother’s Wax Museum', coords: [22.5980, 88.4720], desc: 'Action Area 2 · Near Eco Tourism Park', badge: 'Place', terms: ['mothers wax museum', 'wax museum'] },

  // VIP Road, Lake Town & North-East
  { name: 'Lake Town Clock Tower', coords: [22.6040, 88.4025], desc: 'Lake Town Crossing & VIP Road', badge: 'Hub', terms: ['lake town', 'laketown', 'clock tower lake town', 'big ben kolkata'] },
  { name: 'Sree Bhumi', coords: [22.5990, 88.4000], desc: 'VIP Road & Lake Town Border', badge: 'Place', terms: ['sree bhumi', 'sreebhumi', 'sree bhumi sporting'] },
  { name: 'Baguiati', coords: [22.6140, 88.4285], desc: 'VIP Road Arterial Hub & Joramandir', badge: 'Hub', terms: ['baguiati', 'baguihati', 'joramandir', 'joramandir baguiati'] },
  { name: 'Kestopur', coords: [22.5975, 88.4245], desc: 'VIP Road & Prafulla Kanan', badge: 'Place', terms: ['kestopur', 'krishnapur', 'prafulla kanan'] },
  { name: 'Bangur Avenue', coords: [22.6075, 88.4090], desc: 'VIP Road & Bangur Supermarket', badge: 'Place', terms: ['bangur avenue', 'bangur', 'bangur crossing'] },
  { name: 'Dum Dum Park', coords: [22.6130, 88.4110], desc: 'VIP Road & Jessore Road Link', badge: 'Place', terms: ['dum dum park', 'dumdum park', 'dum dum park bharat chakra', 'dum dum tarun dal'] },
  { name: 'Nagerbazar', coords: [22.6210, 88.4120], desc: 'Dum Dum-Jessore Road Crossroads', badge: 'Hub', terms: ['nagerbazar', 'nager bazar', 'dum dum road'] },
  { name: 'Diamond Plaza Mall', coords: [22.6190, 88.4130], desc: 'Jessore Road · Mall & Parking', badge: 'Mall', terms: ['diamond plaza', 'diamond plaza mall', 'satgachi'] },
  { name: 'Ultadanga', coords: [22.5950, 88.3880], desc: 'Hudco Crossing & Telengabagan', badge: 'Hub', terms: ['ultadanga', 'hudco', 'hudco crossing', 'telengabagan', 'telanga bagan'] },
  { name: 'Bidhannagar Road Station', coords: [22.5910, 88.3900], desc: 'Ultadanga Eastern Railway Junction', badge: 'Terminal', terms: ['bidhannagar road', 'bidhannagar station', 'ultadanga station'] },
  { name: 'Golaghata', coords: [22.5990, 88.3960], desc: 'VIP Road & Ultadanga Canal', badge: 'Place', terms: ['golaghata', 'dakshindari'] },

  // Salt Lake (Bidhannagar)
  { name: 'Salt Lake City Centre 1', coords: [22.5888, 88.4089], desc: 'DC Block, Sector 1 · Salt Lake Hub', badge: 'Mall', terms: ['city centre 1', 'city centre i', 'city centre salt lake', 'cc1', 'salt lake city centre'] },
  { name: 'Salt Lake Sector 5', coords: [22.5750, 88.4350], desc: 'College More, Webel & IT Corridor', badge: 'Hub', terms: ['sector 5', 'sector v', 'salt lake sector 5', 'salt lake sector v', 'college more', 'webel more'] },
  { name: 'Salt Lake FD Block', coords: [22.5750, 88.4120], desc: 'Sector 3 · Iconic Durga Puja Hub', badge: 'Place', terms: ['fd block', 'salt lake fd block', 'sector 3 salt lake'] },
  { name: 'Salt Lake BJ Block', coords: [22.5870, 88.4180], desc: 'Sector 2 · Iconic Durga Puja Hub', badge: 'Place', terms: ['bj block', 'salt lake bj block'] },
  { name: 'Salt Lake AJ Block', coords: [22.5890, 88.4190], desc: 'Sector 2 · Traditional Wooden Mandap', badge: 'Place', terms: ['aj block', 'salt lake aj block'] },
  { name: 'Salt Lake AK Block', coords: [22.5870, 88.4210], desc: 'Sector 2 · Folk Craft Puja', badge: 'Place', terms: ['ak block', 'salt lake ak block'] },
  { name: 'Salt Lake Labony Estate', coords: [22.5880, 88.4120], desc: 'Sector 1 · Near CC1 Mall', badge: 'Place', terms: ['labony', 'labony estate', 'salt lake sector 1'] },
  { name: 'Salt Lake Stadium', coords: [22.5711, 88.4042], desc: 'Vivekananda Yuba Bharati Krirangan', badge: 'Hub', terms: ['salt lake stadium', 'yuba bharati', 'stadium salt lake'] },
  { name: 'Karunamoyee Central Bus Station', coords: [22.5880, 88.4239], desc: 'Interstate Bus Terminus · Salt Lake', badge: 'Terminal', terms: ['karunamoyee bus stand', 'karunamoyee bus terminus', 'karunamoyee'] },

  // North Kolkata Heritage
  { name: 'Shyambazar 5-Point Crossing', coords: [22.6033, 88.3703], desc: 'Netaji Statue & North Kolkata Hub', badge: 'Hub', terms: ['shyambazar', 'shambazar', 'shyambazar five point', 'shyambazar 5 point'] },
  { name: 'Hatibagan', coords: [22.5990, 88.3700], desc: 'Star Theatre & Shopping Corridor', badge: 'Hub', terms: ['hatibagan', 'star theatre', 'hatibagan market'] },
  { name: 'Bagbazar Ghat', coords: [22.6040, 88.3610], desc: 'Historic Riverfront Ghat & Girish Mancha', badge: 'Place', terms: ['bagbazar ghat', 'bagbazar', 'girish mancha'] },
  { name: 'Sovabazar Rajbari', coords: [22.5960, 88.3650], desc: 'Historic Palace Puja (est. 1757)', badge: 'Heritage', terms: ['sovabazar rajbari', 'shobhabazar rajbari', 'sovabazar', 'shobhabazar'] },
  { name: 'Kumartuli Ghat', coords: [22.6010, 88.3640], desc: 'Artisans Village & Clay Idol Studios', badge: 'Heritage', terms: ['kumartuli', 'kumartoli', 'kumartuli park'] },
  { name: 'Ahiritola', coords: [22.5950, 88.3610], desc: 'Ahiritola Launch Ghat & Jubak Brindra', badge: 'Place', terms: ['ahiritola', 'ahiritola ghat'] },
  { name: 'Tala Prattay & Tala Park', coords: [22.6080, 88.3770], desc: 'Tala Water Tank & Indira Cinema', badge: 'Place', terms: ['tala', 'tala prattay', 'tala park', 'tala tank'] },
  { name: 'Paikpara', coords: [22.6100, 88.3840], desc: 'Belgachia Milk Colony & North Hub', badge: 'Place', terms: ['paikpara', 'belgachia sadharan'] },
  { name: 'Kolkata Railway Station (Chitpur)', coords: [22.6040, 88.3790], desc: 'Terminal for North & East trains', badge: 'Terminal', terms: ['kolkata station', 'chitpur station', 'chitpore'] },
  { name: 'RG Kar Medical College', coords: [22.6040, 88.3750], desc: 'Belgachia-Shyambazar Hospital Zone', badge: 'Place', terms: ['rg kar', 'r g kar', 'rg kar medical college'] },
  { name: 'Dunlop Crossing', coords: [22.6530, 88.3750], desc: 'BT Road & Belgharia Expressway Hub', badge: 'Hub', terms: ['dunlop', 'dunlop bridge', 'dunlop crossing', 'baroaritala dunlop'] },
  { name: 'Dakshineswar Temple', coords: [22.6533, 88.3580], desc: 'Kali Temple & Skywalk Terminal', badge: 'Heritage', terms: ['dakshineswar', 'dakshineswar temple', 'dakshineswar skywalk'] },
  { name: 'Belgharia', coords: [22.6640, 88.3850], desc: 'BT Road & Rathtala Crossing', badge: 'Place', terms: ['belgharia', 'rathtala', 'belgharia rathtala'] },
  { name: 'Sodepur', coords: [22.7000, 88.3850], desc: 'BT Road Traffic More', badge: 'Place', terms: ['sodepur', 'sodepur traffic more', 'panihati'] },
  { name: 'Baranagar', coords: [22.6416, 88.3664], desc: 'BT Road, Netaji Colony & Dunlop South', badge: 'Place', terms: ['baranagar', 'bonhooghly', 'netaji colony low land'] },

  // Central Kolkata & Riverfront
  { name: 'Howrah Railway Station', coords: [22.5847, 88.3426], desc: 'Iconic Grand Rail & Ferry Terminal', badge: 'Terminal', terms: ['howrah station', 'howrah railway station', 'howrah rly stn', 'howrah'] },
  { name: 'Howrah Maidan', coords: [22.5838, 88.3262], desc: 'GT Road & Howrah Metro Terminal', badge: 'Hub', terms: ['howrah maidan', 'gt road howrah'] },
  { name: 'Shibpur & Mandirtala', coords: [22.5620, 88.3190], desc: 'Nabanna & 2nd Hooghly Bridge Toll', badge: 'Hub', terms: ['shibpur', 'mandirtala', 'nabanna', 'vidyasagar setu howrah'] },
  { name: 'Sealdah Railway Station', coords: [22.5672, 88.3712], desc: 'Central Rail Terminal & Metro Hub', badge: 'Terminal', terms: ['sealdah', 'sealdah station', 'sealdah railway station'] },
  { name: 'Santosh Mitra Square', coords: [22.5670, 88.3670], desc: 'Lebutala, Sealdah · Light & Laser Spectacle', badge: 'Place', terms: ['santosh mitra square', 'santosh mitra sq', 'lebutala', 'muchipara'] },
  { name: 'Md Ali Park', coords: [22.5800, 88.3610], desc: 'MG Road · Grand Temple Architecture', badge: 'Place', terms: ['md ali park', 'mohammad ali park', 'mg road park'] },
  { name: 'College Street Boi Para', coords: [22.5760, 88.3630], desc: 'Presidency & Calcutta University', badge: 'Heritage', terms: ['college street', 'boi para', 'presidency', 'calcutta university'] },
  { name: 'Burrabazar', coords: [22.5830, 88.3550], desc: 'Barabazar Trade Hub & Posta', badge: 'Hub', terms: ['burrabazar', 'barabazar', 'posta', 'satyanarayan park'] },
  { name: 'Esplanade (Dharmatala)', coords: [22.5639, 88.3516], desc: 'Kolkata Central Transit Heart', badge: 'Hub', terms: ['esplanade', 'dharmatala', 'curzon park', 'dharamtalla', 'esplanade bus terminus'] },
  { name: 'Dalhousie (BBD Bagh)', coords: [22.5720, 88.3470], desc: 'Writers Building & Colonial Core', badge: 'Heritage', terms: ['dalhousie', 'bbd bagh', 'b b d bagh', 'writers building', 'gpo kolkata'] },
  { name: 'Princep Ghat', coords: [22.5550, 88.3320], desc: 'Riverfront Promenade & Monument', badge: 'Heritage', terms: ['princep ghat', 'prinsep ghat', 'strand road'] },
  { name: 'Babughat', coords: [22.5670, 88.3410], desc: 'Ganges Ferry Ghat & Bus Terminus', badge: 'Terminal', terms: ['babughat', 'babu ghat', 'eden gardens'] },
  { name: 'Victoria Memorial', coords: [22.5448, 88.3426], desc: 'Maidan & Queens Way', badge: 'Heritage', terms: ['victoria memorial', 'victoria', 'maidan', 'queens way'] },
  { name: 'Park Street', coords: [22.5528, 88.3516], desc: 'Camac St, Fine Dining & Lifestyle', badge: 'Hub', terms: ['park street', 'camac street', 'park st', 'flurys', 'stephen court'] },
  { name: 'Shakespeare Sarani (Theatre Rd)', coords: [22.5470, 88.3550], desc: 'Loudon St, Rawdon St & Commercial Hub', badge: 'Place', terms: ['theatre road', 'theatre rd', 'shakespeare sarani', 'loudon street'] },
  { name: 'Park Circus 7-Point', coords: [22.5420, 88.3670], desc: 'Syed Amir Ali Ave & Maa Flyover Ramp', badge: 'Hub', terms: ['park circus', 'park circus 7 point', '7 point crossing'] },
  { name: 'Quest Mall', coords: [22.5390, 88.3640], desc: 'Ballygunge-Park Circus Luxury Mall', badge: 'Mall', terms: ['quest mall', 'quest', 'beckbagan'] },
  { name: 'Phoolbagan Crossing', coords: [22.5714, 88.3892], desc: 'CIT Rd & Kankurgachi Link', badge: 'Hub', terms: ['phoolbagan', 'phulbagan', 'phoolbagan crossing'] },
  { name: 'Kankurgachi', coords: [22.5790, 88.3890], desc: 'Maniktala Main Rd & Commercial Hub', badge: 'Hub', terms: ['kankurgachi', 'kakurgachi', 'kankurgachi pantaloons'] },
  { name: 'Mani Square Mall', coords: [22.5780, 88.3980], desc: 'EM Bypass & Kankurgachi Mall', badge: 'Mall', terms: ['mani square', 'mani square mall', 'em bypass mani square'] },
  { name: 'Science City', coords: [22.5410, 88.3985], desc: 'EM Bypass & JBS Haldane Ave Crossing', badge: 'Hub', terms: ['science city', 'science city crossing', 'parama island'] },

  // South Kolkata
  { name: 'Gariahat Crossing', coords: [22.5180, 88.3650], desc: 'Ballygunge-Gariahat Shopping Heart', badge: 'Hub', terms: ['gariahat', 'gariahat crossing', 'gariahat flyover', 'ballygunge', 'gariahat market'] },
  { name: 'Maddox Square', coords: [22.5310, 88.3580], desc: 'Ritchie Road, Ballygunge · Sabeki Adda', badge: 'Place', terms: ['maddox square', 'maddox sq', 'ritchie road'] },
  { name: 'Ballygunge Phari', coords: [22.5270, 88.3640], desc: 'Hazra Rd & Broad St Intersection', badge: 'Hub', terms: ['ballygunge phari', 'ballygunge fari', 'phari'] },
  { name: 'Deshapriya Park', coords: [22.5180, 88.3550], desc: 'Rashbehari Avenue & Priya Cinema', badge: 'Place', terms: ['deshapriya park', 'deshapriya', 'priya cinema'] },
  { name: 'Tridhara Sammilani', coords: [22.5190, 88.3520], desc: 'Manoharpukur Road · Theme Powerhouse', badge: 'Place', terms: ['tridhara', 'tridhara sammilani', 'manoharpukur'] },
  { name: 'Ekdalia Evergreen & Singhi Park', coords: [22.5190, 88.3650], desc: 'Gariahat Heritage Pandal Hub', badge: 'Place', terms: ['ekdalia evergreen', 'ekdalia', 'singhi park', 'ballygunge cultural'] },
  { name: 'Rabindra Sadan & Exide', coords: [22.5385, 88.3468], desc: 'Nandan, Academy & AJC Bose Rd Hub', badge: 'Hub', terms: ['exide', 'exide crossing', 'rabindra sadan', 'nandan', 'sskm'] },
  { name: 'Bhowanipore', coords: [22.5310, 88.3450], desc: 'Harish Mukherjee Rd & 75 Pally', badge: 'Place', terms: ['bhowanipore', 'bhawanipur', 'harish mukherjee', '75 pally'] },
  { name: 'Hazra Crossing', coords: [22.5240, 88.3470], desc: 'SP Mukherjee Rd & Hazra Rd', badge: 'Hub', terms: ['hazra', 'hazra crossing', 'hazra road'] },
  { name: 'Kalighat Temple', coords: [22.5200, 88.3440], desc: 'Historic Shaktipeeth Temple', badge: 'Heritage', terms: ['kalighat temple', 'kalighat mandir', 'kalighat'] },
  { name: 'Rashbehari Avenue', coords: [22.5180, 88.3500], desc: 'Kalighat Metro to Gariahat Corridor', badge: 'Hub', terms: ['rashbehari', 'rashbehari avenue', 'rashbehari crossing'] },
  { name: 'Mudiali & Shib Mandir', coords: [22.5100, 88.3490], desc: 'Southern Avenue Pandal Cluster', badge: 'Place', terms: ['mudiali', 'mudiali club', 'shib mandir'] },
  { name: 'Southern Avenue', coords: [22.5110, 88.3530], desc: 'Lake Promenade & Sarobar Lake', badge: 'Place', terms: ['southern avenue', 'dr meghnad saha sarani', 'lake lovers lane'] },
  { name: 'Golpark & Dhakuria', coords: [22.5110, 88.3660], desc: 'Ramakrishna Mission Institute of Culture', badge: 'Hub', terms: ['golpark', 'gol park', 'dhakuria', 'dhakuria bridge'] },
  { name: 'Jodhpur Park', coords: [22.5030, 88.3620], desc: 'Jodhpur Park Boys School & South Hub', badge: 'Place', terms: ['jodhpur park', 'jodhpurpark'] },
  { name: 'Selimpur & Babubagan', coords: [22.5050, 88.3630], desc: 'Dhakuria South Pandal Hub', badge: 'Place', terms: ['selimpur', 'babubagan', 'salimpur'] },
  { name: 'South City Mall', coords: [22.4990, 88.3610], desc: 'Prince Anwar Shah Road · Mega Mall', badge: 'Mall', terms: ['south city', 'south city mall', 'prince anwar shah', 'anwar shah road'] },
  { name: 'Jadavpur 8B Bus Stand', coords: [22.4980, 88.3710], desc: 'Jadavpur University Central Hub', badge: 'Hub', terms: ['jadavpur 8b', 'jadavpur', 'jadavpur university', '8b bus stand'] },
  { name: 'Baghajatin', coords: [22.4870, 88.3770], desc: 'Baghajatin More & Railway Station', badge: 'Place', terms: ['baghajatin', 'baghajatin more'] },
  { name: 'Santoshpur', coords: [22.4950, 88.3900], desc: 'Jadavpur-EM Bypass Link', badge: 'Place', terms: ['santoshpur', 'santoshpur lake'] },
  { name: 'Alipore & National Library', coords: [22.5330, 88.3320], desc: 'Alipore Zoo, National Library & Belvedre', badge: 'Heritage', terms: ['alipore', 'alipore zoo', 'national library', 'belvedere'] },
  { name: 'New Alipore', coords: [22.5120, 88.3310], desc: 'Suruchi Sangha & Sahapur Corridor', badge: 'Place', terms: ['new alipore', 'suruchi sangha', 'sahapur'] },
  { name: 'Chetla', coords: [22.5160, 88.3380], desc: 'Chetla Agrani & Govinda Auddy Rd', badge: 'Place', terms: ['chetla', 'chetla agrani'] },
  { name: 'Ruby Hospital Crossing', coords: [22.5140, 88.4022], desc: 'EM Bypass, Ruby & Kasba Connector', badge: 'Hub', terms: ['ruby', 'ruby crossing', 'ruby hospital', 'kasba new market'] },
  { name: 'Kasba Bosepukur', coords: [22.5190, 88.3860], desc: 'Bosepukur Sitalatala & Talbagan', badge: 'Place', terms: ['kasba', 'bosepukur', 'sitalatala kasba'] },
  { name: 'Acropolis Mall', coords: [22.5150, 88.3930], desc: 'Rajdanga Main Road · Kasba Mall', badge: 'Mall', terms: ['acropolis', 'acropolis mall', 'rajdanga'] },
  { name: 'Tollygunge Phari', coords: [22.5040, 88.3420], desc: 'Tram Depot & Cinema Studios', badge: 'Hub', terms: ['tollygunge', 'tollygunge phari', 'tolly club'] },
  { name: 'Kudghat & Netaji', coords: [22.4862, 88.3470], desc: 'Kudghat Pragati Sangha & Chandi Ghosh Rd', badge: 'Place', terms: ['kudghat', 'kudghat pragati sangha'] },
  { name: 'Naktala Udayan Sangha', coords: [22.4674, 88.3619], desc: 'NSC Bose Road · Mega Pandal Hub', badge: 'Place', terms: ['naktala', 'naktala udayan sangha'] },
  { name: 'Garia Mahamayatala', coords: [22.4550, 88.3800], desc: 'Garia Crossing & Nabadurga', badge: 'Hub', terms: ['garia', 'garia more', 'mahamayatala', 'garia nabadurga'] },

  // South-West & Behala Corridor
  { name: 'Behala Chowrasta', coords: [22.4892, 88.3168], desc: 'Diamond Harbour Road Central Hub', badge: 'Hub', terms: ['behala chowrasta', 'chowrasta behala', 'chowrasta'] },
  { name: 'Behala Manton', coords: [22.4830, 88.3150], desc: 'Diamond Harbour Road Commercial Flank', badge: 'Place', terms: ['manton', 'behala manton'] },
  { name: 'Barisha', coords: [22.4780, 88.3140], desc: 'Barisha Club & Sabarna Roy Choudhury Bari', badge: 'Heritage', terms: ['barisha', 'barisha club', 'sabarna roy choudhury'] },
  { name: 'Sakherbazar', coords: [22.4722, 88.3128], desc: 'Diamond Harbour Road & Silpara', badge: 'Hub', terms: ['sakherbazar', 'sakher bazar', 'silpara'] },
  { name: 'Thakurpukur 3A Bus Stand', coords: [22.4566, 88.3088], desc: 'SB Park Sarbojanin & South-West Gateway', badge: 'Hub', terms: ['thakurpukur', 'sb park', '3a bus stand'] },
  { name: 'Joka', coords: [22.4385, 88.3039], desc: 'IIM Calcutta & Diamond Harbour Rd', badge: 'Place', terms: ['joka', 'iim calcutta'] },
  { name: 'Taratala', coords: [22.5083, 88.3214], desc: 'Taratala Flyover & Hyde Road Crossing', badge: 'Hub', terms: ['taratala', 'taratala crossing', 'taratala flyover'] },
  { name: 'Khidirpur (Kidderpore)', coords: [22.5360, 88.3240], desc: '5-Point Crossing & Fancy Market', badge: 'Hub', terms: ['khidirpur', 'kidderpore', 'fancy market', 'bhukailash'] },
  { name: 'Haridevpur', coords: [22.4850, 88.3300], desc: '41 Pally & Ajeya Sangha Hub', badge: 'Place', terms: ['haridevpur', '41 pally', 'ajeya sangha'] }
];

// Great-Circle distance formula (Haversine) in Kilometers
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// In-memory cache for user's detected GPS coordinates
let userGpsCoords = null;
let userGpsLabel = null;

export function setUserGps(coords, label = 'My Current Location') {
  userGpsCoords = coords;
  userGpsLabel = label;
}

export function getUserGps() {
  return userGpsCoords ? { coords: userGpsCoords, label: userGpsLabel } : null;
}

export function matchesTerm(text, term) {
  if (!text || !term) return false;
  const t = term.trim().toLowerCase();
  const s = text.toLowerCase();
  if (t.length < 3) return false;
  if (t.includes(' ')) return s.includes(t);
  const regex = new RegExp('(?:^|[^a-z0-9])' + t + '(?:[^a-z0-9]|$)', 'i');
  return regex.test(s);
}

const BROAD_AREAS = new Set([
  'rajarhat', 'salt lake', 'new town', 'kolkata', 'north kolkata', 'south kolkata', 'central kolkata', 'east kolkata'
]);

// Map any pandal to accurate [lat, lng] using multi-tier specificity scoring
export function getPandalCoords(p) {
  if (!p) return [22.5726, 88.3639]; // Default Central Kolkata

  const name = p.name || '';
  const area = p.area || '';
  const locality = area.split(',')[0].trim();

  let bestPlace = null;
  let bestScore = -1;

  for (const place of KOLKATA_PLACES) {
    for (const term of place.terms) {
      const isBroad = BROAD_AREAS.has(term.toLowerCase());
      let score = 0;
      if (matchesTerm(name, term)) {
        score = isBroad ? 10 : 300 + term.length * 2;
      } else if (matchesTerm(locality, term)) {
        score = isBroad ? 8 : 200 + term.length * 2;
      } else if (matchesTerm(area, term)) {
        score = isBroad ? 5 : 50 + term.length;
      }
      if (score > bestScore) {
        bestScore = score;
        bestPlace = place;
      }
    }
  }

  if (bestPlace && bestScore > 0) {
    return bestPlace.coords;
  }

  // 2. Fall back to nearest station coords
  if (p.station && STATION_COORDS[p.station]) {
    return STATION_COORDS[p.station];
  }

  // 3. Fallback to Central Kolkata
  return [22.5726, 88.3639];
}

// Resolve any arbitrary user input into coordinates [lat, lng, displayName]
export function resolvePlaceCoords(query) {
  if (!query || typeof query !== 'string') return null;
  const text = query.trim();
  const lower = text.toLowerCase();

  // If user location is active and query refers to "My Location" or "Current Location"
  if (lower.includes('current location') || lower.includes('my location') || lower.includes('near me')) {
    if (userGpsCoords) {
      return {
        coords: userGpsCoords,
        name: userGpsLabel || 'My Current Location',
        isGps: true
      };
    }
  }

  // 1. Direct match with Metro Station
  for (const [station, coords] of Object.entries(STATION_COORDS)) {
    if (lower === station.toLowerCase() || lower === `${station.toLowerCase()} metro` || lower === `${station.toLowerCase()} metro station`) {
      return { coords, name: `${station} Metro Station`, isStation: true, station };
    }
  }

  // 2. Exact or high-confidence match with Kolkata Places database
  for (const place of KOLKATA_PLACES) {
    if (place.terms.some((t) => lower === t || lower.startsWith(t) || lower.endsWith(t))) {
      return { coords: place.coords, name: place.name, isPlace: true };
    }
  }

  // 3. Substring match with Kolkata Places database
  for (const place of KOLKATA_PLACES) {
    if (place.terms.some((t) => lower.includes(t))) {
      return { coords: place.coords, name: place.name, isPlace: true };
    }
  }

  // 4. Substring match with Metro Stations
  for (const [station, coords] of Object.entries(STATION_COORDS)) {
    if (lower.includes(station.toLowerCase())) {
      return { coords, name: `${station} Metro Station`, isStation: true, station };
    }
  }

  // 5. Regional keyword fuzzy match
  const REGIONAL_CLUSTERS = [
    { terms: ['rajarhat', 'chinar', 'airport', 'kaikhali', 'tegharia', 'dashadrone', 'arjunpur', 'bablatala', 'reckjoani', 'salua', 'bishnupur'], coords: [22.6256, 88.4468], name: 'Chinar Park / Rajarhat' },
    { terms: ['new town', 'newtown', 'action area', 'eco park', 'uniworld', 'ecospace'], coords: [22.5855, 88.4680], name: 'New Town City Square' },
    { terms: ['salt lake', 'bidhannagar', 'karunamoyee', 'sector 5', 'sector v', 'central park', 'fd block', 'bj block'], coords: [22.5888, 88.4089], name: 'Salt Lake City Centre' },
    { terms: ['lake town', 'sree bhumi', 'sreebhumi', 'bangur', 'dum dum park'], coords: [22.6040, 88.4025], name: 'Lake Town / Sree Bhumi' },
    { terms: ['dum dum', 'dumdum', 'nagerbazar', 'cantonment', 'jessore road'], coords: [22.6219, 88.3934], name: 'Dum Dum Station' },
    { terms: ['shyambazar', 'hatibagan', 'bagbazar', 'tala', 'sovabazar', 'kumartuli', 'paikpara', 'belgachia'], coords: [22.6033, 88.3703], name: 'Shyambazar' },
    { terms: ['howrah', 'shibpur', 'mandirtala', 'salkia', 'belur'], coords: [22.5847, 88.3426], name: 'Howrah Station' },
    { terms: ['sealdah', 'santosh mitra', 'lebutala', 'muchipara', 'beliaghata', 'phoolbagan', 'kankurgachi'], coords: [22.5672, 88.3712], name: 'Sealdah' },
    { terms: ['esplanade', 'dharmatala', 'dalhousie', 'bbd bagh', 'chandni', 'mg road', 'burrabazar', 'college street'], coords: [22.5639, 88.3516], name: 'Esplanade / Central Kolkata' },
    { terms: ['park street', 'camac', 'theatre road', 'park circus', 'quest mall'], coords: [22.5528, 88.3516], name: 'Park Street' },
    { terms: ['ballygunge', 'gariahat', 'maddox', 'singhi park', 'ekdalia', 'tridhara', 'deshapriya', 'hindustan park'], coords: [22.5180, 88.3650], name: 'Gariahat / Ballygunge' },
    { terms: ['kalighat', 'rashbehari', 'hazra', 'bhowanipore', 'southern avenue', 'mudiali', 'shib mandir', 'lake gardens'], coords: [22.5181, 88.3469], name: 'Kalighat' },
    { terms: ['alipore', 'new alipore', 'chetla', 'suruchi'], coords: [22.5120, 88.3310], name: 'New Alipore / Chetla' },
    { terms: ['behala', 'chowrasta', 'sakherbazar', 'barisha', 'thakurpukur', 'joka', 'taratala', 'manton'], coords: [22.4892, 88.3168], name: 'Behala Chowrasta' },
    { terms: ['jadavpur', 'santoshpur', 'baghajatin', 'south city', 'anwar shah', 'dhakuria', 'jodhpur park'], coords: [22.4980, 88.3710], name: 'Jadavpur' },
    { terms: ['tollygunge', 'kudghat', 'naktala', 'bansdroni', 'garia', 'ranikuthi'], coords: [22.4674, 88.3619], name: 'Naktala / Garia' },
    { terms: ['ruby', 'kasba', 'bosepukur', 'acropolis', 'em bypass', 'science city', 'topsia', 'tangra'], coords: [22.5140, 88.4022], name: 'Ruby / Kasba' },
    { terms: ['dunlop', 'baranagar', 'dakshineswar', 'belgharia', 'sodepur', 'agarpara'], coords: [22.6530, 88.3750], name: 'Dunlop' }
  ];

  for (const cl of REGIONAL_CLUSTERS) {
    if (cl.terms.some((t) => lower.includes(t))) {
      return { coords: cl.coords, name: text, isPlace: true };
    }
  }

  // Fallback: If not found in Kolkata clusters, anchor to Central Kolkata (Esplanade)
  return { coords: [22.5639, 88.3516], name: text, isGeneric: true };
}

// Find nearby pandals around given coordinates [lat, lng]
export function findNearbyPandals(coords, pandals, maxRadiusKm = 4.5, limit = 15) {
  if (!coords || !Array.isArray(pandals)) return [];
  const [lat, lng] = coords;

  const withDist = pandals.map((p) => {
    const pCoords = getPandalCoords(p);
    const dist = haversine(lat, lng, pCoords[0], pCoords[1]);
    return {
      pandal: p,
      dist,
      distFormatted: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
      walkMin: Math.max(3, Math.round(dist * 12)) // ~12 min per km
    };
  });

  return withDist
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit);
}

// Find pandals en-route between Start and End coordinates
export function findPandalsOnRoute(startCoords, endCoords, pandals, maxStops = 10) {
  if (!startCoords || !Array.isArray(pandals)) return [];
  const [sLat, sLng] = startCoords;

  // Case 1: Only Start point provided (no destination)
  if (!endCoords) {
    const nearby = findNearbyPandals(startCoords, pandals, 5.0, maxStops);
    return nearby.map((n) => n.pandal);
  }

  const [eLat, eLng] = endCoords;
  const directDist = haversine(sLat, sLng, eLat, eLng);

  // If Start and End are practically the same spot (< 0.8 km)
  if (directDist < 0.8) {
    const nearby = findNearbyPandals(startCoords, pandals, 4.0, maxStops);
    return nearby.map((n) => n.pandal);
  }

  // Vector math in local Kolkata Cartesian projection (km)
  // 1 deg latitude ≈ 110.8 km, 1 deg longitude ≈ 102.3 km at ~22.5°N
  const scaleY = 110.8;
  const scaleX = 102.3;

  const dxAB = (eLng - sLng) * scaleX;
  const dyAB = (eLat - sLat) * scaleY;
  const lengthSqAB = dxAB * dxAB + dyAB * dyAB;
  const lengthAB = Math.sqrt(lengthSqAB);

  // Dynamic corridor tolerance based on route length
  // e.g. short routes (3km) have ~1.8km corridor; longer routes (15km) have ~3.5km corridor
  const maxLateralDist = Math.max(1.8, Math.min(3.5, lengthAB * 0.28));
  const maxDetour = Math.max(2.2, lengthAB * 0.42);

  const candidates = [];

  for (const p of pandals) {
    const [pLat, pLng] = getPandalCoords(p);
    const dStart = haversine(sLat, sLng, pLat, pLng);
    const dEnd = haversine(pLat, pLng, eLat, eLng);
    const detour = (dStart + dEnd) - directDist;

    // Projection along vector AB
    const dxAP = (pLng - sLng) * scaleX;
    const dyAP = (pLat - sLat) * scaleY;

    // t: normalized progress along segment AB (0 = start, 1 = end)
    const t = lengthSqAB > 0 ? (dxAP * dxAB + dyAP * dyAB) / lengthSqAB : 0;

    // Cross-track lateral distance from line AB (km)
    const lateralDist = lengthAB > 0 ? Math.abs(dxAP * dyAB - dyAP * dxAB) / lengthAB : dStart;

    const isNearStartOrEnd = dStart <= 1.4 || dEnd <= 1.4;
    const isEnRoute = (t >= -0.12 && t <= 1.15 && lateralDist <= maxLateralDist && detour <= maxDetour) || isNearStartOrEnd;

    if (isEnRoute) {
      candidates.push({
        pandal: p,
        dStart,
        dEnd,
        detour,
        t,
        lateralDist,
        score: t * 10 + (p.must ? -0.8 : 0) // progress priority with gentle must-visit boost
      });
    }
  }

  // Sort candidates strictly along route progress (Start to End)
  candidates.sort((a, b) => a.score - b.score || a.dStart - b.dStart);

  // If too many pandals match, sample evenly across the route progression (Start to End)
  let selected = candidates;
  if (candidates.length > maxStops) {
    const buckets = Array.from({ length: maxStops }, () => []);
    candidates.forEach((c) => {
      const bucketIdx = Math.max(0, Math.min(maxStops - 1, Math.floor(c.t * maxStops)));
      buckets[bucketIdx].push(c);
    });

    const chosen = [];
    buckets.forEach((bucket) => {
      if (bucket.length > 0) {
        // Pick best in each segment: must-visits first, then lowest lateral distance
        bucket.sort((a, b) => (b.pandal.must ? 1 : 0) - (a.pandal.must ? 1 : 0) || a.lateralDist - b.lateralDist);
        chosen.push(bucket[0]);
      }
    });

    if (chosen.length < maxStops) {
      const chosenIds = new Set(chosen.map((c) => c.pandal.id));
      const remainingCandidates = candidates.filter((c) => !chosenIds.has(c.pandal.id));
      remainingCandidates.sort((a, b) => (b.pandal.must ? 1 : 0) - (a.pandal.must ? 1 : 0) || a.detour - b.detour);
      while (chosen.length < maxStops && remainingCandidates.length > 0) {
        chosen.push(remainingCandidates.shift());
      }
    }

    selected = chosen.sort((a, b) => a.t - b.t || a.dStart - b.dStart);
  }

  // Optimize sequence from Start towards End using greedy nearest neighbor
  let currCoords = [sLat, sLng];
  const remaining = [...selected];
  const ordered = [];

  while (remaining.length > 0) {
    remaining.sort((a, b) => {
      const cA = getPandalCoords(a.pandal);
      const cB = getPandalCoords(b.pandal);
      const distA = haversine(currCoords[0], currCoords[1], cA[0], cA[1]);
      const distB = haversine(currCoords[0], currCoords[1], cB[0], cB[1]);
      // Weight moving forward towards end
      const costA = distA + a.dEnd * 0.35;
      const costB = distB + b.dEnd * 0.35;
      return costA - costB;
    });

    const next = remaining.shift();
    ordered.push(next.pandal);
    currCoords = getPandalCoords(next.pandal);
  }

  return ordered;
}

// Request user location with browser Geolocation API
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];

        // Find nearest known place in Kolkata to give a human label
        let closestPlace = null;
        let minDist = Infinity;
        for (const place of KOLKATA_PLACES) {
          const d = haversine(coords[0], coords[1], place.coords[0], place.coords[1]);
          if (d < minDist) {
            minDist = d;
            closestPlace = place;
          }
        }

        let label = 'My Current Location';
        if (closestPlace && minDist <= 1.5) {
          label = `Near ${closestPlace.name} (My Location)`;
        } else if (closestPlace && minDist <= 3.5) {
          label = `${closestPlace.name} Area (My Location)`;
        }

        setUserGps(coords, label);
        resolve({ coords, label, distFromKnown: minDist, accuracy: pos.coords.accuracy });
      },
      (err) => {
        let msg = 'Could not get your location.';
        if (err.code === 1) msg = 'Location permission was denied. Please allow location access or type your area above.';
        else if (err.code === 2) msg = 'Location is unavailable. Please check your GPS or internet connection.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again.';
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}
