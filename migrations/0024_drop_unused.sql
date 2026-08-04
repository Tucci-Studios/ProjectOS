-- Three tables nobody ever wrote to.
--
-- repo_stats backed a "downloads" number on every project page that was always
-- blank, because filling it would mean a third GitHub call per project and most
-- repos have no releases. rank_snapshots and project_tags were built for
-- features that got cut. Empty and unreferenced — better gone than left looking
-- like something works.
DROP TABLE IF EXISTS repo_stats;
DROP TABLE IF EXISTS rank_snapshots;
DROP TABLE IF EXISTS project_tags;
