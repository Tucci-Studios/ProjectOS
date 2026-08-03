-- Forks that exist on GitHub but were never published here.
--
-- These are NOT projects. They have no page, no votes, no description — nobody
-- claimed them on Project OS. They exist so an author can see their real reach,
-- and so we can nudge the people who forked into publishing.
CREATE TABLE github_forks (
  project_id TEXT NOT NULL REFERENCES projects(id),  -- the published project that was forked
  full_name TEXT NOT NULL,                           -- "someone/their-copy"
  owner_login TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 0,
  pushed_at INTEGER,                                 -- last time they actually worked on it
  PRIMARY KEY (project_id, full_name)
);

CREATE INDEX idx_github_forks_project ON github_forks(project_id);

-- When we last asked GitHub, and what it said the total was. GitHub's count
-- includes forks-of-forks we don't list, so we keep it separately.
CREATE TABLE fork_sync (
  project_id TEXT PRIMARY KEY REFERENCES projects(id),
  total INTEGER NOT NULL DEFAULT 0,
  synced_at INTEGER NOT NULL
);
