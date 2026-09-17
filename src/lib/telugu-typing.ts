// ⌨️ Mana Adda Telugu Typing & Phonetic Transliteration Engine
// Enables seamless English-to-Telugu phonetic typing on all forms, inputs, and searches.

export interface TransliterationResult {
  sourceWord: string;
  candidates: string[];
}

export const TELUGU_TYPING_EVENT = "varthanow_telugu_typing_toggle";
export const TELUGU_TYPING_STORAGE_KEY = "varthanow_telugu_typing_enabled";

// In-memory LRU-like cache for instant 0ms transliteration
const transliterationCache = new Map<string, string[]>();

// 📚 Preloaded high-frequency Telugu words dictionary for instantaneous typing
const PRELOADED_TELUGU_WORDS: Record<string, string[]> = {
  // Common Greetings & Conversational
  namaskaram: ["నమస్కారం", "నమస్కారము", "నమస్కరం"],
  namaste: ["నమస్తే", "నమస్తేండి", "నమస్తే! "],
  subhodhayam: ["శుభోదయం", "శుభోదయము"],
  dhanyavadalu: ["ధన్యవాదాలు", "ధన్యవాదములు"],
  swagatham: ["స్వాగతం", "స్వాగతము"],
  andhra: ["ఆంధ్ర", "ఆంధ్రప్రదేశ్", "ఆంధ్రా"],
  telangana: ["తెలంగాణ", "తెలంగాణా"],
  pradesh: ["ప్రదేశ్", "ప్రదేశం"],
  telugu: ["తెలుగు", "తెలుగులో", "తెలుగువారు"],
  vartha: ["వార్త", "వార్తలు", "వార్తా"],
  varthalu: ["వార్తలు", "వార్తలలో", "వార్తలను"],

  // Raitu Bazar & Agriculture
  raithu: ["రైతు", "రైతూ", "రైతుల"],
  raithulu: ["రైతులు", "రైతుల", "రైతులను"],
  panta: ["పంట", "పంటలు", "పంటను"],
  pantalu: ["పంటలు", "పంటల", "పంటలను"],
  biyyam: ["బియ్యం", "బియ్యము", "బియ్యం ధర"],
  vadlu: ["వడ్లు", "వరి", "వడ్ల"],
  mirchi: ["మిర్చి", "మిరప", "మిర్చీ"],
  pasupu: ["పసుపు", "పసుపు కొమ్ములు"],
  kandulu: ["కందులు", "కందిపప్పు"],
  minumulu: ["మినుములు", "మినపప్పు"],
  pesallu: ["పెసలు", "పెసర్లు"],
  vithanaalu: ["విత్తనాలు", "విత్తనాల"],
  eruvulu: ["ఎరువులు", "ఎరువుల"],
  pashuvulu: ["పశువులు", "పశువుల"],
  aavu: ["ఆవు", "ఆవులు"],
  gedhe: ["గేదె", "గేదెలు", "బర్రె"],
  mandi: ["మండి", "మార్కెట్"],
  dhara: ["ధర", "ధరలు", "ధరకు"],
  dharalu: ["ధరలు", "ధరల"],
  vyavasayam: ["వ్యవసాయం", "వ్యవసాయ"],

  // Services, Rentals, Jobs & Business
  sevalu: ["సేవలు", "సేవల", "సేవలకు"],
  seva: ["సేవ", "సేవలు"],
  adde: ["అద్దె", "అద్దెకు", "అద్దెలు"],
  addelu: ["అద్దెలు", "అద్దెల"],
  tractor: ["ట్రాక్టర్", "ట్రాక్టరు", "ట్రాక్టర్లు"],
  jcb: ["జేసీబీ", "జేసిబి"],
  driver: ["డ్రైవర్", "డ్రైవర్లు"],
  electrician: ["ఎలక్ట్రీషియన్", "కరెంట్ పని"],
  plumber: ["ప్లంబర్", "ప్లంబింగ్"],
  borewell: ["బోర్‌వెల్", "బోరు బావి"],
  shamiana: ["షామియానా", "టెంట్లు"],
  sound: ["సౌండ్ సిస్టమ్", "సౌండ్"],
  dj: ["డీజే", "డిజె సౌండ్"],
  repair: ["రిపేర్", "రిపేరింగ్"],
  cleaning: ["క్లీనింగ్", "శుభ్రత"],
  udyogam: ["ఉద్యోగం", "ఉద్యోగాలు"],
  udyogaalu: ["ఉద్యోగాలు", "ఉద్యోగాల"],
  pani: ["పని", "పనులు", "పనివారు"],
  jeetham: ["జీతం", "జీతము"],
  salary: ["శాలరీ", "జీతం"],

  // Real Estate & Home
  illu: ["ఇల్లు", "ఇళ్ళు", "ఇళ్లు"],
  intlo: ["ఇంట్లో", "ఇంటికి"],
  stalam: ["స్థలం", "స్థలము"],
  plot: ["ప్లాట్", "ప్లాట్లు"],
  polam: ["పొలం", "పొలాలు"],
  bhumi: ["భూమి", "భూములు"],
  ammakam: ["అమ్మకం", "అమ్మకానికి"],
  konugolu: ["కొనుగోలు", "కొనడానికి"],
  rent: ["రెంటు", "అద్దె"],

  // Deals, Shopping & Kirana
  deals: ["డీల్స్", "డీల్"],
  offers: ["ఆఫర్స్", "ఆఫర్లు"],
  discount: ["డిస్కౌంట్", "తగ్గింపు"],
  thakkuva: ["తక్కువ", "తక్కువ ధర"],
  manchi: ["మంచి", "మంచిది"],
  kirana: ["కిరాణా", "కిరాణ"],
  samanu: ["సామాను", "సరుకులు"],
  sarukulu: ["సరుకులు", "సరుకుల"],
  mobile: ["మొబైల్", "ఫోన్"],
  phone: ["ఫోన్", "ఫోన్లు"],
  laptop: ["ల్యాప్‌టాప్", "కంప్యూటర్"],
  batalu: ["బట్టలు", "దుస్తులు"],
  cheeralu: ["చీరలు", "చీరల"],

  // Administration, Complaints & News
  firyadu: ["ఫిర్యాదు", "ఫిర్యాదులు"],
  samasya: ["సమస్య", "సమస్యలు"],
  adhikaarulu: ["అధికారులు", "అధికారుల"],
  graamam: ["గ్రామం", "గ్రామ"],
  mandal: ["మండలం", "మండల"],
  mandalam: ["మండలం", "మండలము"],
  jilla: ["జిల్లా", "జిల్లాలో"],
  ooru: ["ఊరు", "ఊరి"],
  nagaram: ["నగరం", "నగరము"],
  police: ["పోలీస్", "పోలీసులు", "పోలీసు"],
  post: ["పోస్ట్", "పోస్టింగ్"],

  // 🏛️ Political, Governance & Designation Acronyms (MLA, MP, CM, PM, etc.)
  mla: ["ఎమ్మెల్యే", "ఎంఎల్ఏ", "శాసనసభ్యుడు", "MLA"],
  mlas: ["ఎమ్మెల్యేలు", "ఎంఎల్ఏలు", "MLAs"],
  mp: ["ఎంపీ", "ఎం.పి", "పార్లమెంట్ సభ్యుడు", "MP"],
  mps: ["ఎంపీలు", "ఎం.పి.లు", "MPs"],
  cm: ["సీఎం", "ముఖ్యమంత్రి", "సిఎం", "CM"],
  pm: ["పీఎం", "ప్రధానమంత్రి", "పిఎం", "PM"],
  mro: ["ఎమ్మార్వో", "తహశీల్దార్", "ఎంఆర్ఓ", "MRO"],
  vro: ["విఆర్వో", "వీఆర్వో", "VRO"],
  vra: ["విఆర్ఏ", "వీఆర్ఏ", "VRA"],
  rdo: ["ఆర్డీవో", "ఆర్డీఓ", "సబ్ కలెక్టర్", "RDO"],
  collector: ["కలెక్టర్", "కలెక్టరు", "జిల్లా కలెక్టర్"],
  sp: ["ఎస్పీ", "ఎస్.పి", "జిల్లా ఎస్పీ", "SP"],
  dsp: ["డీఎస్పీ", "డిఎస్పి", "DSP"],
  ci: ["సీఐ", "సిఐ", "ఇన్‌స్పెక్టర్", "CI"],
  si: ["ఎస్సై", "ఎస్ఐ", "సబ్ ఇన్‌స్పెక్టర్", "SI"],
  asi: ["ఏఎస్ఐ", "ఎఎస్సై", "ASI"],
  hc: ["హెడ్ కానిస్టేబుల్", "హెచ్‌సీ", "HC"],
  constable: ["కానిస్టేబుల్", "పోలీస్ కానిస్టేబుల్"],
  ias: ["ఐఏఎస్", "ఐ.ఎ.ఎస్", "IAS"],
  ips: ["ఐపీఎస్", "ఐ.పి.ఎస్", "IPS"],
  ifs: ["ఐఎఫ్ఎస్", "IFS"],
  rtc: ["ఆర్టీసీ", "ఆర్టీసి బస్సు", "RTC"],
  apsrtc: ["ఏపీఎస్సార్టీసీ", "APSRTC"],
  tsrtc: ["టీఎస్సార్టీసీ", "TSRTC"],
  tg: ["తెలంగాణ", "టీజీ", "TG"],
  ts: ["తెలంగాణ", "టీఎస్", "TS"],
  ap: ["ఏపీ", "ఆంధ్రప్రదేశ్", "AP"],
  tdp: ["టీడీపీ", "తెలుగుదేశం", "TDP"],
  ysrcp: ["వైసీపీ", "వైఎస్సార్సీపీ", "YSRCP"],
  ysr: ["వైఎస్సార్", "YSR"],
  jsp: ["జనసేన", "జేఎస్పీ", "JSP"],
  bjp: ["బీజేపీ", "భారతీయ జనతా పార్టీ", "BJP"],
  cpi: ["సీపీఐ", "సిపిఐ", "CPI"],
  cpm: ["సీపీఎం", "సిపిఎం", "CPM"],
  inc: ["కాంగ్రెస్", "ఐఎన్‌సీ", "INC"],
  congress: ["కాంగ్రెస్", "కాంగ్రెస్ పార్టీ"],
  brs: ["బీఆర్ఎస్", "BRS"],
  trs: ["టీఆర్ఎస్", "TRS"],
  aimim: ["మజ్లిస్", "ఏఐఎంఐఎం", "AIMIM"],
  deo: ["డీఈవో", "డీఈఓ", "DEO"],
  mdo: ["ఎంపీడీవో", "MDO"],
  mpdo: ["ఎంపీడీవో", "ఎంపీడీఓ", "MPDO"],
  mpo: ["ఎంపీవో", "MPO"],
  mptc: ["ఎంపీటీసీ", "MPTC"],
  zptc: ["జెడ్పీటీసీ", "ZPTC"],
  sarpanch: ["సర్పంచ్", "గ్రామ సర్పంచ్"],
  mayor: ["మేయర్"],
  corporator: ["కార్పొరేటర్"],
  councillor: ["కౌన్సిలర్"],
  minister: ["మంత్రి", "మంత్రులు"],
  gov: ["ప్రభుత్వం", "సర్కార్"],
  govt: ["ప్రభుత్వం", "గవర్నమెంట్"],
  panchayat: ["పంచాయతీ", "గ్రామ పంచాయతీ"],
  collectorate: ["కలెక్టరేట్", "కలెక్టర్ ఆఫీస్"],
  rto: ["ఆర్టీవో", "RTO"],
  dmo: ["డీఎంవో", "DMO"],
  dmho: ["డీఎంహెచ్‌వో", "DMHO"],
  dr: ["డాక్టర్", "డా॥"],
  doctor: ["డాక్టర్", "వైద్యుడు"],
  advocate: ["న్యాయవాది", "లాయర్"],
  lawyer: ["లాయర్", "న్యాయవాది"],
  judge: ["న్యాయమూర్తి", "జడ్జి"],
  court: ["కోర్టు", "న్యాయస్థానం"],
  bank: ["బ్యాంకు", "బ్యాంక్"],
  atm: ["ఏటీఎం", "ATM"],
  otp: ["ఓటీపీ", "OTP"],
  pan: ["పాన్ కార్డు", "పాన్"],
  aadhaar: ["ఆధార్", "ఆధార్ కార్డు"],
  aadhar: ["ఆధార్", "ఆధార్ కార్డు"],
  ration: ["రేషన్", "రేషన్ కార్డు"],
  pension: ["పెన్షన్", "పింఛను"],
  gas: ["గ్యాస్", "గ్యాస్ సిలిండర్"],
  bus: ["బస్సు", "ఆర్టీసీ బస్సు"],
  auto: ["ఆటో", "ఆటో రిక్షా"],
  train: ["రైలు", "ట్రైన్"],
  tv: ["టీవీ", "టెలివిజన్", "TV"],
  kg: ["కేజీ", "కిలో"],
  km: ["కిలోమీటర్", "కి.మీ"],
  ac: ["ఏసీ", "AC"],

  // Major AP/TG Towns
  hyderabad: ["హైదరాబాద్", "హైద్రాబాద్"],
  vijayawada: ["విజయవాడ", "బెజవాడ"],
  visakhapatnam: ["విశాఖపట్నం", "వైజాగ్"],
  vizag: ["వైజాగ్", "విశాఖ"],
  guntur: ["గుంటూరు", "గుంటూర్"],
  tirupati: ["తిరుపతి", "తిరుపతీ"],
  warangal: ["వరంగల్", "ఓరుగల్లు"],
  kurnool: ["కర్నూలు", "కర్నూల్"],
  nellore: ["నెల్లూరు", "నెల్లూర్"],
  rajahmundry: ["రాజమండ్రి", "రాజమహేంద్రవరం"],
  kakinada: ["కాకినాడ"],
  khammam: ["ఖమ్మం"],
  nizamabad: ["నిజామాబాద్"],
  karimnagar: ["కరీంనగర్"],
  anantapur: ["అనంతపురం", "అనంతపూర్"],
  kadapa: ["కడప"],
  eluru: ["ఏలూరు"],
  ongole: ["ఒంగోలు"],
  srikakulam: ["శ్రీకాకుళం"],
  vizianagaram: ["విజయనగరం"]
};

