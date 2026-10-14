-- "Can I actually run this?" — derived from the repo's own files, not a vibe.
-- setup_json holds the individual facts so the UI can show its working;
-- setup_tier is the one-word summary computed from them.
ALTER TABLE projects ADD COLUMN setup_json TEXT;
ALTER TABLE projects ADD COLUMN setup_tier TEXT;
ALTER TABLE projects ADD COLUMN setup_at INTEGER;
