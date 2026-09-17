// 💍 Mana Adda Matrimony API Engine & Local Match Discovery
import { supabase, hasSupabaseEnv } from "./supabase";
import type { 
  MatrimonyProfile, 
  MatrimonyInterest, 
  MatrimonyContactRequest, 
  MatrimonySearchFilters,
  MatrimonyReport
} from "@/types/matrimony";

// Approximate Haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// 🌸 AUTHENTIC AP & TS SEED PROFILES (Respectful, Family-Friendly, Local)
export const SEED_MATRIMONY_PROFILES: MatrimonyProfile[] = [
  // BRIDES
  {
    id: "mp_bride_1",
    user_id: "usr_b1",
    profile_for: "daughter",
    profile_managed_by_label_te: "తల్లిదండ్రులు నిర్వహిస్తున్నారు",
    name: "అనుష (Anusha)",
    gender: "bride",
    date_of_birth: "1998-05-14",
    age: 26,
    height: "5'4\"",
    marital_status: "never_married",
    marital_status_label_te: "అవివాహిత (Never Married)",
    mother_tongue: "తెలుగు",
    religion: "హిందూ",
    community: "రెడ్డి / కాపు / కమ్మ / ఏదైనా",
    education: "B.Tech (CSE)",
    education_detail: "GVP College of Engineering, Vizag",
    occupation: "Software Professional",
    occupation_detail: "MNC Software Engineer, Remote",
    income_range: "₹9 - 12 లక్షలు/సం.",
    village_town: "అనకాపల్లి",
    mandal: "అనకాపల్లి",
    district: "Anakapalle",
    state: "Andhra Pradesh",
    lat_approx: 17.6913,
    lon_approx: 83.0039,
    distance_km: 12.0,
    about_te: "కుటుంబ విలువలను గౌరవించే సాంప్రదాయ మరియు విద్యావంతురాలైన అమ్మాయి. స్థిరపడిన మంచి కుటుంబం నుంచి సంబంధం కోసం చూస్తున్నాము.",
    family_type: "చిన్న కుటుంబం (Nuclear)",
    family_values: "సాంప్రదాయక & మోడరన్",
    diet: "శాకాహారం (Veg)",
    horoscope_available: true,
    rashi: "వృషభ రాశి",
    nakshatra: "రోహిణి",
    gothram: "కౌశికస",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
    ],
    photo_privacy: "public",
    contact_privacy: "request_only",
    verification_level: 2,
    verification_badge_label_te: "📱 మొబైల్ & ఐడీ వెరిఫైడ్",
    phone_masked: "+91 98480 *****",
    phone: "9848012345",
    profile_completeness: 85,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "mp_bride_2",
    user_id: "usr_b2",
    profile_for: "self",
    profile_managed_by_label_te: "స్వయంగా",
    name: "ప్రవల్లిక (Pravallika)",
    gender: "bride",
    date_of_birth: "2000-08-20",
    age: 24,
    height: "5'3\"",
    marital_status: "never_married",
    marital_status_label_te: "అవివాహిత (Never Married)",
    mother_tongue: "తెలుగు",
    religion: "హిందూ",
    community: "ఏదైనా (Caste No Bar)",
    caste_no_bar: true,
    education: "M.Sc (Maths)",
    education_detail: "Andhra University",
    occupation: "Bank PO / Officer",
    occupation_detail: "SBI Probationary Officer",
    income_range: "₹7 - 10 లక్షలు/సం.",
    village_town: "పెందుర్తి",
    mandal: "పెందుర్తి",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    lat_approx: 17.8306,
    lon_approx: 83.2014,
    distance_km: 8.0,
    about_te: "ప్రభుత్వ రంగ బ్యాంకులో ఉద్యోగం చేస్తున్నాను. అర్థం చేసుకునే మనస్తత్వం గల భాగస్వామిని కోరుకుంటున్నాను.",
    family_type: "మధ్యతరగతి కుటుంబం",
    family_values: "సాంప్రదాయక",
    diet: "శాకాహారం (Veg)",
    horoscope_available: true,
    rashi: "తుల రాశి",
    nakshatra: "స్వాతి",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
    ],
    photo_privacy: "public",
    contact_privacy: "request_only",
    verification_level: 2,
    verification_badge_label_te: "📱 మొబైల్ & ఉద్యోగం వెరిఫైడ్",
    phone_masked: "+91 94401 *****",
    phone: "9440154321",
    profile_completeness: 90,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "mp_bride_3",
    user_id: "usr_b3",
    profile_for: "sister",
    profile_managed_by_label_te: "సోదరుడు నిర్వహిస్తున్నారు",
    name: "దీప్తి (Deepthi)",
    gender: "bride",
    date_of_birth: "1997-03-11",
    age: 27,
    height: "5'5\"",
    marital_status: "never_married",
    marital_status_label_te: "అవివాహిత (Never Married)",
    mother_tongue: "తెలుగు",
    religion: "హిందూ",
    community: "కాపు / బలిజ",
    education: "MCA",
    education_detail: "Gayatri Vidya Parishad",
    occupation: "IT Analyst",
    occupation_detail: "Tech Mahindra, Vizag",
    income_range: "₹8 - 11 లక్షలు/సం.",
    village_town: "గాజువాక",
    mandal: "గాజువాక",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    lat_approx: 17.6908,
    lon_approx: 83.2082,
    distance_km: 5.5,
    about_te: "గాజువాకలో నివసిస్తున్నాము. సాఫ్ట్‌వేర్ రంగంలో పనిచేస్తున్నది. ప్రశాంతమైన మరియు బాధ్యతాయుతమైన వరుడు కావాలి.",
    family_type: "ఉమ్మడి కుటుంబం (Joint)",
    family_values: "మోడరన్",
    diet: "మిశ్రమం (Flexitarian)",
    horoscope_available: true,
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
    ],
    photo_privacy: "public",
    contact_privacy: "request_only",
    verification_level: 1,
    verification_badge_label_te: "📱 మొబైల్ వెరిఫైడ్",
    phone_masked: "+91 99890 *****",
    phone: "9989012345",
    profile_completeness: 80,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "mp_bride_4",
    user_id: "usr_b4",
    profile_for: "daughter",
    profile_managed_by_label_te: "తల్లిదండ్రులు",
    name: "సౌమ్య (Sowmya)",
    gender: "bride",
    date_of_birth: "1999-11-25",
    age: 25,
    height: "5'2\"",
    marital_status: "never_married",
    marital_status_label_te: "అవివాహిత (Never Married)",
    mother_tongue: "తెలుగు",
    religion: "హిందూ",
    community: "ఏదైనా",
    caste_no_bar: true,
    education: "B.Com, MBA",
    education_detail: "Dr. B.R. Ambedkar University",
    occupation: "Accountant / Finance",
    occupation_detail: "Chartered Firm Accountant",
    income_range: "₹5 - 7 లక్షలు/సం.",
    village_town: "సబ్బవరం",
    mandal: "సబ్బవరం",
    district: "Anakapalle",
    state: "Andhra Pradesh",
    lat_approx: 17.7946,
    lon_approx: 83.1362,
    distance_km: 2.5,
    about_te: "సబ్బవరం ప్రాంతానికి చెందిన అమ్మాయి. గౌరవప్రదమైన కుటుంబం. వ్యవసాయం లేదా స్థానిక వ్యాపారం/ఉద్యోగం ఉన్న సంబంధం నచ్చుతుంది.",
    family_type: "చిన్న కుటుంబం",
    family_values: "సాంప్రదాయక",
    diet: "శాకాహారం",
    horoscope_available: true,
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80"
    ],
    photo_privacy: "public",
    contact_privacy: "request_only",
    verification_level: 2,
    verification_badge_label_te: "📱 మొబైల్ & ఆధార్ వెరిఫైడ్",
    phone_masked: "+91 98491 *****",
    phone: "9849167890",
    profile_completeness: 85,
    is_active: true,
    created_at: new Date().toISOString()
  },

  // GROOMS
  {
    id: "mp_groom_1",
    user_id: "usr_g1",
    profile_for: "son",
    profile_managed_by_label_te: "తల్లిదండ్రులు నిర్వహిస్తున్నారు",
    name: "సాయి కుమార్ (Sai Kumar)",
    gender: "groom",
    date_of_birth: "1995-04-10",
    age: 29,
    height: "5'9\"",
    marital_status: "never_married",
    marital_status_label_te: "అవివాహితుడు (Never Married)",
    mother_tongue: "తెలుగు",
    religion: "హిందూ",
    community: "ఏదైనా (Caste No Bar)",
    caste_no_bar: true,
    education: "M.Tech / B.Ed",
    education_detail: "Andhra University",
    occupation: "Govt High School Teacher",
    occupation_detail: "AP State Government Teacher",
    income_range: "₹8 - 10 లక్షలు/సం.",
    village_town: "సబ్బవరం",
    mandal: "సబ్బవరం",
    district: "Anakapalle",
    state: "Andhra Pradesh",
    lat_approx: 17.7946,
    lon_approx: 83.1362,
    distance_km: 3.5,
    about_te: "ప్రభుత్వ ఉపాధ్యాయుడిగా పనిచేస్తున్నాడు. సబ్బవరం మండలంలో సొంత ఇల్లు, వ్యవసాయ భూమి కలదు. సంస్కారవంతమైన అమ్మాయి కోసం చూస్తున్నాము.",
    family_type: "ఉమ్మడి కుటుంబం (Joint)",
    family_values: "సాంప్రదాయక",
    diet: "శాకాహారం (Veg)",
    horoscope_available: true,
    rashi: "సింహ రాశి",
    nakshatra: "మఖ",
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"
    ],
    photo_privacy: "public",
    contact_privacy: "request_only",
    verification_level: 2,
    verification_badge_label_te: "📱 మొబైల్ & ఉద్యోగం వెరిఫైడ్",
    phone_masked: "+91 98481 *****",
    phone: "9848123456",
    profile_completeness: 90,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "mp_groom_2",
    user_id: "usr_g2",
    profile_for: "self",
    profile_managed_by_label_te: "స్వయంగా",
    name: "వెంకట రమణ (Venkata Ramana)",
    gender: "groom",
    date_of_birth: "1993-09-18",
    age: 31,
    height: "5'10\"",
    marital_status: "never_married",
    marital_status_label_te: "అవివాహితుడు (Never Married)",
    mother_tongue: "తెలుగు",
    religion: "హిందూ",
    community: "కాపు / చౌదరి / ఏదైనా",
    education: "MBA (Agri Business)",
    education_detail: "Acharya N.G. Ranga Agri University",
    occupation: "Business / Agro Agency",
    occupation_detail: "Wholesale Seeds & Fertilizers Business",
    income_range: "₹15 - 20 లక్షలు/సం.",
    village_town: "మధురవాడ",
    mandal: "మధురవాడ",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    lat_approx: 17.8184,
    lon_approx: 83.3512,
    distance_km: 14.0,
    about_te: "వైజాగ్ మరియు పరిసరాల్లో సొంత ఆగ్రో వ్యాపారం నడుపుతున్నాను. స్నేహశీలి మరియు కుటుంబాన్ని ప్రేమించే భాగస్వామిని ఆశిస్తున్నాను.",
    family_type: "చిన్న కుటుంబం",
    family_values: "మోడరన్",
    diet: "మాంసాహారం",
    horoscope_available: true,
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
    ],
    photo_privacy: "public",
    contact_privacy: "request_only",
    verification_level: 1,
    verification_badge_label_te: "📱 మొబైల్ వెరిఫైడ్",
    phone_masked: "+91 98485 *****",
    phone: "9848567890",
    profile_completeness: 85,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "mp_groom_3",
    user_id: "usr_g3",
    profile_for: "brother",
    profile_managed_by_label_te: "సోదరుడు",
    name: "కిరణ్ కుమార్ (Kiran Kumar)",
    gender: "groom",
    date_of_birth: "1996-01-15",
    age: 28,
    height: "5'11\"",
    marital_status: "never_married",
    marital_status_label_te: "అవివాహితుడు (Never Married)",
    mother_tongue: "తెలుగు",
    religion: "హిందూ",
    community: "ఏదైనా",
    caste_no_bar: true,
    education: "B.Tech (IT)",
    education_detail: "GITAM University",
    occupation: "Senior Software Engineer",
    occupation_detail: "Hyderabad Tech Company (Work From Home)",
    income_range: "₹14 - 18 లక్షలు/సం.",
    village_town: "అనకాపల్లి",
    mandal: "అనకాపల్లి",
    district: "Anakapalle",
    state: "Andhra Pradesh",
    lat_approx: 17.6913,
    lon_approx: 83.0039,
    distance_km: 11.5,
    about_te: "అనకాపల్లిలో నివాసం. హైదరాబాద్ కంపెనీలో సీనియర్ సాఫ్ట్‌వేర్ ఇంజనీర్ గా వర్క్ ఫ్రమ్ హోమ్ చేస్తున్నాడు. విద్యావంతురాలైన వధువు కోసం చూస్తున్నాము.",
    family_type: "చిన్న కుటుంబం",
    family_values: "మోడరన్",
    diet: "శాకాహారం",
    horoscope_available: true,
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"
    ],
    photo_privacy: "public",
    contact_privacy: "request_only",
    verification_level: 2,
    verification_badge_label_te: "📱 మొబైల్ & ఆధార్ వెరిఫైడ్",
    phone_masked: "+91 97010 *****",
    phone: "9701043210",
    profile_completeness: 85,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// LocalStorage Keys for user state
