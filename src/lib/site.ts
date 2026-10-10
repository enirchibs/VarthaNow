// Single source of truth for the public site address. Set VITE_SITE_URL at build time
// (e.g. https://vaartanow.com); falls back to the current origin so links never point at localhost in prod.
const envUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "");
const isLocal = (url?: string) => !url || /localhost|127\.0\.0\.1/.test(url);

export const SITE_URL =
  !isLocal(envUrl) ? envUrl! : typeof window !== "undefined" ? window.location.origin : "https://varthanow.pages.dev";

export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
