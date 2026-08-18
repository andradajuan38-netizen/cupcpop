// HOSPITAL COMMAND NETWORK - CAPA 1
// Lógica principal de la aplicación
// Este archivo maneja el renderizado, cálculos, filtros, búsqueda y interacciones

// ===== VARIABLES GLOBALES =====
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'name';
let filteredHospitals = [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar si NO estamos en páginas especiales
    if (document.body.classList.contains('emergency-view') || 
        document.body.classList.contains('simulation-view')) {
        return;
    }
    
    initializeApp();
});

function initializeApp() {
    // Inicializar datos
    filteredHospitals = [...hospitalNetwork.hospitals];
    renderActiveEmergencyBanner();
    renderEmergencyReport();
    renderResourcesOverview();
    
    // Renderizar componentes
    updateDateTime();
    renderStatistics();
    renderHospitals();
    renderMap();
    updateNetworkStatus();
    
    // Configurar event listeners
    setupEventListeners();
    const initialSection = window.location.hash.slice(1);
    if (document.getElementById(initialSection)) {
        navigateToSection(initialSection);
    }
    
    // Actualizar fecha/hora cada segundo
    setInterval(updateDateTime, 1000);
}

function renderActiveEmergencyBanner() {
    const emergency = typeof loadActiveEmergency === 'function' ? loadActiveEmergency() : null;
    const banner = document.getElementById('activeSimulationBanner');
    if (!banner || !emergency) return;

    const state = typeof loadSharedSimulationState === 'function' ? loadSharedSimulationState() : null;
    const isSimulating = state?.active;
    banner.style.display = 'block';
    banner.querySelector('h3').textContent = isSimulating ? 'SIMULACIÓN EN CURSO' : '🚨 EMERGENCIA ACTIVA';
    document.getElementById('bannerEmergencyType').textContent = getEmergencyTypeName(emergency.type).toUpperCase();
    document.getElementById('bannerLocation').textContent = emergency.location.name.toUpperCase();
    document.getElementById('bannerTimeLabel').textContent = isSimulating ? 'Tiempo:' : 'Estado:';
    document.getElementById('bannerTime').textContent = isSimulating ? `T+ ${state.simulationTime}` : 'ACTIVA';
    document.getElementById('bannerHospitalLabel').textContent = isSimulating ? 'Hospitales saturados:' : 'Hospitales afectados:';
    document.getElementById('bannerSaturated').textContent = isSimulating ? (state.networkMetrics?.hospitalsSaturated || 0) : emergency.affectedHospitals.length;
    document.getElementById('bannerPatients').textContent = isSimulating ? state.patientsGenerated : emergency.estimatedAffected;
}

