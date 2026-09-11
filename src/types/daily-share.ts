export type DailyShareCategorySlug = 
  | "motivational"
  | "spiritual"
  | "good-morning"
  | "good-night"
  | "telugu-quotes"
  | "life-quotes"
  | "success"
  | "friendship"
  | "love"
  | "family"
  | "jokes"
  | "birthday"
  | "anniversary"
  | "wedding"
  | "congratulations"
  | "festival"
  | "devotional"
  | "positive-thoughts"
  | "business"
  | "students"
  | "career"
  | "health-wellness"
  | "national-days"
  | "andhra-pradesh"
  | "visakhapatnam"
  | "trending-telugu"
  | "kids"
  | "women"
  | "parents"
  | "inspirational-stories";

export type ContentType = 
  | "image"
  | "quote"
  | "template"
  | "video"
  | "personalized_image"
  | "carousel"
  | "festival"
  | "business";

export interface DailyShareCategory {
  id: string;
  slug: DailyShareCategorySlug;
  title_te: string;
  title_en: string;
  emoji: string;
  description_te?: string;
  color?: string;
}

export interface DailyShareItem {
  id: string;
  title: string;
  slug: string;
  category: DailyShareCategorySlug;
  language: string;
  content_type: ContentType;
  image_url: string;
  video_url?: string;
  thumbnail_url?: string;
  quote_te?: string;
  quote_en?: string;
  author?: string;
  caption?: string;
  description?: string;
  hashtags?: string[];
  likes_count: number;
  shares_count: number;
  personalization_enabled: boolean;
  template_style?: "classic" | "modern" | "festival" | "business" | "quote_card";
  default_user_name?: string;
  default_business_name?: string;
  publish_at?: string;
  expire_at?: string;
  priority?: number;
  tags?: string[];
  location?: string;
  festival?: string;
  created_at: string;
}

export interface PersonalizeOptions {
  userPhoto?: string;
  userName: string;
  userTitle?: string;
  businessName?: string;
  location?: string;
  phoneNumber?: string;
  customMessage?: string;
  themeColor?: string;
}

export interface UserCreation {
  id: string;
  shareItemId: string;
  title: string;
  category: DailyShareCategorySlug;
  created_at: string;
  renderedDataUrl: string;
  options: PersonalizeOptions;
}
