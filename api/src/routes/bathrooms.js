const router = require('express').Router();
const { randomUUID } = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

/**
 * Calcula distância entre dois pontos usando fórmula de Haversine
 * @param {number} lat1 - Latitude do ponto 1
 * @param {number} lon1 - Longitude do ponto 1
 * @param {number} lat2 - Latitude do ponto 2
 * @param {number} lon2 - Longitude do ponto 2
 * @returns {number} Distância em metros
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371000; // Raio da Terra em metros
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/bathrooms/nearby - Busca banheiros próximos a uma localização
router.get('/nearby', (req, res) => {
  const { lat, lng, radius = 5000, type, minRating } = req.query;
  
  // Validar parâmetros obrigatórios
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Parâmetros lat e lng são obrigatórios.' });
  }
  
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusMeters = parseInt(radius, 10);
  
  if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'Coordenadas inválidas.' });
  }
  
  if (isNaN(radiusMeters) || radiusMeters < 0 || radiusMeters > 50000) {
    return res.status(400).json({ error: 'Raio deve estar entre 0 e 50000 metros.' });
  }
  
  // Buscar todos os banheiros com coordenadas
  let query = 'SELECT * FROM bathrooms WHERE latitude IS NOT NULL AND longitude IS NOT NULL';
  const params = [];
  
  // Aplicar filtro de tipo
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  // Aplicar filtro de rating mínimo
  if (minRating) {
    const minRatingValue = parseFloat(minRating);
    if (!isNaN(minRatingValue) && minRatingValue >= 0 && minRatingValue <= 5) {
      query += ' AND rating >= ?';
      params.push(minRatingValue);
    }
  }
  
  const bathrooms = db.prepare(query).all(...params);
  
  // Calcular distância e filtrar por raio
  const results = bathrooms
    .map(bathroom => ({
      ...bathroom,
      distance: haversineDistance(latitude, longitude, bathroom.latitude, bathroom.longitude)
    }))
    .filter(bathroom => bathroom.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 200); // Limitar a 200 resultados
  
  res.json(results);
});

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
  const { name, neighborhood, type, latitude, longitude } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório.' });
  
  // Validar coordenadas se fornecidas
  let lat = null;
  let lng = null;
  if (latitude !== undefined && longitude !== undefined) {
    lat = parseFloat(latitude);
    lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Coordenadas inválidas.' });
    }
  }
  
  const id = randomUUID();
  db.prepare('INSERT INTO bathrooms (id,name,neighborhood,type,latitude,longitude,created_by) VALUES (?,?,?,?,?,?,?)').run(
    id, name.trim(), neighborhood || '', type || 'public', lat, lng, req.user.id
  );
  res.status(201).json(db.prepare('SELECT * FROM bathrooms WHERE id=?').get(id));
});

// PUT /api/bathrooms/:id - Atualizar banheiro
router.put('/:id', requireAuth, (req, res) => {
  const bathroom = db.prepare('SELECT * FROM bathrooms WHERE id=?').get(req.params.id);
  if (!bathroom) return res.status(404).json({ error: 'Banheiro não encontrado.' });
  
  // Apenas o criador ou admin pode atualizar (por enquanto apenas criador)
  if (bathroom.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Você não tem permissão para atualizar este banheiro.' });
  }
  
  const { name, neighborhood, type, latitude, longitude } = req.body;
  
  // Validar coordenadas se fornecidas
  let lat = bathroom.latitude;
  let lng = bathroom.longitude;
  if (latitude !== undefined && longitude !== undefined) {
    lat = parseFloat(latitude);
    lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Coordenadas inválidas.' });
    }
  }
  
  const updatedName = name?.trim() || bathroom.name;
  const updatedNeighborhood = neighborhood !== undefined ? neighborhood : bathroom.neighborhood;
  const updatedType = type || bathroom.type;
  
  db.prepare('UPDATE bathrooms SET name=?, neighborhood=?, type=?, latitude=?, longitude=? WHERE id=?').run(
    updatedName, updatedNeighborhood, updatedType, lat, lng, req.params.id
  );
  
  res.json(db.prepare('SELECT * FROM bathrooms WHERE id=?').get(req.params.id));
});

// POST /api/bathrooms/validate-location - Validar coordenadas via reverse geocoding
router.post('/validate-location', async (req, res) => {
  const { latitude, longitude } = req.body;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Parâmetros latitude e longitude são obrigatórios.' });
  }
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Coordenadas inválidas.' });
  }
  
  try {
    // Reverse geocoding via Nominatim
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Kgando/1.0 (https://kgando.com.br)'
      }
    });
    
    if (!response.ok) {
      return res.status(500).json({ error: 'Erro ao validar localização.' });
    }
    
    const data = await response.json();
    
    if (data.error) {
      return res.status(404).json({ error: 'Localização não encontrada.' });
    }
    
    res.json({
      latitude: lat,
      longitude: lng,
      address: data.display_name,
      neighborhood: data.address?.suburb || data.address?.neighbourhood || '',
      city: data.address?.city || data.address?.town || data.address?.village || '',
      state: data.address?.state || '',
      country: data.address?.country || ''
    });
  } catch (error) {
    console.error('Erro ao validar localização:', error);
    res.status(500).json({ error: 'Erro ao validar localização.' });
  }
});

module.exports = router;
