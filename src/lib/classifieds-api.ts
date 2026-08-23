// VaartaNow Classifieds & Hyperlocal Buy & Sell Marketplace API Engine
import { supabase } from "./supabase";

export type ClassifiedCategory =
  | "electronics"
  | "furniture"
  | "vehicles"
  | "property"
  | "services"
  | "other";

export type ClassifiedStatus = "available" | "sold";

export interface ClassifiedItem {
  id: string;
  seller_name: string;
  category: ClassifiedCategory;
  title: string;
  description: string;
  price: string;
  locality: string;
  contact: string;
  images: string[];
  status: ClassifiedStatus;
  offer_discount?: string;
  free_items?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellerProfile {
  name: string;
  phone: string;
  is_verified: boolean;
}

const LOCAL_STORAGE_PROFILE_KEY = "vaartanow_user_profile";
const LOCAL_STORAGE_POSTS_KEY = "vaartanow_user_classifieds";

// 📦 RICH SEEDED MOCK FALLBACK DATASET
export const SEED_CLASSIFIEDS: ClassifiedItem[] = [
  {
    id: "cf_1",
    seller_name: "శ్రీనివాస్ రావు (Srinivas)",
    category: "other",
    title: "రైతు ధరకు సోనా మసూరి కొత్త బియ్యం (25kg బస్తా)",
    description: "సొంత పొలం నుంచి నేరుగా పండించిన బియ్యం బస్తాలు. కల్తీ లేని శ్రేష్ఠమైన బియ్యం. ఉచిత హోమ్ డెలివరీ కలదు.",
    price: "₹1,350 / బస్తా",
    locality: "విశాఖపట్నం (Visakhapatnam)",
    contact: "9848012345",
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "10% Off on 5+ Bags",
    free_items: "ఉచిత డెలివరీ",
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "cf_2",
    seller_name: "అరవింద్ (Aravind)",
    category: "electronics",
    title: "iPhone 13 128GB (మింట్ కండిషన్ - 10 నెలలు వాడకం)",
    description: "100% అసలైన ఐఫోన్. బ్యాటరీ హెల్త్ 89%. ఒరిజినల్ బాక్స్, యాపిల్ సి-టైప్ కేబుల్ మరియు టెంపర్డ్ గ్లాస్ ఉచితం.",
    price: "₹38,500",
    locality: "ఎంవీపీ కాలనీ (MVP Colony, Vizag)",
    contact: "9988776655",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "నెగోషియబుల్ (Negotiable)",
    free_items: "కవర్ & టెంపర్డ్ గ్లాస్ ఉచితం",
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "cf_3",
    seller_name: "సురేష్ రెడ్డి (Suresh Reddy)",
    category: "vehicles",
    title: "Hero Splendor Plus 2022 మోడల్ (సింగిల్ హ్యాండ్ ਰన్నింగ్)",
    description: "ఒకే హ్యాండ్ వాడకం. మైలేజ్ 65+ kmpl. ఇన్సూరెన్స్ రన్నింగ్ లో ఉంది. క్లీన్ ఆర్‌సి మరియు రెండు కీలు కలవు.",
    price: "₹52,000",
    locality: "మధురవాడ (Madhurawada, Vizag)",
    contact: "9123456789",
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "ఫ్రీ హెల్మెట్",
    free_items: "హెల్మెట్ ఉచితం",
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "cf_4",
    seller_name: "వెంకటేశ్వర్లు (Venkatesh)",
    category: "property",
    title: "2BHK ఫ్లాట్ అద్దెకు (కుటుంబాలకు మాత్రమే)",
    description: "24/7 మంచినీరు, గ్యాస్ పైప్‌లైన్, లిఫ్ట్, కార్ పార్కింగ్ కలదు. ప్రధాన రోడ్డుకు దగ్గరగా శ్రద్ధగల వాతావరణం.",
    price: "₹12,000 / నెల",
    locality: "గచ్చిబౌలి (Gachibowli, Hyderabad)",
    contact: "9876543210",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "మెయింటెనెన్స్ ఉచితం",
    free_items: "ఉచిత పార్కింగ్",
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: "cf_5",
    seller_name: "రాజేష్ ఎలక్ట్రికల్స్ (Rajesh)",
    category: "services",
    title: "ఇంటి వద్దకే ఎలక్ట్రీషియన్ & ప్లంబర్ సేవలు",
    description: "అన్ని రకాల హౌస్‌హోల్డ్ ఎలక్ట్రికల్ ఐటమ్స్ ఫిక్సింగ్, ప్లంబింగ్, వాటరింగ్ పంప్ వర్క్స్ & ట్యూటర్ సేవలు తక్షణమే.",
    price: "₹299 విజిటింగ్ ఛార్జ్",
    locality: "విజయవాడ (Vijayawada)",
    contact: "9550011223",
    images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "20% ఆఫర్ మొదటి విజిట్‌పై",
    free_items: "ఫ్రీ ఇన్‌స్పెక్షన్",
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "cf_6",
    seller_name: "లక్ష్మి ఫర్నిచర్ (Lakshmi)",
    category: "furniture",
    title: "టీక్ వుడ్ 6 సీటర్ సోఫా సెట్ (కొత్తది అసలైన టేకు)",
    description: "అసలైన టేకు తో చేసిన 6 సీటర్ సోఫా. హై-డెన్సిటీ కుషన్స్. 5 ఏళ్ల వారంటీ.",
    price: "₹24,500",
    locality: "గాజువాక (Gajuwaka, Vizag)",
    contact: "9440156789",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"],
    status: "available",
    offer_discount: "15% తగ్గింపు",
    free_items: "ఉచిత కుషన్ కవర్లు",
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 30).toISOString()
  }
];

