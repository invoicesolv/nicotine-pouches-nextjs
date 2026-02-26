-- Index for /api/blog-posts list query: filter by status, order by date DESC
-- Prevents statement timeout when fetching many rows without content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_status_date_desc
  ON public.blog_posts (status, date DESC NULLS LAST)
  WHERE status = 'publish';
