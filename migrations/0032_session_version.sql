-- Lets a sign-out actually invalidate the token it handed out.
-- The session cookie carries this number; bumping it here makes every
-- outstanding token for that user fail verification on the next request.
ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0;