function renderEmergencyReport() {
    const content = document.getElementById('emergencyReportContent');
    const badge = document.getElementById('reportStatusBadge');
    if (!content || !badge || typeof getSharedEmergencyHistory !== 'function') return;

    const emergency = typeof loadActiveEmergency === 'function' ? loadActiveEmergency() : null;
    const history = getSharedEmergencyHistory();
    const completed = history.filter(item => ['COMPLETED', 'CANCELLED'].includes(String(item.status).toUpperCase()));

    if (!emergency && history.length === 0) return;

    const reportEmergency = emergency || history[history.length - 1];
    const report = reportEmergency.catastropheReport ||
        (typeof calculateCatastropheReport === 'function' ? calculateCatastropheReport(reportEmergency) : null);

    badge.textContent = emergency ? 'EMERGENCIA ACTIVA' : 'HISTORIAL DISPONIBLE';
    badge.className = `status-badge ${emergency ? 'danger' : 'normal'}`;
    content.innerHTML = `
        <p><strong>${getEmergencyTypeName(reportEmergency.type).toUpperCase()}</strong> en ${reportEmergency.location.name}.</p>
        <p>Severidad: ${reportEmergency.severity.toUpperCase()} | Estado: ${String(reportEmergency.status).toUpperCase()}</p>
        <div class="report-grid">
            <p><strong>Afectados estimados:</strong> ${report?.affectedPopulation || 0}</p>
            <p><strong>Heridos:</strong> ${report?.injured || 0}</p>
            <p><strong>Heridos críticos:</strong> ${report?.criticalInjured || 0}</p>
            <p><strong>Fallecidos estimados:</strong> ${report?.fatalities || 0}</p>
            <p><strong>Hospitales afectados:</strong> ${report?.affectedHospitals || 0}</p>
            <p><strong>Hospitales operativos:</strong> ${report?.operationalHospitals || 0}</p>
            <p><strong>Camas comprometidas:</strong> ${report?.bedsCompromised || 0}</p>
            <p><strong>Destrucción:</strong> ${report?.destructionLevel || 'SIN DATOS'} (${report?.destructionScore || 0}/100)</p>
            <p><strong>Presión de recursos:</strong> ${report?.resourcesPressure || 'SIN DATOS'}</p>
            <p><strong>Riesgo de red:</strong> ${report?.networkRisk || 'SIN DATOS'}</p>
            <p><strong>Camas disponibles:</strong> ${report?.resources?.bedsAvailable || 0}</p>
            <p><strong>Camas críticas disponibles:</strong> ${report?.resources?.criticalBedsAvailable || 0}</p>
            <p><strong>Ambulancias disponibles:</strong> ${report?.resources?.ambulancesAvailable || 0}</p>
            <p><strong>Quirófanos disponibles:</strong> ${report?.resources?.operatingRoomsAvailable || 0}</p>
            <p><strong>Insumos promedio:</strong> ${report?.resources?.averageSupplies || 0}%</p>
        </div>
        <p class="report-disclaimer">Valores estimados por el motor de emergencias. No representan un conteo forense real.</p>
        <p>Emergencias registradas: ${history.length} | Finalizadas o canceladas: ${completed.length}</p>
        <p>El detalle completo y las alertas están disponibles en la Central de Emergencias.</p>
    `;
}