const STORAGE_MATRIMONY_USER_PROFILE = "mana_adda_user_matrimony_profile";
const STORAGE_MATRIMONY_INTERESTS = "mana_adda_matrimony_interests";
const STORAGE_MATRIMONY_CONTACT_REQUESTS = "mana_adda_matrimony_contact_requests";
const STORAGE_MATRIMONY_SAVED = "mana_adda_matrimony_saved_ids";
const STORAGE_MATRIMONY_BLOCKED = "mana_adda_matrimony_blocked_ids";

// 📦 GET USER OWN PROFILE
export function getUserMatrimonyProfile(): MatrimonyProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_MATRIMONY_USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// 📦 SAVE USER OWN PROFILE
export function saveUserMatrimonyProfile(profile: MatrimonyProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_MATRIMONY_USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.warn("Error saving user matrimony profile:", err);
  }
}

// 📦 GET SAVED IDS
export function getSavedMatrimonyProfileIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_MATRIMONY_SAVED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSaveMatrimonyProfile(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const existing = getSavedMatrimonyProfileIds();
    const isSaved = existing.includes(id);
    const updated = isSaved ? existing.filter((x) => x !== id) : [...existing, id];
    localStorage.setItem(STORAGE_MATRIMONY_SAVED, JSON.stringify(updated));
    return !isSaved;
  } catch {
    return false;
  }
}

