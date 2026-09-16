// 🛠️ Mana Adda Services & Rentals Type Definitions
export type ServiceMode = "customer_location" | "provider_location" | "both";

export type PriceType = "fixed" | "starting_from" | "quote" | "hourly" | "daily" | "negotiable";

export interface PricingItem {
  service_name: string;
  price_rate: string;
  price_type?: PriceType;
}

export interface ServiceCategoryItem {
  id: string;
  slug: string;
  name_te: string;
  name_en: string;
  icon_name: string;
  color_bg: string;
  color_text: string;
  color_border?: string;
  image_url: string;
  subcategories_count: number;
  is_rental?: boolean;
  is_popular?: boolean;
  sort_order: number;
}

export interface ServiceSubcategoryItem {
  id: string;
  category_id: string;
  slug: string;
  name_te: string;
  name_en: string;
  icon_name: string;
  image_url: string;
  description_te?: string;
  is_rental?: boolean;
  sort_order: number;
}

export interface ServiceProvider {
  id: string;
  name: string;
  business_name?: string;
  phone: string;
  whatsapp?: string;
  phone_verified: boolean;
  category_id: string;
  category_name_te: string;
  subcategory_id: string;
  subcategory_name_te: string;
  avatar_url: string;
  photos: string[];
  locality: string;
  village_town: string;
  mandal?: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  distance_km?: number;
  service_radius_km: number;
  service_mode: ServiceMode;
  price_type: PriceType;
  price_from?: number;
  price_rate_label: string;
  pricing_breakdown: PricingItem[];
  services_offered: string[];
  experience_years: number;
  rating: number;
  review_count: number;
  description_te: string;
  description_en?: string;
  working_hours: string;
  is_available_now: boolean;
  is_sponsored?: boolean;
  created_at: string;
}

export interface ServiceReview {
  id: string;
  provider_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ServiceReport {
  provider_id: string;
  reason: string;
  description: string;
  reporter_phone?: string;
  created_at: string;
}

export interface ServiceLocationFilter {
  name_te: string;
  name_en: string;
  district: string;
  lat: number;
  lon: number;
  radius_km: number;
  is_current_gps?: boolean;
}

export interface ServiceSearchFilters {
  query?: string;
  categoryId?: string;
  subcategoryId?: string;
  locality?: string;
  lat?: number;
  lon?: number;
  radiusKm?: number;
  sortBy?: "distance" | "rating" | "price_asc" | "available";
  availableNowOnly?: boolean;
  mode?: "services" | "rentals";
}
