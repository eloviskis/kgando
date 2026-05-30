const router = require('express').Router();
const { randomUUID } = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/bathrooms
router.get('/', (req, res) => {
  const { type } = req.query;
  const rows = type
    ? db.prepare('SELECT * FROM bathrooms WHERE type=? ORDER BY rating DESC, reviews_count DESC LIMIT 50').all(type)
    : db.prepare('SELECT * FROM bathrooms ORDER BY rating DESC, reviews_count DESC LIMIT 50').all();
  res.json(rows);
});

// GET /api/bathrooms/:id
router.get('/:id', (req, res) => {
  const b = db.prepare('SELECT * FROM bathrooms WHERE id=?').get(req.params.id);
  if (!b) return res.status(404).json({ error: 'Banheiro não encontrado.' });
  res.json(b);
});

// POST /api/bathrooms
router.post('/', requireAuth, (req, res) => {
  const { name, neighborhood, type } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório.' });
  const id = randomUUID();
  db.prepare('INSERT INTO bathrooms (id,name,neighborhood,type,created_by) VALUES (?,?,?,?,?)').run(
    id, name.trim(), neighborhood || '', type || 'public', req.user.id
  );
  res.status(201).json(db.prepare('SELECT * FROM bathrooms WHERE id=?').get(id));
});

module.exports = router;
