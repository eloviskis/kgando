-- Migração: Adicionar colunas de geolocalização aos banheiros
-- Data: 2026-06-02

-- Adicionar coluna latitude (pode ser NULL inicialmente)
ALTER TABLE bathrooms ADD COLUMN latitude REAL;

-- Adicionar coluna longitude (pode ser NULL inicialmente)
ALTER TABLE bathrooms ADD COLUMN longitude REAL;

-- Criar índice para buscas geoespaciais eficientes
CREATE INDEX IF NOT EXISTS idx_bathrooms_location ON bathrooms(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
