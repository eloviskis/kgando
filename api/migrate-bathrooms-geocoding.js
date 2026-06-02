/**
 * Script de Migração: Geocoding de Banheiros Existentes
 * 
 * Este script converte os campos 'neighborhood' dos banheiros existentes
 * em coordenadas geográficas (latitude/longitude) usando a API Nominatim
 * do OpenStreetMap.
 * 
 * Uso: node api/migrate-bathrooms-geocoding.js
 */

const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Nominatim API (OpenStreetMap) - gratuita, limite de 1 req/s
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
const REQUEST_DELAY = 1100; // 1.1 segundo entre requests (respeitar rate limit)

// User-Agent obrigatório para Nominatim
const USER_AGENT = 'Kgando/1.0 (https://kgando.com.br)';

// País padrão para melhorar resultados (ajuste se necessário)
const DEFAULT_COUNTRY = 'Brasil';

// Função para fazer delay entre requests
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Faz geocoding de um endereço usando Nominatim
 * @param {string} address - Endereço para geocodificar
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
async function geocodeAddress(address) {
  if (!address || address.trim() === '') {
    return null;
  }

  // Adicionar país ao endereço para melhorar precisão
  const fullAddress = `${address}, ${DEFAULT_COUNTRY}`;

  try {
    const url = new URL(NOMINATIM_API);
    url.searchParams.append('q', fullAddress);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '1');
    url.searchParams.append('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    if (!response.ok) {
      console.error(`❌ Erro HTTP ${response.status} ao geocodificar: ${address}`);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name
      };
    }

    console.warn(`⚠️  Nenhum resultado encontrado para: ${address}`);
    return null;
  } catch (error) {
    console.error(`❌ Erro ao geocodificar "${address}":`, error.message);
    return null;
  }
}

/**
 * Atualiza as coordenadas de um banheiro no banco de dados
 */
function updateBathroomLocation(db, bathroomId, lat, lng) {
  const stmt = db.prepare('UPDATE bathrooms SET latitude = ?, longitude = ? WHERE id = ?');
  stmt.run(lat, lng, bathroomId);
}

/**
 * Função principal de migração
 */
async function main() {
  console.log('🚀 Iniciando migração de geocoding de banheiros...\n');

  // Abrir banco de dados (usar mesma config do index.js)
  const dbPath = path.resolve(__dirname, process.env.DB_PATH || './data/poopit.db');
  const db = new Database(dbPath);

  try {
    // Buscar todos os banheiros sem coordenadas
    const bathrooms = db.prepare(`
      SELECT id, name, neighborhood 
      FROM bathrooms 
      WHERE latitude IS NULL OR longitude IS NULL
    `).all();

    console.log(`📊 Encontrados ${bathrooms.length} banheiros para geocodificar\n`);

    if (bathrooms.length === 0) {
      console.log('✅ Todos os banheiros já têm coordenadas!');
      return;
    }

    const stats = {
      success: 0,
      failed: 0,
      skipped: 0
    };

    // Processar cada banheiro
    for (let i = 0; i < bathrooms.length; i++) {
      const bathroom = bathrooms[i];
      const progress = `[${i + 1}/${bathrooms.length}]`;

      console.log(`${progress} Processando: ${bathroom.name}`);
      console.log(`   Endereço: ${bathroom.neighborhood}`);

      // Pular se não tiver neighborhood
      if (!bathroom.neighborhood || bathroom.neighborhood.trim() === '') {
        console.log(`   ⏭️  Pulado (sem endereço)\n`);
        stats.skipped++;
        continue;
      }

      // Fazer geocoding
      const result = await geocodeAddress(bathroom.neighborhood);

      if (result) {
        // Atualizar banco de dados
        updateBathroomLocation(db, bathroom.id, result.lat, result.lng);
        console.log(`   ✅ Sucesso: ${result.lat}, ${result.lng}`);
        console.log(`   📍 ${result.display_name}\n`);
        stats.success++;
      } else {
        console.log(`   ❌ Falhou\n`);
        stats.failed++;
      }

      // Aguardar antes do próximo request (respeitar rate limit)
      if (i < bathrooms.length - 1) {
        await sleep(REQUEST_DELAY);
      }
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📈 RESUMO DA MIGRAÇÃO');
    console.log('='.repeat(60));
    console.log(`✅ Sucesso:  ${stats.success} banheiros geocodificados`);
    console.log(`❌ Falhas:   ${stats.failed} banheiros não geocodificados`);
    console.log(`⏭️  Pulados:  ${stats.skipped} banheiros sem endereço`);
    console.log(`📊 Total:    ${bathrooms.length} banheiros processados`);
    console.log('='.repeat(60));

    // Listar banheiros que falharam (para revisão manual)
    if (stats.failed > 0) {
      console.log('\n⚠️  Banheiros que falharam geocoding:');
      const failedBathrooms = db.prepare(`
        SELECT id, name, neighborhood 
        FROM bathrooms 
        WHERE latitude IS NULL OR longitude IS NULL
      `).all();

      failedBathrooms.forEach((b, idx) => {
        console.log(`   ${idx + 1}. ${b.name} - "${b.neighborhood || '(sem endereço)'}"`);
      });

      console.log('\n💡 Dica: Esses banheiros podem ser atualizados manualmente via interface admin.');
    }

  } catch (error) {
    console.error('\n❌ Erro fatal durante migração:', error);
    throw error;
  } finally {
    db.close();
    console.log('\n✅ Migração concluída!\n');
  }
}

// Executar script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
}

module.exports = { geocodeAddress };
