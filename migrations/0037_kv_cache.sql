-- A tiny cache in front of the expensive read queries.
--
-- D1 bills by rows READ, not by query count, and several of our queries scan
-- the whole projects table to produce a handful of numbers. Caching the result
-- turns thousands of row reads into one.
CREATE TABLE IF NOT EXISTS kv_cache (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS kv_cache_expiry ON kv_cache(expires_at);
