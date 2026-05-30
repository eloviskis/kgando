require('dotenv').config();
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, process.env.DB_PATH || './data/poopit.db');
if (!fs.existsSync(dbPath)) {
  console.error('❌ Banco não encontrado. Rode "npm run migrate" primeiro.');
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (count > 0) {
  if (!process.argv.includes('--force')) {
    console.log('⚠️  Banco já possui dados. Use --force para recriar.');
    process.exit(0);
  }
  db.exec(`
    DELETE FROM scraps;
    DELETE FROM community_members;
    DELETE FROM review_comments;
    DELETE FROM review_likes;
    DELETE FROM reviews;
    DELETE FROM communities;
    DELETE FROM bathrooms;
    DELETE FROM users;
  `);
}

const hash = bcrypt.hashSync('senha123', 10);

const users = [
  { id: randomUUID(), username: 'jaspion', display_name: 'Jaspion da Silva Sauro', email: 'jaspion@example.com', bio: 'Ninja das operações matinais 🥷', avatar_text: 'JS', avatar_color: '#8B4513' },
  { id: randomUUID(), username: 'ana',     display_name: 'Ana Paula',       email: 'ana@example.com',     bio: 'Fã de banheiros silenciosos 🌹',               avatar_text: 'AP', avatar_color: '#b06a34' },
  { id: randomUUID(), username: 'marcos',  display_name: 'Marcos Tronco',   email: 'marcos@example.com',  bio: 'Estrategista do horário nobre 📱',             avatar_text: 'MT', avatar_color: '#71411d' },
  { id: randomUUID(), username: 'juliana', display_name: 'Juliana Alves',   email: 'juliana@example.com', bio: 'Especialista em banheiros de shopping 🛍',    avatar_text: 'JA', avatar_color: '#D4A574' },
];

const insUser = db.prepare('INSERT INTO users (id,username,display_name,email,password_hash,bio,avatar_text,avatar_color) VALUES (?,?,?,?,?,?,?,?)');
for (const u of users) insUser.run(u.id, u.username, u.display_name, u.email, hash, u.bio, u.avatar_text, u.avatar_color);
console.log('✅ Usuários inseridos');

const bathrooms = [
  { id: randomUUID(), name: 'Banheiro do Escritório',         neighborhood: 'Vila Olímpia', type: 'office',     rating: 4.8, reviews_count: 18 },
  { id: randomUUID(), name: 'Shopping Iguatemi - Piso L3',    neighborhood: 'Jardins',      type: 'commercial', rating: 4.5, reviews_count: 12 },
  { id: randomUUID(), name: 'Restaurante Vila Madalena',      neighborhood: 'Vila Madalena',type: 'restaurant', rating: 4.2, reviews_count: 7  },
  { id: randomUUID(), name: 'Posto BR - Marginal Pinheiros',  neighborhood: 'Pinheiros',    type: 'gas',        rating: 2.1, reviews_count: 5  },
  { id: randomUUID(), name: 'Parque Ibirapuera - Setor Sul',  neighborhood: 'Ibirapuera',   type: 'public',     rating: 3.0, reviews_count: 9  },
];

const insBath = db.prepare('INSERT INTO bathrooms (id,name,neighborhood,type,rating,reviews_count,created_by) VALUES (?,?,?,?,?,?,?)');
for (const b of bathrooms) insBath.run(b.id, b.name, b.neighborhood, b.type, b.rating, b.reviews_count, users[0].id);
console.log('✅ Banheiros inseridos');

const reviews = [
  { id: randomUUID(), user_id: users[0].id, bathroom_id: bathrooms[0].id, title: 'Operação Relâmpago 🥷',          comment: 'Entrei, fiz meu negócio em 3 minutos e saí sem deixar rastros. Papel dupla folha, pia com sensor. 10/10 repetiria.',            quality: 5, duration: 1, relief: 'light',      smell: 'roses',   sticker: 'ninja',  likes_count: 42, comments_count: 3 },
  { id: randomUUID(), user_id: users[1].id, bathroom_id: bathrooms[1].id, title: 'Contemplação pós-refeição 🌿',   comment: 'Crise repentina no shopping. A consistência estava perfeita — formato C, densidade média. Trouxe minha leitura e foi incrível.', quality: 4, duration: 3, relief: 'satisfied',  smell: 'neutral', sticker: 'crown',  likes_count: 28, comments_count: 2 },
  { id: randomUUID(), user_id: users[2].id, bathroom_id: bathrooms[3].id, title: 'Estratégia dos Reels 📱',         comment: 'Aproveitei o horário nobre no escritório. 23 minutos de scroll. Terminei 3 episódios de podcast. Misão cumprida.',               quality: 2, duration: 4, relief: 'satisfied',  smell: 'toxic',   sticker: 'scroll', likes_count: 15, comments_count: 1 },
  { id: randomUUID(), user_id: users[3].id, bathroom_id: bathrooms[1].id, title: 'Perfeição no Shopping 🛍',        comment: 'Esse banheiro deveria ser patrimônio cultural. Cheiro de flores, portas com travamento duplo, até musica ambiente.',              quality: 5, duration: 2, relief: 'light',      smell: 'roses',   sticker: 'flower', likes_count: 31, comments_count: 4 },
];

const insRev = db.prepare('INSERT INTO reviews (id,user_id,bathroom_id,title,comment,quality,duration,relief,smell,sticker,likes_count,comments_count) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
for (const r of reviews) insRev.run(r.id, r.user_id, r.bathroom_id, r.title, r.comment, r.quality, r.duration, r.relief, r.smell, r.sticker, r.likes_count, r.comments_count);
console.log('✅ Reviews inseridas');

const communities = [
  { id: randomUUID(), name: 'Caguei e Saí Correndo',         description: 'Para os ninjas que entram e saem em menos de 2 minutos',  icon: '🏃', members_count: 847  },
  { id: randomUUID(), name: 'Banheiros Estrangeiros',          description: 'Avaliações de banheiros ao redor do mundo',               icon: '🌍', members_count: 523  },
  { id: randomUUID(), name: 'Segredo da Consistência',         description: 'Discussões científicas sobre consistência e qualidade',    icon: '🔬', members_count: 312  },
  { id: randomUUID(), name: 'Cagadas no Trabalho',            description: 'Porque o banheiro da empresa também é sagrado',            icon: '💼', members_count: 1203 },
  { id: randomUUID(), name: 'Leitores de Trono',              description: 'Para quem leva livro, celular ou tablet no banheiro',      icon: '📱', members_count: 678  },
  { id: randomUUID(), name: 'Cagada Matinal',                  description: 'O ritual sagrado das 7h da manhã',                        icon: '🌅', members_count: 934  },
];

const insComm = db.prepare('INSERT INTO communities (id,name,description,icon,members_count,created_by) VALUES (?,?,?,?,?,?)');
for (const c of communities) insComm.run(c.id, c.name, c.description, c.icon, c.members_count, users[0].id);
console.log('✅ Comunidades inseridas');

// Membros iniciais
const insMember = db.prepare('INSERT OR IGNORE INTO community_members (user_id, community_id) VALUES (?,?)');
insMember.run(users[0].id, communities[0].id);
insMember.run(users[0].id, communities[4].id);
insMember.run(users[1].id, communities[1].id);
insMember.run(users[1].id, communities[5].id);
insMember.run(users[2].id, communities[3].id);
insMember.run(users[3].id, communities[2].id);
console.log('✅ Membros inseridos');

// Curtidas
const insLike = db.prepare('INSERT OR IGNORE INTO review_likes (user_id, review_id) VALUES (?,?)');
insLike.run(users[1].id, reviews[0].id);
insLike.run(users[2].id, reviews[0].id);
insLike.run(users[3].id, reviews[0].id);
insLike.run(users[0].id, reviews[1].id);
console.log('✅ Curtidas inseridas');

// Scraps
const insScrap = db.prepare('INSERT INTO scraps (id,from_user_id,to_user_id,message) VALUES (?,?,?,?)');
insScrap.run(randomUUID(), users[1].id, users[0].id, 'Jaspion, sua operação ninja é lendária! 🏆 Ensina tua técnica!');
insScrap.run(randomUUID(), users[2].id, users[0].id, 'Cara, tu é o rei dos ninjas! 42 curtidas em um dia é recorde! 👑');
insScrap.run(randomUUID(), users[3].id, users[0].id, 'Oi Jaspion! Tamo esperando sua próxima avaliação épica 🚀');
console.log('✅ Scraps inseridos');

db.close();
console.log('\n🚽 Seed completo! Login com senha: senha123');
console.log('   Usuários:', users.map(u => u.username).join(', '));
