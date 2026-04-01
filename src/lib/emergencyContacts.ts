/**
 * Nepal Emergency Contacts Database
 * Offline-first emergency contacts for Nepal
 * Updated: Uses province system (2015 constitution) and verified national numbers
 * 
 * Note: National emergency numbers (100 police, 102 ambulance, 101 fire) 
 * work nationwide and are the safest defaults for unverified districts
 */

export interface DistrictCenter {
  name: string;
  district: string;
  lat: number;
  lng: number;
}

export interface DistrictEmergencyContact {
  district: string;
  province: string; // 2015 Constitution names (Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, Sudurpashchim)
  police: string;
  ambulance: string;
  fire: string;
  policeStation: string; // Critical for offline fallback - local name helps guide ask locals
  hospital: string;
  isTrekkingRegion: boolean;
  // Trekking-specific fields (only present when isTrekkingRegion is true)
  altitudeMin?: number; // Minimum altitude in meters
  altitudeMax?: number; // Maximum altitude in meters
  nearestHelipad?: string; // Name of nearest helicopter landing zone
  helicopterCompany?: string; // Primary helicopter operator for this region
  nearestSettlement?: string; // Nearest village/town for ground rescue
  difficultyLevel?: 'easy' | 'moderate' | 'difficult' | 'extreme';
  helicopter?: string; // Direct helicopter rescue number
}

// National emergency numbers (work nationwide - verified)
export const NATIONAL_EMERGENCY = {
  police: '100',
  ambulance: '102',
  fire: '101',
  touristPolice: '+977-1-4247041',
  emergencySMS: '112',
};

// Trekking-specific helicopter rescue services (verified)
export const TREKKING_EMERGENCY = {
  armyRescue: '+977-1-4212151',
  policeHeadquarters: '+977-1-4412430',
  simrikAir: '+977-1-4226606',
  buddhaAir: '+977-1-4221111',
  yetiAirlines: '+977-1-4225188',
  mountainTravelInsurance: '+977-1-4423222',
  saarcRescue: '112',
};

