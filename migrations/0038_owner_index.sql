-- Every profile page, the sitemap's people list, and the badge query all filter
-- projects by owner. With 2,780 projects and no index that was a full scan per
-- lookup -- the single biggest avoidable read on the account.
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id, status);
