-- GitHub's own fork count, stored per project.
--
-- Cards used to show how many forks were published HERE, which is zero for
-- everything indexed — a card claiming "0 forks" for a repo with 7,790 of them
-- is just wrong. This is the real number, captured at import.
ALTER TABLE projects ADD COLUMN github_forks INTEGER NOT NULL DEFAULT 0;
CREATE INDEX idx_projects_github_forks ON projects(github_forks DESC);
