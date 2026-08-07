-- Likes and saves for posts.
--
-- The existing tables are keyed to projects, and a tutorial is a post. Rather
-- than widening those (and loosening a foreign key that currently guarantees
-- something real), posts get their own pair with the same shape.
CREATE TABLE IF NOT EXISTS post_likes (
  user_id    TEXT NOT NULL REFERENCES users(id),
  post_id    TEXT NOT NULL REFERENCES posts(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);

CREATE TABLE IF NOT EXISTS post_saves (
  user_id    TEXT NOT NULL REFERENCES users(id),
  post_id    TEXT NOT NULL REFERENCES posts(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_post_saves_user ON post_saves(user_id);