// Seed preloaded words into cache
Object.entries(PRELOADED_TELUGU_WORDS).forEach(([key, val]) => {
  transliterationCache.set(key.toLowerCase(), val);
});

// ⚡ Offline Phonetic Engine for instant fallback when network is unavailable
const PHONETIC_CONSONANTS: Record<string, string> = {
  k: "క", kh: "ఖ", g: "గ", gh: "ఘ",
  ch: "చ", c: "చ", chh: "ఛ", j: "జ", jh: "ఝ",
  t: "త", th: "థ", d: "ద", dh: "ధ", n: "న",
  T: "ట", Th: "ఠ", D: "డ", Dh: "ఢ", N: "ణ",
  p: "ప", ph: "ఫ", f: "ఫ", b: "బ", bh: "భ", m: "మ",
  y: "య", r: "ర", l: "ల", v: "వ", w: "వ",
  s: "స", sh: "శ", Sh: "ష", h: "హ", L: "ళ",
  ksh: "క్ష"
};

const PHONETIC_VOWELS: Record<string, string> = {
  a: "అ", aa: "ఆ", A: "ఆ",
  i: "ఇ", ee: "ఈ", ii: "ఈ", I: "ఈ",
  u: "ఉ", oo: "ఊ", uu: "ఊ", U: "ఊ",
  e: "ఎ", E: "ఏ", ae: "ఏ",
  ai: "ఐ",
  o: "ఒ", O: "ఓ",
  au: "ఔ", ou: "ఔ",
  am: "అం"
};

