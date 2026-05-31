const router = require('express').Router();
const { randomUUID } = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const VALID_CATEGORIES = ['quality', 'duration', 'relief', 'smell'];
const VALID_MAPPED = {
  quality:  ['1','2','3','4','5'],
  duration: ['1','2','3','4','5'],
  relief:   ['light','satisfied','incomplete'],
  smell:    ['roses','neutral','toxic'],
};

function isEmoji(str) {
  if (!str || str.length === 0 || str.length > 8) return false;
  return /\p{Emoji}/u.test(str);
}

// GET /api/review-options — opções personalizadas do usuário logado
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(
    'SELECT id, category, emoji, label, mapped_value FROM custom_review_options WHERE user_id=?'
  ).all(req.user.id);
  res.json(rows);
});

// POST /api/review-options — criar ou atualizar opção personalizada (upsert)
router.post('/', requireAuth, (req, res) => {
  const { category, emoji, label, mapped_value } = req.body;

  if (!VALID_CATEGORIES.includes(category))
    return res.status(400).json({ error: 'Categoria inválida.' });
  if (!isEmoji(String(emoji || '')))
    return res.status(400).json({ error: 'A imagem deve ser um emoji.' });
  if (!label?.trim() || label.trim().length > 30)
    return res.status(400).json({ error: 'Texto inválido (máximo 30 caracteres).' });
  if (!VALID_MAPPED[category]?.includes(String(mapped_value)))
    return res.status(400).json({ error: 'Valor mapeado inválido para esta categoria.' });

  const existing = db.prepare(
    'SELECT id FROM custom_review_options WHERE user_id=? AND category=?'
  ).get(req.user.id, category);

  if (existing) {
    db.prepare(
      'UPDATE custom_review_options SET emoji=?, label=?, mapped_value=? WHERE id=?'
    ).run(emoji.trim(), label.trim(), String(mapped_value), existing.id);
    return res.json(
      db.prepare('SELECT id, category, emoji, label, mapped_value FROM custom_review_options WHERE id=?').get(existing.id)
    );
  }

  const id = randomUUID();
  db.prepare(
    'INSERT INTO custom_review_options (id, user_id, category, emoji, label, mapped_value) VALUES (?,?,?,?,?,?)'
  ).run(id, req.user.id, category, emoji.trim(), label.trim(), String(mapped_value));
  res.status(201).json(
    db.prepare('SELECT id, category, emoji, label, mapped_value FROM custom_review_options WHERE id=?').get(id)
  );
});

// DELETE /api/review-options/:category — excluir opção de uma categoria
router.delete('/:category', requireAuth, (req, res) => {
  if (!VALID_CATEGORIES.includes(req.params.category))
    return res.status(400).json({ error: 'Categoria inválida.' });
  db.prepare('DELETE FROM custom_review_options WHERE user_id=? AND category=?')
    .run(req.user.id, req.params.category);
  res.json({ ok: true });
});

module.exports = router;
