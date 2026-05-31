const express = require('express');
const router  = express.Router();

const GIPHY_BASE = 'https://api.giphy.com/v1/gifs';
const API_KEY    = process.env.GIPHY_API_KEY;

/* GET /api/giphy/search?q=texto&limit=20&offset=0 */
router.get('/search', async (req, res) => {
  if (!API_KEY) return res.status(503).json({ error: 'Giphy not configured' });

  const q      = String(req.query.q      || '').trim().slice(0, 100);
  const limit  = Math.min(parseInt(req.query.limit)  || 20, 50);
  const offset = Math.max(parseInt(req.query.offset) ||  0, 0);
  const rating = 'pg-13'; // moderado — sem conteúdo adulto

  if (!q) return res.json({ data: [] });

  const url = `${GIPHY_BASE}/search?api_key=${API_KEY}&q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}&rating=${rating}&lang=pt`;
  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: 'Giphy error' });
    const json = await r.json();
    // Retornar somente os campos necessários (não expor a chave)
    const data = (json.data || []).map(g => ({
      id:       g.id,
      title:    g.title,
      url:      g.images?.fixed_height?.url       || g.images?.original?.url,
      preview:  g.images?.fixed_height_small?.url || g.images?.fixed_height?.url,
      width:    parseInt(g.images?.fixed_height?.width  || 200),
      height:   parseInt(g.images?.fixed_height?.height || 150),
    }));
    res.json({ data });
  } catch (e) {
    console.error('[GIPHY]', e.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

/* GET /api/giphy/trending?limit=20 */
router.get('/trending', async (req, res) => {
  if (!API_KEY) return res.status(503).json({ error: 'Giphy not configured' });
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const url = `${GIPHY_BASE}/trending?api_key=${API_KEY}&limit=${limit}&rating=pg-13`;
  try {
    const r = await fetch(url);
    const json = await r.json();
    const data = (json.data || []).map(g => ({
      id:      g.id,
      title:   g.title,
      url:     g.images?.fixed_height?.url,
      preview: g.images?.fixed_height_small?.url || g.images?.fixed_height?.url,
      width:   parseInt(g.images?.fixed_height?.width  || 200),
      height:  parseInt(g.images?.fixed_height?.height || 150),
    }));
    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: 'Trending failed' });
  }
});

module.exports = router;
