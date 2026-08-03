-- Replies. A comment can hang off another comment, so a thread reads the way
-- people actually talk instead of as a flat wall of separate remarks.
ALTER TABLE project_comments ADD COLUMN parent_id TEXT REFERENCES project_comments(id);
CREATE INDEX idx_project_comments_parent ON project_comments(parent_id);
