-- Put project_tags back.
--
-- 0024 dropped it as unreferenced. It wasn't: the search-index triggers from
-- 0014 read it on every insert and update to projects, so dropping it broke
-- publishing and importing outright. Nothing in src/ or scripts/ mentions the
-- table by name, which is exactly why a grep over application code was the
-- wrong way to decide a table was dead.
CREATE TABLE IF NOT EXISTS project_tags (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag        TEXT NOT NULL,
  PRIMARY KEY (project_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON project_tags(tag);