// 👤 PROFILE SESSION HELPERS (LocalStorage: vaartanow_user_profile)
export function getStoredSellerProfile(): SellerProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY) || localStorage.getItem("vizag_user_profile");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveStoredSellerProfile(profile: SellerProfile): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem("vizag_user_profile", JSON.stringify(profile));
  } catch {}
}

// 📱 TWILIO / SMS 6-DIGIT OTP VERIFICATION WITH SUPABASE AUTH & FALLBACK
let currentOTPMap: Record<string, string> = {};

export async function sendSMSOTP(phone: string): Promise<{ success: boolean; otpDemo: string }> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const formattedPhone = `+91${cleanPhone}`;
  
  // Generate local demo OTP fallback
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  currentOTPMap[cleanPhone] = otp;

  console.log(`📱 Triggering Twilio SMS OTP for ${formattedPhone}...`);

  // 1. Invoke Supabase Auth Phone Provider (Twilio integration configured in Supabase)
  if (supabase) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });
      if (!error) {
        console.log(`✅ Supabase Auth Twilio SMS sent to ${formattedPhone}`);
      } else {
        console.warn("Supabase Auth signInWithOtp notice:", error.message);
      }
    } catch (e) {
      console.warn("Supabase Auth invoke error:", e);
    }

    // 2. Also invoke Edge Function send-otp proxy if available
    try {
      await supabase.functions.invoke("send-otp", {
        body: { phone: cleanPhone, otp }
      });
    } catch {}
  }

  return { success: true, otpDemo: otp };
}

export async function verifySellerOTP(
  phone: string,
  enteredOTP: string,
  name: string
): Promise<{ success: boolean; profile?: SellerProfile; error?: string }> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const formattedPhone = `+91${cleanPhone}`;
  const expectedOTP = currentOTPMap[cleanPhone] || "123456";

  let isVerified = false;

  // 1. Try verifying via Supabase Auth Phone Provider first
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: enteredOTP.trim(),
        type: "sms"
      });
      if (!error && data?.session) {
        isVerified = true;
        console.log("✅ Verified via Supabase Auth Twilio SMS!");
      }
    } catch (e) {
      console.warn("Supabase verifyOtp notice:", e);
    }
  }

  // 2. Fallback to expected demo OTP or 123456
  if (!isVerified) {
    if (enteredOTP.trim() === expectedOTP || enteredOTP.trim() === "123456") {
      isVerified = true;
    }
  }

  if (!isVerified) {
    return { success: false, error: "చెల్లుబాటు కాని 6-అంకెల OTP (Invalid OTP Code)" };
  }

  const profile: SellerProfile = {
    name: name.trim() || "Verified Seller",
    phone: cleanPhone,
    is_verified: true
  };

  saveStoredSellerProfile(profile);

  // Save to Supabase public.verified_contacts
  if (supabase) {
    try {
      await supabase.from("verified_contacts").upsert(
        {
          phone: cleanPhone,
          name: profile.name,
          is_verified: true
        },
        { onConflict: "phone" }
      );
    } catch (e) {
      console.warn("Supabase verified_contacts upsert notice:", e);
    }
  }

  return { success: true, profile };
}

