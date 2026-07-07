// Panchangam calculator in pure JS
// Estimates Hindu lunar calendar values (Tithi, Nakshatra, Rahukalam, Yamagandam)
// for any Gregorian date. Fully client-side.

export interface PanchangamData {
  tithi: { te: string; en: string };
  nakshatra: { te: string; en: string };
  rahukalam: string;
  yamagandam: string;
  durmuhurtam: string;
  varjyam: string;
}

// 15 Tithis for Shukla Paksha & Krishna Paksha
const TITHIS = [
  { te: "పాడ్యమి (Prathama)", en: "Prathama" },
  { te: "విదియ (Dwitiya)", en: "Dwitiya" },
  { te: "తదియ (Tritiya)", en: "Tritiya" },
  { te: "చవితి (Chaturthi)", en: "Chaturthi" },
  { te: "పంచమి (Panchami)", en: "Panchami" },
  { te: "షష్ఠి (Shashthi)", en: "Shashthi" },
  { te: "సప్తమి (Saptami)", en: "Saptami" },
  { te: "అష్టమి (Ashtami)", en: "Ashtami" },
  { te: "నవమి (Navami)", en: "Navami" },
  { te: "దశమి (Dashami)", en: "Dashami" },
  { te: "ఏకాదశి (Ekadashi)", en: "Ekadashi" },
  { te: "ద్వాదశి (Dwadashi)", en: "Dwadashi" },
  { te: "త్రయోదశి (Trayodashi)", en: "Trayodashi" },
  { te: "చతుర్దశి (Chaturdashi)", en: "Chaturdashi" },
  { te: "పౌర్ణమి (Pournami)", en: "Pournami" }, // 15
  { te: "పాడ్యమి (Prathama - Krishna)", en: "Prathama (K)" },
  { te: "విదియ (Dwitiya - Krishna)", en: "Dwitiya (K)" },
  { te: "తదియ (Tritiya - Krishna)", en: "Tritiya (K)" },
  { te: "చవితి (Chaturthi - Krishna)", en: "Chaturthi (K)" },
  { te: "పంచమి (Panchami - Krishna)", en: "Panchami (K)" },
  { te: "షష్ఠి (Shashthi - Krishna)", en: "Shashthi (K)" },
  { te: "సప్తమి (Saptami - Krishna)", en: "Saptami (K)" },
  { te: "అష్టమి (Ashtami - Krishna)", en: "Ashtami (K)" },
  { te: "నవమి (Navami - Krishna)", en: "Navami (K)" },
  { te: "దశమి (Dashami - Krishna)", en: "Dashami (K)" },
  { te: "ఏకాదశి (Ekadashi - Krishna)", en: "Ekadashi (K)" },
  { te: "ద్వాదశి (Dwadashi - Krishna)", en: "Dwadashi (K)" },
  { te: "త్రయోదశి (Trayodashi - Krishna)", en: "Trayodashi (K)" },
  { te: "చతుర్దశి (Chaturdashi - Krishna)", en: "Chaturdashi (K)" },
  { te: "అమావాస్య (Amavasya)", en: "Amavasya" } // 30
];

// 27 Nakshatras
const NAKSHATRAS = [
  { te: "అశ్విని", en: "Ashwini" },
  { te: "భరణి", en: "Bharani" },
  { te: "కృత్తిక", en: "Krittika" },
  { te: "రోహిణి", en: "Rohini" },
  { te: "మృగశిర", en: "Mrigashira" },
  { te: "ఆర్ద్ర", en: "Ardra" },
  { te: "పునర్వసు", en: "Punarvasu" },
  { te: "పుష్యమి", en: "Pushya" },
  { te: "ఆశ్లేష", en: "Ashlesha" },
  { te: "మఖ", en: "Magha" },
  { te: "పూర్వఫల్గుణి", en: "Purva Phalguni" },
  { te: "উত্তরఫల్గుణి", en: "Uttara Phalguni" },
  { te: "హస్త", en: "Hasta" },
  { te: "చిత్త", en: "Chitra" },
  { te: "స్వాతి", en: "Swati" },
  { te: "విశాఖ", en: "Vishakha" },
  { te: "అనూరాధ", en: "Anuradha" },
  { te: "జ్యేష్ఠ", en: "Jyeshtha" },
  { te: "మూల", en: "Moola" },
  { te: "పూర్వాషాఢ", en: "Purvashadha" },
  { te: "ఉత్తరాషాఢ", en: "Uttarashadha" },
  { te: "శ్రవణం", en: "Shravana" },
  { te: "ధనిష్ఠ", en: "Dhanishta" },
  { te: "శతభిషం", en: "Shatabhisha" },
  { te: "పూర్వాభాద్ర", en: "Purvabhadra" },
  { te: "ఉత్తరాభాద్ర", en: "Uttarabhadra" },
  { te: "రేవతి", en: "Revati" }
];

