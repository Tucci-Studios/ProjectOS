-- Full-text search. LIKE '%term%' can't rank and scans every row; FTS5 does
-- both properly. Triggers keep the index in step with the tables.
CREATE VIRTUAL TABLE project_search USING fts5(
  project_id UNINDEXED,
  name,
  description,
  tags,
  tokenize = 'porter unicode61'
);

INSERT INTO project_search (project_id, name, description, tags)
SELECT p.id,
       p.base_name || ' ' || COALESCE(p.variant_name, ''),
       p.description,
       COALESCE((SELECT GROUP_CONCAT(tag, ' ') FROM project_tags t WHERE t.project_id = p.id), '')
FROM projects p WHERE p.status = 'live';

CREATE TRIGGER project_search_insert AFTER INSERT ON projects BEGIN
  INSERT INTO project_search (project_id, name, description, tags)
  VALUES (new.id, new.base_name || ' ' || COALESCE(new.variant_name, ''), new.description, '');
END;

CREATE TRIGGER project_search_update AFTER UPDATE ON projects BEGIN
  DELETE FROM project_search WHERE project_id = old.id;
  INSERT INTO project_search (project_id, name, description, tags)
  SELECT new.id, new.base_name || ' ' || COALESCE(new.variant_name, ''), new.description,
         COALESCE((SELECT GROUP_CONCAT(tag, ' ') FROM project_tags t WHERE t.project_id = new.id), '')
  WHERE new.status = 'live';
END;

CREATE TRIGGER project_search_delete AFTER DELETE ON projects BEGIN
  DELETE FROM project_search WHERE project_id = old.id;
END;

CREATE VIRTUAL TABLE post_search USING fts5(
  post_id UNINDEXED,
  title,
  body,
  tokenize = 'porter unicode61'
);

INSERT INTO post_search (post_id, title, body)
SELECT id, COALESCE(title, ''), body_md FROM posts WHERE status = 'live';

CREATE TRIGGER post_search_insert AFTER INSERT ON posts BEGIN
  INSERT INTO post_search (post_id, title, body) VALUES (new.id, COALESCE(new.title, ''), new.body_md);
END;

CREATE TRIGGER post_search_update AFTER UPDATE ON posts BEGIN
  DELETE FROM post_search WHERE post_id = old.id;
  INSERT INTO post_search (post_id, title, body)
  SELECT new.id, COALESCE(new.title, ''), new.body_md WHERE new.status = 'live';
END;

CREATE TRIGGER post_search_delete AFTER DELETE ON posts BEGIN
  DELETE FROM post_search WHERE post_id = old.id;
END;
