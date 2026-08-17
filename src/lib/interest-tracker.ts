// 🕵️‍♂️ Click Interest Tracker for personalization
export function trackArticleView(title: string, category: string) {
  try {
    const stored = localStorage.getItem("varthanow_interests");
    const interests: Record<string, number> = stored ? JSON.parse(stored) : {};

    // 1. Extract words from title
    const words = title.toLowerCase()
      .replace(/[^\w\s\u0c00-\u0c7f]/g, "") // support Telugu characters and English words
      .split(/\s+/);

    words.forEach(w => {
      if (w.length > 3) {
        interests[w] = (interests[w] || 0) + 1;
      }
    });

    // 2. Track category
    if (category) {
      const catKey = category.toLowerCase();
      interests[catKey] = (interests[catKey] || 0) + 5; // Higher weight for category matches
    }

    // Keep only top 100 keywords to save storage
    const sorted = Object.entries(interests)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100);

    localStorage.setItem("varthanow_interests", JSON.stringify(Object.fromEntries(sorted)));
  } catch (e) {
    console.warn("Failed to track interests:", e);
  }
}

export function getUserInterests(): string[] {
  try {
    const stored = localStorage.getItem("varthanow_interests");
    if (!stored) return [];
    const interests: Record<string, number> = JSON.parse(stored);
    
    // Return keywords that have been triggered at least twice
    return Object.entries(interests)
      .filter(([_, count]) => count >= 2)
      .map(([word]) => word);
  } catch {
    return [];
  }
}
