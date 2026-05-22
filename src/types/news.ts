export type NewsCategory =
  | "andhra-pradesh"
  | "telangana"
  | "cinema"
  | "vizag"
  | "technology"
  | "jobs"
  | "cricket"
  | "politics";

export type BlogPost = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  tags: string[];
  meta_title: string;
  meta_description: string;
  og_image: string | null;
  author_name: string;
  language: "te" | "en" | "hi" | "ta" | "kn";
  published: boolean;
  featured: boolean;
  reading_time_min: number;
  published_at: string;
};

export type SearchFilters = {
  query: string;
  category?: NewsCategory | "all";
  language?: "te" | "en" | "hi" | "ta" | "kn";
};
