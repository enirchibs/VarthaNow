import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  console.error("❌ Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false }
});

const FEED_SOURCES = [
  { url: "https://news.google.com/rss/search?q=రాజకీయాలు+when:24h&hl=te&gl=IN&ceid=IN:te", category: "politics", priority: 1, publisher: "Google News", directFeed: false },
  { url: "https://tv9telugu.com/feed", category: "politics", priority: 1, publisher: "TV9 Telugu", directFeed: true },
  { url: "https://ntvtelugu.com/feed", category: "politics", priority: 1, publisher: "NTV Telugu", directFeed: true },
  { url: "https://www.etvbharat.com/rss/telugu/state/andhra-pradesh", category: "politics", priority: 1, publisher: "ETV Bharat", directFeed: true },

  { url: "https://news.google.com/rss/search?q=breaking+news+telugu+when:6h&hl=te&gl=IN&ceid=IN:te", category: "national", priority: 1, publisher: "Google News", directFeed: false },
  { url: "https://www.andhrajyothy.com/rss.xml", category: "national", priority: 1, publisher: "Andhra Jyothy", directFeed: true },
  { url: "https://www.vaartha.com/feed", category: "national", priority: 1, publisher: "Vaartha", directFeed: true },
  { url: "https://www.abpdesam.com/rss.xml", category: "national", priority: 1, publisher: "ABP Desam", directFeed: true },
  { url: "https://10tv.in/feed", category: "national", priority: 1, publisher: "10TV", directFeed: true },

  { url: "https://news.google.com/rss/search?q=ఆంధ్రప్రదేశ్+వార్తలు+when:24h&hl=te&gl=IN&ceid=IN:te", category: "andhra-pradesh", priority: 2, publisher: "Google News", directFeed: false },
  { url: "https://www.etvbharat.com/rss/telugu/state/andhra-pradesh", category: "andhra-pradesh", priority: 2, publisher: "ETV Bharat AP", directFeed: true },
  { url: "https://tv9telugu.com/feed/category/andhra-pradesh", category: "andhra-pradesh", priority: 2, publisher: "TV9 AP", directFeed: true },

  { url: "https://news.google.com/rss/search?q=తెలంగాణ+వార్తలు+when:24h&hl=te&gl=IN&ceid=IN:te", category: "telangana", priority: 2, publisher: "Google News", directFeed: false },
  { url: "https://www.etvbharat.com/rss/telugu/state/telangana", category: "telangana", priority: 2, publisher: "ETV Bharat TS", directFeed: true },
  { url: "https://hmtvlive.com/feed", category: "telangana", priority: 2, publisher: "HMTV Live", directFeed: true },

  { url: "https://news.google.com/rss/search?q=క్రికెట్+IPL+T20+when:24h&hl=te&gl=IN&ceid=IN:te", category: "cricket", priority: 2, publisher: "Google News", directFeed: false },
  { url: "https://tv9telugu.com/feed/category/sports", category: "cricket", priority: 2, publisher: "TV9 Sports", directFeed: true },
  { url: "https://www.etvbharat.com/rss/telugu/sports", category: "cricket", priority: 2, publisher: "ETV Sports", directFeed: true },

  { url: "https://news.google.com/rss/search?q=వ్యాపారం+మార్కెట్+when:24h&hl=te&gl=IN&ceid=IN:te", category: "business", priority: 2, publisher: "Google News", directFeed: false },
  { url: "https://www.etvbharat.com/rss/telugu/business", category: "business", priority: 2, publisher: "ETV Business", directFeed: true },

  { url: "https://news.google.com/rss/search?q=సినిమా+టాలీవుడ్+when:24h&hl=te&gl=IN&ceid=IN:te", category: "cinema", priority: 3, publisher: "Google News", directFeed: false },
  { url: "https://tv9telugu.com/feed/category/entertainment", category: "cinema", priority: 3, publisher: "TV9 Entertainment", directFeed: true },
  { url: "https://www.etvbharat.com/rss/telugu/entertainment", category: "cinema", priority: 3, publisher: "ETV Entertainment", directFeed: true },
  { url: "https://ntvtelugu.com/feed/category/entertainment", category: "cinema", priority: 3, publisher: "NTV Entertainment", directFeed: true },

  { url: "https://news.google.com/rss/search?q=సాంకేతిక+వార్తలు+when:24h&hl=te&gl=IN&ceid=IN:te", category: "technology", priority: 3, publisher: "Google News", directFeed: false },

  { url: "https://news.google.com/rss/search?q=ఉద్యోగాలు+ప్రభుత్వ+when:48h&hl=te&gl=IN&ceid=IN:te", category: "jobs", priority: 3, publisher: "Google News Jobs", directFeed: false },
  { url: "https://www.etvbharat.com/rss/telugu/education", category: "jobs", priority: 3, publisher: "ETV Education", directFeed: true },

  { url: "https://news.google.com/rss/search?q=ఆరోగ్య+వార్తలు+when:48h&hl=te&gl=IN&ceid=IN:te", category: "health", priority: 3, publisher: "Google News Health", directFeed: false },
  { url: "https://www.etvbharat.com/rss/telugu/health-and-lifestyle", category: "health", priority: 3, publisher: "ETV Health", directFeed: true },

  { url: "https://news.google.com/rss/search?q=విద్య+పాఠశాల+విశ్వవిద్యాలయం+when:48h&hl=te&gl=IN&ceid=IN:te", category: "education", priority: 3, publisher: "Google News Education", directFeed: false },

  { url: "https://news.google.com/rss/search?q=ఆధ్యాత్మికం+భక్తి+when:48h&hl=te&gl=IN&ceid=IN:te", category: "devotional", priority: 4, publisher: "Google News Devotional", directFeed: false },
  { url: "https://tv9telugu.com/feed/category/devotional", category: "devotional", priority: 4, publisher: "TV9 Devotional", directFeed: true },

  { url: "https://news.google.com/rss/search?q=వ్యవసాయం+రైతులు+when:48h&hl=te&gl=IN&ceid=IN:te", category: "agriculture", priority: 4, publisher: "Google News Agriculture", directFeed: false },

  { url: "https://news.google.com/rss/search?q=జ్యోతిష్యం+రాశిఫలాలు+when:48h&hl=te&gl=IN&ceid=IN:te", category: "astrology", priority: 4, publisher: "Google News Astrology", directFeed: false }
];

async function run() {
  console.log(`Migrating ${FEED_SOURCES.length} feeds to the database...`);
  
  for (const feed of FEED_SOURCES) {
    // Determine default interval based on priority tier
    let interval = 3600; // 1 hour default
    if (feed.priority === 1) interval = 1200; // 20 mins
    if (feed.priority === 2) interval = 3600; // 1 hour
    if (feed.priority === 3) interval = 7200; // 2 hours
    if (feed.priority === 4) interval = 14400; // 4 hours
    
    const { error } = await supabase.from('rss_feeds').upsert({
      url: feed.url,
      category: feed.category,
      priority_tier: feed.priority,
      publisher: feed.publisher,
      direct_feed: feed.directFeed,
      current_interval_seconds: interval,
      consecutive_failures: 0,
      next_fetch_time: new Date().toISOString()
    }, { onConflict: 'url' });
    
    if (error) {
      console.error(`❌ Failed to insert ${feed.url}:`, error.message);
    } else {
      console.log(`✅ Inserted/Updated ${feed.publisher} - ${feed.category}`);
    }
  }
  
  console.log("Migration complete!");
}

run();
