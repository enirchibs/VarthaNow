// 🌍 Universal Location & Area Detection Engine with GPS & Autocomplete
import { supabase } from "@/lib/supabase";

export interface DetectedLocation {
  city: string;
  state: string;
  lat: number;
  lon: number;
}

export interface DetailedAreaResult {
  formatted_address: string;
  suburb_village?: string;
  city_town: string;
  district_mandal?: string;
  state: string;
  pincode?: string;
  lat?: number;
  lon?: number;
  error_type?: "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "NOT_SUPPORTED" | "UNKNOWN";
  error_message?: string;
}

// 🏢 Preloaded High-Priority Andhra Pradesh & Telangana Localities Database
export const PRELOADED_AP_TS_LOCATIONS: { name_te: string; name_en: string; category: string }[] = [
  // Visakhapatnam District & Mandals
  { name_te: "విశాఖపట్నం (Visakhapatnam)", name_en: "Visakhapatnam City", category: "City" },
  { name_te: "మధురవాడ (Madhurawada)", name_en: "Madhurawada, Vizag", category: "Locality / Mandal" },
  { name_te: "గాజువాక (Gajuwaka)", name_en: "Gajuwaka, Vizag", category: "Locality / Mandal" },
  { name_te: "ఎంవీపీ కాలనీ (MVP Colony)", name_en: "MVP Colony, Vizag", category: "Locality" },
  { name_te: "సీతమ్మధార (Seethammadhara)", name_en: "Seethammadhara, Vizag", category: "Locality" },
  { name_te: "జగదాంబ (Jagadamba Center)", name_en: "Jagadamba, Vizag", category: "Locality" },
  { name_te: "పెందుర్తి (Pendurthi)", name_en: "Pendurthi, Vizag", category: "Mandal / Locality" },
  { name_te: "గోపాలపట్నం (Gopalapatnam)", name_en: "Gopalapatnam, Vizag", category: "Locality" },
  { name_te: "భీమునిపట్నం (Bheemunipatnam / Bheemili)", name_en: "Bheemunipatnam (Bheemili)", category: "Town / Mandal" },
  { name_te: "స్టీల్ ప్లాంట్ / కూర్మన్నపాలెం (Steel Plant / Kurmannapalem)", name_en: "Kurmannapalem / Steel Plant", category: "Locality" },
  { name_te: "సింహాచలం (Simhachalam)", name_en: "Simhachalam, Vizag", category: "Locality" },
  { name_te: "ఆనందపురం (Anandapuram)", name_en: "Anandapuram Mandal", category: "Mandal" },
  { name_te: "పద్మనాభం (Padmanabham)", name_en: "Padmanabham Mandal", category: "Mandal" },
  { name_te: "పీఎమ్‌పాలెం (PM Palem)", name_en: "PM Palem, Vizag", category: "Locality" },
  { name_te: "రుషికొండ (Rushikonda)", name_en: "Rushikonda, Vizag", category: "Locality" },
  { name_te: "ఎండాడ (Endada)", name_en: "Endada, Vizag", category: "Locality" },
  { name_te: "ఎన్‌ఏడీ జంక్షన్ (NAD Junction)", name_en: "NAD Junction, Vizag", category: "Locality" },
  { name_te: "అక్కయ్యపాలెం (Akkayyapalem)", name_en: "Akkayyapalem, Vizag", category: "Locality" },
  { name_te: "కంచరపాలెం (Kancharapalem)", name_en: "Kancharapalem, Vizag", category: "Locality" },
  { name_te: "జ్ఞానాపురం (Gnanapuram)", name_en: "Gnanapuram, Vizag", category: "Locality" },

  // NTR / Krishna / Vijayawada
  { name_te: "విజయవాడ (Vijayawada)", name_en: "Vijayawada City", category: "City" },
  { name_te: "బెంచ్ సర్కిల్ (Benz Circle)", name_en: "Benz Circle, Vijayawada", category: "Locality" },
  { name_te: "గవర్నర్ పేట (Governorpet)", name_en: "Governorpet, Vijayawada", category: "Locality" },
  { name_te: "పటమట (Patamata)", name_en: "Patamata, Vijayawada", category: "Locality" },
  { name_te: "గుణదల (Gunadala)", name_en: "Gunadala, Vijayawada", category: "Locality" },
  { name_te: "పోరంకి (Poranki)", name_en: "Poranki, Vijayawada", category: "Locality" },
  { name_te: "ఇబ్రహీంపట్నం (Ibrahimpatnam)", name_en: "Ibrahimpatnam, Vijayawada", category: "Mandal" },
  { name_te: "గుడివాడ (Gudivada)", name_en: "Gudivada", category: "Town / Mandal" },
  { name_te: "మచిలీపట్నం (Machilipatnam)", name_en: "Machilipatnam", category: "City / Mandal" },

  // Guntur / Amaravati / Bapatla
  { name_te: "గుంటూరు (Guntur)", name_en: "Guntur City", category: "City" },
  { name_te: "బ్రోడీపేట (Brodipet)", name_en: "Brodipet, Guntur", category: "Locality" },
  { name_te: "అరుండల్ పేట (Arundelpet)", name_en: "Arundelpet, Guntur", category: "Locality" },
  { name_te: "అమరావతి (Amaravati)", name_en: "Amaravati Capital Region", category: "Capital City" },
  { name_te: "మంగళగిరి (Mangalagiri)", name_en: "Mangalagiri", category: "Town / Mandal" },
  { name_te: "తాడేపల్లి (Tadepalli)", name_en: "Tadepalli", category: "Town / Mandal" },
  { name_te: "తెనాలి (Tenali)", name_en: "Tenali", category: "Town / Mandal" },
  { name_te: "నరసరావుపేట (Narasaraopet)", name_en: "Narasaraopet", category: "Town" },
  { name_te: "బాపట్ల (Bapatla)", name_en: "Bapatla", category: "Town" },

  // Tirupati / Chittoor
  { name_te: "తిరుపతి (Tirupati)", name_en: "Tirupati City", category: "City" },
  { name_te: "అలిపిరి (Alipiri)", name_en: "Alipiri, Tirupati", category: "Locality" },
  { name_te: "ఎమ్మార్ పల్లి (MR Palle)", name_en: "MR Palle, Tirupati", category: "Locality" },
  { name_te: "చంద్రగిరి (Chandragiri)", name_en: "Chandragiri", category: "Mandal" },
  { name_te: "రేణిగుంట (Renigunta)", name_en: "Renigunta", category: "Mandal" },
  { name_te: "శ్రీకాళహస్తి (Srikalahasti)", name_en: "Srikalahasti", category: "Town" },
  { name_te: "మదనపల్లె (Madanapalle)", name_en: "Madanapalle", category: "Town" },

  // Godavari Districts (Rajahmundry, Kakinada, Eluru)
  { name_te: "రాజమండ్రి (Rajahmundry / Rajamahendravaram)", name_en: "Rajahmundry", category: "City" },
  { name_te: "దానవాయిపేట (Danavaipeta)", name_en: "Danavaipeta, Rajahmundry", category: "Locality" },
  { name_te: "మొరంపూడి (Morampudi)", name_en: "Morampudi, Rajahmundry", category: "Locality" },
  { name_te: "కాకినాడ (Kakinada)", name_en: "Kakinada City", category: "City" },
  { name_te: "సామర్లకోట (Samalkot)", name_en: "Samalkot", category: "Town" },
  { name_te: "పిఠాపురం (Pithapuram)", name_en: "Pithapuram", category: "Town" },
  { name_te: "అమలాపురం (Amalapuram)", name_en: "Amalapuram", category: "Town" },
  { name_te: "భీమవరం (Bhimavaram)", name_en: "Bhimavaram", category: "Town" },
  { name_te: "తణుకు (Tanuku)", name_en: "Tanuku", category: "Town" },
  { name_te: "ఏలూరు (Eluru)", name_en: "Eluru", category: "City" },

  // Rayalaseema & North Andhra
  { name_te: "కర్నూలు (Kurnool)", name_en: "Kurnool City", category: "City" },
  { name_te: "నంద్యాల (Nandyal)", name_en: "Nandyal", category: "City" },
  { name_te: "అనంతపురం (Anantapur)", name_en: "Anantapur", category: "City" },
  { name_te: "కడప (Kadapa)", name_en: "Kadapa City", category: "City" },
  { name_te: "విజయనగరం (Vizianagaram)", name_en: "Vizianagaram", category: "City" },
  { name_te: "శ్రీకాకుళం (Srikakulam)", name_en: "Srikakulam", category: "City" },

  // Hyderabad & Telangana
  { name_te: "హైదరాబాద్ (Hyderabad)", name_en: "Hyderabad City", category: "Metropolitan City" },
  { name_te: "బంజారా హిల్స్ (Banjara Hills)", name_en: "Banjara Hills, Hyd", category: "Locality" },
  { name_te: "జుబ్లీ హిల్స్ (Jubilee Hills)", name_en: "Jubilee Hills, Hyd", category: "Locality" },
  { name_te: "గచ్చిబౌలి (Gachibowli)", name_en: "Gachibowli, Hyd", category: "IT Hub" },
  { name_te: "హైటెక్ సిటీ (HITECH City)", name_en: "HITECH City, Hyd", category: "IT Hub" },
  { name_te: "మాదాపూర్ (Madhapur)", name_en: "Madhapur, Hyd", category: "Locality" },
  { name_te: "కూకట్‌పల్లి (Kukatpally)", name_en: "Kukatpally, Hyd", category: "Locality" },
  { name_te: "సికింద్రాబాద్ (Secunderabad)", name_en: "Secunderabad", category: "City" },
  { name_te: "అమీర్‌పేట్ (Ameerpet)", name_en: "Ameerpet, Hyd", category: "Locality" },
  { name_te: "దిల్‌సుఖ్‌నగర్ (Dilsukhnagar)", name_en: "Dilsukhnagar, Hyd", category: "Locality" },
  { name_te: "కొండాపూర్ (Kondapur)", name_en: "Kondapur, Hyd", category: "Locality" },
  { name_te: "మియాపూర్ (Miyapur)", name_en: "Miyapur, Hyd", category: "Locality" },
  { name_te: "వరంగల్ (Warangal)", name_en: "Warangal", category: "City" },
  { name_te: "కరీంనగర్ (Karimnagar)", name_en: "Karimnagar", category: "City" },
  { name_te: "ఖమ్మం (Khammam)", name_en: "Khammam", category: "City" }
];

