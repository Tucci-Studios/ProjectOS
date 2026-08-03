-- Rate limiting: one row per action, pruned as it's checked. Generous by
-- design — these only catch scripts, not enthusiastic humans.
CREATE TABLE rate_events (
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_rate_events ON rate_events(user_id, action, created_at);
