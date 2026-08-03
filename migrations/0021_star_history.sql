-- Daily star readings, so "top this week" can mean something.
--
-- The trap: GitHub only reports a project's CURRENT star total. Ranking a week
-- by that just returns the biggest projects, forever — n8n wins every week
-- because n8n has 199k stars, not because anything happened this week.
--
-- Momentum has to be measured, and it can only be measured going forward: we
-- record where every project stands each day, and a window's ranking is the
-- DIFFERENCE across it. Nothing can be computed retroactively, so the weekly
-- chart is only honest once seven days of readings exist.
CREATE TABLE star_history (
  project_id TEXT NOT NULL REFERENCES projects(id),
  day INTEGER NOT NULL,               -- unix day number (epoch seconds / 86400)
  stars INTEGER NOT NULL,
  forks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, day)
);

CREATE INDEX idx_star_history_day ON star_history(day DESC);

-- Today's reading, so there's a baseline from the moment this ships.
INSERT OR REPLACE INTO star_history (project_id, day, stars, forks)
SELECT id, CAST(strftime('%s','now') AS INTEGER) / 86400, stars, github_forks
FROM projects WHERE status = 'live';