// 📦 GET INTERESTS
export function getMatrimonyInterests(): MatrimonyInterest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_MATRIMONY_INTERESTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function sendMatrimonyInterest(senderId: string, senderName: string, receiverId: string): MatrimonyInterest {
  const existing = getMatrimonyInterests();
  const newInterest: MatrimonyInterest = {
    id: `int_${Date.now()}`,
    sender_profile_id: senderId,
    sender_name: senderName,
    receiver_profile_id: receiverId,
    status: "pending",
    created_at: new Date().toISOString()
  };
  const updated = [newInterest, ...existing.filter((i) => i.receiver_profile_id !== receiverId)];
  localStorage.setItem(STORAGE_MATRIMONY_INTERESTS, JSON.stringify(updated));
  return newInterest;
}

// 📦 GET CONTACT REQUESTS
export function getMatrimonyContactRequests(): MatrimonyContactRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_MATRIMONY_CONTACT_REQUESTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function requestMatrimonyContact(targetProfileId: string, requesterName: string, requesterPhone: string): MatrimonyContactRequest {
  const existing = getMatrimonyContactRequests();
  const req: MatrimonyContactRequest = {
    id: `req_${Date.now()}`,
    requester_profile_id: "usr_self",
    requester_name: requesterName,
    requester_phone: requesterPhone,
    target_profile_id: targetProfileId,
    status: "pending",
    created_at: new Date().toISOString()
  };
  const updated = [req, ...existing.filter((r) => r.target_profile_id !== targetProfileId)];
  localStorage.setItem(STORAGE_MATRIMONY_CONTACT_REQUESTS, JSON.stringify(updated));
  return req;
}

