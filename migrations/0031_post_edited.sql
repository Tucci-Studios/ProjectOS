-- When a post was last changed.
--
-- Needed for two things: telling a reader the guide they're following isn't the
-- one that was published, and working out whether a project owner's verdict
-- still applies. An approval given before an edit is vouching for text nobody
-- re-read, and comparing this against the mark's timestamp is enough to say so
-- without storing a second state that could drift.
ALTER TABLE posts ADD COLUMN edited_at INTEGER;
