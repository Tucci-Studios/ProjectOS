-- Ideas: community proposals for changing Project OS itself, ranked by votes.
-- The platform is open source on itself — this is how it decides what to build.
CREATE TABLE ideas (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',  -- open | planned | building | shipped | declined
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_ideas_status ON ideas(status, created_at);

CREATE TABLE idea_votes (
  idea_id TEXT NOT NULL REFERENCES ideas(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (idea_id, user_id)
);
CREATE INDEX idx_idea_votes_idea ON idea_votes(idea_id);
