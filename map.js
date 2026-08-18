// HOSPITAL COMMAND NETWORK - CAPA 1
// Mapa de Argentina con hospitales utilizando Leaflet + OpenStreetMap
// Este componente es el mapa base para futuras capas de emergencias y simulaciones

// ===== CONFIGURACIÓN DEL MAPA =====
let map;
let hospitalMarkers = [];
let cityMarkers = [];
let currentFilter = 'all';
let showHospitals = true;
let showCities = true;
let showRoutes = true;
let showProvinces = true;
let emergencyOverlay = null;

// Coordenadas del centro de Córdoba Capital
const CORDOBA_CENTER = [-31.4201, -64.1888];
const CORDOBA_ZOOM = 8;

// Límites del mapa - solo Córdoba Capital
const CORDOBA_BOUNDS = [
    [-35.2, -66.0], // Suroeste provincial
    [-29.5, -60.5]  // Noreste provincial
];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadHospitalData();
    renderActiveEmergencyOverlay();
    setupEventListeners();
    updateNetworkStatistics();
});

// ===== INICIALIZAR MAPA LEAFLET =====
function initializeMap() {
    // Crear el mapa
    map = L.map('mapContainer', {
        center: CORDOBA_CENTER,
        zoom: CORDOBA_ZOOM,
        minZoom: 7,
        maxZoom: 18,
        maxBounds: CORDOBA_BOUNDS,
        maxBoundsViscosity: 1.0, // Evita rebote fuera de los límites
        zoomControl: false // Deshabilitar control de zoom por defecto para personalizar
    });

    // Agregar capa de OpenStreetMap con estilo profesional
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        className: 'map-tiles'
    }).addTo(map);

    // Agregar control de zoom personalizado
    addCustomZoomControl();

    // Agregar brújula
    addCompass();

    // Agregar escala
    L.control.scale({
        position: 'bottomright',
        metric: true,
        imperial: false
    }).addTo(map);

    console.log('Mapa inicializado correctamente');
}

function renderActiveEmergencyOverlay() {
    const emergency = typeof loadActiveEmergency === 'function' ? loadActiveEmergency() : null;
    if (!emergency || !['READY', 'ACTIVE', 'PAUSED'].includes(String(emergency.status).toUpperCase())) {
        return;
    }

    const latitude = emergency.coordinates?.latitude || emergency.location?.latitude;
    const longitude = emergency.coordinates?.longitude || emergency.location?.longitude;
    const radius = emergency.radius || emergency.affectedRadius;
    if (!latitude || !longitude || !radius) return;

    const epicenter = L.marker([latitude, longitude]).addTo(map);
    epicenter.bindPopup(`<b>🚨 ${getEmergencyTypeName(emergency.type)}</b><br>${emergency.location.name}<br>Radio: ${radius} km`);
    const circle = L.circle([latitude, longitude], {
        radius: radius * 1000,
        color: '#ff006e',
        fillColor: '#ff006e',
        fillOpacity: 0.12,
        weight: 2
    }).addTo(map);
    emergencyOverlay = L.layerGroup([epicenter, circle]).addTo(map);
    map.fitBounds(circle.getBounds(), { padding: [40, 40] });
}

// ===== CONTROLES PERSONALIZADOS =====
function addCustomZoomControl() {
    const zoomControl = L.control({ position: 'topright' });

    zoomControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'custom-zoom-control');
        
        div.innerHTML = `
            <button class="zoom-btn zoom-in" title="Acercar">+</button>
            <button class="zoom-btn zoom-out" title="Alejar">-</button>
            <button class="zoom-btn zoom-reset" title="Restablecer vista">⟲</button>
            <button class="zoom-btn zoom-center" title="Centrar Córdoba">🎯</button>
        `;

        // Event listeners
        div.querySelector('.zoom-in').addEventListener('click', () => map.zoomIn());
        div.querySelector('.zoom-out').addEventListener('click', () => map.zoomOut());
        div.querySelector('.zoom-reset').addEventListener('click', () => {
            map.setView(CORDOBA_CENTER, CORDOBA_ZOOM);
        });
        div.querySelector('.zoom-center').addEventListener('click', centerOnCordoba);

        return div;
    };

    zoomControl.addTo(map);
}

