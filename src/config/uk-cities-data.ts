// UK Cities Geo Data Configuration
// Comprehensive data for all UK cities with coordinates and details

export interface CityGeoData {
  name: string;
  region: string;
  country: string;
  geo: {
    latitude: number;
    longitude: number;
  };
  population: string;
  telephone: string;
}

export const UK_CITIES_GEO_DATA: Record<string, CityGeoData> = {
  'aberdeen': {
    name: 'Aberdeen',
    region: 'Aberdeenshire',
    country: 'Scotland',
    geo: { latitude: 57.1497, longitude: -2.0943 },
    population: '198,590',
    telephone: '+44 1224 XXX XXXX'
  },
  'armagh': {
    name: 'Armagh',
    region: 'County Armagh',
    country: 'Northern Ireland',
    geo: { latitude: 54.3503, longitude: -6.6528 },
    population: '14,777',
    telephone: '+44 28 XXXX XXXX'
  },
  'bangor-wales': {
    name: 'Bangor',
    region: 'Gwynedd',
    country: 'Wales',
    geo: { latitude: 53.2281, longitude: -4.1281 },
    population: '18,322',
    telephone: '+44 1248 XXX XXXX'
  },
  'bangor-northern-ireland': {
    name: 'Bangor',
    region: 'County Down',
    country: 'Northern Ireland',
    geo: { latitude: 54.6539, longitude: -5.6689 },
    population: '58,388',
    telephone: '+44 28 XXXX XXXX'
  },
  'bath': {
    name: 'Bath',
    region: 'Somerset',
    country: 'England',
    geo: { latitude: 51.3811, longitude: -2.3590 },
    population: '94,782',
    telephone: '+44 1225 XXX XXXX'
  },
  'belfast': {
    name: 'Belfast',
    region: 'County Antrim',
    country: 'Northern Ireland',
    geo: { latitude: 54.5973, longitude: -5.9301 },
    population: '343,542',
    telephone: '+44 28 XXXX XXXX'
  },
  'birmingham': {
    name: 'Birmingham',
    region: 'West Midlands',
    country: 'England',
    geo: { latitude: 52.4862, longitude: -1.8904 },
    population: '1,144,919',
    telephone: '+44 121 XXX XXXX'
  },
  'bradford': {
    name: 'Bradford',
    region: 'West Yorkshire',
    country: 'England',
    geo: { latitude: 53.7960, longitude: -1.7594 },
    population: '537,173',
    telephone: '+44 1274 XXX XXXX'
  },
  'brighton-and-hove': {
    name: 'Brighton and Hove',
    region: 'East Sussex',
    country: 'England',
    geo: { latitude: 50.8225, longitude: -0.1372 },
    population: '290,395',
    telephone: '+44 1273 XXX XXXX'
  },
  'bristol': {
    name: 'Bristol',
    region: 'South Gloucestershire',
    country: 'England',
    geo: { latitude: 51.4545, longitude: -2.5879 },
    population: '467,099',
    telephone: '+44 117 XXX XXXX'
  },
  'cambridge': {
    name: 'Cambridge',
    region: 'Cambridgeshire',
    country: 'England',
    geo: { latitude: 52.2053, longitude: 0.1218 },
    population: '145,818',
    telephone: '+44 1223 XXX XXXX'
  },
  'canterbury': {
    name: 'Canterbury',
    region: 'Kent',
    country: 'England',
    geo: { latitude: 51.2802, longitude: 1.0789 },
    population: '55,240',
    telephone: '+44 1227 XXX XXXX'
  },
  'cardiff': {
    name: 'Cardiff',
    region: 'South Glamorgan',
    country: 'Wales',
    geo: { latitude: 51.4816, longitude: -3.1791 },
    population: '366,903',
    telephone: '+44 29 XXXX XXXX'
  },
  'carlisle': {
    name: 'Carlisle',
    region: 'Cumbria',
    country: 'England',
    geo: { latitude: 54.8951, longitude: -2.9440 },
    population: '75,306',
    telephone: '+44 1228 XXX XXXX'
  },
  'chelmsford': {
    name: 'Chelmsford',
    region: 'Essex',
    country: 'England',
    geo: { latitude: 51.7356, longitude: 0.4685 },
    population: '110,507',
    telephone: '+44 1245 XXX XXXX'
  },
  'chester': {
    name: 'Chester',
    region: 'Cheshire',
    country: 'England',
    geo: { latitude: 53.1908, longitude: -2.8909 },
    population: '79,645',
    telephone: '+44 1244 XXX XXXX'
  },
  'chichester': {
    name: 'Chichester',
    region: 'West Sussex',
    country: 'England',
    geo: { latitude: 50.8367, longitude: -0.7790 },
    population: '26,795',
    telephone: '+44 1243 XXX XXXX'
  },
  'city-of-london': {
    name: 'City of London',
    region: 'Greater London',
    country: 'England',
    geo: { latitude: 51.5155, longitude: -0.0922 },
    population: '8,706',
    telephone: '+44 20 XXXX XXXX'
  },
  'city-of-westminster': {
    name: 'City of Westminster',
    region: 'Greater London',
    country: 'England',
    geo: { latitude: 51.4994, longitude: -0.1245 },
    population: '261,317',
    telephone: '+44 20 XXXX XXXX'
  },
  'colchester': {
    name: 'Colchester',
    region: 'Essex',
    country: 'England',
    geo: { latitude: 51.8959, longitude: 0.9034 },
    population: '194,706',
    telephone: '+44 1206 XXX XXXX'
  },
  'coventry': {
    name: 'Coventry',
    region: 'West Midlands',
    country: 'England',
    geo: { latitude: 52.4068, longitude: -1.5197 },
    population: '366,785',
    telephone: '+44 24 XXXX XXXX'
  },
  'derby': {
    name: 'Derby',
    region: 'Derbyshire',
    country: 'England',
    geo: { latitude: 52.9225, longitude: -1.4746 },
    population: '255,394',
    telephone: '+44 1332 XXX XXXX'
  },
  'derry': {
    name: 'Derry',
    region: 'County Londonderry',
    country: 'Northern Ireland',
    geo: { latitude: 54.9966, longitude: -7.3086 },
    population: '85,016',
    telephone: '+44 28 XXXX XXXX'
  },
  'doncaster': {
    name: 'Doncaster',
    region: 'South Yorkshire',
    country: 'England',
    geo: { latitude: 53.5228, longitude: -1.1288 },
    population: '109,805',
    telephone: '+44 1302 XXX XXXX'
  },
  'dundee': {
    name: 'Dundee',
    region: 'Angus',
    country: 'Scotland',
    geo: { latitude: 56.4620, longitude: -2.9707 },
    population: '148,210',
    telephone: '+44 1382 XXX XXXX'
  },
  'dunfermline': {
    name: 'Dunfermline',
    region: 'Fife',
    country: 'Scotland',
    geo: { latitude: 56.0716, longitude: -3.4523 },
    population: '58,508',
    telephone: '+44 1383 XXX XXXX'
  },
  'durham': {
    name: 'Durham',
    region: 'County Durham',
    country: 'England',
    geo: { latitude: 54.7752, longitude: -1.5849 },
    population: '48,069',
    telephone: '+44 191 XXX XXXX'
  },
  'edinburgh': {
    name: 'Edinburgh',
    region: 'City of Edinburgh',
    country: 'Scotland',
    geo: { latitude: 55.9533, longitude: -3.1883 },
    population: '506,520',
    telephone: '+44 131 XXX XXXX'
  },
  'ely': {
    name: 'Ely',
    region: 'Cambridgeshire',
    country: 'England',
    geo: { latitude: 52.3994, longitude: 0.2624 },
    population: '20,256',
    telephone: '+44 1353 XXX XXXX'
  },
  'exeter': {
    name: 'Exeter',
    region: 'Devon',
    country: 'England',
    geo: { latitude: 50.7184, longitude: -3.5339 },
    population: '130,428',
    telephone: '+44 1392 XXX XXXX'
  },
  'glasgow': {
    name: 'Glasgow',
    region: 'Glasgow City',
    country: 'Scotland',
    geo: { latitude: 55.8642, longitude: -4.2518 },
    population: '635,640',
    telephone: '+44 141 XXX XXXX'
  },
  'gloucester': {
    name: 'Gloucester',
    region: 'Gloucestershire',
    country: 'England',
    geo: { latitude: 51.8642, longitude: -2.2381 },
    population: '121,688',
    telephone: '+44 1452 XXX XXXX'
  },
  'hereford': {
    name: 'Hereford',
    region: 'Herefordshire',
    country: 'England',
    geo: { latitude: 52.0567, longitude: -2.7158 },
    population: '60,800',
    telephone: '+44 1432 XXX XXXX'
  },
  'inverness': {
    name: 'Inverness',
    region: 'Highland',
    country: 'Scotland',
    geo: { latitude: 57.4778, longitude: -4.2247 },
    population: '47,290',
    telephone: '+44 1463 XXX XXXX'
  },
  'kingston-upon-hull': {
    name: 'Kingston upon Hull',
    region: 'East Riding of Yorkshire',
    country: 'England',
    geo: { latitude: 53.7676, longitude: -0.3274 },
    population: '314,018',
    telephone: '+44 1482 XXX XXXX'
  },
  'lancaster': {
    name: 'Lancaster',
    region: 'Lancashire',
    country: 'England',
    geo: { latitude: 54.0469, longitude: -2.8007 },
    population: '52,234',
    telephone: '+44 1524 XXX XXXX'
  },
  'leeds': {
    name: 'Leeds',
    region: 'West Yorkshire',
    country: 'England',
    geo: { latitude: 53.8008, longitude: -1.5491 },
    population: '789,194',
    telephone: '+44 113 XXX XXXX'
  },
  'leicester': {
    name: 'Leicester',
    region: 'Leicestershire',
    country: 'England',
    geo: { latitude: 52.6369, longitude: -1.1398 },
    population: '508,916',
    telephone: '+44 116 XXX XXXX'
  },
  'lichfield': {
    name: 'Lichfield',
    region: 'Staffordshire',
    country: 'England',
    geo: { latitude: 52.6833, longitude: -1.8167 },
    population: '33,816',
    telephone: '+44 1543 XXX XXXX'
  },
  'lincoln': {
    name: 'Lincoln',
    region: 'Lincolnshire',
    country: 'England',
    geo: { latitude: 53.2307, longitude: -0.5408 },
    population: '100,160',
    telephone: '+44 1522 XXX XXXX'
  },
  'lisburn': {
    name: 'Lisburn',
    region: 'County Antrim',
    country: 'Northern Ireland',
    geo: { latitude: 54.5139, longitude: -6.0433 },
    population: '45,370',
    telephone: '+44 28 XXXX XXXX'
  },
  'liverpool': {
    name: 'Liverpool',
    region: 'Merseyside',
    country: 'England',
    geo: { latitude: 53.4084, longitude: -2.9916 },
    population: '498,042',
    telephone: '+44 151 XXX XXXX'
  },
  'london': {
    name: 'London',
    region: 'Greater London',
    country: 'England',
    geo: { latitude: 51.5074, longitude: -0.1278 },
    population: '9,002,488',
    telephone: '+44 20 XXXX XXXX'
  },
  'manchester': {
    name: 'Manchester',
    region: 'Greater Manchester',
    country: 'England',
    geo: { latitude: 53.4808, longitude: -2.2426 },
    population: '547,627',
    telephone: '+44 161 XXX XXXX'
  },
  'milton-keynes': {
    name: 'Milton Keynes',
    region: 'Buckinghamshire',
    country: 'England',
    geo: { latitude: 52.0406, longitude: -0.7594 },
    population: '229,941',
    telephone: '+44 1908 XXX XXXX'
  },
  'newcastle-upon-tyne': {
    name: 'Newcastle upon Tyne',
    region: 'Tyne and Wear',
    country: 'England',
    geo: { latitude: 54.9783, longitude: -1.6178 },
    population: '300,196',
    telephone: '+44 191 XXX XXXX'
  },
  'newport': {
    name: 'Newport',
    region: 'South Wales',
    country: 'Wales',
    geo: { latitude: 51.5882, longitude: -2.9977 },
    population: '151,500',
    telephone: '+44 1633 XXX XXXX'
  },
  'newry': {
    name: 'Newry',
    region: 'County Down',
    country: 'Northern Ireland',
    geo: { latitude: 54.1784, longitude: -6.3386 },
    population: '27,433',
    telephone: '+44 28 XXXX XXXX'
  },
  'norwich': {
    name: 'Norwich',
    region: 'Norfolk',
    country: 'England',
    geo: { latitude: 52.6309, longitude: 1.2974 },
    population: '195,971',
    telephone: '+44 1603 XXX XXXX'
  },
  'nottingham': {
    name: 'Nottingham',
    region: 'Nottinghamshire',
    country: 'England',
    geo: { latitude: 52.9548, longitude: -1.1581 },
    population: '331,069',
    telephone: '+44 115 XXX XXXX'
  },
  'oxford': {
    name: 'Oxford',
    region: 'Oxfordshire',
    country: 'England',
    geo: { latitude: 51.7520, longitude: -1.2577 },
    population: '152,000',
    telephone: '+44 1865 XXX XXXX'
  },
  'perth': {
    name: 'Perth',
    region: 'Perth and Kinross',
    country: 'Scotland',
    geo: { latitude: 56.3959, longitude: -3.4308 },
    population: '47,180',
    telephone: '+44 1738 XXX XXXX'
  },
  'peterborough': {
    name: 'Peterborough',
    region: 'Cambridgeshire',
    country: 'England',
    geo: { latitude: 52.5695, longitude: -0.2405 },
    population: '215,671',
    telephone: '+44 1733 XXX XXXX'
  },
  'plymouth': {
    name: 'Plymouth',
    region: 'Devon',
    country: 'England',
    geo: { latitude: 50.3755, longitude: -4.1427 },
    population: '264,695',
    telephone: '+44 1752 XXX XXXX'
  },
  'portsmouth': {
    name: 'Portsmouth',
    region: 'Hampshire',
    country: 'England',
    geo: { latitude: 50.8198, longitude: -1.0880 },
    population: '238,137',
    telephone: '+44 23 XXX XXXX'
  },
  'preston': {
    name: 'Preston',
    region: 'Lancashire',
    country: 'England',
    geo: { latitude: 53.7632, longitude: -2.7031 },
    population: '141,801',
    telephone: '+44 1772 XXX XXXX'
  },
  'ripon': {
    name: 'Ripon',
    region: 'North Yorkshire',
    country: 'England',
    geo: { latitude: 54.1352, longitude: -1.5212 },
    population: '16,702',
    telephone: '+44 1765 XXX XXXX'
  },
  'salford': {
    name: 'Salford',
    region: 'Greater Manchester',
    country: 'England',
    geo: { latitude: 53.4875, longitude: -2.2901 },
    population: '244,890',
    telephone: '+44 161 XXX XXXX'
  },
  'salisbury': {
    name: 'Salisbury',
    region: 'Wiltshire',
    country: 'England',
    geo: { latitude: 51.0693, longitude: -1.7946 },
    population: '40,302',
    telephone: '+44 1722 XXX XXXX'
  },
  'sheffield': {
    name: 'Sheffield',
    region: 'South Yorkshire',
    country: 'England',
    geo: { latitude: 53.3811, longitude: -1.4701 },
    population: '582,506',
    telephone: '+44 114 XXX XXXX'
  },
  'southampton': {
    name: 'Southampton',
    region: 'Hampshire',
    country: 'England',
    geo: { latitude: 50.9097, longitude: -1.4044 },
    population: '269,781',
    telephone: '+44 23 XXX XXXX'
  },
  'southend-on-sea': {
    name: 'Southend-on-Sea',
    region: 'Essex',
    country: 'England',
    geo: { latitude: 51.5459, longitude: 0.7077 },
    population: '183,125',
    telephone: '+44 1702 XXX XXXX'
  },
  'st-albans': {
    name: 'St Albans',
    region: 'Hertfordshire',
    country: 'England',
    geo: { latitude: 51.7520, longitude: -0.3360 },
    population: '82,146',
    telephone: '+44 1727 XXX XXXX'
  },
  'st-asaph': {
    name: 'St Asaph',
    region: 'Denbighshire',
    country: 'Wales',
    geo: { latitude: 53.2581, longitude: -3.4450 },
    population: '3,355',
    telephone: '+44 1745 XXX XXXX'
  },
  'st-davids': {
    name: 'St Davids',
    region: 'Pembrokeshire',
    country: 'Wales',
    geo: { latitude: 51.8819, longitude: -5.2656 },
    population: '1,841',
    telephone: '+44 1437 XXX XXXX'
  },
  'stirling': {
    name: 'Stirling',
    region: 'Stirling',
    country: 'Scotland',
    geo: { latitude: 56.1165, longitude: -3.9369 },
    population: '37,610',
    telephone: '+44 1786 XXX XXXX'
  },
  'stoke-on-trent': {
    name: 'Stoke-on-Trent',
    region: 'Staffordshire',
    country: 'England',
    geo: { latitude: 53.0027, longitude: -2.1794 },
    population: '256,375',
    telephone: '+44 1782 XXX XXXX'
  },
  'sunderland': {
    name: 'Sunderland',
    region: 'Tyne and Wear',
    country: 'England',
    geo: { latitude: 54.9069, longitude: -1.3838 },
    population: '174,286',
    telephone: '+44 191 XXX XXXX'
  },
  'swansea': {
    name: 'Swansea',
    region: 'West Glamorgan',
    country: 'Wales',
    geo: { latitude: 51.6214, longitude: -3.9436 },
    population: '245,508',
    telephone: '+44 1792 XXX XXXX'
  },
  'truro': {
    name: 'Truro',
    region: 'Cornwall',
    country: 'England',
    geo: { latitude: 50.2632, longitude: -5.0510 },
    population: '18,766',
    telephone: '+44 1872 XXX XXXX'
  },
  'wakefield': {
    name: 'Wakefield',
    region: 'West Yorkshire',
    country: 'England',
    geo: { latitude: 53.6833, longitude: -1.5053 },
    population: '345,038',
    telephone: '+44 1924 XXX XXXX'
  },
  'wells': {
    name: 'Wells',
    region: 'Somerset',
    country: 'England',
    geo: { latitude: 51.2090, longitude: -2.6476 },
    population: '10,536',
    telephone: '+44 1749 XXX XXXX'
  },
  'winchester': {
    name: 'Winchester',
    region: 'Hampshire',
    country: 'England',
    geo: { latitude: 51.0592, longitude: -1.3100 },
    population: '45,184',
    telephone: '+44 1962 XXX XXXX'
  },
  'wolverhampton': {
    name: 'Wolverhampton',
    region: 'West Midlands',
    country: 'England',
    geo: { latitude: 52.5869, longitude: -2.1285 },
    population: '263,700',
    telephone: '+44 1902 XXX XXXX'
  },
  'worcester': {
    name: 'Worcester',
    region: 'Worcestershire',
    country: 'England',
    geo: { latitude: 52.1936, longitude: -2.2201 },
    population: '101,891',
    telephone: '+44 1905 XXX XXXX'
  },
  'wrexham': {
    name: 'Wrexham',
    region: 'Clwyd',
    country: 'Wales',
    geo: { latitude: 53.0466, longitude: -2.9930 },
    population: '65,692',
    telephone: '+44 1978 XXX XXXX'
  },
  'york': {
    name: 'York',
    region: 'North Yorkshire',
    country: 'England',
    geo: { latitude: 53.9590, longitude: -1.0815 },
    population: '208,200',
    telephone: '+44 1904 XXX XXXX'
  }
};

// Helper function to get city data by slug
export function getCityData(slug: string): CityGeoData | null {
  return UK_CITIES_GEO_DATA[slug] || null;
}

// Helper function to check if a slug is a city
export function isCitySlug(slug: string): boolean {
  return slug in UK_CITIES_GEO_DATA;
}

// Get all city slugs
export function getAllCitySlugs(): string[] {
  return Object.keys(UK_CITIES_GEO_DATA);
}
