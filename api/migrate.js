require('dotenv').config();
const Database = require('better-sqlite3');
const fs   = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, process.env.DB_PATH || './data/poopit.db');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

try {
  const schema = fs.readFileSync(path.join(__dirname, 'src/db/schema.sql'), 'utf8');
  db.exec(schema);

  // Migrações incrementais (ALTER TABLE seguro — ignora se coluna já existe)
  const migrations = [
    "ALTER TABLE users ADD COLUMN banned_at TEXT",
    "ALTER TABLE users ADD COLUMN google_id TEXT",
    "ALTER TABLE users ADD COLUMN is_public INTEGER NOT NULL DEFAULT 1",
    `CREATE TABLE IF NOT EXISTS invites (
      code        TEXT PRIMARY KEY,
      created_by  TEXT REFERENCES users(id) ON DELETE CASCADE,
      used_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
      used_at     TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS friends (
      id           TEXT PRIMARY KEY,
      requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      addressee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status       TEXT NOT NULL DEFAULT 'pending',
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(requester_id, addressee_id)
    )`,
    `CREATE TABLE IF NOT EXISTS testimonials (
      id           TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content      TEXT NOT NULL,
      approved     INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(from_user_id, to_user_id)
    )`,
    `CREATE TABLE IF NOT EXISTS profile_votes (
      id           TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vote_type    TEXT NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(from_user_id, to_user_id, vote_type)
    )`,
    `CREATE TABLE IF NOT EXISTS profile_views (
      viewer_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      viewed_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      viewed_at  TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY(viewer_id, viewed_id)
    )`,
    `CREATE TABLE IF NOT EXISTS community_topics (
      id           TEXT PRIMARY KEY,
      community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
      user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title        TEXT NOT NULL,
      content      TEXT NOT NULL,
      replies_count INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS community_topic_replies (
      id         TEXT PRIMARY KEY,
      topic_id   TEXT NOT NULL REFERENCES community_topics(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    "ALTER TABLE users ADD COLUMN birthday TEXT",
    "ALTER TABLE users ADD COLUMN city TEXT",
    "ALTER TABLE users ADD COLUMN country TEXT",
    "ALTER TABLE users ADD COLUMN relationship TEXT",
    "ALTER TABLE users ADD COLUMN mood TEXT",
    "ALTER TABLE users ADD COLUMN totp_secret TEXT",
    "ALTER TABLE users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0",
    `CREATE TABLE IF NOT EXISTS login_audit (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT,
      ip         TEXT,
      success    INTEGER NOT NULL DEFAULT 0,
      reason     TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS password_resets (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      used       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT NOT NULL,
      from_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      entity_id  TEXT,
      message    TEXT NOT NULL,
      read       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    "ALTER TABLE users ADD COLUMN notification_prefs TEXT DEFAULT NULL",
    `CREATE TABLE IF NOT EXISTS custom_review_options (
      id           TEXT PRIMARY KEY,
      user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category     TEXT NOT NULL CHECK(category IN ('quality','duration','relief','smell')),
      emoji        TEXT NOT NULL,
      label        TEXT NOT NULL,
      mapped_value TEXT NOT NULL,
      UNIQUE(user_id, category)
    )`,
    "ALTER TABLE reviews ADD COLUMN custom_display TEXT",
    `CREATE TABLE IF NOT EXISTS comment_reactions (
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      comment_id TEXT NOT NULL REFERENCES review_comments(id) ON DELETE CASCADE,
      emoji      TEXT NOT NULL,
      PRIMARY KEY (user_id, comment_id)
    )`,
    // Comunidades: privado, anônimo e convites
    "ALTER TABLE communities ADD COLUMN is_private INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE communities ADD COLUMN allow_anonymous INTEGER NOT NULL DEFAULT 0",
    `CREATE TABLE IF NOT EXISTS community_invites (
      id            TEXT PRIMARY KEY,
      community_id  TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
      invited_by    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      invited_user  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status        TEXT NOT NULL DEFAULT 'pending',
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(community_id, invited_user)
    )`,
    // anonymous_as em tópicos e replies
    "ALTER TABLE community_topics ADD COLUMN anonymous_as TEXT DEFAULT NULL",
    "ALTER TABLE community_topic_replies ADD COLUMN anonymous_as TEXT DEFAULT NULL",
    // link de convite único por comunidade
    "ALTER TABLE communities ADD COLUMN invite_token TEXT DEFAULT NULL",
  ];
  for (const sql of migrations) {
    try { db.exec(sql); } catch { /* coluna já existe */ }
  }

  console.log('✅ Schema aplicado com sucesso:', dbPath);
} catch (err) {
  console.error('❌ Erro na migração:', err.message);
  process.exit(1);
} finally {
  db.close();
}

