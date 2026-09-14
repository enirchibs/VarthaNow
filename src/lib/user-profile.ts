/**
 * VaartaNow Persistent User Profile & Authentication Engine
 * Supports OLX-style multi-ad posting without repeated OTPs
 * and Upwork-style professional headlines/bios and avatars.
 */
import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  name: string;          // Mandatory: Full legal / display name
  phone: string;         // 10 digits
  is_verified: boolean;
  avatar_url?: string;   // Profile picture (Data URL or hosted URL)
  headline?: string;     // Upwork-style headline: e.g. "Electrician with 10 years of experience" / "10 సం. అనుభవం గల ఎలక్ట్రీషియన్"
  bio?: string;          // Detailed description about user, skills, services or business
  locality?: string;     // Primary city or mandal
  role?: "user" | "provider" | "seller" | "employer";
  created_at: string;
  updated_at: string;
}

export const PROFILE_STORAGE_KEY = "vaartanow_user_profile";
export const PROFILE_EVENT_NAME = "vaartanow_profile_updated";

/**
 * Retrieve active user profile from localStorage
 */
export function getStoredUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.phone && parsed.is_verified) {
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to parse stored user profile:", err);
  }
  return null;
}

/**
 * Save user profile to localStorage, notify components, and sync with backend
 */
export function saveStoredUserProfile(profile: UserProfile): void {
  try {
    const normalized: UserProfile = {
      ...profile,
      phone: profile.phone.replace(/\D/g, "").slice(-10),
      name: profile.name.trim(),
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalized));

    // Also mirror to legacy keys for backwards compatibility
    localStorage.setItem("vaartanow_safety_profile", JSON.stringify({
      id: normalized.id,
      mobile_number: normalized.phone,
      mobile_verified: normalized.is_verified,
      full_name: normalized.name,
      avatar_url: normalized.avatar_url,
      bio: normalized.bio || normalized.headline,
      role: normalized.role || "provider",
      account_status: "active"
    }));
    localStorage.setItem("vizag_user_profile", JSON.stringify({
      name: normalized.name,
      phone: normalized.phone,
      is_verified: normalized.is_verified
    }));

    // Dispatch global custom event for immediate reactive UI updates
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: normalized }));
    }

    // Sync to Supabase profiles / verified_contacts if available
    if (supabase) {
      supabase.from("verified_contacts").upsert(
        {
          phone: normalized.phone,
          name: normalized.name,
          is_verified: true,
          avatar_url: normalized.avatar_url,
          headline: normalized.headline,
          bio: normalized.bio
        },
        { onConflict: "phone" }
      ).then(({ error }: any) => {
        if (error) console.warn("Supabase verified_contacts sync notice:", error.message);
      });
    }
  } catch (err) {
    console.warn("Failed to save user profile:", err);
  }
}

/**
 * Clear user profile session (Logout)
 */
export function clearStoredUserProfile(): void {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem("vaartanow_safety_profile");
    localStorage.removeItem("vizag_user_profile");
    localStorage.removeItem("vaartanow_employer_profile");
    
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: null }));
    }
  } catch (err) {
    console.warn("Failed to clear user profile:", err);
  }
}

/**
 * Helper to check whether user is actively logged in with a verified profile
 */
export function isUserLoggedIn(): boolean {
  const profile = getStoredUserProfile();
  return Boolean(profile && profile.is_verified && profile.phone && profile.name.trim().length > 0);
}

/**
 * Quick suggested headlines (Upwork-style) for providers and sellers
 */
export const SUGGESTED_HEADLINES = [
  "🧑‍🔧 10 సం. అనుభవం గల ప్రొఫెషనల్ ఎలక్ట్రీషియన్ (Electrician - 10 Yrs Exp)",
  "🔧 ప్లంబింగ్ & శానిటరీ స్పెషలిస్ట్ (Plumber & Sanitary Specialist)",
  "🚗 8 సం. అనుభవం గల కారు & హెవీ డ్రైవర్ (Experienced Driver)",
  "🏗️ సివిల్ కాంట్రాక్టర్ & బిల్డింగ్ వర్కర్ (Civil Contractor & Mason)",
  "🚜 వ్యవసాయ యంత్రాలు & ట్రాక్టర్ డ్రైవర్ (Agricultural Services)",
  "❄️ AC రిపేర్, వాషింగ్ మెషిన్ & ఫ్రిజ్ టెక్నీషియన్ (Appliance Technician)",
  "🎨 పెయింటింగ్ కాంట్రాక్టర్ & పాలిష్ వర్కర్ (Home Painting Expert)",
  "👩 రుచికరమైన హోమ్‌మేడ్ పిండివంటలు & పచ్చళ్ళు (Homemade Food & Pickles)",
  "🥻 పట్టు చీరలు & లేడీస్ బొటిక్ డిజైనర్ (Sarees & Boutique Designer)",
  "🏡 ప్రాపర్టీ ఓనర్ & రియల్ ఎస్టేట్ కన్సల్టెంట్ (Property Owner / Consultant)",
  "💼 ప్రైవేట్ జాబ్ రిక్రూటర్ / బిజినెస్ ఓనర్ (Job Recruiter / Employer)",
  "🌾 సహజ సేంద్రీయ రైతు (Organic Farmer & Direct Produce)"
];
