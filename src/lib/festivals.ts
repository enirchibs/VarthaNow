export interface Festival {
  date: string; // YYYY-MM-DD
  nameTe: string;
  nameEn: string;
  emoji: string;
}

// Curated calendar of Telugu and national festivals for 2025/2026/2027
export const FESTIVALS: Festival[] = [
  { date: "2026-01-01", nameTe: "నూతన సంవత్సర వేడుకలు", nameEn: "New Year's Day", emoji: "🎉" },
  { date: "2026-01-13", nameTe: "భోగి పండుగ", nameEn: "Bhogi", emoji: "🔥" },
  { date: "2026-01-14", nameTe: "సంక్రాంతి", nameEn: "Sankranti", emoji: "🪁" },
  { date: "2026-01-15", nameTe: "కనుమ", nameEn: "Kanuma", emoji: "🐂" },
  { date: "2026-01-26", nameTe: "గణతంత్ర దినోత్సవం", nameEn: "Republic Day", emoji: "🇮🇳" },
  { date: "2026-02-15", nameTe: "మహా శివరాత్రి", nameEn: "Maha Shivaratri", emoji: "🔱" },
  { date: "2026-03-03", nameTe: "హోలీ పండుగ", nameEn: "Holi", emoji: "🎨" },
  { date: "2026-03-19", nameTe: "ఉగాది (తెలుగు నూతన సంవత్సరం)", nameEn: "Ugadi (Telugu New Year)", emoji: "🥭" },
  { date: "2026-03-27", nameTe: "శ్రీరామ నవమి", nameEn: "Sri Rama Navami", emoji: "🏹" },
  { date: "2026-04-03", nameTe: "గుడ్ ఫ్రైడే", nameEn: "Good Friday", emoji: "✝️" },
  { date: "2026-04-05", nameTe: "బాబు జగ్జీవన్ రామ్ జయంతి", nameEn: "Babu Jagjivan Ram Jayanti", emoji: "👨" },
  { date: "2026-04-14", nameTe: "అంబేద్కర్ జయంతి", nameEn: "Ambedkar Jayanti", emoji: "📖" },
  { date: "2026-08-15", nameTe: "స్వాతంత్ర్య దినోత్సవం", nameEn: "Independence Day", emoji: "🇮🇳" },
  { date: "2026-08-27", nameTe: "శ్రీకృష్ణ జన్మాష్టమి", nameEn: "Krishnashtami", emoji: "🍯" },
  { date: "2026-09-15", nameTe: "వినాయక చవితి", nameEn: "Ganesh Chaturthi", emoji: "🐘" },
  { date: "2026-10-11", nameTe: "దుర్గాష్టమి", nameEn: "Durga Ashtami", emoji: "🌸" },
  { date: "2026-10-12", nameTe: "విజయదశమి (దసరా)", nameEn: "Dussehra", emoji: "🏹" },
  { date: "2026-11-08", nameTe: "దీపావళి", nameEn: "Diwali", emoji: "🪔" },
  { date: "2026-12-25", nameTe: "క్రిస్మస్ పండుగ", nameEn: "Christmas", emoji: "🎄" }
];

export function getUpcomingFestivals(count = 2): Festival[] {
  const todayStr = new Date().toISOString().split("T")[0];
  
  // Filter future festivals
  const future = FESTIVALS.filter(f => f.date >= todayStr);
  if (future.length >= count) return future.slice(0, count);

  // If we ran out of festivals in current year, return the first ones (assume next year rotation)
  return FESTIVALS.slice(0, count);
}
