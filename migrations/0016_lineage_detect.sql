-- Lineage is DETECTED, not declared. GitHub records the parent when someone
-- clicks Fork, so publishing just asks GitHub and draws the edge.
--
--   verified — GitHub's fork graph confirmed it. Automatic, trustworthy.
--   declared — no fork edge (they downloaded a zip); the publisher said so.
--              Shown as unverified until the parent's owner confirms it.
ALTER TABLE projects ADD COLUMN lineage_source TEXT;      -- verified | declared | NULL
ALTER TABLE projects ADD COLUMN parent_confirmed_at INTEGER;

-- Everything already in the table got here through the old fork-verified path.
UPDATE projects SET lineage_source = 'verified', parent_confirmed_at = fork_verified_at
WHERE parent_id IS NOT NULL;
