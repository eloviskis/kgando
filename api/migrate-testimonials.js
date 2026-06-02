const db = require('./src/db');

console.log('=== Migrando coluna approved de DEFAULT 1 para DEFAULT 0 ===');

try {
  // SQLite não suporta ALTER COLUMN, então precisamos recriar a tabela
  console.log('1. Criando tabela temporária...');
  db.exec(`
    CREATE TABLE testimonials_new (
      id           TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content      TEXT NOT NULL,
      approved     INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log('2. Copiando dados existentes (mantendo approved como está)...');
  db.exec(`
    INSERT INTO testimonials_new (id, from_user_id, to_user_id, content, approved, created_at)
    SELECT id, from_user_id, to_user_id, content, approved, created_at FROM testimonials;
  `);

  console.log('3. Removendo constraint UNIQUE da tabela antiga...');
  console.log('4. Dropando tabela antiga...');
  db.exec('DROP TABLE testimonials;');

  console.log('5. Renomeando tabela nova...');
  db.exec('ALTER TABLE testimonials_new RENAME TO testimonials;');

  console.log('6. Criando índice...');
  db.exec('CREATE INDEX IF NOT EXISTS idx_testimonials_to_user ON testimonials(to_user_id, approved);');

  console.log('✅ Migração concluída com sucesso!');
  
  // Verificar resultado
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE name='testimonials'").get();
  console.log('\nNovo schema:', schema.sql);
  
  const count = db.prepare("SELECT COUNT(*) as total FROM testimonials").get();
  console.log('\nTotal de depoimentos mantidos:', count.total);
  
} catch (err) {
  console.error('❌ Erro na migração:', err.message);
  process.exit(1);
}
