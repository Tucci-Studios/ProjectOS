-- Remember which update splash a user has already seen, so it shows once.
ALTER TABLE users ADD COLUMN last_seen_update TEXT;
