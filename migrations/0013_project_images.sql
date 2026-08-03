-- Projects can show a gallery, not just one screenshot.
CREATE TABLE project_images (
  project_id TEXT NOT NULL REFERENCES projects(id),
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, url)
);
CREATE INDEX idx_project_images ON project_images(project_id, position);
