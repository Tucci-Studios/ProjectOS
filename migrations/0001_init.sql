-- Project OS — initial schema
-- Conventions: TEXT ids (github ids / nanoid), unix-epoch seconds for timestamps.

CREATE TABLE users (
  id TEXT PRIMARY KEY,                -- github user id (stable across renames)
  github_login TEXT NOT NULL,         -- current @handle, refreshed on sign-in
  display_name TEXT,
  avatar_url TEXT,
  github_created_at INTEGER NOT NULL, -- account-age gate for likes
  tos_accepted_at INTEGER,            -- NULL until first-publish ToS gate passed
  role TEXT NOT NULL DEFAULT 'user',  -- user | trusted_reviewer | admin
  created_at INTEGER NOT NULL,
  banned_at INTEGER
);
CREATE UNIQUE INDEX idx_users_login ON users(github_login);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id),
  base_name TEXT NOT NULL,            -- immutable down the lineage ("Subwolf")
  variant_name TEXT,                  -- NULL for lineage roots ("Cyber" => "Subwolf // Cyber")
  category TEXT NOT NULL,             -- claude-code | claude-skills | claude-md | mcp-servers | codex | local-llms | scripts-tools | games
  description TEXT NOT NULL,
  license TEXT NOT NULL DEFAULT 'GPL-3.0',
  github_repo TEXT NOT NULL,          -- "owner/repo"
  manifest_json TEXT NOT NULL,        -- validated project.json, as submitted
  parent_id TEXT REFERENCES projects(id),  -- lineage edge; NULL = root
  root_id TEXT,                       -- denormalized lineage root for fast tree loads
  change_summary TEXT,                -- author's one-liner: what changed vs parent
  fork_verified_at INTEGER,           -- when GitHub fork relationship was API-verified
  status TEXT NOT NULL DEFAULT 'live',-- live | delisted | pending_review
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX idx_projects_repo ON projects(github_repo);
CREATE INDEX idx_projects_root ON projects(root_id);
CREATE INDEX idx_projects_parent ON projects(parent_id);
CREATE INDEX idx_projects_category ON projects(category, status, created_at);

CREATE TABLE likes (
  user_id TEXT NOT NULL REFERENCES users(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, project_id)
);
CREATE INDEX idx_likes_project ON likes(project_id);

-- GitHub stats cache, refreshed by cron worker — project pages never hit the GitHub API.
CREATE TABLE repo_stats (
  project_id TEXT PRIMARY KEY REFERENCES projects(id),
  stars INTEGER NOT NULL DEFAULT 0,
  github_forks INTEGER NOT NULL DEFAULT 0,
  release_downloads INTEGER NOT NULL DEFAULT 0,
  refreshed_at INTEGER NOT NULL
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES users(id),
  project_id TEXT REFERENCES projects(id), -- optional: post attached to a project
  title TEXT,
  body_md TEXT NOT NULL,               -- raw markdown; sanitized at render
  kind TEXT NOT NULL DEFAULT 'post',   -- post | tutorial
  status TEXT NOT NULL DEFAULT 'live', -- live | removed
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_posts_created ON posts(status, created_at);
CREATE INDEX idx_posts_project ON posts(project_id);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id),
  author_id TEXT NOT NULL REFERENCES users(id),
  body_md TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live',
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_comments_post ON comments(post_id, created_at);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL,          -- project | post | comment | user
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',-- open | resolved | dismissed
  resolved_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  resolved_at INTEGER
);
CREATE INDEX idx_reports_queue ON reports(status, created_at);

CREATE TABLE waitlist (
  email TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  source TEXT                          -- landing | fork-wars | other
);
