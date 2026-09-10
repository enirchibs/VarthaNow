// 📖 Read Article & User Visit Tracker
const READ_ARTICLES_KEY = "varthanow_read_articles";
const LAST_VISIT_KEY = "varthanow_last_visit";

/**
 * Marks an article as read with the current timestamp
 */
export function markArticleAsRead(slug: string): void {
  if (!slug) return;
  try {
    const stored = localStorage.getItem(READ_ARTICLES_KEY);
    const readMap: Record<string, number> = stored ? JSON.parse(stored) : {};
    readMap[slug] = Date.now();

    // Clean up old entries if map grows beyond 500 items to avoid storage overflow
    const entries = Object.entries(readMap);
    if (entries.length > 500) {
      entries.sort((a, b) => b[1] - a[1]);
      const trimmedMap = Object.fromEntries(entries.slice(0, 400));
      localStorage.setItem(READ_ARTICLES_KEY, JSON.stringify(trimmedMap));
    } else {
      localStorage.setItem(READ_ARTICLES_KEY, JSON.stringify(readMap));
    }
  } catch (e) {
    console.warn("Failed to mark article as read:", e);
  }
}

/**
 * Checks if an article has been read by the user
 */
export function isArticleRead(slug: string): boolean {
  if (!slug) return false;
  try {
    const stored = localStorage.getItem(READ_ARTICLES_KEY);
    if (!stored) return false;
    const readMap: Record<string, number> = JSON.parse(stored);
    return Boolean(readMap[slug]);
  } catch {
    return false;
  }
}

/**
 * Returns object mapping read slugs to their read timestamp
 */
export function getReadArticlesMap(): Record<string, number> {
  try {
    const stored = localStorage.getItem(READ_ARTICLES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Updates the timestamp of the user's last visit
 */
export function recordUserVisit(): void {
  try {
    localStorage.setItem(LAST_VISIT_KEY, Date.now().toString());
  } catch (e) {
    console.warn("Failed to record user visit:", e);
  }
}

/**
 * Gets the timestamp of user's previous visit
 */
export function getUserLastVisitTime(): number {
  try {
    const stored = localStorage.getItem(LAST_VISIT_KEY);
    return stored ? parseInt(stored, 10) : Date.now();
  } catch {
    return Date.now();
  }
}

/**
 * Calculates hours elapsed since article publication
 */
export function getArticleAgeHours(publishedAt: string): number {
  const pubTime = new Date(publishedAt).getTime();
  if (isNaN(pubTime)) return 0;
  return Math.max(0, (Date.now() - pubTime) / (1000 * 3600));
}