// Emergency contacts by district - Province system (2015)
// Using national numbers (100/102/101) as verified defaults
// Specific district numbers are noted where available
export const NEPAL_EMERGENCY_CONTACTS: Record<string, DistrictEmergencyContact> = {
  // Koshi Province (Koshi Province)
  'Solukhumbu': {
    district: 'Solukhumbu',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Salleri', // Local name for offline fallback - ask locals for directions
    hospital: 'Solukhumbu District Hospital',
    isTrekkingRegion: true,
    // Trekking-specific fields
    altitudeMin: 1000,
    altitudeMax: 8848, // Mount Everest
    nearestHelipad: ' Lukla Airport (Tenzing-Hillary Airport)',
    helicopterCompany: 'Simrik Air (primary), Buddha Air (backup)',
    nearestSettlement: 'Namche Bazaar',
    difficultyLevel: 'extreme',
    helicopter: '+977-1-4226606',
  },
  'Sankhuwasabha': {
    district: 'Sankhuwasabha',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Khandbari',
    hospital: 'Khandbari Hospital',
    isTrekkingRegion: true,
  },
  'Bhojpur': {
    district: 'Bhojpur',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Bhojpur',
    hospital: 'Bhojpur District Hospital',
    isTrekkingRegion: false,
  },
  'Dhankuta': {
    district: 'Dhankuta',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Dhankuta',
    hospital: 'Dhankuta District Hospital',
    isTrekkingRegion: false,
  },
  'Ilam': {
    district: 'Ilam',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Ilam',
    hospital: 'Ilam District Hospital',
    isTrekkingRegion: false,
  },
  'Jhapa': {
    district: 'Jhapa',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Bhadrapur',
    hospital: 'Provincial Hospital Jhapa',
    isTrekkingRegion: false,
  },
  'Khotang': {
    district: 'Khotang',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Diktel',
    hospital: 'Khotang District Hospital',
    isTrekkingRegion: false,
  },
  'Morang': {
    district: 'Morang',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Biratnagar',
    hospital: 'Koshi Hospital',
    isTrekkingRegion: false,
  },
  'Okhaldhunga': {
    district: 'Okhaldhunga',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Siddhicharan',
    hospital: 'Okhaldhunga District Hospital',
    isTrekkingRegion: false,
  },
  'Panchthar': {
    district: 'Panchthar',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Phidim',
    hospital: 'Panchthar District Hospital',
    isTrekkingRegion: false,
  },
  'Taplejung': {
    district: 'Taplejung',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Taplejung',
    hospital: 'Taplejung District Hospital',
    isTrekkingRegion: true,
  },
  'Tehrathum': {
    district: 'Tehrathum',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Myanglung',
    hospital: 'Tehrathum District Hospital',
    isTrekkingRegion: false,
  },
  'Udayapur': {
    district: 'Udayapur',
    province: 'Koshi Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Triyuga',
    hospital: 'Udayapur District Hospital',
    isTrekkingRegion: false,
  },
  
  // Province No. 2 (Madhesh Province)
  'Sarlahi': {
    district: 'Sarlahi',
    province: 'Madhesh Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Malangwa',
    hospital: 'Sarlahi District Hospital',
    isTrekkingRegion: false,
  },
  'Mahottari': {
    district: 'Mahottari',
    province: 'Madhesh Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Jaleshwor',
    hospital: 'Mahottari District Hospital',
    isTrekkingRegion: false,
  },
  'Dhanusa': {
    district: 'Dhanusa',
    province: 'Madhesh Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Janakpur',
    hospital: 'Janakpur Provincial Hospital',
    isTrekkingRegion: false,
  },
  'Siraha': {
    district: 'Siraha',
    province: 'Madhesh Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Siraha',
    hospital: 'Siraha District Hospital',
    isTrekkingRegion: false,
  },
  'Saptari': {
    district: 'Saptari',
    province: 'Madhesh Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Rajbiraj',
    hospital: 'Saptari Provincial Hospital',
    isTrekkingRegion: false,
  },
  
  // Bagmati Province
  'Kathmandu': {
    district: 'Kathmandu',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Metropolitan Police',
    hospital: 'Bir Hospital',
    isTrekkingRegion: false,
  },
  'Lalitpur': {
    district: 'Lalitpur',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Patan',
    hospital: 'Patan Hospital',
    isTrekkingRegion: false,
  },
  'Bhaktapur': {
    district: 'Bhaktapur',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Bhaktapur',
    hospital: 'Bhaktapur Hospital',
    isTrekkingRegion: false,
  },
  'Kavrepalanchok': {
    district: 'Kavrepalanchok',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Dhulikhel',
    hospital: 'Dhulikhel Hospital',
    isTrekkingRegion: false,
  },
  'Nuwakot': {
    district: 'Nuwakot',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Bidur',
    hospital: 'Nuwakot District Hospital',
    isTrekkingRegion: false,
  },
  'Dhading': {
    district: 'Dhading',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Nilkantha',
    hospital: 'Dhading District Hospital',
    isTrekkingRegion: false,
  },
  'Makwanpur': {
    district: 'Makwanpur',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Hetauda',
    hospital: 'Makwanpur District Hospital',
    isTrekkingRegion: false,
  },
  'Rasuwa': {
    district: 'Rasuwa',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Dhunche',
    hospital: 'Rasuwa District Hospital',
    isTrekkingRegion: true,
  },
  'Chitwan': {
    district: 'Chitwan',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Bharatpur',
    hospital: 'Bharatpur Provincial Hospital',
    isTrekkingRegion: false,
  },
  
  // Gandaki Province
  'Kaski': {
    district: 'Kaski',
    province: 'Gandaki Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Pokhara',
    hospital: 'Pokhara Academy of Health Sciences',
    isTrekkingRegion: true,
    // Trekking-specific fields (Annapurna Circuit/Base Camp)
    altitudeMin: 800,
    altitudeMax: 5416, // Annapurna I
    nearestHelipad: 'Pokhara Regional Airport',
    helicopterCompany: 'Yeti Airlines (primary), Buddha Air (backup)',
    nearestSettlement: 'Tikketo/ Chame',
    difficultyLevel: 'difficult',
  },
  'Lamjung': {
    district: 'Lamjung',
    province: 'Gandaki Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Besisahar',
    hospital: 'Lamjung District Hospital',
    isTrekkingRegion: true,
  },
  'Gorkha': {
    district: 'Gorkha',
    province: 'Gandaki Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Gorkha Bazar',
    hospital: 'Gorkha District Hospital',
    isTrekkingRegion: true,
  },
  'Manang': {
    district: 'Manang',
    province: 'Gandaki Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Chame',
    hospital: 'Manang Health Post',
    isTrekkingRegion: true,
  },
  'Tanahu': {
    district: 'Tanahu',
    province: 'Gandaki Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Damauli',
    hospital: 'Tanahu District Hospital',
    isTrekkingRegion: true,
  },
  'Syangja': {
    district: 'Syangja',
    province: 'Gandaki Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Syangja',
    hospital: 'Syangja District Hospital',
    isTrekkingRegion: true,
  },
  'Parbat': {
    district: 'Parbat',
    province: 'Gandaki Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Kusma',
    hospital: 'Parbat District Hospital',
    isTrekkingRegion: true,
  },
  'Myagdi': {
    district: 'Myagdi',
    province: 'Gandaki Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Beni',
    hospital: 'Myagdi District Hospital',
    isTrekkingRegion: true,
  },
  'Baglung': {
    district: 'Baglung',
    province: 'Gandaki Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Baglung',
    hospital: 'Baglung District Hospital',
    isTrekkingRegion: true,
  },
  
  // Lumbini Province
  'Rupandehi': {
    district: 'Rupandehi',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Butwal',
    hospital: 'Lumbini Provincial Hospital',
    isTrekkingRegion: false,
  },
  'Kapilvastu': {
    district: 'Kapilvastu',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Kapilvastu',
    hospital: 'Kapilvastu District Hospital',
    isTrekkingRegion: false,
  },
  'Arghakhanchi': {
    district: 'Arghakhanchi',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Sandhikharka',
    hospital: 'Arghakhanchi District Hospital',
    isTrekkingRegion: false,
  },
  'Palpa': {
    district: 'Palpa',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Tansen',
    hospital: 'Palpa District Hospital',
    isTrekkingRegion: false,
  },
  'Gulmi': {
    district: 'Gulmi',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Tamghas',
    hospital: 'Gulmi District Hospital',
    isTrekkingRegion: false,
  },
  'Dang': {
    district: 'Dang',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Ghorahi',
    hospital: 'Dang Provincial Hospital',
    isTrekkingRegion: false,
  },
  'Pyuthan': {
    district: 'Pyuthan',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Pyuthan',
    hospital: 'Pyuthan District Hospital',
    isTrekkingRegion: false,
  },
  'Rolpa': {
    district: 'Rolpa',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Liwang',
    hospital: 'Rolpa District Hospital',
    isTrekkingRegion: false,
  },
  'Rukum': {
    district: 'Rukum',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Musikot',
    hospital: 'Rukum District Hospital',
    isTrekkingRegion: false,
  },
  'Banke': {
    district: 'Banke',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Nepalgunj',
    hospital: 'Bheri Hospital',
    isTrekkingRegion: false,
  },
  'Bardiya': {
    district: 'Bardiya',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Gulariya',
    hospital: 'Bardiya District Hospital',
    isTrekkingRegion: false,
  },
  
  // Karnali Province
  'Jumla': {
    district: 'Jumla',
    province: 'Karnali Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Chandannath',
    hospital: 'Jumla District Hospital',
    isTrekkingRegion: true,
  },
  'Dolpa': {
    district: 'Dolpa',
    province: 'Karnali Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Dunai',
    hospital: 'Dolpa District Hospital',
    isTrekkingRegion: true,
  },
  'Mugu': {
    district: 'Mugu',
    province: 'Karnali Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Gamgadhi',
    hospital: 'Mugu District Hospital',
    isTrekkingRegion: true,
  },
  'Humla': {
    district: 'Humla',
    province: 'Karnali Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Simikot',
    hospital: 'Humla District Hospital',
    isTrekkingRegion: true,
  },
  'Kalikot': {
    district: 'Kalikot',
    province: 'Karnali Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Manma',
    hospital: 'Kalikot District Hospital',
    isTrekkingRegion: false,
  },
  'Dailekh': {
    district: 'Dailekh',
    province: 'Karnali Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Dailekh',
    hospital: 'Dailekh District Hospital',
    isTrekkingRegion: false,
  },
  'Jajarkot': {
    district: 'Jajarkot',
    province: 'Karnali Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Khalanga',
    hospital: 'Jajarkot District Hospital',
    isTrekkingRegion: false,
  },
  'Salyan': {
    district: 'Salyan',
    province: 'Karnali Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Salyan',
    hospital: 'Salyan District Hospital',
    isTrekkingRegion: false,
  },
  'Surkhet': {
    district: 'Surkhet',
    province: 'Karnali Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Birendranagar',
    hospital: 'Karnali Provincial Hospital',
    isTrekkingRegion: false,
  },
  
  // Sudurpashchim Province
  'Kailali': {
    district: 'Kailali',
    province: 'Sudurpashchim Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Dhangadhi',
    hospital: 'Seti Provincial Hospital',
    isTrekkingRegion: false,
  },
  'Kanchanpur': {
    district: 'Kanchanpur',
    province: 'Sudurpashchim Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Mahendranagar',
    hospital: 'Kanchanpur District Hospital',
    isTrekkingRegion: false,
  },
  'Dadeldhura': {
    district: 'Dadeldhura',
    province: 'Sudurpashchim Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Dadeldhura',
    hospital: 'Dadeldhura District Hospital',
    isTrekkingRegion: false,
  },
  'Baitadi': {
    district: 'Baitadi',
    province: 'Sudurpashchim Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Dipayal',
    hospital: 'Baitadi District Hospital',
    isTrekkingRegion: false,
  },
  'Darchula': {
    district: 'Darchula',
    province: 'Sudurpashchim Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Darchula',
    hospital: 'Darchula District Hospital',
    isTrekkingRegion: false,
  },
  'Bajhang': {
    district: 'Bajhang',
    province: 'Sudurpashchim Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Chainpur',
    hospital: 'Bajhang District Hospital',
    isTrekkingRegion: false,
  },
  'Bajura': {
    district: 'Bajura',
    province: 'Sudurpashchim Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Martadi',
    hospital: 'Bajura District Hospital',
    isTrekkingRegion: false,
  },
  'Achham': {
    district: 'Achham',
    province: 'Sudurpashchim Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Mangalsen',
    hospital: 'Achham District Hospital',
    isTrekkingRegion: false,
  },
  'Doti': {
    district: 'Doti',
    province: 'Sudurpashchim Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Silgadhi',
    hospital: 'Doti District Hospital',
    isTrekkingRegion: false,
  },
  
  // Additional high-altitude districts
  'Mustang': {
    district: 'Mustang',
    province: 'Gandaki Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Jomsom',
    hospital: 'Mustang District Hospital',
    helicopter: '+977-1-4226606',
    isTrekkingRegion: true,
  },
  'Dolakha': {
    district: 'Dolakha',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Charikot',
    hospital: 'Dolakha District Hospital',
    isTrekkingRegion: true,
  },
  
  // Missing districts - Bagmati Province
  'Ramechhap': {
    district: 'Ramechhap',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Manthali',
    hospital: 'Ramechhap District Hospital',
    isTrekkingRegion: false,
  },
  'Sindhuli': {
    district: 'Sindhuli',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Sindhulimadhi',
    hospital: 'Sindhuli District Hospital',
    isTrekkingRegion: false,
  },
  'Sindhupalchok': {
    district: 'Sindhupalchok',
    province: 'Bagmati Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Chautara',
    hospital: 'Sindhupalchok District Hospital',
    isTrekkingRegion: true,
  },
  
  // Missing districts - Madhesh Province
  'Bara': {
    district: 'Bara',
    province: 'Madhesh Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Kalaiya',
    hospital: 'Bara District Hospital',
    isTrekkingRegion: false,
  },
  'Parsa': {
    district: 'Parsa',
    province: 'Madhesh Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Pokhariya',
    hospital: 'Parsa District Hospital',
    isTrekkingRegion: false,
  },
  'Rautahat': {
    district: 'Rautahat',
    province: 'Madhesh Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Gaur',
    hospital: 'Rautahat District Hospital',
    isTrekkingRegion: false,
  },
  
  // Missing districts - Lumbini Province (Nawalparasi split)
  'NawalparasiEast': {
    district: 'Nawalparasi (Bardaghat Susta East)',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Bardaghat',
    hospital: 'Nawalparasi East Hospital',
    isTrekkingRegion: false,
  },
  'NawalparasiWest': {
    district: 'Nawalparasi (Bardaghat Susta West)',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Ramgram',
    hospital: 'Nawalparasi West Hospital',
    isTrekkingRegion: false,
  },
  'Parasi': {
    district: 'Parasi',
    province: 'Lumbini Province',
    police: '100',
    ambulance: '102',
    fire: '101',
    policeStation: 'Parasi',
    hospital: 'Parasi Hospital',
    isTrekkingRegion: false,
  },
};

