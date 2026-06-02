const db = require('./src/db');

console.log('=== Migrando tabela notifications: adicionar coluna link ===');

try {
  console.log('1. Adicionando coluna link...');
  db.exec('ALTER TABLE notifications ADD COLUMN link TEXT;');
  
  console.log('✅ Coluna link adicionada com sucesso!');
  
  // Verificar resultado
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE name='notifications'").get();
  console.log('\nNovo schema:');
  console.log(schema.sql);
  
  // Testar se funciona
  const test = db.prepare("SELECT link FROM notifications LIMIT 1").get();
  console.log('\n✅ Coluna link funcional!');
  
} catch (err) {
  if (err.message.includes('duplicate column')) {
    console.log('⚠️  Coluna link já existe, migração não necessária.');
  } else {
    console.error('❌ Erro na migração:', err.message);
    process.exit(1);
  }
}
