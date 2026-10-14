-- Account deletion, and page counts that don't identify anybody.

-- Deleting a user row outright would break 18 tables and, worse, cut the
-- lineage other people's forks hang off. So a deleted account is anonymised in
-- place: the personal fields are cleared and the id survives to keep public
-- contributions attached to a tombstone.
ALTER TABLE users ADD COLUMN deleted_at INTEGER;

-- Self-hosted, aggregate-only. One row per path per day holding a count and
-- nothing else -- no id, no IP, no user agent, no session, no cookie. It can
-- say "the MCP tutorial was opened 40 times on Tuesday" and can never say who.
CREATE TABLE IF NOT EXISTS page_views (
  path TEXT NOT NULL,
  day  INTEGER NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (path, day)
);
CREATE INDEX IF NOT EXISTS page_views_day ON page_views(day);