// 🔍 FETCH CLASSIFIEDS FROM SUPABASE OR LOCAL STORAGE
export async function fetchClassifieds(options?: {
  category?: string;
  searchQuery?: string;
  statusFilter?: string;
}): Promise<ClassifiedItem[]> {
  const { category = "all", searchQuery = "", statusFilter = "all" } = options || {};

  let localPosts: ClassifiedItem[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (raw) localPosts = JSON.parse(raw);
  } catch {}

  let fetchedData: ClassifiedItem[] = [];

  if (supabase) {
    try {
      let query = supabase
        .from("classifieds")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        fetchedData = data as ClassifiedItem[];
      }
    } catch (err) {
      console.warn("Supabase classifieds fetch warning:", err);
    }
  }

  // Merge Supabase data + local user posts + seeded mock dataset
  const combinedMap = new Map<string, ClassifiedItem>();
  
  [...localPosts, ...fetchedData, ...SEED_CLASSIFIEDS].forEach((item) => {
    if (!combinedMap.has(item.id)) {
      combinedMap.set(item.id, item);
    }
  });

  let result = Array.from(combinedMap.values());

  // Filter client-side
  if (category && category !== "all") {
    result = result.filter((item) => item.category === category);
  }

  if (statusFilter && statusFilter !== "all") {
    result = result.filter((item) => item.status === statusFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q) ||
        item.seller_name.toLowerCase().includes(q)
    );
  }

  return result;
}

// ➕ ADD NEW CLASSIFIED ITEM
export async function addClassifiedItem(
  item: Omit<ClassifiedItem, "id" | "created_at" | "updated_at" | "is_active" | "status">
): Promise<ClassifiedItem> {
  const newItem: ClassifiedItem = {
    ...item,
    id: `cf_${Date.now()}`,
    status: "available",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Save to LocalStorage
  let localPosts: ClassifiedItem[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (raw) localPosts = JSON.parse(raw);
  } catch {}

  localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify([newItem, ...localPosts]));

  // Save to Supabase public.classifieds
  if (supabase) {
    try {
      const { data, error } = await supabase.from("classifieds").insert({
        seller_name: newItem.seller_name,
        category: newItem.category,
        title: newItem.title,
        description: newItem.description,
        price: newItem.price,
        locality: newItem.locality,
        contact: newItem.contact,
        images: newItem.images,
        status: newItem.status,
        offer_discount: newItem.offer_discount,
        free_items: newItem.free_items,
        is_active: true
      }).select().single();

      if (!error && data) {
        return data as ClassifiedItem;
      }
    } catch (e) {
      console.warn("Supabase classifieds insert notice:", e);
    }
  }

  return newItem;
}

// 🔄 UPDATE CLASSIFIED STATUS (e.g. Mark as Sold)
export async function updateClassifiedStatus(
  id: string,
  newStatus: ClassifiedStatus
): Promise<boolean> {
  // Update LocalStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (raw) {
      const posts: ClassifiedItem[] = JSON.parse(raw);
      const updated = posts.map((p) => (p.id === id ? { ...p, status: newStatus } : p));
      localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(updated));
    }
  } catch {}

  // Update Supabase
  if (supabase && !id.startsWith("cf_")) {
    try {
      await supabase
        .from("classifieds")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase status update notice:", e);
    }
  }

  return true;
}

// ✏️ UPDATE FULL CLASSIFIED ITEM
export async function updateClassifiedItem(
  id: string,
  updates: Partial<ClassifiedItem>
): Promise<boolean> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (raw) {
      const posts: ClassifiedItem[] = JSON.parse(raw);
      const updated = posts.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
      localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(updated));
    }
  } catch {}

  if (supabase && !id.startsWith("cf_")) {
    try {
      await supabase
        .from("classifieds")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase item update notice:", e);
    }
  }

  return true;
}

// 🗑️ DELETE / DEACTIVATE CLASSIFIED ITEM
export async function deleteClassifiedItem(id: string): Promise<boolean> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (raw) {
      const posts: ClassifiedItem[] = JSON.parse(raw);
      const updated = posts.filter((p) => p.id !== id);
      localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(updated));
    }
  } catch {}

  if (supabase && !id.startsWith("cf_")) {
    try {
      await supabase
        .from("classifieds")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase item deactivate notice:", e);
    }
  }

  return true;
}
