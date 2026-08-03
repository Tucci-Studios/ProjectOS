-- Real projects, pulled from GitHub.
--
-- Two kinds of thing now live in `projects`:
--
--   indexed  — we found it on GitHub and linked to it. The author has never
--              heard of Project OS and agreed to nothing. It's a link, like any
--              directory listing.
--   claimed  — the author signed in with GitHub and it's genuinely theirs. Only
--              claimed projects can post updates or take part in anything the
--              site's rules govern.
--
-- The bridge between them is the user id: an indexed project is owned by a
-- shadow user row keyed 'gh_<github numeric id>' — the SAME key the OAuth
-- callback uses. So the moment the real author signs in, the row they already
-- own becomes a real account and their projects claim themselves.
ALTER TABLE projects ADD COLUMN source TEXT NOT NULL DEFAULT 'claimed'; -- indexed | claimed
ALTER TABLE projects ADD COLUMN claimed_at INTEGER;
ALTER TABLE projects ADD COLUMN stars INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN language TEXT;
ALTER TABLE projects ADD COLUMN pushed_at INTEGER;      -- last real activity on GitHub
ALTER TABLE projects ADD COLUMN homepage TEXT;

-- A user row that exists only because we indexed their work. They have never
-- signed in. Set when the shadow is created; cleared when they actually arrive.
ALTER TABLE users ADD COLUMN is_shadow INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_projects_source ON projects(source, stars DESC);
CREATE INDEX idx_projects_pushed ON projects(pushed_at DESC);

UPDATE projects SET claimed_at = created_at WHERE source = 'claimed';