// 🎯 Detect Current GPS/Mobile Location & Reverse Geocode to detailed area string
export async function detectGPSLocation(): Promise<DetectedLocation | null> {
  try {
    const cached = localStorage.getItem("varthanow_gps_location");
    if (cached) return JSON.parse(cached);
  } catch {}

  try {
    const area = await detectDetailedGPSArea();
    if (area && area.formatted_address) {
      const result: DetectedLocation = {
        city: area.city_town || "Visakhapatnam",
        state: area.state || "Andhra Pradesh",
        lat: area.lat ?? 17.6868,
        lon: area.lon ?? 83.2185
      };
      try {
        localStorage.setItem("varthanow_gps_location", JSON.stringify(result));
      } catch {}
      return result;
    }
  } catch (e) {
    console.warn("detectGPSLocation error:", e);
  }

  return {
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    lat: 17.6868,
    lon: 83.2185
  };
}

export interface DetailedAreaResult {
  formatted_address: string;
  suburb_village?: string;
  city_town: string;
  district_mandal?: string;
  state: string;
  pincode?: string;
  lat?: number;
  lon?: number;
  detection_source?: "gps" | "network" | "ip";
  error_type?: "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "NOT_SUPPORTED" | "UNKNOWN";
  error_message?: string;
}

// 🏛️ Structured District -> Mandals/Towns Dataset for Andhra Pradesh & Telangana
export interface DistrictMandalData {
  district_te: string;
  district_en: string;
  state: "AP" | "TS";
  mandals: { name_te: string; name_en: string }[];
}

