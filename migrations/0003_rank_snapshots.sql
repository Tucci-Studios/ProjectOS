-- Weekly rank snapshots power the Top 10 movement arrows (▲2 / ▼1 / NEW).
-- A snapshot is taken once per week (cron, later). Arrows render only when a
-- previous week's snapshot exists — never fake movement.
CREATE TABLE rank_snapshots (
  week INTEGER NOT NULL,              -- weeks since site epoch (2026-08-02)
  project_id TEXT NOT NULL REFERENCES projects(id),
  rank INTEGER NOT NULL,
  like_count INTEGER NOT NULL,
  PRIMARY KEY (week, project_id)
);
