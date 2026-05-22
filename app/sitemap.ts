import type { MetadataRoute } from "next";

const routes = ["", "/shorts", "/local", "/jobs", "/ai", "/properties", "/auth", "/profile"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "hourly" : "daily",
    priority: route === "" ? 1 : 0.8
  }));
}
