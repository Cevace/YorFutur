-- Create blog_posts table for YorFutur blog system
-- This table stores all blog posts with full content, metadata, and publishing status

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    author_name TEXT DEFAULT 'YorFutur',
    reading_time INTEGER, -- in minutes
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) -- admin who created it
);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view published posts
CREATE POLICY "Published posts are viewable by everyone"
ON blog_posts FOR SELECT
USING (published = true);

-- Policy: Authenticated users can manage all posts
CREATE POLICY "Authenticated users can manage posts"
ON blog_posts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_blog_posts_updated_at_trigger
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_blog_posts_updated_at();

-- Comments
COMMENT ON TABLE blog_posts IS 'Blog posts for YorFutur blog system';
COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN blog_posts.reading_time IS 'Estimated reading time in minutes';
COMMENT ON COLUMN blog_posts.published IS 'Whether the post is publicly visible';
COMMENT ON COLUMN blog_posts.published_at IS 'When the post was first published';
