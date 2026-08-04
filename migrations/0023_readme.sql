-- A project's README, cached.
--
-- It's the actual content of every project — the page was a description and a
-- link without it. Stored rather than fetched per view so a page render never
-- waits on GitHub, and capped because some READMEs are enormous.
ALTER TABLE projects ADD COLUMN readme_md TEXT;
ALTER TABLE projects ADD COLUMN readme_at INTEGER;
