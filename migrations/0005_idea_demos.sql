-- Ideas become proposals you can SEE: someone branches Project OS, builds the
-- change, deploys their branch, and submits the live URL. Voters try it before
-- they vote. Winning proposals get merged at the end of each cycle.
ALTER TABLE ideas ADD COLUMN demo_url TEXT;        -- live deployment of their branch
ALTER TABLE ideas ADD COLUMN repo_url TEXT;        -- their fork / PR to review the code
ALTER TABLE ideas ADD COLUMN shot_url TEXT;        -- screenshot fallback if no demo
ALTER TABLE ideas ADD COLUMN cycle INTEGER;        -- voting cycle this belongs to
CREATE INDEX idx_ideas_cycle ON ideas(cycle, status);
