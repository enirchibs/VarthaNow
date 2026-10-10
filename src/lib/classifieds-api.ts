// VaartaNow Classifieds & Hyperlocal Buy & Sell Marketplace API Engine
import { supabase } from "./supabase";

export type ClassifiedCategory =
  | "electronics"
  | "furniture"
  | "vehicles"
  | "property"
  | "services"
  | "building_materials"
  | "clothing_fashion"
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
export const SEED_CLASSIFIEDS: ClassifiedItem[] = [];

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

// 📱 SMS 6-DIGIT OTP VERIFICATION — Supabase Auth phone provider is the only source of truth.
// otpDemo is kept for UI compatibility but is always empty: OTPs must never be generated or revealed client-side.
export async function sendSMSOTP(phone: string): Promise<{ success: boolean; otpDemo: string; error?: string }> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  if (!supabase) return { success: false, otpDemo: "", error: "OTP సేవ అందుబాటులో లేదు (OTP service unavailable)" };

  const { error } = await supabase.auth.signInWithOtp({ phone: `+91${cleanPhone}` });
  if (error) {
    console.warn("Supabase Auth signInWithOtp error:", error.message);
    return { success: false, otpDemo: "", error: "OTP పంపడం విఫలమైంది. మళ్ళీ ప్రయత్నించండి (Failed to send OTP)" };
  }
  return { success: true, otpDemo: "" };
}

export async function verifySellerOTP(
  phone: string,
  enteredOTP: string,
  name: string
): Promise<{ success: boolean; profile?: SellerProfile; error?: string }> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const invalid = { success: false, error: "చెల్లుబాటు కాని 6-అంకెల OTP (Invalid OTP Code)" };
  if (!supabase) return invalid;

  const { data, error } = await supabase.auth.verifyOtp({
    phone: `+91${cleanPhone}`,
    token: enteredOTP.trim(),
    type: "sms"
  });
  if (error || !data?.session) return invalid;

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

  // Merge Supabase data + local user posts
  const combinedMap = new Map<string, ClassifiedItem>();
  
  [...localPosts, ...fetchedData].forEach((item) => {
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
      // Usually: not signed in by phone OTP, or the contact number isn't the signed-in phone.
      if (error) console.warn("Listing not published (kept only on this device):", error.message);
    } catch (e) {
      console.warn("Supabase classifieds insert notice:", e);
    }
  }

  return newItem;
}

// 🔄 UPDATE CLASSIFIED STATUS (e.g. Mark as Sold)

/**
 * Run a seller write and report whether it really changed a row. When the signed-in phone
 * doesn't own the listing, row-level security returns zero rows instead of an error.
 */
async function ownerWrite(write: PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>): Promise<boolean> {
  try {
    const { data, error } = await write;
    if (error) console.warn("Listing change refused:", error.message);
    return !error && (data?.length ?? 0) > 0;
  } catch (e) {
    console.warn("Listing change failed:", e);
    return false;
  }
}

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

  // Only the signed-in seller (phone matches the listing) may change it; the database enforces this.
  if (supabase && !id.startsWith("cf_")) return ownerWrite(
    supabase.from("classifieds").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id).select("id")
  );

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

  if (supabase && !id.startsWith("cf_")) return ownerWrite(
    supabase.from("classifieds").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select("id")
  );

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

  if (supabase && !id.startsWith("cf_")) return ownerWrite(
    supabase.from("classifieds").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", id).select("id")
  );

  return true;
}
