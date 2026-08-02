-- Dev seed data. Local only: npx wrangler d1 execute project-os --local --file seed/seed.sql
DELETE FROM likes; DELETE FROM repo_stats; DELETE FROM projects; DELETE FROM users;

INSERT INTO users (id, github_login, display_name, avatar_url, github_created_at, tos_accepted_at, role, created_at) VALUES
  ('u_jacob', 'jacob', 'Jacob', NULL, 1500000000, 1754100000, 'admin', 1754100000),
  ('u_nyx',   'nyx-dev', 'Nyx', NULL, 1600000000, 1754110000, 'user', 1754110000),
  ('u_rook',  'rook42', 'Rook', NULL, 1650000000, 1754120000, 'user', 1754120000);

INSERT INTO projects (id, owner_id, base_name, variant_name, category, description, license, github_repo, manifest_json, parent_id, root_id, change_summary, fork_verified_at, status, created_at, updated_at) VALUES
  ('p_subwolf', 'u_jacob', 'Subwolf', NULL, 'games',
   'A neon stealth game about a wolf that hacks security systems.',
   'GPL-3.0-or-later', 'jacob/subwolf', '{}', NULL, 'p_subwolf', NULL, NULL, 'live', 1754100100, 1754100100),
  ('p_cyber', 'u_nyx', 'Subwolf', 'Cyber', 'games',
   'Subwolf with a full cyberspace layer: hack INTO the systems you sneak past.',
   'GPL-3.0-or-later', 'nyx-dev/subwolf-cyber', '{}', 'p_subwolf', 'p_subwolf',
   'Added a playable cyberspace layer with 6 hackable systems.', 1754110100, 'live', 1754110100, 1754110100),
  ('p_night', 'u_rook', 'Subwolf', 'Cyber Night', 'games',
   'Cyber Subwolf, but the whole game happens in one endless night. New vision mechanics.',
   'GPL-3.0-or-later', 'rook42/subwolf-cyber-night', '{}', 'p_cyber', 'p_subwolf',
   'Night-only campaign + night vision goggles with battery management.', 1754120100, 'live', 1754120100, 1754120100);

INSERT INTO likes (user_id, project_id, created_at) VALUES
  ('u_nyx', 'p_subwolf', 1754110200),
  ('u_rook', 'p_subwolf', 1754120200),
  ('u_jacob', 'p_cyber', 1754120300);

INSERT INTO repo_stats (project_id, stars, github_forks, release_downloads, refreshed_at) VALUES
  ('p_subwolf', 42, 7, 130, 1754130000),
  ('p_cyber', 17, 2, 40, 1754130000),
  ('p_night', 5, 0, 0, 1754130000);
