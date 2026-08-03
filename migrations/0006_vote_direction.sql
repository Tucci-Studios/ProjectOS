-- Votes gain direction: +1 up, -1 down. Score is the sum, Reddit-style.
ALTER TABLE likes ADD COLUMN value INTEGER NOT NULL DEFAULT 1;