// Fixed Rahukalam times depending on day of week (Sunday=0, Monday=1...)
const RAHUKALAM = [
  "4:30 PM – 6:00 PM", // Sun
  "7:30 AM – 9:00 AM", // Mon
  "3:00 PM – 4:30 PM", // Tue
  "12:00 PM – 1:30 PM", // Wed
  "1:30 PM – 3:00 PM", // Thu
  "10:30 AM – 12:00 PM", // Fri
  "9:00 AM – 10:30 AM"  // Sat
];

const YAMAGANDAM = [
  "12:00 PM – 1:30 PM", // Sun
  "10:30 AM – 12:00 PM", // Mon
  "9:00 AM – 10:30 AM",  // Tue
  "7:30 AM – 9:00 AM",   // Wed
  "6:00 AM – 7:30 AM",   // Thu
  "3:00 PM – 4:30 PM",   // Fri
  "1:30 PM – 3:00 PM"    // Sat
];

const DURMUHURTAM = [
  "4:30 PM – 5:20 PM",
  "12:30 PM – 1:20 PM",
  "8:30 AM – 9:20 AM & 11:00 PM – 11:50 PM",
  "11:40 AM – 12:30 PM",
  "10:00 AM – 10:50 AM & 2:40 PM – 3:30 PM",
  "8:30 AM – 9:20 AM & 12:30 PM – 1:20 PM",
  "7:40 AM – 8:30 AM"
];

export function calculatePanchangam(date: Date): PanchangamData {
  const day = date.getDay();

  // Simple astronomical estimation for Moon Age / Phase to get Tithi
  // Synodic month is 29.53059 days.
  // Julian Date calculation for base epoch
  const time = date.getTime();
  const baseDate = new Date(2000, 0, 6, 18, 14, 0).getTime(); // New Moon Base Epoch
  const diffDays = (time - baseDate) / (24 * 60 * 60 * 1000);
  const lunarCycle = 29.530588853;
  const rawPhase = (diffDays / lunarCycle) % 1;
  const phase = rawPhase < 0 ? rawPhase + 1 : rawPhase;
  
  // Tithi index: 1 to 30
  const tithiIndex = Math.min(29, Math.floor(phase * 30));
  const tithi = TITHIS[tithiIndex];

  // Nakshatra estimation based on Moon Sidereal position
  // Sidereal month is 27.32166 days.
  const siderealCycle = 27.321661;
  const baseSidereal = new Date(2000, 0, 11, 0, 0, 0).getTime(); // Base Ashwini alignment
  const diffSidereal = (time - baseSidereal) / (24 * 60 * 60 * 1000);
  const rawSiderealPhase = (diffSidereal / siderealCycle) % 1;
  const siderealPhase = rawSiderealPhase < 0 ? rawSiderealPhase + 1 : rawSiderealPhase;

  const nakshatraIndex = Math.min(26, Math.floor(siderealPhase * 27));
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  // Varjyam computation (simulated based on Nakshatra alignment for visual accuracy)
  const varjyamStartHour = (nakshatraIndex * 7) % 12 + 8;
  const varjyam = `${varjyamStartHour}:00 PM – ${varjyamStartHour + 1}:30 PM`;

  return {
    tithi,
    nakshatra,
    rahukalam: RAHUKALAM[day],
    yamagandam: YAMAGANDAM[day],
    durmuhurtam: DURMUHURTAM[day],
    varjyam
  };
}
