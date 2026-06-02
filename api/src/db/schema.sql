-- Usuários
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  bio           TEXT NOT NULL DEFAULT '',
  avatar_text   TEXT NOT NULL DEFAULT '',
  avatar_color  TEXT NOT NULL DEFAULT '#8B4513',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Banheiros
CREATE TABLE IF NOT EXISTS bathrooms (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  neighborhood   TEXT NOT NULL DEFAULT '',
  type           TEXT NOT NULL DEFAULT 'public',
  rating         REAL NOT NULL DEFAULT 0,
  reviews_count  INTEGER NOT NULL DEFAULT 0,
  created_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Avaliações de cagada
CREATE TABLE IF NOT EXISTS reviews (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bathroom_id     TEXT REFERENCES bathrooms(id) ON DELETE SET NULL,
  title           TEXT NOT NULL DEFAULT '',
  comment         TEXT NOT NULL DEFAULT '',
  quality         INTEGER NOT NULL,
  duration        INTEGER NOT NULL,
  relief          TEXT NOT NULL,
  smell           TEXT NOT NULL,
  sticker         TEXT NOT NULL DEFAULT '',
  likes_count     INTEGER NOT NULL DEFAULT 0,
  comments_count  INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Curtidas em avaliações
CREATE TABLE IF NOT EXISTS review_likes (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_id  TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, review_id)
);

-- Comentários em avaliações
CREATE TABLE IF NOT EXISTS review_comments (
  id          TEXT PRIMARY KEY,
  review_id   TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Comunidades
CREATE TABLE IF NOT EXISTS communities (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  icon           TEXT NOT NULL DEFAULT '💩',
  members_count  INTEGER NOT NULL DEFAULT 0,
  created_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Membros de comunidades
CREATE TABLE IF NOT EXISTS community_members (
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  community_id  TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  joined_at     TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, community_id)
);

-- Recados (Scraps)
CREATE TABLE IF NOT EXISTS scraps (
  id            TEXT PRIMARY KEY,
  from_user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message       TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Convites
CREATE TABLE IF NOT EXISTS invites (
  code        TEXT PRIMARY KEY,
  created_by  TEXT REFERENCES users(id) ON DELETE CASCADE,
  used_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
  used_at     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_reviews_user_id     ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at  ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_likes_review ON review_likes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_rev ON review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_scraps_to_user      ON scraps(to_user_id, created_at DESC);

-- Notificações
CREATE TABLE IF NOT EXISTS notifications (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  from_user_id  TEXT REFERENCES users(id) ON DELETE CASCADE,
  entity_id     TEXT,
  message       TEXT NOT NULL,
  link          TEXT,
  read          INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