function renderResourcesOverview() {
    const container = document.getElementById('resourcesOverview');
    if (!container) return;

    const hospitals = hospitalNetwork.hospitals;
    const resources = hospitals.reduce((total, hospital) => {
        total.beds += hospital.camas.disponibles;
        total.totalBeds += hospital.camas.totales;
        total.criticalBeds += hospital.camasCriticas.disponibles;
        total.totalCriticalBeds += hospital.camasCriticas.totales;
        total.ambulances += hospital.ambulancias.disponibles;
        total.operatingRooms += hospital.quirófanos.disponibles;
        total.totalOperatingRooms += hospital.quirófanos.totales;
        total.supplies += hospital.insumos.porcentajeDisponible;
        total.staff += hospital.personal.disponible;
        total.totalStaff += hospital.personal.total;
        return total;
    }, { beds: 0, totalBeds: 0, criticalBeds: 0, totalCriticalBeds: 0, ambulances: 0, operatingRooms: 0, totalOperatingRooms: 0, supplies: 0, staff: 0, totalStaff: 0 });
    const emergency = typeof loadActiveEmergency === 'function' ? loadActiveEmergency() : null;
    const report = emergency && typeof calculateCatastropheReport === 'function'
        ? (emergency.catastropheReport || calculateCatastropheReport(emergency))
        : null;

    const supplies = hospitals.length ? Math.round(resources.supplies / hospitals.length) : 0;
    const bedsAvailability = resources.totalBeds ? Math.round((resources.beds / resources.totalBeds) * 100) : 0;
    const criticalBedsAvailability = resources.totalCriticalBeds ? Math.round((resources.criticalBeds / resources.totalCriticalBeds) * 100) : 0;
    const operatingAvailability = resources.totalOperatingRooms ? Math.round((resources.operatingRooms / resources.totalOperatingRooms) * 100) : 0;
    const staffAvailability = resources.totalStaff ? Math.round((resources.staff / resources.totalStaff) * 100) : 0;
    const pressure = report?.resourcesPressure || 'SIN EMERGENCIA ACTIVA';
    const pressureClass = pressure === 'ALTA PRESIÓN' ? 'critical' : pressure === 'PRESIÓN MODERADA' ? 'warning' : 'stable';
    const sortedHospitals = [...hospitals].sort((a, b) => a.porcentajeOcupacion - b.porcentajeOcupacion);

    container.innerHTML = `
        <div class="resources-dashboard">
            <div class="resources-heading">
                <div>
                    <span class="resources-eyebrow">LECTURA OPERATIVA</span>
                    <h3>Capacidad disponible de la red</h3>
                </div>
                <div class="resources-network-count"><strong>${hospitals.length}</strong><span>hospitales conectados</span></div>
            </div>
            <div class="resource-metric-grid">
                <div class="resource-metric-card beds">
                    <div class="resource-metric-top"><span class="resource-icon">🛏️</span><span>CAMAS</span></div>
                    <strong>${resources.beds}</strong><small>disponibles de ${resources.totalBeds}</small>
                    <div class="resource-progress"><span style="width:${bedsAvailability}%"></span></div><em>${bedsAvailability}% de reserva</em>
                </div>
                <div class="resource-metric-card critical-beds">
                    <div class="resource-metric-top"><span class="resource-icon">🔴</span><span>CAMAS CRÍTICAS</span></div>
                    <strong>${resources.criticalBeds}</strong><small>UCI disponibles de ${resources.totalCriticalBeds}</small>
                    <div class="resource-progress"><span style="width:${criticalBedsAvailability}%"></span></div><em>${criticalBedsAvailability}% de reserva</em>
                </div>
                <div class="resource-metric-card ambulances">
                    <div class="resource-metric-top"><span class="resource-icon">🚑</span><span>AMBULANCIAS</span></div>
                    <strong>${resources.ambulances}</strong><small>unidades disponibles</small>
                    <div class="resource-card-note">Respuesta territorial activa</div>
                </div>
                <div class="resource-metric-card operating">
                    <div class="resource-metric-top"><span class="resource-icon">🔬</span><span>QUIRÓFANOS</span></div>
                    <strong>${resources.operatingRooms}</strong><small>disponibles de ${resources.totalOperatingRooms}</small>
                    <div class="resource-progress"><span style="width:${operatingAvailability}%"></span></div><em>${operatingAvailability}% de reserva</em>
                </div>
                <div class="resource-metric-card supplies">
                    <div class="resource-metric-top"><span class="resource-icon">💊</span><span>INSUMOS</span></div>
                    <strong>${supplies}%</strong><small>promedio de disponibilidad</small>
                    <div class="resource-progress"><span style="width:${supplies}%"></span></div><em>Control de abastecimiento</em>
                </div>
                <div class="resource-metric-card staff">
                    <div class="resource-metric-top"><span class="resource-icon">👥</span><span>PERSONAL</span></div>
                    <strong>${resources.staff}</strong><small>disponibles de ${resources.totalStaff}</small>
                    <div class="resource-progress"><span style="width:${staffAvailability}%"></span></div><em>${staffAvailability}% de disponibilidad</em>
                </div>
            </div>
            <div class="resource-pressure-panel ${pressureClass}">
                <div><span class="pressure-dot"></span><strong>${pressure}</strong><p>${report ? `${report.affectedHospitals} hospitales afectados · ${report.bedsCompromised} camas comprometidas` : 'La red se encuentra sin una emergencia activa.'}</p></div>
                <a href="emergencies.html">VER SITUACIÓN</a>
            </div>
            <div class="resources-analysis-grid">
                <section class="resource-chart-panel">
                    <div class="resource-panel-heading"><div><span class="resources-eyebrow">CAPACIDAD</span><h4>Disponibilidad por recurso</h4></div><span class="panel-unit">%</span></div>
                    ${[
                        ['Camas generales', bedsAvailability, 'blue'],
                        ['Camas críticas', criticalBedsAvailability, 'red'],
                        ['Quirófanos', operatingAvailability, 'violet'],
                        ['Personal', staffAvailability, 'cyan'],
                        ['Insumos', supplies, 'green']
                    ].map(([label, value, color]) => `<div class="resource-chart-row"><span>${label}</span><div class="resource-bar"><i class="${color}" style="width:${value}%"></i></div><strong>${value}%</strong></div>`).join('')}
                </section>
                <section class="resource-chart-panel">
                    <div class="resource-panel-heading"><div><span class="resources-eyebrow">DISTRIBUCIÓN</span><h4>Camas libres por hospital</h4></div><span class="panel-unit">RED</span></div>
                    ${sortedHospitals.slice(0, 8).map(hospital => {
                        const value = hospital.camas.disponibles;
                        const width = resources.beds ? Math.max(4, Math.round((value / resources.beds) * 100)) : 0;
                        return `<div class="resource-chart-row hospital-row"><span title="${hospital.nombre}">${hospital.id} · ${hospital.ciudad}</span><div class="resource-bar"><i class="blue" style="width:${width}%"></i></div><strong>${value}</strong></div>`;
                    }).join('')}
                </section>
            </div>
            <section class="resource-table-panel">
                <div class="resource-panel-heading"><div><span class="resources-eyebrow">MONITOREO DETALLADO</span><h4>Estado de recursos por hospital</h4></div><span class="panel-unit">${hospitals.length} REGISTROS</span></div>
                <div class="resource-table-wrap"><table class="resource-table"><thead><tr><th>Hospital</th><th>Ubicación</th><th>Camas libres</th><th>UCI libres</th><th>Insumos</th><th>Estado</th></tr></thead><tbody>
                    ${sortedHospitals.map(hospital => `<tr><td><strong>${hospital.id}</strong> ${hospital.nombre}</td><td>${hospital.ciudad}</td><td>${hospital.camas.disponibles} / ${hospital.camas.totales}</td><td>${hospital.camasCriticas.disponibles} / ${hospital.camasCriticas.totales}</td><td><span class="table-percent">${hospital.insumos.porcentajeDisponible}%</span></td><td><span class="table-status ${getStatusClass(hospital.estado)}">${hospital.estado}</span></td></tr>`).join('')}
                </tbody></table></div>
            </section>
        </div>
    `;
}

