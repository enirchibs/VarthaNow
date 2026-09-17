// 💍 Mana Adda Matrimony Types & Data Contracts
export type MatrimonyGender = "bride" | "groom";

export type ProfileFor = "self" | "son" | "daughter" | "brother" | "sister" | "relative";

export type MaritalStatus = "never_married" | "divorced" | "widowed" | "separated";

export type PhotoPrivacy = "public" | "request_only" | "approved_only" | "hidden";

export type ContactPrivacy = "request_only" | "mutual_interest" | "verified_only";

export interface MatrimonyProfile {
  id: string;
  user_id: string;
  profile_for: ProfileFor;
  profile_managed_by_label_te: string; // "స్వయంగా", "తల్లిదండ్రులు", "తోబుట్టువులు"
  name: string;
  gender: MatrimonyGender;
  date_of_birth: string;
  age: number;
  height: string; // e.g. "5'4\""
  marital_status: MaritalStatus;
  marital_status_label_te: string; // "అవివాహితుడు/అవివాహిత (Never Married)"
  mother_tongue: string;
  religion: string;
  community: string;
  subcommunity?: string;
  caste_no_bar?: boolean;
  education: string;
  education_detail?: string;
  occupation: string;
  occupation_detail?: string;
  income_range?: string;
  village_town: string;
  mandal?: string;
  district: string;
  state: string;
  lat_approx: number;
  lon_approx: number;
  distance_km?: number;
  about_te: string;
  family_type?: string; // "ఉమ్మడి కుటుంబం (Joint)", "చిన్న కుటుంబం (Nuclear)"
  family_values?: string; // "సాంప్రదాయక (Traditional)", "మోడరన్ (Moderate)"
  diet?: string; // "శాకాహారం (Veg)", "మాంసాహారం (Non-Veg)"
  horoscope_available?: boolean;
  rashi?: string;
  nakshatra?: string;
  gothram?: string;
  photos: string[];
  photo_privacy: PhotoPrivacy;
  contact_privacy: ContactPrivacy;
  verification_level: 1 | 2 | 3;
  verification_badge_label_te: string; // "📱 మొబైల్ వెరిఫైడ్", "🪪 ఐడీ వెరిఫైడ్"
  phone_masked: string; // "+91 98765 *****"
  phone: string; // private, never leaked without approved request
  profile_completeness: number; // e.g. 85
  is_active: boolean;
  created_at: string;
}

export interface MatrimonyInterest {
  id: string;
  sender_profile_id: string;
  sender_name: string;
  receiver_profile_id: string;
  status: "pending" | "accepted" | "declined" | "maybe_later";
  created_at: string;
}

export interface MatrimonyContactRequest {
  id: string;
  requester_profile_id: string;
  requester_name: string;
  requester_phone: string;
  target_profile_id: string;
  status: "pending" | "approved" | "declined";
  created_at: string;
}

export interface MatrimonySearchFilters {
  gender: MatrimonyGender;
  age_min?: number;
  age_max?: number;
  locality?: string;
  radius_km?: number;
  lat?: number;
  lon?: number;
  education?: string;
  occupation?: string;
  marital_status?: string;
  community?: string;
  caste_no_bar_only?: boolean;
  with_photo_only?: boolean;
  ring_tier?: "very_near" | "nearby_towns" | "wider" | "all";
  query?: string;
}

export interface MatrimonyReport {
  reported_profile_id: string;
  reporter_phone?: string;
  reason: string;
  description: string;
  created_at: string;
}
