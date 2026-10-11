-- Allow the citizen-reporter categories "local" (స్థానిక వార్తలు) and "issues" (ప్రజా సమస్యలు).
alter table blog_posts drop constraint if exists blog_posts_category_check;
alter table blog_posts add constraint blog_posts_category_check check (category = any (array[
  'andhra-pradesh', 'telangana', 'cinema', 'vizag', 'technology', 'jobs', 'cricket', 'politics', 'national',
  'international', 'business', 'sports', 'entertainment', 'health', 'devotional', 'breaking', 'crime', 'weather',
  'election', 'education', 'lifestyle', 'science', 'environment', 'astrology', 'agriculture', 'automobile',
  'real-estate', 'travel', 'food', 'spiritual',
  'local', 'issues'
]));