// ===== FECHA Y HORA =====
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const dateTimeString = now.toLocaleDateString('es-ES', options);
    document.getElementById('currentDateTime').textContent = dateTimeString;
}

// ===== ESTADÍSTICAS GENERALES =====
function renderStatistics() {
    const hospitals = hospitalNetwork.hospitals;
    
    // Calcular estadísticas
    const totalHospitals = hospitals.length;
    const normalHospitals = hospitals.filter(h => h.estado === 'NORMAL').length;
    const alertHospitals = hospitals.filter(h => 
        h.estado === 'ADVERTENCIA' || h.estado === 'ALTA DEMANDA'
    ).length;
    const saturatedHospitals = hospitals.filter(h => h.estado === 'SATURADO').length;
    
    const totalBeds = hospitals.reduce((sum, h) => sum + h.camas.totales, 0);
    const occupiedBeds = hospitals.reduce((sum, h) => sum + h.camas.ocupadas, 0);
    const availableBeds = hospitals.reduce((sum, h) => sum + h.camas.disponibles, 0);
    const averageOccupation = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    
    const totalCriticalBeds = hospitals.reduce((sum, h) => sum + h.camasCriticas.totales, 0);
    const occupiedCriticalBeds = hospitals.reduce((sum, h) => sum + h.camasCriticas.ocupadas, 0);
    const availableCriticalBeds = totalCriticalBeds - occupiedCriticalBeds;
    
    const availableAmbulances = hospitals.reduce((sum, h) => sum + h.ambulancias.disponibles, 0);
    
    // Actualizar DOM
    document.getElementById('totalHospitals').textContent = totalHospitals;
    document.getElementById('normalHospitals').textContent = normalHospitals;
    document.getElementById('alertHospitals').textContent = alertHospitals;
    document.getElementById('saturatedHospitals').textContent = saturatedHospitals;
    document.getElementById('averageOccupation').textContent = averageOccupation + '%';
    document.getElementById('availableBeds').textContent = availableBeds;
    document.getElementById('availableCriticalBeds').textContent = availableCriticalBeds;
    document.getElementById('availableAmbulances').textContent = availableAmbulances;
}