function addCompass() {
    const compass = L.control({ position: 'topleft' });

    compass.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'compass-control');
        div.innerHTML = `
            <div class="compass">
                <div class="compass-arrow">↑</div>
                <div class="compass-label">N</div>
            </div>
        `;
        return div;
    };

    compass.addTo(map);
}

function centerOnCordoba() {
    map.flyTo(CORDOBA_CENTER, CORDOBA_ZOOM, {
        duration: 1.5
    });
}

// ===== CARGAR DATOS DE HOSPITALES =====
function loadHospitalData() {
    // Verificar que hospitalNetwork esté disponible
    if (typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        console.error('❌ No se encontraron datos de hospitales. Asegúrate de que hospitals.js se cargó correctamente.');
        return;
    }

    console.log('✅ Datos de hospitales cargados:', hospitalNetwork.hospitals.length, 'hospitales encontrados');

    // Limpiar marcadores existentes
    clearMarkers();

    // Agregar marcadores de hospitales
    let hospitalesAgregados = 0;
    hospitalNetwork.hospitals.forEach((hospital, index) => {
        if (hospital.geolocalizacion && hospital.geolocalizacion.latitud && hospital.geolocalizacion.longitud) {
            console.log(`📍 Agregando hospital ${index + 1}:`, hospital.nombre, 
                       `[${hospital.geolocalizacion.latitud}, ${hospital.geolocalizacion.longitud}]`);
            addHospitalMarker(hospital);
            hospitalesAgregados++;
        } else {
            console.warn('⚠️ Hospital sin geolocalización:', hospital.nombre);
        }
    });

    // Agregar ciudades principales
    addMajorCities();
    
    console.log(`✅ Total marcadores agregados: ${hospitalesAgregados} hospitales, ${cityMarkers.length} ciudades`);
    
    // Forzar un repintado del mapa
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

// ===== MARCADORES DE HOSPITALES =====
function addHospitalMarker(hospital) {
    const { latitud, longitud } = hospital.geolocalizacion;
    
    // Validar coordenadas
    if (!latitud || !longitud || isNaN(latitud) || isNaN(longitud)) {
        console.error('❌ Coordenadas inválidas para hospital:', hospital.nombre, latitud, longitud);
        return;
    }
    
    const statusClass = getStatusClass(hospital.estado);
    const emergency = typeof loadActiveEmergency === 'function' ? loadActiveEmergency() : null;
    const isAffected = emergency?.affectedHospitals?.some(item => item.id === hospital.id);

    // Crear icono personalizado para el hospital
    const hospitalIcon = L.divIcon({
        className: 'hospital-marker',
        html: `
            <div class="hospital-icon ${isAffected ? 'emergency-affected' : statusClass}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-4h8v4"></path>
                </svg>
            </div>
            <div class="hospital-pulse ${statusClass}"></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });

    // Crear marcador
    const marker = L.marker([latitud, longitud], {
        icon: hospitalIcon,
        title: hospital.nombre
    });

    // Crear popup con información básica
    const popupContent = createHospitalPopup(hospital, isAffected);
    marker.bindPopup(popupContent, {
        className: 'hospital-popup',
        maxWidth: 300
    });

    // Evento click
    marker.on('click', function() {
        showHospitalDetail(hospital);
    });

    // Agregar al mapa y al array
    marker.addTo(map);
    hospitalMarkers.push(marker);
    
    console.log(`✓ Marcador agregado para ${hospital.nombre} en [${latitud}, ${longitud}]`);
}

function createHospitalPopup(hospital, isAffected = false) {
    const statusClass = getStatusClass(hospital.estado);
    
    return `
        <div class="popup-content">
            <h4>${hospital.nombre}</h4>
            <div class="popup-location">
                <span>📍 ${hospital.ciudad}, ${hospital.geolocalizacion.provincia}</span>
            </div>
            <div class="popup-status">
                <span class="status-badge ${isAffected ? 'emergency-affected' : statusClass}">${isAffected ? 'AFECTADO' : hospital.estado}</span>
            </div>
            <div class="popup-metrics">
                <div class="popup-metric">
                    <span class="metric-label">Camas:</span>
                    <span class="metric-value">${hospital.camas.disponibles}</span>
                </div>
                <div class="popup-metric">
                    <span class="metric-label">Críticas:</span>
                    <span class="metric-value">${hospital.camasCriticas.disponibles}</span>
                </div>
                <div class="popup-metric">
                    <span class="metric-label">Guardia:</span>
                    <span class="metric-value">${hospital.guardia.porcentajeOcupada}%</span>
                </div>
                <div class="popup-metric">
                    <span class="metric-label">Personal:</span>
                    <span class="metric-value">${hospital.personal.disponible}</span>
                </div>
            </div>
            <div class="popup-disclaimer">
                <span class="disclaimer-text">⚠️ DATOS SIMULADOS</span>
            </div>
            <button class="popup-btn" onclick="showHospitalDetail('${hospital.id}')">
                Ver Hospital
            </button>
        </div>
    `;
}

// ===== CIUDADES PRINCIPALES - CÓRDOBA CAPITAL =====
function addMajorCities() {
    const majorCities = [
        { name: "Córdoba", lat: -31.4201, lon: -64.1888, population: 1300000 },
        { name: "Nueva Córdoba", lat: -31.4333, lon: -64.1833, population: 150000 },
        { name: "Güemes", lat: -31.4167, lon: -64.1667, population: 120000 },
        { name: "Alta Córdoba", lat: -31.4167, lon: -64.2000, population: 100000 },
        { name: "Jardín", lat: -31.4333, lon: -64.2167, population: 80000 },
        { name: "General Paz", lat: -31.4500, lon: -64.2167, population: 75000 },
        { name: "Alberdi", lat: -31.4000, lon: -64.2000, population: 70000 },
        { name: "San Vicente", lat: -31.3667, lon: -64.2167, population: 65000 },
        { name: "Argüello", lat: -31.3833, lon: -64.2833, population: 60000 },
        { name: "Yapeyú", lat: -31.4333, lon: -64.2333, population: 55000 }
    ];

    majorCities.forEach(city => {
        const cityIcon = L.divIcon({
            className: 'city-marker',
            html: `<div class="city-dot"></div>`,
            iconSize: [8, 8],
            iconAnchor: [4, 4]
        });

        const marker = L.marker([city.lat, city.lon], {
            icon: cityIcon,
            title: city.name
        });

        marker.bindTooltip(city.name, {
            permanent: false,
            direction: 'top',
            className: 'city-tooltip'
        });

        if (showCities) {
            marker.addTo(map);
        }
        cityMarkers.push(marker);
    });
}

// ===== DETALLE DE HOSPITAL =====
function showHospitalDetail(hospital) {
    if (typeof hospital === 'string') {
        // Si recibimos el ID, buscar el hospital
        hospital = hospitalNetwork.hospitals.find(h => h.id === hospital);
    }
    
    if (!hospital) return;

    const statusClass = getStatusClass(hospital.estado);
    
    // Actualizar panel lateral
    const detailPanel = document.getElementById('hospitalDetailPanel');
    detailPanel.innerHTML = `
        <div class="detail-header">
            <h3>${hospital.nombre}</h3>
            <button class="close-detail" onclick="closeHospitalDetail()">×</button>
        </div>
        <div class="detail-content">
            <div class="detail-disclaimer">
                <span class="disclaimer-text">⚠️ DATOS SIMULADOS</span>
            </div>
            <div class="detail-location">
                <span>📍 ${hospital.ciudad}, ${hospital.geolocalizacion.provincia}</span>
            </div>
            <div class="detail-status">
                <span class="status-badge ${statusClass}">${hospital.estado}</span>
            </div>
            
            <div class="detail-section">
                <h4>Recursos Disponibles</h4>
                <div class="detail-metrics">
                    <div class="detail-metric">
                        <span class="metric-icon">🛏️</span>
                        <div class="metric-info">
                            <span class="metric-label">Camas</span>
                            <span class="metric-value">${hospital.camas.disponibles}</span>
                        </div>
                    </div>
                    <div class="detail-metric">
                        <span class="metric-icon">🏥</span>
                        <div class="metric-info">
                            <span class="metric-label">Camas Críticas</span>
                            <span class="metric-value">${hospital.camasCriticas.disponibles}</span>
                        </div>
                    </div>
                    <div class="detail-metric">
                        <span class="metric-icon">🚑</span>
                        <div class="metric-info">
                            <span class="metric-label">Ambulancias</span>
                            <span class="metric-value">${hospital.ambulancias.disponibles}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Ocupación</h4>
                <div class="occupation-bars">
                    <div class="occupation-item">
                        <span class="occupation-label">Guardia</span>
                        <div class="progress-bar">
                            <div class="progress-fill ${getOccupationClass(hospital.guardia.porcentajeOcupada)}" 
                                 style="width: ${hospital.guardia.porcentajeOcupada}%"></div>
                        </div>
                        <span class="occupation-value">${hospital.guardia.porcentajeOcupada}%</span>
                    </div>
                    <div class="occupation-item">
                        <span class="occupation-label">Personal</span>
                        <div class="progress-bar">
                            <div class="progress-fill ${getOccupationClass(100 - (hospital.personal.disponible / hospital.personal.total * 100))}" 
                                 style="width: ${(hospital.personal.disponible / hospital.personal.total * 100)}%"></div>
                        </div>
                        <span class="occupation-value">${Math.round(hospital.personal.disponible / hospital.personal.total * 100)}%</span>
                    </div>
                </div>
            </div>
            
            <button class="view-hospital-btn" onclick="viewFullHospital('${hospital.id}')">
                Ver Hospital
            </button>
        </div>
    `;
    
    detailPanel.classList.add('active');
    
    // Centrar mapa en el hospital
    if (hospital.geolocalizacion) {
        map.flyTo(
            [hospital.geolocalizacion.latitud, hospital.geolocalizacion.longitud],
            14,
            { duration: 1 }
        );
    }
}

function closeHospitalDetail() {
    document.getElementById('hospitalDetailPanel').classList.remove('active');
}

function viewFullHospital(hospitalId) {
    // Redirigir al dashboard individual del hospital
    window.location.href = `../hospital.html?id=${hospitalId}`;
}

// ===== ESTADÍSTICAS DE LA RED =====
function updateNetworkStatistics() {
    if (typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        return;
    }

    const hospitals = hospitalNetwork.hospitals;
    
    const totalHospitals = hospitals.length;
    const normalHospitals = hospitals.filter(h => h.estado === 'NORMAL').length;
    const warningHospitals = hospitals.filter(h => h.estado === 'ADVERTENCIA').length;
    const highDemandHospitals = hospitals.filter(h => h.estado === 'ALTA DEMANDA').length;
    const saturatedHospitals = hospitals.filter(h => h.estado === 'SATURADO').length;
    
    const availableBeds = hospitals.reduce((sum, h) => sum + h.camas.disponibles, 0);
    const availableCriticalBeds = hospitals.reduce((sum, h) => sum + h.camasCriticas.disponibles, 0);
    const availableAmbulances = hospitals.reduce((sum, h) => sum + h.ambulancias.disponibles, 0);
    const averageOccupation = Math.round(
        hospitals.reduce((sum, h) => sum + h.porcentajeOcupacion, 0) / hospitals.length
    );

    // Actualizar DOM
    document.getElementById('totalHospitals').textContent = totalHospitals;
    document.getElementById('normalHospitals').textContent = normalHospitals;
    document.getElementById('warningHospitals').textContent = warningHospitals;
    document.getElementById('highDemandHospitals').textContent = highDemandHospitals;
    document.getElementById('saturatedHospitals').textContent = saturatedHospitals;
    document.getElementById('availableBeds').textContent = availableBeds;
    document.getElementById('availableCriticalBeds').textContent = availableCriticalBeds;
    document.getElementById('availableAmbulances').textContent = availableAmbulances;
    document.getElementById('averageOccupation').textContent = averageOccupation + '%';
}

// ===== FILTROS =====
function applyFilters() {
    // Filtrar marcadores de hospitales
    hospitalMarkers.forEach((marker, index) => {
        const hospital = hospitalNetwork.hospitals[index];
        if (!hospital) return;

        const shouldShow = showHospitals && 
                          (currentFilter === 'all' || hospital.estado === currentFilter);
        
        if (shouldShow) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
        } else {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
    });

    // Filtrar ciudades
    cityMarkers.forEach(marker => {
        if (showCities) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
        } else {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Buscador
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }
        
        const results = performSearch(query);
        displaySearchResults(results);
    });
    
    searchInput.addEventListener('focus', function() {
        if (this.value.length >= 2) {
            const query = this.value.toLowerCase().trim();
            const results = performSearch(query);
            displaySearchResults(results);
        }
    });
    
    // Cerrar resultados al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            searchResults.classList.remove('active');
        }
    });
    
    // Filtro de estado
    document.getElementById('statusFilter').addEventListener('change', function() {
        currentFilter = this.value;
        applyFilters();
    });

    // Toggle de hospitales
    document.getElementById('toggleHospitals').addEventListener('change', function() {
        showHospitals = this.checked;
        applyFilters();
    });

    // Toggle de ciudades
    document.getElementById('toggleCities').addEventListener('change', function() {
        showCities = this.checked;
        applyFilters();
    });

    // Toggle de rutas
    document.getElementById('toggleRoutes').addEventListener('change', function() {
        showRoutes = this.checked;
        // Implementar en futuras capas
    });

    // Toggle de provincias
    document.getElementById('toggleProvinces').addEventListener('change', function() {
        showProvinces = this.checked;
        // Implementar en futuras capas
    });
}

// ===== UTILIDADES =====
function clearMarkers() {
    hospitalMarkers.forEach(marker => map.removeLayer(marker));
    cityMarkers.forEach(marker => map.removeLayer(marker));
    hospitalMarkers = [];
    cityMarkers = [];
}

// ===== BUSCADOR =====
function performSearch(query) {
    const results = [];
    
    // Buscar hospitales
    hospitalNetwork.hospitals.forEach(hospital => {
        if (hospital.nombre.toLowerCase().includes(query) || 
            hospital.ciudad.toLowerCase().includes(query)) {
            results.push({
                type: 'hospital',
                name: hospital.nombre,
                location: hospital.ciudad,
                lat: hospital.geolocalizacion.latitud,
                lon: hospital.geolocalizacion.longitud,
                data: hospital
            });
        }
    });
    
    // Buscar ciudades
    const cities = [
        { name: "Alta Gracia", lat: -31.6529, lon: -64.4283 },
        { name: "Córdoba", lat: -31.4201, lon: -64.1888 },
        { name: "Villa Carlos Paz", lat: -31.4167, lon: -64.5000 },
        { name: "Anisacate", lat: -31.6833, lon: -64.4500 },
        { name: "Villa del Prado", lat: -31.6333, lon: -64.4000 },
        { name: "Malagueño", lat: -31.5667, lon: -64.3667 },
        { name: "Despeñaderos", lat: -31.9167, lon: -64.3833 },
        { name: "Rafael García", lat: -31.7000, lon: -64.4500 },
        { name: "Los Cedros", lat: -31.7000, lon: -64.4167 },
        { name: "Falda del Carmen", lat: -31.6833, lon: -64.4333 },
        { name: "La Bolsa", lat: -31.6500, lon: -64.4500 },
        { name: "Villa General Belgrano", lat: -31.6833, lon: -64.4667 },
        { name: "Santa Rosa de Calamuchita", lat: -32.0000, lon: -64.4500 },
        { name: "Embalse", lat: -32.1833, lon: -64.4167 },
        { name: "Villa Alberto", lat: -31.7167, lon: -64.4333 }
    ];
    
    cities.forEach(city => {
        if (city.name.toLowerCase().includes(query)) {
            results.push({
                type: 'city',
                name: city.name,
                location: city.name,
                lat: city.lat,
                lon: city.lon,
                data: city
            });
        }
    });
    
    return results.slice(0, 10); // Limitar a 10 resultados
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No se encontraron resultados</div>';
        searchResults.classList.add('active');
        return;
    }
    
    searchResults.innerHTML = results.map(result => `
        <div class="search-result-item" onclick="selectSearchResult(${result.lat}, ${result.lon}, '${result.type}')">
            <div class="result-name">${result.name}</div>
            <div class="result-type">${result.type === 'hospital' ? '🏥 Hospital' : '📍 Localidad'} - ${result.location}</div>
        </div>
    `).join('');
    
    searchResults.classList.add('active');
}

function selectSearchResult(lat, lon, type) {
    // Centrar mapa en el resultado
    map.flyTo([lat, lon], type === 'hospital' ? 14 : 12, {
        duration: 1.5
    });
    
    // Cerrar resultados
    document.getElementById('searchResults').classList.remove('active');
    document.getElementById('searchInput').value = '';
    
    // Si es hospital, mostrar el detalle
    if (type === 'hospital') {
        const hospital = hospitalNetwork.hospitals.find(h => 
            h.geolocalizacion.latitud === lat && h.geolocalizacion.longitud === lon
        );
        if (hospital) {
            setTimeout(() => showHospitalDetail(hospital), 1500);
        }
    }
}

function getStatusClass(estado) {
    switch (estado) {
        case 'NORMAL':
            return 'normal';
        case 'ADVERTENCIA':
            return 'warning';
        case 'ALTA DEMANDA':
            return 'high-demand';
        case 'SATURADO':
            return 'saturated';
        case 'FUERA DE SERVICIO':
            return 'out-of-service';
        default:
            return 'normal';
    }
}

function getOccupationClass(percentage) {
    if (percentage >= 90) return 'saturated';
    if (percentage >= 80) return 'high-demand';
    if (percentage >= 70) return 'warning';
    return 'normal';
}

// ===== FUNCIONES PARA FUTURAS CAPAS =====
// Estas funciones están preparadas para ser utilizadas en capas futuras

// Función para actualizar marcadores durante simulaciones (Capa 5)
function updateHospitalMarkers() {
    hospitalMarkers.forEach((marker, index) => {
        const hospital = hospitalNetwork.hospitals[index];
        if (!hospital || !hospital.geolocalizacion) return;

        const statusClass = getStatusClass(hospital.estado);
        
        // Actualizar icono
        const newIcon = L.divIcon({
            className: 'hospital-marker',
            html: `
                <div class="hospital-icon ${statusClass}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-4h8v4"></path>
                    </svg>
                </div>
                <div class="hospital-pulse ${statusClass}"></div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });

        marker.setIcon(newIcon);
        marker.setPopupContent(createHospitalPopup(hospital));
    });

    updateNetworkStatistics();
}

// Función para agregar catástrofes (Capa 4)
function addDisasterMarker(disaster) {
    // Implementar en Capa 4
    console.log('Función preparada para Capa 4: Catástrofes');
}

// Función para mostrar rutas de ambulancias (Capa 6)
function showAmbulanceRoute(fromHospital, toHospital) {
    // Implementar en Capa 6
    console.log('Función preparada para Capa 6: Rutas de ambulancias');
}

// Función para mostrar zonas de afectación (Capa 4)
function showAffectedZone(center, radius) {
    // Implementar en Capa 4
    console.log('Función preparada para Capa 4: Zonas de afectación');
}