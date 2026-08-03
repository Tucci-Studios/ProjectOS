-- Weekly update posts, Steam-patch-notes style. Written by admins; can point at
-- the community idea that drove the change.
CREATE TABLE updates (
  id TEXT PRIMARY KEY,
  version TEXT,                       -- e.g. "Week 3" or "v0.4"
  title TEXT NOT NULL,
  intro TEXT,                         -- short paragraph above the bullet list
  body_md TEXT NOT NULL,              -- "+ added", "~ changed", "- fixed", "> shipped idea:<id>"
  author_id TEXT NOT NULL REFERENCES users(id),
  published_at INTEGER NOT NULL
);
CREATE INDEX idx_updates_published ON updates(published_at);
