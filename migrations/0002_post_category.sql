-- Posts gain a section: tutorials and tutorial-requests live inside category feeds.
-- kind now includes: post | tutorial | request
ALTER TABLE posts ADD COLUMN category TEXT;
CREATE INDEX idx_posts_category_kind ON posts(category, kind, status, created_at);
