-- Dev seed data (dumb test content across all categories).
-- Local only: npx wrangler d1 execute project-os --local --file seed/seed.sql
-- NOTE: does not touch real users (gh_*), only seed users (u_*).
DELETE FROM comments; DELETE FROM posts; DELETE FROM likes; DELETE FROM repo_stats;
DELETE FROM projects; DELETE FROM users WHERE id LIKE 'u_%';

INSERT INTO users (id, github_login, display_name, avatar_url, github_created_at, tos_accepted_at, role, created_at) VALUES
  ('u_nyx',   'nyx-dev',   'Nyx',   NULL, 1600000000, 1754110000, 'user', 1754110000),
  ('u_rook',  'rook42',    'Rook',  NULL, 1650000000, 1754120000, 'user', 1754120000),
  ('u_patch', 'patchcable','Patch', NULL, 1620000000, 1754100000, 'user', 1754100000),
  ('u_zero',  'zerocool99','Zero',  NULL, 1680000000, 1754130000, 'user', 1754130000);

INSERT INTO projects (id, owner_id, base_name, variant_name, category, description, license, github_repo, manifest_json, parent_id, root_id, change_summary, fork_verified_at, status, created_at, updated_at) VALUES
-- games: the Subwolf lineage (3 generations)
  ('p_subwolf', 'u_patch', 'Subwolf', NULL, 'games',
   'A neon stealth game about a wolf that hacks security systems.',
   'GPL-3.0-or-later', 'patchcable/subwolf', '{}', NULL, 'p_subwolf', NULL, NULL, 'live', 1753500000, 1753500000),
  ('p_cyber', 'u_nyx', 'Subwolf', 'Cyber', 'games',
   'Subwolf with a full cyberspace layer: hack INTO the systems you sneak past.',
   'GPL-3.0-or-later', 'nyx-dev/subwolf-cyber', '{}', 'p_subwolf', 'p_subwolf',
   'Added a playable cyberspace layer with 6 hackable systems.', 1753600000, 'live', 1753600000, 1753600000),
  ('p_night', 'u_rook', 'Subwolf', 'Cyber Night', 'games',
   'Cyber Subwolf, but the whole game happens in one endless night. New vision mechanics.',
   'GPL-3.0-or-later', 'rook42/subwolf-cyber-night', '{}', 'p_cyber', 'p_subwolf',
   'Night-only campaign + night vision goggles with battery management.', 1753700000, 'live', 1753700000, 1753700000),
-- claude-code
  ('p_vibecheck', 'u_zero', 'Vibe Check', NULL, 'claude-code',
   'A Claude Code setup that reviews your repo and roasts your code style before every commit. Constructively. Mostly.',
   'MIT', 'zerocool99/vibe-check', '{}', NULL, 'p_vibecheck', NULL, NULL, 'live', 1753800000, 1753800000),
-- claude-skills
  ('p_pdfgoblin', 'u_nyx', 'PDF Goblin', NULL, 'claude-skills',
   'A Claude skill that eats any PDF and spits out summaries, tables, and action items. Feed it your worst scans.',
   'Apache-2.0', 'nyx-dev/pdf-goblin', '{}', NULL, 'p_pdfgoblin', NULL, NULL, 'live', 1753850000, 1753850000),
-- claude-md
  ('p_oneclaude', 'u_patch', 'The One CLAUDE.md', NULL, 'claude-md',
   'A battle-tested CLAUDE.md for shipping side projects fast: build ladders, verification gates, no-slop rules.',
   'CC0-1.0', 'patchcable/the-one-claude-md', '{}', NULL, 'p_oneclaude', NULL, NULL, 'live', 1753900000, 1753900000),
-- mcp-servers: Fridge lineage (2 generations)
  ('p_fridge', 'u_rook', 'Fridge MCP', NULL, 'mcp-servers',
   'An MCP server for your smart fridge. Ask Claude what you can cook with what is actually in there.',
   'MIT', 'rook42/fridge-mcp', '{}', NULL, 'p_fridge', NULL, NULL, 'live', 1753950000, 1753950000),
  ('p_freezer', 'u_zero', 'Fridge MCP', 'Freezer', 'mcp-servers',
   'Fridge MCP but it also tracks the freezer and yells at you about freezer-burned mystery bags.',
   'MIT', 'zerocool99/fridge-mcp-freezer', '{}', 'p_fridge', 'p_fridge',
   'Freezer inventory + expiry nagging via notifications.', 1754000000, 'live', 1754000000, 1754000000),
-- codex
  ('p_autopilot', 'u_zero', 'Codex Autopilot', NULL, 'codex',
   'Codex config + prompts that turn issues labeled "auto" into draft PRs overnight.',
   'MIT', 'zerocool99/codex-autopilot', '{}', NULL, 'p_autopilot', NULL, NULL, 'live', 1754050000, 1754050000),
-- local-llms
  ('p_basement', 'u_patch', 'Basement Brain', NULL, 'local-llms',
   'One-command local LLM stack: model picker, chat UI, and a file-drop RAG folder. Runs on a potato.',
   'GPL-3.0-or-later', 'patchcable/basement-brain', '{}', NULL, 'p_basement', NULL, NULL, 'live', 1754100000, 1754100000),
-- scripts-tools
  ('p_yeet', 'u_nyx', 'YEET.sh', NULL, 'scripts-tools',
   'Finds every node_modules on your machine, shows the damage in GB, and yeets them with one keypress.',
   'MIT', 'nyx-dev/yeet-sh', '{}', NULL, 'p_yeet', NULL, NULL, 'live', 1754150000, 1754150000);