// ===== ESTADO DE LA RED =====
function updateNetworkStatus() {
    const hospitals = hospitalNetwork.hospitals;
    const saturatedCount = hospitals.filter(h => h.estado === 'SATURADO').length;
    const alertCount = hospitals.filter(h => 
        h.estado === 'ADVERTENCIA' || h.estado === 'ALTA DEMANDA'
    ).length;
    
    const statusIndicator = document.getElementById('networkStatusIndicator');
    
    if (saturatedCount > 0) {
        statusIndicator.className = 'status-indicator saturated';
        statusIndicator.textContent = 'SATURADO';
    } else if (alertCount > 0) {
        statusIndicator.className = 'status-indicator high-demand';
        statusIndicator.textContent = 'ALTA DEMANDA';
    } else {
        statusIndicator.className = 'status-indicator normal';
        statusIndicator.textContent = 'NORMAL';
    }
}

// ===== RENDERIZADO DE HOSPITALES =====
function renderHospitals() {
    applyFilters();
    
    const container = document.getElementById('hospitalsGrid');
    const listContainer = document.getElementById('hospitalsListSection');
    
    // Aplicar ordenamiento
    sortHospitals();
    
    const hospitalsHTML = filteredHospitals.map(hospital => createHospitalCard(hospital)).join('');
    
    if (container) container.innerHTML = hospitalsHTML;
    if (listContainer) listContainer.innerHTML = hospitalsHTML;
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.view-hospital-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const hospitalId = this.getAttribute('data-hospital-id');
            showHospitalDetail(hospitalId);
        });
    });
}

function createHospitalCard(hospital) {
    const statusClass = getStatusClass(hospital.estado);
    const occupationClass = getOccupationClass(hospital.porcentajeOcupacion);
    
    // Determinar si los valores son críticos
    const bedsWarning = hospital.camas.disponibles < 50;
    const criticalWarning = hospital.camasCriticas.disponibles < 10;
    
    return `
        <div class="hospital-card ${statusClass}" data-hospital-id="${hospital.id}">
            <div class="hospital-card-header">
                <div>
                    <h4 class="hospital-name">${hospital.nombre}</h4>
                    <p class="hospital-location">${hospital.ciudad} - ${hospital.zona}</p>
                </div>
                <span class="hospital-status ${statusClass}">${hospital.estado}</span>
            </div>
            
            <div class="hospital-occupation">
                <div class="occupation-label">
                    <span>Ocupación</span>
                    <span>${hospital.porcentajeOcupacion}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${occupationClass}" style="width: ${hospital.porcentajeOcupacion}%"></div>
                </div>
            </div>
            
            <div class="hospital-metrics">
                <div class="metric">
                    <span class="metric-label">Camas Disponibles</span>
                    <span class="metric-value ${bedsWarning ? 'warning' : ''}">${hospital.camas.disponibles}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Camas Críticas</span>
                    <span class="metric-value ${criticalWarning ? 'danger' : ''}">${hospital.camasCriticas.disponibles}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Guardia</span>
                    <span class="metric-value">${hospital.guardia.porcentajeOcupada}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Personal</span>
                    <span class="metric-value">${hospital.personal.disponible}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Quirófanos</span>
                    <span class="metric-value">${hospital.quirófanos.disponibles}/${hospital.quirófanos.totales}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Ambulancias</span>
                    <span class="metric-value">${hospital.ambulancias.disponibles}</span>
                </div>
            </div>
            
            <div class="hospital-card-footer">
                <div class="quick-info">
                    <span>📍 ${hospital.zona}</span>
                    <span>🏥 ${hospital.id}</span>
                </div>
                <button class="view-hospital-btn" data-hospital-id="${hospital.id}">Ver Hospital</button>
            </div>
        </div>
    `;
}

// ===== FILTROS =====
function applyFilters() {
    filteredHospitals = hospitalNetwork.hospitals.filter(hospital => {
        // Filtro por estado
        if (currentFilter !== 'all' && hospital.estado !== currentFilter) {
            return false;
        }
        
        // Filtro por búsqueda
        if (currentSearch && !hospital.nombre.toLowerCase().includes(currentSearch.toLowerCase())) {
            return false;
        }
        
        return true;
    });
}

