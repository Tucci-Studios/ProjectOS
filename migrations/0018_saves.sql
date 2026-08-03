-- Bookmarks. Deliberately separate from follows: following is a subscription
-- (tell me when this changes), saving is a shelf (I want to find this again).
-- Conflating them means you can't keep something without also being pinged.
CREATE TABLE saves (
  user_id TEXT NOT NULL REFERENCES users(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, project_id)
);

CREATE INDEX idx_saves_user ON saves(user_id, created_at DESC);