const PHONETIC_MAATRAS: Record<string, string> = {
  a: "",
  aa: "ా", A: "ా",
  i: "ి",
  ee: "ీ", ii: "ీ", I: "ీ",
  u: "ు",
  oo: "ూ", uu: "ూ", U: "ూ",
  e: "ె",
  E: "ే", ae: "ే",
  ai: "ై",
  o: "ొ",
  O: "ో",
  au: "ౌ", ou: "ౌ",
  am: "ం"
};

/**
 * Fast offline phonetic rule-based transliteration of an English word into Telugu.
 */
export function offlinePhoneticTelugu(word: string): string {
  if (!word || !word.trim()) return "";
  const lower = word.toLowerCase().trim();
  if (!/^[a-zA-Z]+$/.test(lower)) return word;

  // Check preloaded first
  if (PRELOADED_TELUGU_WORDS[lower]) {
    return PRELOADED_TELUGU_WORDS[lower][0];
  }

  let result = "";
  let i = 0;
  const len = word.length;

  while (i < len) {
    // Try 3-char match
    const c3 = word.substring(i, i + 3);
    const c2 = word.substring(i, i + 2);
    const c1 = word.substring(i, i + 1);

    // Initial vowel at word start or after vowel
    if (i === 0 && (PHONETIC_VOWELS[c2] || PHONETIC_VOWELS[c1])) {
      if (PHONETIC_VOWELS[c2]) {
        result += PHONETIC_VOWELS[c2];
        i += 2;
      } else {
        result += PHONETIC_VOWELS[c1];
        i += 1;
      }
      continue;
    }

    // Match consonant
    let cons = "";
    let consLen = 0;
    if (PHONETIC_CONSONANTS[c3]) {
      cons = PHONETIC_CONSONANTS[c3];
      consLen = 3;
    } else if (PHONETIC_CONSONANTS[c2]) {
      cons = PHONETIC_CONSONANTS[c2];
      consLen = 2;
    } else if (PHONETIC_CONSONANTS[c1]) {
      cons = PHONETIC_CONSONANTS[c1];
      consLen = 1;
    }

    if (cons) {
      i += consLen;
      // Look ahead for following vowel/maatra
      const v2 = word.substring(i, i + 2);
      const v1 = word.substring(i, i + 1);

      if (v2 && PHONETIC_MAATRAS[v2] !== undefined) {
        result += cons + PHONETIC_MAATRAS[v2];
        i += 2;
      } else if (v1 && PHONETIC_MAATRAS[v1] !== undefined) {
        result += cons + PHONETIC_MAATRAS[v1];
        i += 1;
      } else if (i < len) {
        // Next is another consonant -> add virama (halant / pollu)
        result += cons + "్";
      } else {
        // Word ending consonant without explicit vowel -> in Telugu usually implicit 'a' or virama
        result += cons;
      }
    } else if (PHONETIC_VOWELS[c2]) {
      result += PHONETIC_VOWELS[c2];
      i += 2;
    } else if (PHONETIC_VOWELS[c1]) {
      result += PHONETIC_VOWELS[c1];
      i += 1;
    } else {
      result += c1;
      i += 1;
    }
  }

  return result || word;
}