INSERT INTO likes (user_id, project_id, created_at) VALUES
  ('u_nyx', 'p_subwolf', 1753610000), ('u_rook', 'p_subwolf', 1753710000), ('u_zero', 'p_subwolf', 1753810000),
  ('u_patch', 'p_cyber', 1753620000), ('u_zero', 'p_cyber', 1753820000),
  ('u_nyx', 'p_night', 1753720000),
  ('u_patch', 'p_yeet', 1754160000), ('u_rook', 'p_yeet', 1754170000), ('u_zero', 'p_yeet', 1754180000), ('u_nyx', 'p_yeet', 1754190000),
  ('u_rook', 'p_vibecheck', 1753830000), ('u_nyx', 'p_vibecheck', 1753840000),
  ('u_zero', 'p_oneclaude', 1753910000), ('u_nyx', 'p_oneclaude', 1753920000), ('u_rook', 'p_oneclaude', 1753930000),
  ('u_patch', 'p_fridge', 1753960000), ('u_nyx', 'p_fridge', 1753970000),
  ('u_rook', 'p_basement', 1754110000),
  ('u_patch', 'p_pdfgoblin', 1753860000);

INSERT INTO repo_stats (project_id, stars, github_forks, release_downloads, refreshed_at) VALUES
  ('p_subwolf', 42, 7, 130, 1754130000), ('p_cyber', 17, 2, 40, 1754130000), ('p_night', 5, 0, 0, 1754130000),
  ('p_vibecheck', 88, 12, 0, 1754130000), ('p_pdfgoblin', 31, 4, 0, 1754130000),
  ('p_oneclaude', 210, 45, 0, 1754130000), ('p_fridge', 12, 3, 0, 1754130000),
  ('p_freezer', 4, 0, 0, 1754130000), ('p_autopilot', 27, 5, 0, 1754130000),
  ('p_basement', 156, 22, 900, 1754130000), ('p_yeet', 340, 60, 2100, 1754130000);

INSERT INTO posts (id, author_id, project_id, title, body_md, kind, category, status, created_at) VALUES
  ('post_1', 'u_patch', 'p_subwolf', 'Subwolf devlog #3: guards can hear you now',
   'Added directional audio to guard AI. If you sprint on metal floors, they come looking. Sneaking on carpet is silent. Next up: vents.', 'post', 'games', 'live', 1754200000),
  ('post_2', 'u_zero', NULL, 'Hot take: your AGENTS.md is more important than your README',
   'READMEs are for humans who skim. AGENTS.md is for the AI that will actually maintain your project in 6 months. Write it first.', 'post', NULL, 'live', 1754210000),
  ('post_3', 'u_nyx', 'p_yeet', 'YEET.sh just crossed 2000 downloads',
   'It started as a joke. It is no longer a joke. 4.2 TB of node_modules have been yeeted worldwide. Top single yeet: 38 GB from one agency laptop.', 'post', 'scripts-tools', 'live', 1754220000),
  ('post_4', 'u_rook', 'p_fridge', 'Wiring Fridge MCP to a dumb fridge with a $6 sensor',
   'GOAL
Your dumb fridge answers "what can I cook?" through Claude by the end.

PREREQS
- A $6 magnetic door sensor
- Any webcam
- @[Fridge MCP] cloned locally

## Step 1 — Tape the sensor to the door
Stick the magnet half on the door, the sensor half on the frame. When the door opens, the sensor fires — that is our "inventory might have changed" signal.

## Step 2 — Point the webcam at the shelves
Top corner, angled down. Bad angles are fine; the model is better at reading blurry ketchup bottles than you are.

## Step 3 — Wire both into the MCP server
Set SENSOR_PIN and CAMERA_URL in .env, then npm start. Door opens -> snapshot -> inventory updates.

VERIFY
Ask Claude "what is in my fridge?" If it lists your sad condiments, it works.', 'tutorial', 'mcp-servers', 'live', 1754230000),
  ('post_5', 'u_zero', NULL, 'How do I make a Claude skill that reads my bank CSV exports?',
   'Every bank gives me a different cursed CSV format. I want a skill that normalizes them into one ledger. Someone has to have built this — or can someone''s Claude build a tutorial for it?', 'request', 'claude-skills', 'live', 1754225000);

-- Shift all seed timestamps so the newest content is "now" and the oldest ~8 days back.
-- (anchor epoch 1754231000 = the newest seed comment)
UPDATE projects SET created_at = created_at + (strftime('%s','now') - 1754231000),
                    updated_at = updated_at + (strftime('%s','now') - 1754231000) WHERE id LIKE 'p_%';
UPDATE posts SET created_at = created_at + (strftime('%s','now') - 1754231000);
UPDATE likes SET created_at = created_at + (strftime('%s','now') - 1754231000);

INSERT INTO comments (id, post_id, author_id, body_md, status, created_at) VALUES
  ('c_1', 'post_1', 'u_nyx', 'The metal floor thing is genius. Forking this into Cyber tonight.', 'live', 1754201000),
  ('c_2', 'post_1', 'u_zero', 'Please add cardboard boxes to hide in. I will not elaborate.', 'live', 1754202000),
  ('c_3', 'post_2', 'u_patch', 'Counterpoint: my README IS my AGENTS.md. One file, two audiences.', 'live', 1754211000),
  ('c_4', 'post_3', 'u_rook', '38 GB??? what were they building, a planet?', 'live', 1754221000),
  ('c_5', 'post_4', 'u_patch', 'Did this with my garage fridge. It now judges my soda intake. 10/10.', 'live', 1754231000);

UPDATE comments SET created_at = created_at + (strftime('%s','now') - 1754231000);
