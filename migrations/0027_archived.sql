-- GitHub's own "this repo is finished" flag.
--
-- An archived repo is one the owner has explicitly marked read-only: no more
-- commits, no more issues. It's the single most honest staleness signal there
-- is, it costs nothing (it's already in the response we fetch), and without it
-- a project abandoned two years ago looks identical to one shipped last week.
ALTER TABLE projects ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;