// 📦 GET BLOCKED IDS
export function getBlockedMatrimonyProfileIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_MATRIMONY_BLOCKED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function blockMatrimonyProfile(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getBlockedMatrimonyProfileIds();
    if (!existing.includes(id)) {
      localStorage.setItem(STORAGE_MATRIMONY_BLOCKED, JSON.stringify([...existing, id]));
    }
  } catch {}
}

export async function reportMatrimonyProfile(report: MatrimonyReport): Promise<{ success: boolean; message: string }> {
  if (hasSupabaseEnv && supabase) {
    try {
      await supabase.from("matrimony_reports").insert([report]);
    } catch (e) {
      console.warn("Matrimony report submission error:", e);
    }
  }
  return {
    success: true,
    message: "మీ ఫిర్యాదు నమోదు చేయబడింది. మా బృందం దీనిని పరిశీలిస్తుంది."
  };
}

// 🚀 SEARCH MATRIMONY PROFILES (Local Match Rings & Geospatial Discovery)
export async function searchMatrimonyProfiles(filters: MatrimonySearchFilters): Promise<{
  profiles: MatrimonyProfile[];
  rings: {
    very_near: MatrimonyProfile[];
    nearby_towns: MatrimonyProfile[];
    wider: MatrimonyProfile[];
  };
  total: number;
}> {
  let list = [...SEED_MATRIMONY_PROFILES];

  // Include user profile if created and matches criteria
  const userProf = getUserMatrimonyProfile();
  if (userProf) {
    list = [userProf, ...list.filter((p) => p.id !== userProf.id)];
  }

  // Filter by Blocked
  const blockedIds = getBlockedMatrimonyProfileIds();
  list = list.filter((p) => !blockedIds.includes(p.id));

  // Filter by Gender
  if (filters.gender) {
    list = list.filter((p) => p.gender === filters.gender);
  }

  // Filter by Age
  if (filters.age_min) {
    list = list.filter((p) => p.age >= filters.age_min!);
  }
  if (filters.age_max) {
    list = list.filter((p) => p.age <= filters.age_max!);
  }

  // Calculate Distance from Reference Point (Default Sabbavaram / Vizag 17.7946, 83.1362)
  const refLat = filters.lat || 17.7946;
  const refLon = filters.lon || 83.1362;

  list = list.map((p) => {
    const dist = calculateDistanceKm(refLat, refLon, p.lat_approx, p.lon_approx);
    return {
      ...p,
      distance_km: dist
    };
  });

  // Calculate Local Match Rings
  const veryNear = list.filter((p) => (p.distance_km || 0) <= 10);
  const nearbyTowns = list.filter((p) => (p.distance_km || 0) > 10 && (p.distance_km || 0) <= 25);
  const wider = list.filter((p) => (p.distance_km || 0) > 25);

  // Filter by Ring Tier if active
  if (filters.ring_tier === "very_near") {
    list = veryNear;
  } else if (filters.ring_tier === "nearby_towns") {
    list = nearbyTowns;
  } else if (filters.ring_tier === "wider") {
    list = wider;
  } else if (filters.radius_km && filters.radius_km > 0) {
    list = list.filter((p) => (p.distance_km || 0) <= filters.radius_km!);
  }

  // Filter by Free-text Query
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.village_town.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.education.toLowerCase().includes(q) ||
        p.occupation.toLowerCase().includes(q) ||
        p.community.toLowerCase().includes(q)
    );
  }

  // Default Sort by approximate distance
  list.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));

  return {
    profiles: list,
    rings: {
      very_near: veryNear,
      nearby_towns: nearbyTowns,
      wider
    },
    total: list.length
  };
}