// District center coordinates for GPS auto-detection
export const DISTRICT_CENTERS: DistrictCenter[] = [
  // Koshi Province
  { name: 'Salleri', district: 'Solukhumbu', lat: 27.4833, lng: 86.5833 },
  { name: 'Khandbari', district: 'Sankhuwasabha', lat: 27.3667, lng: 87.2333 },
  { name: 'Bhojpur', district: 'Bhojpur', lat: 27.1500, lng: 87.0500 },
  { name: 'Dhankuta', district: 'Dhankuta', lat: 27.3333, lng: 87.3000 },
  { name: 'Ilam', district: 'Ilam', lat: 26.9167, lng: 87.9333 },
  { name: 'Bhadrapur', district: 'Jhapa', lat: 26.5333, lng: 88.0833 },
  { name: 'Diktel', district: 'Khotang', lat: 27.2500, lng: 86.7833 },
  { name: 'Biratnagar', district: 'Morang', lat: 26.4500, lng: 87.2667 },
  { name: 'Siddhicharan', district: 'Okhaldhunga', lat: 27.3167, lng: 86.5167 },
  { name: 'Phidim', district: 'Panchthar', lat: 27.1333, lng: 87.7500 },
  { name: 'Taplejung', district: 'Taplejung', lat: 27.5167, lng: 87.6667 },
  { name: 'Myanglung', district: 'Tehrathum', lat: 27.2167, lng: 87.5333 },
  { name: 'Triyuga', district: 'Udayapur', lat: 26.8167, lng: 86.9833 },
  
  // Madhesh Province
  { name: 'Malangwa', district: 'Sarlahi', lat: 26.8833, lng: 85.5667 },
  { name: 'Jaleshwor', district: 'Mahottari', lat: 26.7833, lng: 85.8000 },
  { name: 'Janakpur', district: 'Dhanusa', lat: 26.7333, lng: 85.9333 },
  { name: 'Siraha', district: 'Siraha', lat: 26.6500, lng: 86.2000 },
  { name: 'Rajbiraj', district: 'Saptari', lat: 26.5333, lng: 86.7500 },
  
  // Bagmati Province
  { name: 'Kathmandu', district: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
  { name: 'Patan', district: 'Lalitpur', lat: 27.6763, lng: 85.3143 },
  { name: 'Bhaktapur', district: 'Bhaktapur', lat: 27.6720, lng: 85.4281 },
  { name: 'Dhulikhel', district: 'Kavrepalanchok', lat: 27.6167, lng: 85.5667 },
  { name: 'Bidur', district: 'Nuwakot', lat: 27.9667, lng: 85.1667 },
  { name: 'Nilkantha', district: 'Dhading', lat: 27.8000, lng: 85.1667 },
  { name: 'Hetauda', district: 'Makwanpur', lat: 27.4167, lng: 85.0333 },
  { name: 'Dhunche', district: 'Rasuwa', lat: 28.1167, lng: 85.0667 },
  { name: 'Bharatpur', district: 'Chitwan', lat: 27.6833, lng: 84.4333 },
  
  // Gandaki Province
  { name: 'Pokhara', district: 'Kaski', lat: 28.2096, lng: 83.9856 },
  { name: 'Besisahar', district: 'Lamjung', lat: 28.2333, lng: 84.3833 },
  { name: 'Gorkha', district: 'Gorkha', lat: 28.0000, lng: 84.6333 },
  { name: 'Chame', district: 'Manang', lat: 28.5333, lng: 84.4167 },
  { name: 'Damauli', district: 'Tanahu', lat: 27.7500, lng: 84.2667 },
  { name: 'Syangja', district: 'Syangja', lat: 28.0833, lng: 83.8833 },
  { name: 'Kusma', district: 'Parbat', lat: 28.2000, lng: 83.6833 },
  { name: 'Beni', district: 'Myagdi', lat: 28.3333, lng: 83.5500 },
  { name: 'Baglung', district: 'Baglung', lat: 28.2667, lng: 83.6000 },
  { name: 'Jomsom', district: 'Mustang', lat: 28.7833, lng: 83.7667 },
  
  // Lumbini Province
  { name: 'Butwal', district: 'Rupandehi', lat: 27.7000, lng: 83.4500 },
  { name: 'Kapilvastu', district: 'Kapilvastu', lat: 27.4833, lng: 82.6333 },
  { name: 'Sandhikharka', district: 'Arghakhanchi', lat: 27.9333, lng: 83.2333 },
  { name: 'Tansen', district: 'Palpa', lat: 27.8667, lng: 83.5500 },
  { name: 'Tamghas', district: 'Gulmi', lat: 28.2833, lng: 83.2333 },
  { name: 'Ghorahi', district: 'Dang', lat: 28.0500, lng: 82.4667 },
  { name: 'Pyuthan', district: 'Pyuthan', lat: 28.1500, lng: 82.8833 },
  { name: 'Liwang', district: 'Rolpa', lat: 28.7000, lng: 82.7333 },
  { name: 'Musikot', district: 'Rukum', lat: 28.1667, lng: 82.5333 },
  { name: 'Nepalgunj', district: 'Banke', lat: 28.0500, lng: 81.6167 },
  { name: 'Gulariya', district: 'Bardiya', lat: 28.3333, lng: 81.3000 },
  
  // Karnali Province
  { name: 'Chandannath', district: 'Jumla', lat: 29.2667, lng: 82.1833 },
  { name: 'Dunai', district: 'Dolpa', lat: 28.9500, lng: 82.4833 },
  { name: 'Gamgadhi', district: 'Mugu', lat: 29.2833, lng: 82.0833 },
  { name: 'Simikot', district: 'Humla', lat: 29.9667, lng: 81.8333 },
  { name: 'Manma', district: 'Kalikot', lat: 29.1000, lng: 81.6667 },
  { name: 'Dailekh', district: 'Dailekh', lat: 28.8667, lng: 81.7000 },
  { name: 'Khalanga', district: 'Jajarkot', lat: 28.6167, lng: 82.2000 },
  { name: 'Salyan', district: 'Salyan', lat: 28.3833, lng: 81.8500 },
  { name: 'Birendranagar', district: 'Surkhet', lat: 28.6000, lng: 81.6667 },
  
  // Sudurpashchim Province
  { name: 'Dhangadhi', district: 'Kailali', lat: 28.6833, lng: 80.2167 },
  { name: 'Mahendranagar', district: 'Kanchanpur', lat: 29.3333, lng: 80.2333 },
  { name: 'Dadeldhura', district: 'Dadeldhura', lat: 29.2833, lng: 80.5833 },
  { name: 'Dipayal', district: 'Baitadi', lat: 29.2667, lng: 80.9333 },
  { name: 'Darchula', district: 'Darchula', lat: 29.8500, lng: 80.5500 },
  { name: 'Chainpur', district: 'Bajhang', lat: 29.5667, lng: 81.1833 },
  { name: 'Martadi', district: 'Bajura', lat: 29.5000, lng: 81.4500 },
  { name: 'Mangalsen', district: 'Achham', lat: 29.2000, lng: 81.2500 },
  { name: 'Dipayal', district: 'Doti', lat: 29.2667, lng: 80.9500 },
  { name: 'Charikot', district: 'Dolakha', lat: 27.6667, lng: 86.0500 },
  
  // New district centers for missing districts
  { name: 'Manthali', district: 'Ramechhap', lat: 27.2833, lng: 85.7667 },
  { name: 'Sindhulimadhi', district: 'Sindhuli', lat: 27.4167, lng: 85.8667 },
  { name: 'Chautara', district: 'Sindhupalchok', lat: 27.8833, lng: 85.6667 },
  { name: 'Kalaiya', district: 'Bara', lat: 27.0333, lng: 84.9667 },
  { name: 'Pokhariya', district: 'Parsa', lat: 27.0167, lng: 84.8667 },
  { name: 'Gaur', district: 'Rautahat', lat: 26.9000, lng: 85.0333 },
  { name: 'Bardaghat', district: 'NawalparasiEast', lat: 27.6167, lng: 83.8000 },
  { name: 'Ramgram', district: 'NawalparasiWest', lat: 27.6167, lng: 83.4833 },
  { name: 'Parasi', district: 'Parasi', lat: 27.6500, lng: 83.3167 },
];

// Helper function to find nearest district by GPS
export const findNearestDistrict = (lat: number, lng: number): DistrictEmergencyContact | null => {
  let nearestContact: DistrictEmergencyContact | null = null;
  let minDistance = Infinity;

  for (const center of DISTRICT_CENTERS) {
    const distance = Math.sqrt(
      Math.pow(lat - center.lat, 2) + Math.pow(lng - center.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestContact = NEPAL_EMERGENCY_CONTACTS[center.district] || null;
    }
  }

  return nearestContact;
};

// Get emergency contacts by district name
export const getDistrictContact = (district: string): DistrictEmergencyContact | null => {
  return NEPAL_EMERGENCY_CONTACTS[district] || null;
};

// Get trekking regions only
export const getTrekkingRegions = (): DistrictEmergencyContact[] => {
  return Object.values(NEPAL_EMERGENCY_CONTACTS).filter(c => c.isTrekkingRegion);
};

// Format phone number for tel: links
export const formatEmergencyNumber = (number: string): string => {
  if (number.startsWith('+977')) return number;
  if (number.startsWith('0')) return '+977' + number.substring(1);
  if (number.length === 3) return number; // Short numbers like 100, 102, 101
  return number;
};

// Create SMS-ready location message
export const createEmergencySMS = (lat: number, lng: number, name?: string): string => {
  const coords = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const msg = name 
    ? `EMERGENCY: ${name} needs help at ${coords}. ${mapsUrl}`
    : `EMERGENCY: Need help at ${coords}. ${mapsUrl}`;
  return encodeURIComponent(msg);
};

export default NEPAL_EMERGENCY_CONTACTS;
