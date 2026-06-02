/**
 * Módulo de Mapa - Kgando
 * 
 * Visualização de banheiros em mapa interativo com Leaflet.js
 * Funcionalidades:
 * - Busca por proximidade
 * - Clustering de marcadores
 * - Filtros visuais (tipo, rating, raio)
 * - Criação de banheiros no mapa
 * - Navegação para banheiros
 */

(function () {
  'use strict';

  // Em produção usa URL relativa (mesmo host); em dev aponta para localhost
  const API_BASE = location.hostname === 'localhost' ? 'http://localhost:3001' : '';
  
  // Estado do mapa
  let map = null;
  let userMarker = null;
  let markerClusterGroup = null;
  let currentLocation = null;
  let bathrooms = [];
  let isCreatingBathroom = false;
  let tempMarker = null;

  // Configurações padrão
  const DEFAULT_RADIUS = 5000; // 5km
  const DEFAULT_LAT = -23.5505; // São Paulo
  const DEFAULT_LNG = -46.6333;
  const DEFAULT_ZOOM = 13;

  // Ícones por tipo de banheiro
  const BATHROOM_TYPES = {
    public: { emoji: '🚻', color: '#4A90E2', label: 'Público' },
    commercial: { emoji: '🏢', color: '#50C878', label: 'Comercial' },
    restaurant: { emoji: '🍽️', color: '#E85D75', label: 'Restaurante' },
    gas: { emoji: '⛽', color: '#FFA500', label: 'Posto' },
    office: { emoji: '💼', color: '#9B59B6', label: 'Escritório' },
    home: { emoji: '🏠', color: '#95A5A6', label: 'Casa' },
    airport: { emoji: '✈️', color: '#3498DB', label: 'Aeroporto' }
  };

  /**
   * Renderiza a página do mapa
   */
  window.renderMapPage = async function () {
    const user = window.currentUser;
    if (!user) {
      navigateTo('login');
      return;
    }

    const t = window.i18n.t;
    const root = document.getElementById('pageRoot');
    root.innerHTML = `
      <div class="map-page">
        <!-- Cabeçalho do mapa -->
        <div class="map-header">
          <h1>${t('map')}</h1>
          <div class="map-header-actions">
            <button id="myLocationBtn" class="btn-icon" title="${t('my_location')}">
              📍
            </button>
            <button id="toggleFiltersBtn" class="btn-icon" title="${t('filters')}">
              🔍
            </button>
          </div>
        </div>

        <!-- Container do mapa -->
        <div id="map-container" class="map-container"></div>

        <!-- Painel de filtros lateral -->
        <aside id="filtersSidebar" class="filters-sidebar hidden">
          <div class="filters-header">
            <h3>${t('filters')}</h3>
            <button id="closeFiltersBtn" class="btn-icon">✕</button>
          </div>

          <div class="filters-body">
            <!-- Raio de busca -->
            <div class="filter-group">
              <label>${t('search_radius')}</label>
              <select id="radiusFilter" class="filter-select">
                <option value="500">500m</option>
                <option value="1000">1 km</option>
                <option value="2000">2 km</option>
                <option value="5000" selected>5 km</option>
                <option value="10000">10 km</option>
                <option value="20000">20 km</option>
              </select>
            </div>

            <!-- Tipo de banheiro -->
            <div class="filter-group">
              <label>${t('bathroom_type')}</label>
              <select id="typeFilter" class="filter-select">
                <option value="">Todos</option>
                <option value="public">🚻 Público</option>
                <option value="commercial">🏢 Comercial</option>
                <option value="restaurant">🍽️ Restaurante</option>
                <option value="gas">⛽ Posto</option>
                <option value="office">💼 Escritório</option>
                <option value="home">🏠 Casa</option>
                <option value="airport">✈️ Aeroporto</option>
              </select>
            </div>

            <!-- Rating mínimo -->
            <div class="filter-group">
              <label>${t('min_rating')}</label>
              <select id="ratingFilter" class="filter-select">
                <option value="0">Qualquer</option>
                <option value="2">⭐⭐ 2+</option>
                <option value="3">⭐⭐⭐ 3+</option>
                <option value="4">⭐⭐⭐⭐ 4+</option>
                <option value="4.5">⭐⭐⭐⭐⭐ 4.5+</option>
              </select>
            </div>

            <!-- Botão aplicar filtros -->
            <button id="applyFiltersBtn" class="btn-primary">${t('apply_filters')}</button>
          </div>
        </aside>

        <!-- Botão flutuante para criar banheiro -->
        <button id="createBathroomBtn" class="fab" title="${t('create_bathroom_on_map')}">
          ➕
        </button>

        <!-- Loading overlay -->
        <div id="mapLoading" class="map-loading hidden">
          <div class="spinner"></div>
          <p>${t('loading_bathrooms')}</p>
        </div>
      </div>
    `;

    // Inicializar mapa
    await initializeMap();
    attachEventListeners();
  };

  /**
   * Inicializa o mapa Leaflet
   */
  async function initializeMap() {
    // Criar mapa
    map = L.map('map-container', {
      zoomControl: true,
      attributionControl: true
    }).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);

    // Adicionar tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Criar grupo de clustering
    markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count > 10) size = 'medium';
        if (count > 50) size = 'large';
        
        return L.divIcon({
          html: `<div class="marker-cluster-inner">${count}</div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(40, 40)
        });
      }
    });
    map.addLayer(markerClusterGroup);

    // Tentar obter localização do usuário
    await getUserLocation();

    // Carregar banheiros próximos
    await loadNearbyBathrooms();

    // Eventos de mapa
    map.on('moveend', debounce(loadNearbyBathrooms, 500));
  }

  /**
   * Obtém localização do usuário via GPS
   */
  async function getUserLocation() {
    // Verificar se já tem localização salva
    const savedLocation = localStorage.getItem('kgando:lastLocation');
    if (savedLocation) {
      try {
        const { lat, lng } = JSON.parse(savedLocation);
        currentLocation = { lat, lng };
        map.setView([lat, lng], DEFAULT_ZOOM);
        addUserMarker(lat, lng);
      } catch (e) {
        console.error('Erro ao carregar localização salva:', e);
      }
    }

    // Tentar obter localização atual
    if (!navigator.geolocation) {
      console.warn('Geolocalização não suportada pelo navegador');
      return;
    }

    showLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        currentLocation = { lat, lng };
        localStorage.setItem('kgando:lastLocation', JSON.stringify({ lat, lng }));
        
        map.setView([lat, lng], DEFAULT_ZOOM);
        addUserMarker(lat, lng);
        
        loadNearbyBathrooms();
        showLoading(false);
      },
      (error) => {
        console.warn('Erro ao obter localização:', error.message);
        showLoading(false);
        
        // Mostrar mensagem de erro
        const t = window.i18n.t;
        if (error.code === error.PERMISSION_DENIED) {
          showNotification(t('location_permission_denied'), 'warning');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  }

  /**
   * Adiciona marcador da localização do usuário
   */
  function addUserMarker(lat, lng) {
    if (userMarker) {
      map.removeLayer(userMarker);
    }

    const icon = L.divIcon({
      html: '<div class="user-location-marker">📍</div>',
      className: 'user-location-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    userMarker = L.marker([lat, lng], { icon }).addTo(map);
    
    const t = window.i18n.t;
    userMarker.bindPopup(`<b>${t('you_are_here')}</b>`);
  }

  /**
   * Carrega banheiros próximos da API
   */
  async function loadNearbyBathrooms() {
    if (!currentLocation) return;

    const { lat, lng } = currentLocation;
    const radius = document.getElementById('radiusFilter')?.value || DEFAULT_RADIUS;
    const type = document.getElementById('typeFilter')?.value || '';
    const minRating = document.getElementById('ratingFilter')?.value || '0';

    showLoading(true);

    try {
      const token = localStorage.getItem('kgando:token');
      const params = new URLSearchParams({
        lat,
        lng,
        radius,
        ...(type && { type }),
        ...(parseFloat(minRating) > 0 && { minRating })
      });

      const response = await fetch(`${API_BASE}/api/bathrooms/nearby?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar banheiros');
      }

      bathrooms = await response.json();
      renderBathroomMarkers();
      
      const t = window.i18n.t;
      showNotification(t('bathrooms_loaded').replace('{count}', bathrooms.length), 'success');
    } catch (error) {
      console.error('Erro ao carregar banheiros:', error);
      const t = window.i18n.t;
      showNotification(t('error_loading_bathrooms'), 'error');
    } finally {
      showLoading(false);
    }
  }

  /**
   * Renderiza marcadores dos banheiros no mapa
   */
  function renderBathroomMarkers() {
    // Limpar marcadores existentes
    markerClusterGroup.clearLayers();

    bathrooms.forEach(bathroom => {
      if (!bathroom.latitude || !bathroom.longitude) return;

      const marker = createBathroomMarker(bathroom);
      markerClusterGroup.addLayer(marker);
    });
  }

  /**
   * Cria marcador customizado para um banheiro
   */
  function createBathroomMarker(bathroom) {
    const typeInfo = BATHROOM_TYPES[bathroom.type] || BATHROOM_TYPES.public;
    const rating = bathroom.rating || 0;
    const ratingColor = getRatingColor(rating);

    const icon = L.divIcon({
      html: `
        <div class="bathroom-marker" style="background-color: ${typeInfo.color}">
          <div class="bathroom-marker-emoji">${typeInfo.emoji}</div>
          ${rating > 0 ? `<div class="bathroom-marker-rating" style="background-color: ${ratingColor}">${rating.toFixed(1)}</div>` : ''}
        </div>
      `,
      className: 'bathroom-marker-icon',
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50]
    });

    const marker = L.marker([bathroom.latitude, bathroom.longitude], { icon });
    
    // Popup com detalhes
    marker.bindPopup(() => createBathroomPopup(bathroom), {
      maxWidth: 300,
      className: 'bathroom-popup'
    });

    return marker;
  }

  /**
   * Cria conteúdo HTML do popup do banheiro
   */
  function createBathroomPopup(bathroom) {
    const t = window.i18n.t;
    const typeInfo = BATHROOM_TYPES[bathroom.type] || BATHROOM_TYPES.public;
    const distance = bathroom.distance ? formatDistance(bathroom.distance) : '';
    const rating = bathroom.rating || 0;
    const stars = '⭐'.repeat(Math.round(rating));

    const popup = document.createElement('div');
    popup.className = 'bathroom-popup-content';
    popup.innerHTML = `
      <div class="bathroom-popup-header">
        <span class="bathroom-popup-emoji">${typeInfo.emoji}</span>
        <h3>${bathroom.name}</h3>
      </div>
      
      <div class="bathroom-popup-info">
        <p class="bathroom-popup-type">${typeInfo.label}</p>
        ${rating > 0 ? `<p class="bathroom-popup-rating">${stars} ${rating.toFixed(1)}</p>` : '<p class="bathroom-popup-no-rating">Sem avaliações</p>'}
        ${bathroom.reviews_count > 0 ? `<p class="bathroom-popup-reviews">${bathroom.reviews_count} ${bathroom.reviews_count === 1 ? 'avaliação' : 'avaliações'}</p>` : ''}
        ${distance ? `<p class="bathroom-popup-distance">📍 ${distance}</p>` : ''}
      </div>

      <div class="bathroom-popup-actions">
        <button class="btn-secondary btn-sm" onclick="window.viewBathroom('${bathroom.id}')">
          Ver Perfil
        </button>
        <button class="btn-primary btn-sm" onclick="window.reviewBathroom('${bathroom.id}')">
          Avaliar
        </button>
        <button class="btn-icon btn-sm" onclick="window.navigateToBathroom(${bathroom.latitude}, ${bathroom.longitude})" title="${t('navigate')}">
          🧭
        </button>
      </div>
    `;

    return popup;
  }

  /**
   * Cor do marcador baseado no rating
   */
  function getRatingColor(rating) {
    if (rating >= 4) return '#28a745'; // Verde
    if (rating >= 2.5) return '#ffc107'; // Amarelo
    return '#dc3545'; // Vermelho
  }

  /**
   * Formata distância em metros/km
   */
  function formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  /**
   * Anexa event listeners
   */
  function attachEventListeners() {
    // Botão minha localização
    document.getElementById('myLocationBtn')?.addEventListener('click', () => {
      if (currentLocation) {
        map.setView([currentLocation.lat, currentLocation.lng], DEFAULT_ZOOM);
      } else {
        getUserLocation();
      }
    });

    // Toggle filtros
    document.getElementById('toggleFiltersBtn')?.addEventListener('click', () => {
      document.getElementById('filtersSidebar')?.classList.toggle('hidden');
    });

    document.getElementById('closeFiltersBtn')?.addEventListener('click', () => {
      document.getElementById('filtersSidebar')?.classList.add('hidden');
    });

    // Aplicar filtros
    document.getElementById('applyFiltersBtn')?.addEventListener('click', () => {
      loadNearbyBathrooms();
      document.getElementById('filtersSidebar')?.classList.add('hidden');
    });

    // Botão criar banheiro
    document.getElementById('createBathroomBtn')?.addEventListener('click', toggleCreateBathroomMode);
  }

  /**
   * Ativar/desativar modo de criação de banheiro
   */
  function toggleCreateBathroomMode() {
    isCreatingBathroom = !isCreatingBathroom;
    const btn = document.getElementById('createBathroomBtn');
    const t = window.i18n.t;

    if (isCreatingBathroom) {
      btn.classList.add('active');
      btn.textContent = '✕';
      btn.title = t('cancel');
      
      map.getContainer().style.cursor = 'crosshair';
      map.on('click', onMapClickCreateBathroom);
      
      showNotification(t('click_map_to_place_bathroom'), 'info');
    } else {
      btn.classList.remove('active');
      btn.textContent = '➕';
      btn.title = t('create_bathroom_on_map');
      
      map.getContainer().style.cursor = '';
      map.off('click', onMapClickCreateBathroom);
      
      if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
      }
    }
  }

  /**
   * Handler de clique no mapa para criar banheiro
   */
  async function onMapClickCreateBathroom(e) {
    const { lat, lng } = e.latlng;

    // Adicionar marcador temporário
    if (tempMarker) {
      map.removeLayer(tempMarker);
    }

    const icon = L.divIcon({
      html: '<div class="temp-marker">📍</div>',
      className: 'temp-marker-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    tempMarker = L.marker([lat, lng], { icon }).addTo(map);

    // Validar localização via reverse geocoding
    try {
      showLoading(true);
      const token = localStorage.getItem('kgando:token');
      const response = await fetch(`${API_BASE}/api/bathrooms/validate-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ latitude: lat, longitude: lng })
      });

      if (!response.ok) {
        throw new Error('Erro ao validar localização');
      }

      const data = await response.json();
      showLoading(false);

      // Abrir modal de confirmação
      showCreateBathroomModal(lat, lng, data);
    } catch (error) {
      console.error('Erro ao validar localização:', error);
      showLoading(false);
      const t = window.i18n.t;
      showNotification(t('error_validating_location'), 'error');
    }
  }

  /**
   * Mostra modal para criar banheiro
   */
  function showCreateBathroomModal(lat, lng, locationData) {
    const t = window.i18n.t;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2>${t('create_bathroom')}</h2>
          <button class="btn-icon close-modal">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-location-info">📍 ${locationData.address}</p>
          
          <form id="createBathroomForm">
            <div class="form-group">
              <label for="bathroomName">${t('bathroom_name')} *</label>
              <input type="text" id="bathroomName" class="form-control" required 
                     placeholder="Ex: Banheiro do Shopping">
            </div>

            <div class="form-group">
              <label for="bathroomType">${t('bathroom_type')} *</label>
              <select id="bathroomType" class="form-control" required>
                <option value="public">🚻 Público</option>
                <option value="commercial">🏢 Comercial</option>
                <option value="restaurant">🍽️ Restaurante</option>
                <option value="gas">⛽ Posto</option>
                <option value="office">💼 Escritório</option>
                <option value="home">🏠 Casa</option>
                <option value="airport">✈️ Aeroporto</option>
              </select>
            </div>

            <div class="form-group">
              <label for="bathroomNeighborhood">${t('neighborhood')}</label>
              <input type="text" id="bathroomNeighborhood" class="form-control" 
                     value="${locationData.neighborhood || ''}" 
                     placeholder="${locationData.city || ''}">
            </div>

            <input type="hidden" id="bathroomLat" value="${lat}">
            <input type="hidden" id="bathroomLng" value="${lng}">

            <div class="modal-actions">
              <button type="button" class="btn-secondary close-modal">${t('cancel')}</button>
              <button type="submit" class="btn-primary">${t('create_and_review')}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.removeChild(modal);
        toggleCreateBathroomMode(); // Desativar modo de criação
      });
    });

    modal.querySelector('#createBathroomForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await createBathroomAndRedirect(modal);
    });
  }

  /**
   * Cria banheiro e redireciona para avaliação
   */
  async function createBathroomAndRedirect(modal) {
    const name = document.getElementById('bathroomName').value.trim();
    const type = document.getElementById('bathroomType').value;
    const neighborhood = document.getElementById('bathroomNeighborhood').value.trim();
    const latitude = parseFloat(document.getElementById('bathroomLat').value);
    const longitude = parseFloat(document.getElementById('bathroomLng').value);

    if (!name) {
      const t = window.i18n.t;
      showNotification(t('bathroom_name_required'), 'error');
      return;
    }

    showLoading(true);

    try {
      const token = localStorage.getItem('kgando:token');
      const response = await fetch(`${API_BASE}/api/bathrooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          type,
          neighborhood,
          latitude,
          longitude
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar banheiro');
      }

      const bathroom = await response.json();
      
      showLoading(false);
      document.body.removeChild(modal);
      
      // Redirecionar para criar avaliação
      window.appRouter.navigate('new', { bathroomId: bathroom.id });
    } catch (error) {
      console.error('Erro ao criar banheiro:', error);
      showLoading(false);
      showNotification(error.message, 'error');
    }
  }

  /**
   * Funções globais para ações do popup
   */
  window.viewBathroom = function (bathroomId) {
    window.appRouter.navigate('bathrooms', { id: bathroomId });
  };

  window.reviewBathroom = function (bathroomId) {
    window.appRouter.navigate('new', { bathroomId });
  };

  window.navigateToBathroom = function (lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  /**
   * Utilitários
   */
  function showLoading(show) {
    const loading = document.getElementById('mapLoading');
    if (loading) {
      loading.classList.toggle('hidden', !show);
    }
  }

  function showNotification(message, type = 'info') {
    // Usar sistema de notificação existente se disponível
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      alert(message);
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

})();