// 🎤 VOICE SEARCH INTERPRETER FOR TELUGU SPEECH
export function parseVoiceMatrimonyQuery(transcript: string): Partial<MatrimonySearchFilters> {
  const result: Partial<MatrimonySearchFilters> = {};
  const lower = transcript.toLowerCase();

  // Gender
  if (/వధువు|అమ్మాయి|పిల్ల|bride|female|girl/i.test(lower)) {
    result.gender = "bride";
  } else if (/వరుడు|అబ్బాయి|కుర్రాడు|groom|male|boy/i.test(lower)) {
    result.gender = "groom";
  }

  // Age pattern e.g. "25 నుంచి 30" or "25 to 30"
  const ageMatch = lower.match(/(\d{2})\s*(నుంచి|నుండి|to|-)\s*(\d{2})/);
  if (ageMatch && ageMatch[1] && ageMatch[3]) {
    result.age_min = parseInt(ageMatch[1], 10);
    result.age_max = parseInt(ageMatch[3], 10);
  }

  // Locality detection
  if (/అనకాపల్లి|anakapalle/i.test(lower)) result.locality = "అనకాపల్లి";
  else if (/సబ్బవరం|sabbavaram/i.test(lower)) result.locality = "సబ్బవరం";
  else if (/విశాఖ|వైజాగ్|vizag|visakhapatnam/i.test(lower)) result.locality = "విశాఖపట్నం";
  else if (/గాజువాక|gajuwaka/i.test(lower)) result.locality = "గాజువాక";
  else if (/పెందుర్తి|pendurthi/i.test(lower)) result.locality = "పెందుర్తి";

  return result;
}