export const AP_TS_DISTRICTS_MANDALS: DistrictMandalData[] = [
  {
    district_te: "విశాఖపట్నం (Visakhapatnam)",
    district_en: "Visakhapatnam",
    state: "AP",
    mandals: [
      { name_te: "మధురవాడ (Madhurawada)", name_en: "Madhurawada" },
      { name_te: "గాజువాక (Gajuwaka)", name_en: "Gajuwaka" },
      { name_te: "ఎంవీపీ కాలనీ (MVP Colony)", name_en: "MVP Colony" },
      { name_te: "ఆనందపురం (Anandapuram)", name_en: "Anandapuram" },
      { name_te: "భీమునిపట్నం (Bheemunipatnam / Bheemili)", name_en: "Bheemunipatnam" },
      { name_te: "సీతమ్మధార (Seethammadhara)", name_en: "Seethammadhara" },
      { name_te: "జగదాంబ (Jagadamba Center)", name_en: "Jagadamba" },
      { name_te: "పెందుర్తి (Pendurthi)", name_en: "Pendurthi" },
      { name_te: "గోపాలపట్నం (Gopalapatnam)", name_en: "Gopalapatnam" },
      { name_te: "పద్మనాభం (Padmanabham)", name_en: "Padmanabham" },
      { name_te: "పీఎమ్‌పాలెం (PM Palem)", name_en: "PM Palem" },
      { name_te: "రుషికొండ (Rushikonda)", name_en: "Rushikonda" },
      { name_te: "కూర్మన్నపాలెం / స్టీల్ ప్లాంట్", name_en: "Kurmannapalem / Steel Plant" },
      { name_te: "ఎన్‌ఏడీ జంక్షన్ (NAD Junction)", name_en: "NAD Junction" },
      { name_te: "అక్కయ్యపాలెం (Akkayyapalem)", name_en: "Akkayyapalem" },
      { name_te: "సింహాచలం (Simhachalam)", name_en: "Simhachalam" }
    ]
  },
  {
    district_te: "ఎన్టీఆర్ / విజయవాడ (NTR / Vijayawada)",
    district_en: "Vijayawada",
    state: "AP",
    mandals: [
      { name_te: "బెంచ్ సర్కిల్ (Benz Circle)", name_en: "Benz Circle" },
      { name_te: "పటమట (Patamata)", name_en: "Patamata" },
      { name_te: "గుణదల (Gunadala)", name_en: "Gunadala" },
      { name_te: "గవర్నర్ పేట (Governorpet)", name_en: "Governorpet" },
      { name_te: "పోరంకి (Poranki)", name_en: "Poranki" },
      { name_te: "ఇబ్రహీంపట్నం (Ibrahimpatnam)", name_en: "Ibrahimpatnam" },
      { name_te: "గుడివాడ (Gudivada)", name_en: "Gudivada" },
      { name_te: "మచిలీపట్నం (Machilipatnam)", name_en: "Machilipatnam" },
      { name_te: "కంచికచర్ల (Kanchikacherla)", name_en: "Kanchikacherla" },
      { name_te: "నందిగామ (Nandigama)", name_en: "Nandigama" },
      { name_te: "మైలవరం (Mylavaram)", name_en: "Mylavaram" }
    ]
  },
  {
    district_te: "గుంటూరు / అమరావతి (Guntur / Amaravati)",
    district_en: "Guntur",
    state: "AP",
    mandals: [
      { name_te: "బ్రోడీపేట (Brodipet)", name_en: "Brodipet" },
      { name_te: "అరుండల్ పేట (Arundelpet)", name_en: "Arundelpet" },
      { name_te: "అమరావతి రాజధాని (Amaravati Capital)", name_en: "Amaravati" },
      { name_te: "మంగళగిరి (Mangalagiri)", name_en: "Mangalagiri" },
      { name_te: "తాడేపల్లి (Tadepalli)", name_en: "Tadepalli" },
      { name_te: "తెనాలి (Tenali)", name_en: "Tenali" },
      { name_te: "నరసరావుపేట (Narasaraopet)", name_en: "Narasaraopet" },
      { name_te: "బాపట్ల (Bapatla)", name_en: "Bapatla" },
      { name_te: "పొన్నూరు (Ponnur)", name_en: "Ponnur" }
    ]
  },
  {
    district_te: "తిరుపతి / చిత్తూరు (Tirupati / Chittoor)",
    district_en: "Tirupati",
    state: "AP",
    mandals: [
      { name_te: "అలిపిరి (Alipiri)", name_en: "Alipiri" },
      { name_te: "ఎమ్మార్ పల్లి (MR Palle)", name_en: "MR Palle" },
      { name_te: "చంద్రగిరి (Chandragiri)", name_en: "Chandragiri" },
      { name_te: "రేణిగుంట (Renigunta)", name_en: "Renigunta" },
      { name_te: "శ్రీకాళహస్తి (Srikalahasti)", name_en: "Srikalahasti" },
      { name_te: "మదనపల్లె (Madanapalle)", name_en: "Madanapalle" },
      { name_te: "చిత్తూరు (Chittoor Town)", name_en: "Chittoor" },
      { name_te: "పీలేరు (Pileru)", name_en: "Pileru" }
    ]
  },
  {
    district_te: "తూర్పు గోదావరి / కాకినాడ / రాజమండ్రి",
    district_en: "Kakinada / Rajahmundry",
    state: "AP",
    mandals: [
      { name_te: "రాజమండ్రి అర్బన్ (Rajahmundry)", name_en: "Rajahmundry" },
      { name_te: "కాకినాడ అర్బన్ (Kakinada)", name_en: "Kakinada" },
      { name_te: "దానవాయిపేట (Danavaipeta)", name_en: "Danavaipeta" },
      { name_te: "సామర్లకోట (Samalkot)", name_en: "Samalkot" },
      { name_te: "పిఠాపురం (Pithapuram)", name_en: "Pithapuram" },
      { name_te: "తుని (Tuni)", name_en: "Tuni" },
      { name_te: "అనపర్తి (Anaparthy)", name_en: "Anaparthy" },
      { name_te: "అమలాపురం (Amalapuram)", name_en: "Amalapuram" }
    ]
  },
  {
    district_te: "పశ్చిమ గోదావరి / ఏలూరు / భీమవరం",
    district_en: "Eluru / Bhimavaram",
    state: "AP",
    mandals: [
      { name_te: "ఏలూరు (Eluru)", name_en: "Eluru" },
      { name_te: "భీమవరం (Bhimavaram)", name_en: "Bhimavaram" },
      { name_te: "తణుకు (Tanuku)", name_en: "Tanuku" },
      { name_te: "తాడేపల్లిగూడెం (Tadepalligudem)", name_en: "Tadepalligudem" },
      { name_te: "పాలకొల్లు (Palakollu)", name_en: "Palakollu" },
      { name_te: "నరసాపురం (Narsapuram)", name_en: "Narsapuram" },
      { name_te: "జంగారెడ్డిగూడెం (Jangareddygudem)", name_en: "Jangareddygudem" }
    ]
  },
  {
    district_te: "అనకాపల్లి / అరకు / పాడేరు",
    district_en: "Anakapalli / Araku",
    state: "AP",
    mandals: [
      { name_te: "అనకాపల్లి (Anakapalli)", name_en: "Anakapalli" },
      { name_te: "చోడవరం (Chodavaram)", name_en: "Chodavaram" },
      { name_te: "యలమంచిలి (Yelamanchili)", name_en: "Yelamanchili" },
      { name_te: "నర్సీపట్నం (Narsipatnam)", name_en: "Narsipatnam" },
      { name_te: "అరకు వ్యాలీ (Araku Valley)", name_en: "Araku Valley" },
      { name_te: "పాడేరు (Paderu)", name_en: "Paderu" },
      { name_te: "అట్చుతాపురం (Atchutapuram)", name_en: "Atchutapuram" }
    ]
  },
  {
    district_te: "విజయనగరం / శ్రీకాకుళం",
    district_en: "Vizianagaram / Srikakulam",
    state: "AP",
    mandals: [
      { name_te: "విజయనగరం (Vizianagaram)", name_en: "Vizianagaram" },
      { name_te: "శ్రీకాకుళం (Srikakulam)", name_en: "Srikakulam" },
      { name_te: "భోగాపురం (Bhogapuram)", name_en: "Bhogapuram" },
      { name_te: "బొబ్బిలి (Bobbili)", name_en: "Bobbili" },
      { name_te: "పలాస (Palasa)", name_en: "Palasa" },
      { name_te: "టెక్కలి (Tekkali)", name_en: "Tekkali" },
      { name_te: "రాజాం (Rajam)", name_en: "Rajam" }
    ]
  },
  {
    district_te: "రాయలసీమ (కర్నూలు / అనంతపురం / కడప)",
    district_en: "Kurnool / Anantapur / Kadapa",
    state: "AP",
    mandals: [
      { name_te: "కర్నూలు (Kurnool)", name_en: "Kurnool" },
      { name_te: "నంద్యాల (Nandyal)", name_en: "Nandyal" },
      { name_te: "అనంతపురం (Anantapur)", name_en: "Anantapur" },
      { name_te: "కడప (Kadapa)", name_en: "Kadapa" },
      { name_te: "ప్రొద్దుటూరు (Proddatur)", name_en: "Proddatur" },
      { name_te: "ధర్మవరం (Dharmavaram)", name_en: "Dharmavaram" },
      { name_te: "ఆదోని (Adoni)", name_en: "Adoni" },
      { name_te: "హిందూపురం (Hindupur)", name_en: "Hindupur" },
      { name_te: "పుట్టపర్తి (Puttaparthi)", name_en: "Puttaparthi" }
    ]
  },
  {
    district_te: "హైదరాబాద్ మెట్రో (Hyderabad Metro)",
    district_en: "Hyderabad",
    state: "TS",
    mandals: [
      { name_te: "గచ్చిబౌలి (Gachibowli)", name_en: "Gachibowli" },
      { name_te: "హైటెక్ సిటీ (HITECH City)", name_en: "HITECH City" },
      { name_te: "మాదాపూర్ (Madhapur)", name_en: "Madhapur" },
      { name_te: "కూకట్‌పల్లి (Kukatpally)", name_en: "Kukatpally" },
      { name_te: "బంజారా హిల్స్ (Banjara Hills)", name_en: "Banjara Hills" },
      { name_te: "జుబ్లీ హిల్స్ (Jubilee Hills)", name_en: "Jubilee Hills" },
      { name_te: "కొండాపూర్ (Kondapur)", name_en: "Kondapur" },
      { name_te: "మియాపూర్ (Miyapur)", name_en: "Miyapur" },
      { name_te: "సికింద్రాబాద్ (Secunderabad)", name_en: "Secunderabad" },
      { name_te: "అమీర్‌పేట్ (Ameerpet)", name_en: "Ameerpet" },
      { name_te: "దిల్‌సుఖ్‌నగర్ (Dilsukhnagar)", name_en: "Dilsukhnagar" },
      { name_te: "ఎల్బీ నగర్ (LB Nagar)", name_en: "LB Nagar" },
      { name_te: "ఉప్పల్ (Uppal)", name_en: "Uppal" },
      { name_te: "కొంపల్లి (Kompally)", name_en: "Kompally" },
      { name_te: "బాచపల్లి (Bachupally)", name_en: "Bachupally" }
    ]
  },
  {
    district_te: "తెలంగాణ జిల్లాలు (వరంగల్ / కరీంనగర్ / ఖమ్మం)",
    district_en: "Telangana Districts",
    state: "TS",
    mandals: [
      { name_te: "వరంగల్ (Warangal)", name_en: "Warangal" },
      { name_te: "హన్మకొండ (Hanamkonda)", name_en: "Hanamkonda" },
      { name_te: "కరీంనగర్ (Karimnagar)", name_en: "Karimnagar" },
      { name_te: "ఖమ్మం (Khammam)", name_en: "Khammam" },
      { name_te: "నిజామాబాద్ (Nizamabad)", name_en: "Nizamabad" },
      { name_te: "రామగుండం (Ramagundam)", name_en: "Ramagundam" },
      { name_te: "సిద్దిపేట (Siddipet)", name_en: "Siddipet" },
      { name_te: "సూర్యాపేట (Suryapet)", name_en: "Suryapet" },
      { name_te: "మహబూబ్‌నగర్ (Mahbubnagar)", name_en: "Mahbubnagar" },
      { name_te: "నల్గొండ (Nalgonda)", name_en: "Nalgonda" }
    ]
  }
];

