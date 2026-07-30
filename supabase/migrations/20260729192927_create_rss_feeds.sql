CREATE TABLE IF NOT EXISTS public.rss_feeds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    priority_tier INTEGER NOT NULL,
    publisher TEXT NOT NULL,
    direct_feed BOOLEAN DEFAULT false,
    
    -- Adaptive Polling Columns
    last_fetched_at TIMESTAMPTZ,
    next_fetch_time TIMESTAMPTZ DEFAULT NOW(),
    current_interval_seconds INTEGER DEFAULT 3600,
    consecutive_failures INTEGER DEFAULT 0,
    
    -- Conditional GETs
    etag TEXT,
    last_modified TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast scheduler querying
CREATE INDEX IF NOT EXISTS idx_rss_feeds_next_fetch ON public.rss_feeds(next_fetch_time);
