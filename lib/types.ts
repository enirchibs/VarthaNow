export type Language = "te" | "en" | "hi" | "ta" | "kn" | "ml";

export type Category =
  | "Latest"
  | "Andhra Pradesh"
  | "Telangana"
  | "India"
  | "World"
  | "Politics"
  | "Cinema"
  | "Cricket"
  | "Technology"
  | "Business"
  | "Devotional"
  | "Jobs"
  | "Education"
  | "Weather"
  | "Viral"
  | "Local";

export type Article = {
  id: string;
  category: Category;
  city?: string;
  headline: Record<Language, string>;
  summary: Record<Language, string>;
  oneMinute: Record<Language, string>;
  source: string;
  sourceUrl: string;
  imageUrl: string;
  publishedAt: string;
  reactions: number;
  bookmarks: number;
  trendingScore: number;
  isBreaking?: boolean;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Govt" | "IT" | "Walk-in" | "Internship" | "Local";
  salary: string;
  applyUrl: string;
  deadline: string;
};

export type Property = {
  id: string;
  title: string;
  location: string;
  type: "Flat" | "House" | "Villa" | "PG" | "Rental" | "Commercial";
  price: string;
  imageUrl: string;
};

export type NotificationItem = {
  id: string;
  type: "Cyclone" | "Rain" | "Election" | "Cricket" | "Government";
  title: string;
  body: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
};