// 🌐 Convert English Area / Locality names into standard Telugu
export async function convertAreaToTelugu(englishText: string): Promise<string> {
  if (!englishText || !englishText.trim()) return "";
  
  // If already 100% Telugu with NO English letters, return as is
  if (!/[a-zA-Z]/.test(englishText)) {
    return englishText;
  }

  // 1. Google Translate API (en -> te)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=te&dt=t&q=${encodeURIComponent(englishText.trim())}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && Array.isArray(data[0])) {
        const teluguStr = data[0].map((item: any) => item[0]).filter(Boolean).join("").trim();
        if (teluguStr && /[\u0C00-\u0C7F]/.test(teluguStr)) {
          return teluguStr;
        }
      }
    }
  } catch (err) {
    console.warn("Google translate to Telugu error:", err);
  }

  // 2. MyMemory Translation API fallback
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText.trim())}&langpair=en|te`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText && /[\u0C00-\u0C7F]/.test(data.responseData.translatedText)) {
        return data.responseData.translatedText.trim();
      }
    }
  } catch (err) {
    console.warn("MyMemory translation fallback error:", err);
  }

  // 3. Fallback dictionary replacements for common words & localities
  let translated = englishText;
  const dict: Record<string, string> = {
    "Ward": "వార్డ్",
    "East": "ఈస్ట్",
    "West": "వెస్ట్",
    "North": "నార్త్",
    "South": "సౌత్",
    "Anand": "ఆనంద్",
    "Bagh": "బాగ్",
    "Hyderabad": "హైదరాబాద్",
    "Visakhapatnam": "విశాఖపట్నం",
    "Vijayawada": "విజయవాడ",
    "Guntur": "గుంటూరు",
    "Tirupati": "తిరుపతి",
    "Rajahmundry": "రాజమండ్రి",
    "Kakinada": "కాకినాడ",
    "Kurnool": "కర్నూలు",
    "Nellore": "నెల్లూరు",
    "Kadapa": "కడప",
    "Anantapur": "అనంతపురం",
    "Vizianagaram": "విజయనగరం",
    "Srikakulam": "శ్రీకాకుళం",
    "Warangal": "వరంగల్",
    "Secunderabad": "సికింద్రాబాద్",
    "Nagar": "నగర్",
    "Colony": "కాలనీ",
    "Road": "రోడ్డు",
    "Street": "వీధి",
    "Village": "గ్రామం",
    "Mandal": "మండలం"
  };

  for (const [en, te] of Object.entries(dict)) {
    const re = new RegExp(`\\b${en}\\b`, "gi");
    translated = translated.replace(re, te);
  }

  return translated;
}

// 🏢 Reference Coordinates for AP & TS Regional Centers (Instant Offline / API Fallback)
const AP_TS_REFERENCE_COORDINATES: { name_te: string; name_en: string; lat: number; lon: number; state: string }[] = [
  // Visakhapatnam region
  { name_te: "విశాఖపట్నం (Visakhapatnam)", name_en: "Visakhapatnam", lat: 17.6868, lon: 83.2185, state: "Andhra Pradesh" },
  { name_te: "ఆనందపురం (Anandapuram)", name_en: "Anandapuram", lat: 17.9095, lon: 83.3916, state: "Andhra Pradesh" },
  { name_te: "మధురవాడ (Madhurawada)", name_en: "Madhurawada", lat: 17.8184, lon: 83.3551, state: "Andhra Pradesh" },
  { name_te: "గాజువాక (Gajuwaka)", name_en: "Gajuwaka", lat: 17.6908, lon: 83.2185, state: "Andhra Pradesh" },
  { name_te: "పెందుర్తి (Pendurthi)", name_en: "Pendurthi", lat: 17.8347, lon: 83.2014, state: "Andhra Pradesh" },
  { name_te: "భీమిలి (Bheemili)", name_en: "Bheemunipatnam", lat: 17.8906, lon: 83.4542, state: "Andhra Pradesh" },
  // Krishna / NTR / Guntur
  { name_te: "విజయవాడ (Vijayawada)", name_en: "Vijayawada", lat: 16.5062, lon: 80.6480, state: "Andhra Pradesh" },
  { name_te: "గుంటూరు (Guntur)", name_en: "Guntur", lat: 16.3067, lon: 80.4365, state: "Andhra Pradesh" },
  { name_te: "మంగళగిరి (Mangalagiri)", name_en: "Mangalagiri", lat: 16.4325, lon: 80.5684, state: "Andhra Pradesh" },
  { name_te: "తెనాలి (Tenali)", name_en: "Tenali", lat: 16.2435, lon: 80.6401, state: "Andhra Pradesh" },
  // Godavari
  { name_te: "రాజమండ్రి (Rajahmundry)", name_en: "Rajahmundry", lat: 17.0005, lon: 81.8040, state: "Andhra Pradesh" },
  { name_te: "కాకినాడ (Kakinada)", name_en: "Kakinada", lat: 16.9891, lon: 82.2475, state: "Andhra Pradesh" },
  { name_te: "ఏలూరు (Eluru)", name_en: "Eluru", lat: 16.7107, lon: 81.0952, state: "Andhra Pradesh" },
  { name_te: "భీమవరం (Bhimavaram)", name_en: "Bhimavaram", lat: 16.5449, lon: 81.5212, state: "Andhra Pradesh" },
  // Rayalaseema & South AP
  { name_te: "తిరుపతి (Tirupati)", name_en: "Tirupati", lat: 13.6288, lon: 79.4192, state: "Andhra Pradesh" },
  { name_te: "కర్నూలు (Kurnool)", name_en: "Kurnool", lat: 15.8281, lon: 78.0373, state: "Andhra Pradesh" },
  { name_te: "నెల్లూరు (Nellore)", name_en: "Nellore", lat: 14.4426, lon: 79.9865, state: "Andhra Pradesh" },
  { name_te: "కడప (Kadapa)", name_en: "Kadapa", lat: 14.4673, lon: 78.8242, state: "Andhra Pradesh" },
  { name_te: "అనంతపురం (Anantapur)", name_en: "Anantapur", lat: 14.6819, lon: 77.6006, state: "Andhra Pradesh" },
  { name_te: "ఒంగోలు (Ongole)", name_en: "Ongole", lat: 15.5057, lon: 80.0499, state: "Andhra Pradesh" },
  // North Andhra
  { name_te: "విజయనగరం (Vizianagaram)", name_en: "Vizianagaram", lat: 18.1067, lon: 83.3956, state: "Andhra Pradesh" },
  { name_te: "శ్రీకాకుళం (Srikakulam)", name_en: "Srikakulam", lat: 18.2969, lon: 83.8968, state: "Andhra Pradesh" },
  // Hyderabad & Telangana
  { name_te: "హైదరాబాద్ (Hyderabad)", name_en: "Hyderabad", lat: 17.3850, lon: 78.4867, state: "Telangana" },
  { name_te: "కూకట్‌పల్లి (Kukatpally)", name_en: "Kukatpally", lat: 17.4933, lon: 78.4011, state: "Telangana" },
  { name_te: "సికింద్రాబాద్ (Secunderabad)", name_en: "Secunderabad", lat: 17.4399, lon: 78.4983, state: "Telangana" },
  { name_te: "వరంగల్ (Warangal)", name_en: "Warangal", lat: 17.9689, lon: 79.5941, state: "Telangana" },
  { name_te: "కరీంనగర్ (Karimnagar)", name_en: "Karimnagar", lat: 18.4386, lon: 79.1288, state: "Telangana" },
  { name_te: "ఖమ్మం (Khammam)", name_en: "Khammam", lat: 17.2473, lon: 80.1514, state: "Telangana" },
  { name_te: "నిజామాబాద్ (Nizamabad)", name_en: "Nizamabad", lat: 18.6725, lon: 78.0941, state: "Telangana" }
];

// Multi-source IP / Network Location fallback for when satellite GPS is unavailable or timed out on mobile indoors
async function getNetworkIPLocation(): Promise<{
  latitude: number;
  longitude: number;
  locality?: string;
  city?: string;
  state?: string;
} | null> {
  // 1. Try BigDataCloud reverse-geocode-client (no params = automatically uses caller's public IP)
  try {
    const res = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client", {
      headers: { Accept: "application/json" }
    });
    if (res.ok) {
      const data = await res.json();
      const lat = parseFloat(data.latitude);
      const lon = parseFloat(data.longitude);
      if (!isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
        return {
          latitude: lat,
          longitude: lon,
          locality: data.locality || data.city || "",
          city: data.city || data.principalSubdivision || "",
          state: data.principalSubdivision || "Andhra Pradesh"
        };
      }
    }
  } catch (e) {
    console.warn("BigDataCloud IP lookup warning:", e);
  }

  // 2. Try ipwho.is (fast, CORS-enabled client-side fallback)
  try {
    const res = await fetch("https://ipwho.is/");
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        return {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          city: data.city || "",
          state: data.region || "Andhra Pradesh"
        };
      }
    }
  } catch (e) {
    console.warn("ipwho.is IP lookup warning:", e);
  }

  return null;
}

export interface DeviceCoordsResult {
  latitude: number;
  longitude: number;
  source: "gps" | "network" | "ip";
}

// Helper to retrieve device coordinates with multi-strategy mobile support:
// 1. Fast network/cellular/cached GPS (5s timeout, 5-minute cache)
// 2. High accuracy satellite GPS (10s timeout, for mobile outdoors)
// 3. Instant IP geolocation fallback (eliminates false "GPS not enabled" on mobile indoors)
async function getDeviceCoordinates(): Promise<DeviceCoordsResult> {
  if (typeof window !== "undefined" && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        let isResolved = false;
        let watchId: number | null = null;

        const onComplete = (p: GeolocationPosition) => {
          if (!isResolved) {
            isResolved = true;
            if (watchId !== null) {
              try { navigator.geolocation.clearWatch(watchId); } catch {}
              watchId = null;
            }
            resolve(p);
          }
        };

        // 1. Strategy A: Low-accuracy / Network / Wi-Fi / Google Play Services location cache
        // On mobile, this returns in ~200-500ms even when indoors without satellite lock!
        navigator.geolocation.getCurrentPosition(
          onComplete,
          (err) => {
            // Strategy B: If low-accuracy failed, try High Accuracy with 10s timeout
            navigator.geolocation.getCurrentPosition(
              onComplete,
              (err2) => {
                if (!isResolved) {
                  isResolved = true;
                  if (watchId !== null) {
                    try { navigator.geolocation.clearWatch(watchId); } catch {}
                    watchId = null;
                  }
                  reject(err2);
                }
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
        );

        // Strategy C: Parallel burst with watchPosition for mobile Chrome/Safari
        try {
          watchId = navigator.geolocation.watchPosition(
            (p) => onComplete(p),
            () => {},
            { enableHighAccuracy: false, timeout: 6000, maximumAge: 180000 }
          );
        } catch {}

        // Global safety timer (12 seconds max before falling back to IP)
        setTimeout(() => {
          if (!isResolved) {
            if (watchId !== null) {
              try { navigator.geolocation.clearWatch(watchId); } catch {}
              watchId = null;
            }
            reject(new Error("GEOLOCATION_TIMEOUT"));
          }
        }, 12000);
      });

      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        source: pos.coords.accuracy && pos.coords.accuracy < 150 ? "gps" : "network"
      };
    } catch (geoErr) {
      console.warn("Mobile browser geolocation unavailable or timed out, trying IP/Network fallback...", geoErr);
    }
  }

  // Strategy D: IP / Network Fallback (Works on 100% of mobile phones without requiring satellite lock!)
  const ipResult = await getNetworkIPLocation();
  if (ipResult) {
    return {
      latitude: ipResult.latitude,
      longitude: ipResult.longitude,
      source: "ip"
    };
  }

  throw new Error("COORDINATES_UNAVAILABLE");
}

// Multi-tier reverse geocode: BigDataCloud -> Nominatim -> Known Coordinates Distance Match
async function reverseGeocodeWithFallbacks(latitude: number, longitude: number): Promise<{
  formatted_address: string;
  suburb_village?: string;
  city_town: string;
  district_mandal?: string;
  state: string;
  pincode?: string;
}> {
  // Strategy 1: BigDataCloud Reverse Geocode Client API (Reliable, fast, no 429 rate limit issues on client browsers)
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const locality = bdcData.locality || "";
      const city = bdcData.city || bdcData.principalSubdivision || "";
      const state = bdcData.principalSubdivision || "Andhra Pradesh";
      const postcode = bdcData.postcode || "";

      let formatted = "";
      if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
        formatted = `${locality}, ${city}`;
      } else if (city) {
        formatted = `${city}, ${state}`;
      } else if (locality) {
        formatted = `${locality}, ${state}`;
      }

      if (formatted) {
        let teluguAddress = formatted;
        try {
          teluguAddress = await convertAreaToTelugu(formatted);
        } catch (e) {
          console.warn("Telugu conversion error:", e);
        }

        return {
          formatted_address: teluguAddress || formatted,
          suburb_village: locality,
          city_town: city || "Visakhapatnam",
          district_mandal: locality || city,
          state,
          pincode: postcode
        };
      }
    }
  } catch (err) {
    console.warn("BigDataCloud reverse geocode error:", err);
  }

  // Strategy 2: OpenStreetMap Nominatim Reverse Geocode
  try {
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=te,en`,
      { headers: { "User-Agent": "VarthaNow-Location-Detector" } }
    );
    if (osmRes.ok) {
      const data = await osmRes.json();
      const address = data.address || {};
      const suburbOrVillage = address.suburb || address.village || address.neighbourhood || address.residential || address.road;
      const cityOrTown = address.city || address.town || address.municipality || address.county;
      const mandalOrDist = address.county || address.state_district || address.district;
      const state = address.state || "Andhra Pradesh";
      const pincode = address.postcode;

      let formatted = "";
      if (suburbOrVillage && cityOrTown) {
        formatted = `${suburbOrVillage}, ${cityOrTown}`;
      } else if (cityOrTown) {
        formatted = `${cityOrTown}, ${state}`;
      } else {
        formatted = data.display_name ? data.display_name.split(",").slice(0, 3).join(",") : "";
      }

      if (formatted) {
        let teluguAddress = formatted;
        try {
          teluguAddress = await convertAreaToTelugu(formatted);
        } catch (e) {
          console.warn("Telugu conversion error:", e);
        }

        return {
          formatted_address: teluguAddress || formatted,
          suburb_village: suburbOrVillage,
          city_town: cityOrTown || "Visakhapatnam",
          district_mandal: mandalOrDist,
          state,
          pincode
        };
      }
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode error:", err);
  }

  // Strategy 3: Nearest AP/TS Coordinates match fallback (Always works offline/when APIs fail)
  let closest = AP_TS_REFERENCE_COORDINATES[0];
  let minDistance = Infinity;
  for (const ref of AP_TS_REFERENCE_COORDINATES) {
    const d = Math.hypot(latitude - ref.lat, longitude - ref.lon);
    if (d < minDistance) {
      minDistance = d;
      closest = ref;
    }
  }

  return {
    formatted_address: closest.name_te,
    suburb_village: closest.name_en,
    city_town: closest.name_en,
    district_mandal: closest.name_en,
    state: closest.state
  };
}

