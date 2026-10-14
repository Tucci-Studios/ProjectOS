-- Self-hosted error capture. No vendor, no user data leaving the account.
CREATE TABLE IF NOT EXISTS error_log (
  id         TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  source     TEXT NOT NULL,   -- 'server' | 'client'
  path       TEXT,
  message    TEXT NOT NULL,
  digest     TEXT,            -- Next's error digest, to tie a client report to a server log
  stack      TEXT,
  seen_at    INTEGER
);
CREATE INDEX IF NOT EXISTS error_log_recent ON error_log(created_at DESC);
