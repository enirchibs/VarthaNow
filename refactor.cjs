const fs = require('fs');
let content = fs.readFileSync('scripts/ingest-telugu-news.ts', 'utf8');

// 1. Remove FEED_SOURCES array
content = content.replace(/interface FeedSource \{[\s\S]*?\}\s*const FEED_SOURCES: FeedSource\[\] = \[[\s\S]*?\];/g, "// Feeds are now fetched dynamically from the rss_feeds table in Supabase.");

// 2. Replace fetching logic
const oldRunCode = `  let feedsToProcess = FEED_SOURCES;
  if (targetCategory) {
    feedsToProcess = FEED_SOURCES.filter(f => f.category.toLowerCase() === targetCategory.toLowerCase());
    console.log(\`🎯 Category filter: "\${targetCategory}" → \${feedsToProcess.length} feeds\`);
  } else if (targetPriority) {
    feedsToProcess = FEED_SOURCES.filter(f => f.priority === targetPriority);
    console.log(\`🎯 Priority filter: P\${targetPriority} → \${feedsToProcess.length} feeds\`);
  }

  console.log(\`📋 Processing \${feedsToProcess.length} feeds × up to \${ITEMS_PER_FEED} items\`);
  console.log("═".repeat(70));

  for (const feed of feedsToProcess) {
    try {
      console.log(\`\\n\${"─".repeat(60)}\`);
      console.log(\`📡 [P\${feed.priority}][\${feed.category.toUpperCase()}] \${feed.publisher}\`);
      console.log(\`   \${feed.directFeed ? "✅ Direct Feed" : "🔄 Google News"}: \${feed.url.slice(0, 80)}\`);

      let rssItems: any[] = [];
      try {
        const rss = await parser.parseURL(feed.url);
        rssItems = (rss.items || []).slice(0, ITEMS_PER_FEED);
        console.log(\`   Found \${rssItems.length} items\`);`;

const newRunCode = `  let query = supabase.from('rss_feeds').select('*').lte('next_fetch_time', new Date().toISOString());
  if (targetCategory) query = query.eq('category', targetCategory.toLowerCase());
  if (targetPriority) query = query.eq('priority_tier', targetPriority);

  const { data: dbFeeds, error } = await query;
  if (error) {
    console.error("❌ Failed to fetch feeds from Supabase:", error);
    process.exit(1);
  }
  let feedsToProcess = dbFeeds || [];

  console.log(\`📋 Processing \${feedsToProcess.length} feeds × up to \${ITEMS_PER_FEED} items\`);
  console.log("═".repeat(70));

  for (const feed of feedsToProcess) {
    try {
      console.log(\`\\n\${"─".repeat(60)}\`);
      console.log(\`📡 [P\${feed.priority_tier}][\${feed.category.toUpperCase()}] \${feed.publisher}\`);
      console.log(\`   \${feed.direct_feed ? "✅ Direct Feed" : "🔄 Google News"}: \${feed.url.slice(0, 80)}\`);

      let rssItems: any[] = [];
      try {
        let fetchOpts: any = { headers: {} };
        if (feed.etag) fetchOpts.headers['If-None-Match'] = feed.etag;
        if (feed.last_modified) fetchOpts.headers['If-Modified-Since'] = feed.last_modified;
        
        const res = await fetch(feed.url, fetchOpts);
        
        // ── Adaptive Polling: Update DB if 304 or Error ──
        if (res.status === 304 || res.status === 429 || !res.ok) {
           let newFailures = feed.consecutive_failures;
           let newInterval = feed.current_interval_seconds;
           
           if (res.status === 304) {
               console.log(\`   🔄 304 Not Modified. Applying Exponential Backoff...\`);
               newInterval = Math.floor(newInterval * 1.5);
               newFailures = 0;
           } else {
               console.log(\`   ❌ HTTP Error \${res.status}. Aggressive Backoff...\`);
               newFailures++;
               newInterval = Math.floor(newInterval * 2);
           }
           
           // Clamp max interval
           const maxIntervals: Record<number, number> = { 1: 3600, 2: 14400, 3: 43200, 4: 86400 };
           const maxInt = maxIntervals[feed.priority_tier] || 86400;
           if (newInterval > maxInt) newInterval = maxInt;
           
           const nextFetch = new Date(Date.now() + newInterval * 1000).toISOString();
           await supabase.from('rss_feeds').update({ 
               current_interval_seconds: newInterval,
               next_fetch_time: nextFetch,
               consecutive_failures: newFailures
           }).eq('id', feed.id);
           
           if (res.status === 304) continue;
           throw new Error(\`HTTP Error \${res.status}\`);
        }
        
        const xml = await res.text();
        const rss = await parser.parseString(xml);
        
        // Calculate Moving Average TBA
        let newInterval = feed.current_interval_seconds;
        if (rss.items && rss.items.length > 1) {
             let totalDiff = 0;
             let count = 0;
             for (let i = 0; i < Math.min(rss.items.length - 1, 10); i++) {
                 const t1 = new Date(rss.items[i].isoDate || rss.items[i].pubDate || Date.now()).getTime();
                 const t2 = new Date(rss.items[i+1].isoDate || rss.items[i+1].pubDate || Date.now()).getTime();
                 if (!isNaN(t1) && !isNaN(t2) && t1 !== t2) {
                     totalDiff += Math.abs(t1 - t2);
                     count++;
                 }
             }
             if (count > 0) {
                 const avgTBA = Math.floor((totalDiff / count) / 1000);
                 const minIntervals: Record<number, number> = { 1: 300, 2: 900, 3: 1800, 4: 7200 };
                 const maxIntervals: Record<number, number> = { 1: 3600, 2: 14400, 3: 43200, 4: 86400 };
                 const minInt = minIntervals[feed.priority_tier] || 7200;
                 const maxInt = maxIntervals[feed.priority_tier] || 86400;
                 
                 newInterval = Math.floor(avgTBA * 0.8);
                 if (newInterval < minInt) newInterval = minInt;
                 if (newInterval > maxInt) newInterval = maxInt;
                 console.log(\`   ⏱️ Avg TBA: \${avgTBA}s -> New Interval: \${newInterval}s\`);
             }
        }
        
        const nextFetch = new Date(Date.now() + newInterval * 1000).toISOString();
        await supabase.from('rss_feeds').update({ 
            current_interval_seconds: newInterval,
            next_fetch_time: nextFetch,
            consecutive_failures: 0,
            last_fetched_at: new Date().toISOString(),
            etag: res.headers.get('etag'),
            last_modified: res.headers.get('last-modified')
        }).eq('id', feed.id);

        rssItems = (rss.items || []).slice(0, ITEMS_PER_FEED);
        console.log(\`   Found \${rssItems.length} items\`);`;

if (content.includes("let feedsToProcess = FEED_SOURCES;")) {
  content = content.replace(oldRunCode, newRunCode);
} else {
  console.log("Could not find the target code to replace.");
}

// 3. Fix property names for DB compatibility
content = content.replace(/feed\.priority/g, "feed.priority_tier");
content = content.replace(/feed\.directFeed/g, "feed.direct_feed");

fs.writeFileSync('scripts/ingest-telugu-news.ts', content);
console.log("File refactored successfully!");