// ===== ORDENAMIENTO =====
function sortHospitals() {
    switch (currentSort) {
        case 'name':
            filteredHospitals.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case 'occupation':
            filteredHospitals.sort((a, b) => b.porcentajeOcupacion - a.porcentajeOcupacion);
            break;
        case 'availableBeds':
            filteredHospitals.sort((a, b) => a.camas.disponibles - b.camas.disponibles);
            break;
        case 'criticalBeds':
            filteredHospitals.sort((a, b) => a.camasCriticas.disponibles - b.camasCriticas.disponibles);
            break;
        case 'risk':
            const riskOrder = { 'SATURADO': 4, 'ALTA DEMANDA': 3, 'ADVERTENCIA': 2, 'NORMAL': 1 };
            filteredHospitals.sort((a, b) => riskOrder[b.estado] - riskOrder[a.estado]);
            break;
    }
}

// ===== DETALLE DE HOSPITAL =====
function showHospitalDetail(hospitalId) {
    const hospital = hospitalNetwork.hospitals.find(h => h.id === hospitalId);
    if (!hospital) return;
    
    const statusClass = getStatusClass(hospital.estado);
    const occupationClass = getOccupationClass(hospital.porcentajeOcupacion);
    
    // Llenar datos del modal
    document.getElementById('modalHospitalName').textContent = hospital.nombre;
    document.getElementById('modalLocation').textContent = `${hospital.ciudad} - ${hospital.zona}`;
    
    const statusBadge = document.getElementById('modalStatus');
    statusBadge.textContent = hospital.estado;
    statusBadge.className = `detail-value status-badge ${statusClass}`;
    
    // Camas
    document.getElementById('modalTotalBeds').textContent = hospital.camas.totales;
    document.getElementById('modalOccupiedBeds').textContent = hospital.camas.ocupadas;
    document.getElementById('modalAvailableBeds').textContent = hospital.camas.disponibles;
    document.getElementById('modalBedsProgress').className = `progress-fill ${occupationClass}`;
    document.getElementById('modalBedsProgress').style.width = `${hospital.porcentajeOcupacion}%`;
    
    // Camas críticas
    const criticalOccupation = Math.round((hospital.camasCriticas.ocupadas / hospital.camasCriticas.totales) * 100);
    document.getElementById('modalTotalCritical').textContent = hospital.camasCriticas.totales;
    document.getElementById('modalOccupiedCritical').textContent = hospital.camasCriticas.ocupadas;
    document.getElementById('modalAvailableCritical').textContent = hospital.camasCriticas.disponibles;
    document.getElementById('modalCriticalProgress').className = `progress-fill ${getOccupationClass(criticalOccupation)}`;
    document.getElementById('modalCriticalProgress').style.width = `${criticalOccupation}%`;
    
    // Guardia
    document.getElementById('modalGuardia').textContent = hospital.guardia.porcentajeOcupada + '%';
    document.getElementById('modalGuardiaProgress').className = `progress-fill ${getOccupationClass(hospital.guardia.porcentajeOcupada)}`;
    document.getElementById('modalGuardiaProgress').style.width = `${hospital.guardia.porcentajeOcupada}%`;
    
    // Personal
    const personalAvailable = Math.round((hospital.personal.disponible / hospital.personal.total) * 100);
    document.getElementById('modalTotalPersonal').textContent = hospital.personal.total;
    document.getElementById('modalAvailablePersonal').textContent = hospital.personal.disponible;
    document.getElementById('modalPersonalProgress').className = `progress-fill ${getOccupationClass(100 - personalAvailable)}`;
    document.getElementById('modalPersonalProgress').style.width = `${personalAvailable}%`;
    
    // Quirófanos
    document.getElementById('modalTotalQuirofanos').textContent = hospital.quirófanos.totales;
    document.getElementById('modalAvailableQuirofanos').textContent = hospital.quirófanos.disponibles;
    
    // Ambulancias
    document.getElementById('modalAmbulancias').textContent = hospital.ambulancias.disponibles;
    
    // Insumos
    document.getElementById('modalInsumos').textContent = hospital.insumos.porcentajeDisponible + '%';
    document.getElementById('modalInsumosProgress').className = `progress-fill ${getOccupationClass(100 - hospital.insumos.porcentajeDisponible)}`;
    document.getElementById('modalInsumosProgress').style.width = `${hospital.insumos.porcentajeDisponible}%`;
    
    // Generar alertas
    const alerts = generateHospitalAlerts(hospital);
    const alertsContainer = document.getElementById('modalAlerts');
    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <span>⚠️</span>
            <span>${alert.message}</span>
        </div>
    `).join('');
    
    // Mostrar modal
    document.getElementById('hospitalModal').classList.add('active');
}

function generateHospitalAlerts(hospital) {
    const alerts = [];
    
    if (hospital.camas.disponibles < 20) {
        alerts.push({
            type: 'danger',
            message: `Camas generales críticas: solo ${hospital.camas.disponibles} disponibles`
        });
    } else if (hospital.camas.disponibles < 50) {
        alerts.push({
            type: 'warning',
            message: `Camas generales bajas: ${hospital.camas.disponibles} disponibles`
        });
    }
    
    if (hospital.camasCriticas.disponibles < 5) {
        alerts.push({
            type: 'danger',
            message: `Camas críticas críticas: solo ${hospital.camasCriticas.disponibles} disponibles`
        });
    } else if (hospital.camasCriticas.disponibles < 10) {
        alerts.push({
            type: 'warning',
            message: `Camas críticas bajas: ${hospital.camasCriticas.disponibles} disponibles`
        });
    }
    
    if (hospital.insumos.porcentajeDisponible < 30) {
        alerts.push({
            type: 'danger',
            message: `Insumos críticos: solo ${hospital.insumos.porcentajeDisponible}% disponible`
        });
    } else if (hospital.insumos.porcentajeDisponible < 50) {
        alerts.push({
            type: 'warning',
            message: `Insumos bajos: ${hospital.insumos.porcentajeDisponible}% disponible`
        });
    }
    
    if (hospital.quirófanos.disponibles === 0) {
        alerts.push({
            type: 'danger',
            message: 'No hay quirófanos disponibles'
        });
    } else if (hospital.quirófanos.disponibles < 2) {
        alerts.push({
            type: 'warning',
            message: `Solo ${hospital.quirófanos.disponibles} quirófanos disponibles`
        });
    }
    
    const personalAvailable = (hospital.personal.disponible / hospital.personal.total) * 100;
    if (personalAvailable < 30) {
        alerts.push({
            type: 'danger',
            message: `Personal crítico: solo ${personalAvailable.toFixed(0)}% disponible`
        });
    } else if (personalAvailable < 50) {
        alerts.push({
            type: 'warning',
            message: `Personal bajo: ${personalAvailable.toFixed(0)}% disponible`
        });
    }
    
    if (alerts.length === 0) {
        alerts.push({
            type: 'normal',
            message: 'Todos los recursos dentro de parámetros normales'
        });
    }
    
    return alerts;
}

// ===== MAPA =====
function renderMap() {
    const mapContainer = document.getElementById('networkMap');
    if (!mapContainer) return;
    
    // Crear fondo del mapa
    mapContainer.innerHTML = `
        <div class="map-background"></div>
        <div class="map-grid"></div>
    `;
    
    // Agregar marcadores de hospitales
    hospitalNetwork.hospitals.forEach(hospital => {
        const marker = document.createElement('div');
        marker.className = `map-marker ${getStatusClass(hospital.estado)}`;
        marker.style.left = `${hospital.coordenadas.x}%`;
        marker.style.top = `${hospital.coordenadas.y}%`;
        marker.textContent = hospital.id.replace('H', '');
        marker.title = hospital.nombre;
        marker.setAttribute('data-hospital-id', hospital.id);
        
        marker.addEventListener('click', function() {
            showHospitalDetail(hospital.id);
        });
        
        mapContainer.appendChild(marker);
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Navegación
    document.querySelectorAll('.nav-item:not(.disabled)').forEach(item => {
        // Excluir el enlace de Mapa que tiene navegación externa
        if (item.id === 'mapLink') {
            return; // No agregar event listener al enlace de mapa
        }
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });

    window.addEventListener('hashchange', function() {
        const section = window.location.hash.slice(1);
        if (document.getElementById(section)) {
            navigateToSection(section, false);
        }
    });
    
    // Filtros
    document.getElementById('searchInput').addEventListener('input', function() {
        currentSearch = this.value;
        renderHospitals();
    });
    
    document.getElementById('statusFilter').addEventListener('change', function() {
        currentFilter = this.value;
        renderHospitals();
    });
    
    document.getElementById('sortBy').addEventListener('change', function() {
        currentSort = this.value;
        renderHospitals();
    });
    
    // Modal
    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('hospitalModal').classList.remove('active');
    });
    
    document.getElementById('hospitalModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
    
    // Tecla ESC para cerrar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.getElementById('hospitalModal').classList.remove('active');
        }
    });
}

// ===== NAVEGACIÓN =====
function navigateToSection(sectionId, updateHash = true) {
    if (updateHash && window.location.hash !== `#${sectionId}`) {
        history.replaceState(null, '', `#${sectionId}`);
    }
    // Actualizar navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Mostrar sección correspondiente
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
    
    // Renderizar contenido específico de la sección
    if (sectionId === 'map') {
        renderMap();
    } else if (sectionId === 'hospitals') {
        renderHospitals();
    } else if (sectionId === 'resources') {
        renderResourcesOverview();
    } else if (sectionId === 'reports') {
        renderEmergencyReport();
    }
}

