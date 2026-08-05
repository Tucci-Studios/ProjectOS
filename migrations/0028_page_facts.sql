-- The rows that survived the lab: version, open issues, contributors.
-- (Last commit needed no column — pushed_at was already stored and the page
-- was simply showing created_at instead. Topics were judged and cut.)
ALTER TABLE projects ADD COLUMN release_tag TEXT;
ALTER TABLE projects ADD COLUMN release_at INTEGER;
ALTER TABLE projects ADD COLUMN open_issues INTEGER;
-- Up to six people as [{login, commits, avatar}], refreshed with the rest.
ALTER TABLE projects ADD COLUMN contributors_json TEXT;
