-- Follows: get told when a project you care about grows a new branch.
CREATE TABLE follows (
  user_id TEXT NOT NULL REFERENCES users(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, project_id)
);
CREATE INDEX idx_follows_project ON follows(project_id);

-- Blocks: hide someone's projects and posts from your view.
CREATE TABLE blocks (
  user_id TEXT NOT NULL REFERENCES users(id),
  blocked_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, blocked_id)
);

-- Notifications: replies, new branches, milestones.
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL,              -- reply | branch | vote_milestone | idea_shipped
  body TEXT NOT NULL,
  href TEXT NOT NULL,
  read_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at, created_at);

-- Comments on projects (previously only on feed posts).
CREATE TABLE project_comments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  author_id TEXT NOT NULL REFERENCES users(id),
  body_md TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live',
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_project_comments ON project_comments(project_id, created_at);

-- Denormalized tags for search/filtering (from the manifest).
CREATE TABLE project_tags (
  project_id TEXT NOT NULL REFERENCES projects(id),
  tag TEXT NOT NULL,
  PRIMARY KEY (project_id, tag)
);
CREATE INDEX idx_project_tags_tag ON project_tags(tag);
