-- Somewhere for a stranger to reach the operator without an inbox existing.
-- Messages land here and are read in /mod. Nothing is emailed anywhere.
CREATE TABLE IF NOT EXISTS contact_messages (
  id         TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  kind       TEXT NOT NULL,           -- 'takedown' | 'privacy' | 'other'
  reply_to   TEXT,                    -- optional; only if they want an answer
  body       TEXT NOT NULL,
  user_id    TEXT,                    -- set when they happened to be signed in
  handled_at INTEGER
);
CREATE INDEX IF NOT EXISTS contact_recent ON contact_messages(created_at DESC);