// 🎯 Detect Detailed GPS Area (Street, Village, Mandal, City, District) with multi-device resilience
export async function detectDetailedGPSArea(): Promise<DetailedAreaResult | null> {
  try {
    const coords = await getDeviceCoordinates();
    const geo = await reverseGeocodeWithFallbacks(coords.latitude, coords.longitude);
    return {
      ...geo,
      lat: coords.latitude,
      lon: coords.longitude,
      detection_source: coords.source
    };
  } catch (err: any) {
    let errType: "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "UNKNOWN" = "UNKNOWN";
    let errMsg = "మొబైల్ లొకేషన్ గుర్తించడంలో ఆటంకం ఏర్పడింది. దయచేసి నేరుగా ఏరియా పేరు టైప్ చేయండి.";

    if (err?.code === 1 /* PERMISSION_DENIED */) {
      errType = "PERMISSION_DENIED";
      errMsg = "మొబైల్‌లో లొకేషన్ పర్మిషన్ (Location Permission) అవసరం. దయచేసి బ్రౌజర్ అడ్రస్ బార్‌లోని 🔒 లాక్ ఐకాన్‌పై క్లిక్ చేసి 'Location' ని Allow చేయండి.";
    } else if (err?.code === 2 /* POSITION_UNAVAILABLE */ || err?.message === "COORDINATES_UNAVAILABLE") {
      errType = "POSITION_UNAVAILABLE";
      errMsg = "మొబైల్‌లో 'Location' (లొకేషన్) లేదా 'GPS' ఆఫ్ అయి ఉండవచ్చు. దయచేసి మొబైల్ స్క్రీన్ పైనుండి క్రిందికి స్వైప్ చేసి (Quick Settings) 'Location' ఆన్ చేయండి.";
    } else if (err?.code === 3 /* TIMEOUT */ || err?.message === "GEOLOCATION_TIMEOUT") {
      errType = "TIMEOUT";
      errMsg = "లొకేషన్ సిగ్నల్ అందుకోవడానికి సమయం మించిపోయింది. దయచేసి మళ్ళీ ప్రయత్నించండి లేదా పైన ఏరియా పేరు టైప్ చేయండి.";
    }

    return {
      formatted_address: "",
      city_town: "",
      state: "",
      error_type: errType,
      error_message: errMsg
    };
  }
}