// ===== UTILIDADES =====
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

// Función para actualizar datos de un hospital específico
function updateHospitalData(hospitalId, newData) {
    const hospital = hospitalNetwork.hospitals.find(h => h.id === hospitalId);
    if (hospital) {
        Object.assign(hospital, newData);
        // Recalcular estado
        hospital.estado = calcularEstadoHospital(hospital);
        // Actualizar timestamp
        hospitalNetwork.lastUpdated = new Date().toISOString();
        // Re-renderizar
        renderStatistics();
        renderHospitals();
        renderMap();
        updateNetworkStatus();
    }
}

// Función para obtener estadísticas de la red
function getNetworkStatistics() {
    const hospitals = hospitalNetwork.hospitals;
    return {
        totalHospitals: hospitals.length,
        normalHospitals: hospitals.filter(h => h.estado === 'NORMAL').length,
        warningHospitals: hospitals.filter(h => h.estado === 'ADVERTENCIA').length,
        highDemandHospitals: hospitals.filter(h => h.estado === 'ALTA DEMANDA').length,
        saturatedHospitals: hospitals.filter(h => h.estado === 'SATURADO').length,
        totalBeds: hospitals.reduce((sum, h) => sum + h.camas.totales, 0),
        availableBeds: hospitals.reduce((sum, h) => sum + h.camas.disponibles, 0),
        totalCriticalBeds: hospitals.reduce((sum, h) => sum + h.camasCriticas.totales, 0),
        availableCriticalBeds: hospitals.reduce((sum, h) => sum + h.camasCriticas.disponibles, 0),
        totalAmbulances: hospitals.reduce((sum, h) => sum + h.ambulancias.disponibles, 0),
        averageOccupation: Math.round(
            hospitals.reduce((sum, h) => sum + h.porcentajeOcupacion, 0) / hospitals.length
        )
    };
}

// Función para simular cambios en la red (preparada para Capa 5)
function simulateNetworkChange(changes) {
    changes.forEach(change => {
        updateHospitalData(change.hospitalId, change.data);
    });
}

// Función para exportar datos (preparada para capas futuras)
function exportNetworkData() {
    return JSON.stringify(hospitalNetwork, null, 2);
}

// Función para importar datos (preparada para capas futuras)
function importNetworkData(data) {
    try {
        const importedData = JSON.parse(data);
        if (importedData.hospitals && Array.isArray(importedData.hospitals)) {
            hospitalNetwork.hospitals = importedData.hospitals;
            hospitalNetwork.lastUpdated = new Date().toISOString();
            renderStatistics();
            renderHospitals();
            renderMap();
            updateNetworkStatus();
            return true;
        }
    } catch (e) {
        console.error('Error al importar datos:', e);
        return false;
    }
    return false;
}