-- Per-project changelog. The owner posts what changed; it lands in the feed of
-- everyone following the project. This is the heartbeat of the site — branches
-- are rare events, updates are the weekly motion.
CREATE TABLE project_updates (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  author_id TEXT NOT NULL REFERENCES users(id),
  version TEXT,                       -- optional label the author picks ("v0.3", "big rewrite")
  body_md TEXT NOT NULL,              -- what changed, in plain words
  status TEXT NOT NULL DEFAULT 'live',
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_project_updates_project ON project_updates(project_id, created_at DESC);
CREATE INDEX idx_project_updates_recent ON project_updates(created_at DESC);
