-- Applications to work on Project OS, and to moderate it.
--
-- One table for both: a moderator application is an application for the "mod"
-- role, and keeping them together means one inbox rather than two.
CREATE TABLE IF NOT EXISTS help_applications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  role        TEXT NOT NULL,
  body        TEXT NOT NULL,
  contact     TEXT,
  status      TEXT NOT NULL DEFAULT 'open',  -- open | accepted | declined
  created_at  INTEGER NOT NULL,
  decided_at  INTEGER
);
CREATE INDEX IF NOT EXISTS help_applications_status ON help_applications (status, created_at DESC);
-- One live application per person per role: reapplying replaces, it doesn't pile up.
CREATE UNIQUE INDEX IF NOT EXISTS help_applications_one_open
  ON help_applications (user_id, role) WHERE status = 'open';
