-- Ideas get up/down votes too, matching how projects work.
ALTER TABLE idea_votes ADD COLUMN value INTEGER NOT NULL DEFAULT 1;
