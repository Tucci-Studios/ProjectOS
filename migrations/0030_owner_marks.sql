-- What a project's owner says about a tutorial written for their project.
--
-- Three states, one row each, because they're mutually exclusive: an owner
-- either approves a guide, disputes it, or has said nothing. The note is the
-- interesting one — a public, one-sided annotation on someone else's work — so
-- it carries who wrote it and when, and the author is told rather than finding
-- out from a reader.
--
-- An owner's own tutorial needs no row: authorship is checked directly against
-- the project, so it can't be faked or left stale.
CREATE TABLE IF NOT EXISTS tutorial_owner_marks (
  post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('approved', 'disputed')),
  note       TEXT,
  by_user_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (post_id)
);
CREATE INDEX IF NOT EXISTS idx_owner_marks_project ON tutorial_owner_marks(project_id);