// 🌐 Convert Telugu text to English for cross-database querying
export async function convertTeluguToEnglish(teluguText: string): Promise<string> {
  if (!teluguText || !teluguText.trim()) return "";
  if (!/[\u0C00-\u0C7F]/.test(teluguText)) return teluguText;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=te&tl=en&dt=t&q=${encodeURIComponent(teluguText.trim())}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && Array.isArray(data[0])) {
        const enStr = data[0].map((item: any) => item[0]).filter(Boolean).join("").trim();
        if (enStr) return enStr;
      }
    }
  } catch (err) {
    console.warn("Telugu to English conversion error:", err);
  }

  return teluguText;
}

// 🔍 Search Area Autocomplete (Supports both Telugu and English input, detects name and full address)
export async function searchAreaAutocomplete(query: string): Promise<string[]> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.toLowerCase().trim();
  const isTeluguQuery = /[\u0C00-\u0C7F]/.test(cleanQuery);
  let englishQuery = cleanQuery;

  if (isTeluguQuery) {
    try {
      englishQuery = (await convertTeluguToEnglish(cleanQuery)).toLowerCase().trim();
    } catch {}
  }

  const apTsDbMatches: string[] = [];
  const otherDbMatches: string[] = [];
  const localMatches = new Set<string>();

  // 1. Match against Preloaded AP/TS database & All Mandals / Districts
  PRELOADED_AP_TS_LOCATIONS.forEach((loc) => {
    if (
      loc.name_te.toLowerCase().includes(cleanQuery) ||
      loc.name_en.toLowerCase().includes(cleanQuery) ||
      (isTeluguQuery && englishQuery && loc.name_en.toLowerCase().includes(englishQuery))
    ) {
      localMatches.add(loc.name_te);
    }
  });

  AP_TS_DISTRICTS_MANDALS.forEach((dist) => {
    if (
      dist.district_te.toLowerCase().includes(cleanQuery) ||
      dist.district_en.toLowerCase().includes(cleanQuery) ||
      (isTeluguQuery && englishQuery && dist.district_en.toLowerCase().includes(englishQuery))
    ) {
      localMatches.add(dist.district_te);
    }
    dist.mandals.forEach((mandal) => {
      if (
        mandal.name_te.toLowerCase().includes(cleanQuery) ||
        mandal.name_en.toLowerCase().includes(cleanQuery) ||
        (isTeluguQuery && englishQuery && mandal.name_en.toLowerCase().includes(englishQuery))
      ) {
        localMatches.add(`${mandal.name_te}, ${dist.district_te.split(" ")[0]}`);
      }
    });
  });

  // 2. Query Supabase Database Tables (osm_locations & india_post_locations)
  if (supabase) {
    try {
      const searchTerms = isTeluguQuery && englishQuery !== cleanQuery ? [cleanQuery, englishQuery] : [cleanQuery];
      const searchFilters = searchTerms
        .map((t) => `office_name.ilike.%${t}%,district.ilike.%${t}%`)
        .join(",");

      const osmFilters = searchTerms
        .map((t) => `name.ilike.%${t}%,mandal.ilike.%${t}%,district.ilike.%${t}%`)
        .join(",");

      const [osmRes, postRes] = await Promise.all([
        supabase
          .from("osm_locations")
          .select("name, mandal, district, state")
          .or(osmFilters)
          .limit(10),
        supabase
          .from("india_post_locations")
          .select("office_name, district, state, pincode")
          .or(searchFilters)
          .limit(15)
      ]);

      if (osmRes.data) {
        osmRes.data.forEach((row: any) => {
          if (row.name) {
            const isApTs = /andhra|telangana|ap|ts/i.test(row.state || "");
            if (isApTs) apTsDbMatches.push(row.name);
            else otherDbMatches.push(row.name);
          }
        });
      }
      if (postRes.data) {
        postRes.data.forEach((row: any) => {
          if (row.office_name && row.district) {
            const entry = `${row.office_name}, ${row.district} (${row.pincode || row.state})`;
            const isApTs = /andhra|telangana|ap|ts/i.test(row.state || "");
            if (isApTs) apTsDbMatches.push(entry);
            else otherDbMatches.push(entry);
          }
        });
      }
    } catch (e) {
      console.warn("Supabase location search error:", e);
    }
  }

  // 3. Fetch live OpenStreetMap Nominatim search results as fallback
  let liveMatches: string[] = [];
  if (localMatches.size + apTsDbMatches.length < 5) {
    try {
      const q = isTeluguQuery ? query : (englishQuery || query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=in&limit=6&accept-language=te,en`,
        { headers: { "User-Agent": "VarthaNow-Places-Search" } }
      );
      if (response.ok) {
        const data = await response.json();
        liveMatches = data.map((item: any) => {
          const parts = item.display_name.split(",");
          return parts.slice(0, 3).map((p: string) => p.trim()).join(", ");
        });
      }
    } catch (err) {
      console.warn("Live OSM search fallback:", err);
    }
  }

  // Convert any pure English matches to Telugu so users always get clean Telugu location and address
  const localList = Array.from(localMatches);
  const apTsConverted = await Promise.all(
    apTsDbMatches.map(async (m) => (!/[\u0C00-\u0C7F]/.test(m) ? await convertAreaToTelugu(m) : m))
  );
  const otherConverted = await Promise.all(
    [...liveMatches, ...otherDbMatches].map(async (m) => (!/[\u0C00-\u0C7F]/.test(m) ? await convertAreaToTelugu(m) : m))
  );

  const apTsCombined = Array.from(new Set([...localList, ...apTsConverted]));
  const otherCombined = Array.from(new Set(otherConverted));

  // Sort by prefix match against query (in Telugu or English)
  apTsCombined.sort((a, b) => {
    const aStarts = a.toLowerCase().startsWith(cleanQuery) || (englishQuery && a.toLowerCase().startsWith(englishQuery)) ? 0 : 1;
    const bStarts = b.toLowerCase().startsWith(cleanQuery) || (englishQuery && b.toLowerCase().startsWith(englishQuery)) ? 0 : 1;
    return aStarts - bStarts;
  });

  const combined = Array.from(new Set([...apTsCombined, ...otherCombined]));
  return combined.slice(0, 10);
}

export function getCachedGPSLocation(): DetectedLocation | null {
  try {
    const cached = localStorage.getItem("varthanow_gps_location");
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