/**
 * Synchronously returns cached or preloaded transliterations for instant 0ms suggestions.
 */
export function getInstantTransliteration(word: string): string[] | null {
  if (!word || !word.trim()) return null;
  const cleanWord = word.trim().toLowerCase();
  if (transliterationCache.has(cleanWord)) {
    return transliterationCache.get(cleanWord)!;
  }
  return null;
}

/**
 * Fetches Telugu transliteration candidates using Google Input Tools API with instant local cache
 * and fallback to offline phonetic generator.
 */
export async function fetchTeluguTransliteration(word: string): Promise<string[]> {
  if (!word || !word.trim()) return [];
  const cleanWord = word.trim().toLowerCase();

  // 1. Check in-memory cache
  if (transliterationCache.has(cleanWord)) {
    return transliterationCache.get(cleanWord)!;
  }

  // 2. Fetch from Google Input Tools API
  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(cleanWord)}&itc=te-t-i0-und&num=5`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200); // 1.2s timeout for snappy feel

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data[0] === "SUCCESS" && data[1] && data[1][0] && Array.isArray(data[1][0][1])) {
        const candidates = data[1][0][1] as string[];
        if (candidates.length > 0) {
          // Store in cache
          transliterationCache.set(cleanWord, candidates);
          return candidates;
        }
      }
    }
  } catch {
    // Network failed or timed out, gracefully fall back to offline engine
  }

  // 3. Fallback: Offline Phonetic generator
  const offlineResult = offlinePhoneticTelugu(cleanWord);
  const fallbackList = [offlineResult, cleanWord];
  transliterationCache.set(cleanWord, fallbackList);
  return fallbackList;
}

/**
 * Checks if Telugu typing is currently active (defaults to true).
 */
export function isTeluguTypingActive(): boolean {
  try {
    const stored = localStorage.getItem(TELUGU_TYPING_STORAGE_KEY);
    return stored !== "false"; // default true
  } catch {
    return true;
  }
}

/**
 * Toggles or sets Telugu typing state globally and notifies all listeners.
 */
export function setTeluguTypingActive(enabled: boolean) {
  try {
    localStorage.setItem(TELUGU_TYPING_STORAGE_KEY, enabled ? "true" : "false");
  } catch {}
  window.dispatchEvent(new CustomEvent(TELUGU_TYPING_EVENT, { detail: enabled }));
}

/**
 * Programmatically updates a controlled React input or textarea value
 * using the HTML prototype setter and dispatches input/change events.
 */
export function replaceWordInInput(
  el: HTMLInputElement | HTMLTextAreaElement,
  targetWord: string,
  replacement: string,
  cursorEndPos: number
): void {
  const currentVal = el.value;
  const wordStartPos = cursorEndPos - targetWord.length;
  if (wordStartPos < 0) return;

  const newVal = currentVal.substring(0, wordStartPos) + replacement + currentVal.substring(cursorEndPos);

  const prototype = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (nativeSetter) {
    nativeSetter.call(el, newVal);
  } else {
    el.value = newVal;
  }

  // Calculate new cursor location (right after inserted Telugu word)
  const newCursorPos = wordStartPos + replacement.length;
  try {
    el.setSelectionRange(newCursorPos, newCursorPos);
  } catch {}

  // Dispatch events for React synthetic event listeners
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Checks if an HTMLInputElement or HTMLTextAreaElement is eligible for Telugu transliteration.
 */
export function isEligibleInput(el: Element | null): el is HTMLInputElement | HTMLTextAreaElement {
  if (!el) return false;
  if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") return false;

  const input = el as HTMLInputElement;
  if (input.dataset?.noTelugu === "true") return false;

  if (el.tagName === "INPUT") {
    const type = (input.type || "text").toLowerCase();
    const ineligibleTypes = ["password", "number", "tel", "email", "url", "file", "checkbox", "radio", "submit", "button", "date", "time"];
    if (ineligibleTypes.includes(type)) return false;
  }

  return true;
}
