// HOSPITAL COMMAND NETWORK - CAPA 2
// RENDERIZADO DEL DASHBOARD INDIVIDUAL DEL HOSPITAL
// Este módulo carga y muestra la información detallada de un hospital específico

let currentHospital = null;

/**
 * Inicialización al cargar la página
 */
document.addEventListener('DOMContentLoaded', function() {
    // Obtener ID del hospital desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const hospitalId = urlParams.get('id');
    
    if (!hospitalId) {
        console.error('No se especificó un hospital');
        alert('Error: No se especificó un hospital');
        window.location.href = 'map/index.html';
        return;
    }
    
    // Cargar el hospital
    loadHospital(hospitalId);
});

/**
 * Carga el hospital desde hospitalNetwork
 */
function loadHospital(hospitalId) {
    // Verificar que hospitalNetwork esté disponible
    if (typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        console.error('No se encontraron datos de hospitales');
        alert('Error: No se pudieron cargar los datos');
        return;
    }
    
    // Buscar el hospital por ID
    const hospital = hospitalNetwork.hospitals.find(h => h.id === hospitalId);
    
    if (!hospital) {
        console.error('Hospital no encontrado:', hospitalId);
        alert('Error: Hospital no encontrado');
        window.location.href = 'map/index.html';
        return;
    }
    
    // Actualizar métricas del hospital
    currentHospital = updateHospitalMetrics(hospital);
    
    console.log('Hospital cargado:', currentHospital);
    
    // Renderizar el dashboard
    renderHospital(currentHospital);
}

/**
 * Renderiza toda la información del hospital
 */
function renderHospital(hospital) {
    renderHeader(hospital);
    renderSidebar(hospital);
    renderSummaryCards(hospital);
    renderBedsModule(hospital);
    renderEmergencyModule(hospital);
    renderStaffModule(hospital);
    renderOperatingRoomsModule(hospital);
    renderAmbulancesModule(hospital);
    renderSuppliesModule(hospital);
    renderAreasModule(hospital);
}

/**
 * Renderiza el header del hospital
 */
function renderHeader(hospital) {
    document.getElementById('hospitalName').textContent = hospital.nombre;
    document.getElementById('hospitalLocation').textContent = `${hospital.ciudad}, ${hospital.geolocalizacion.provincia}`;
    
    const statusBadge = document.getElementById('hospitalStatusBadge');
    const statusClass = hospital.estado.toLowerCase().replace(/ /g, '-');
    statusBadge.className = `status-indicator ${getStatusClass(hospital.estado)}`;
    statusBadge.querySelector('.status-text').textContent = getStatusText(hospital.estado).replace(/^[🟢🟡🟠🔴⚫]\s*/, '');

    const emergency = typeof loadActiveEmergency === 'function' ? loadActiveEmergency() : null;
    if (emergency && emergency.affectedHospitals?.some(item => item.id === hospital.id)) {
        statusBadge.querySelector('.status-text').textContent = 'HOSPITAL AFECTADO POR EMERGENCIA';
        statusBadge.classList.add('emergency-affected');
    }

    const simulation = typeof loadSharedSimulationState === 'function' ? loadSharedSimulationState() : null;
    if (simulation?.active && hospital.estado === 'SATURADO') {
        statusBadge.querySelector('.status-text').textContent = 'HOSPITAL EN ESTADO CRÍTICO';
        statusBadge.classList.add('saturated');
    }
}

/**
 * Renderiza la barra lateral con estado general, riesgo y alertas
 */
function renderSidebar(hospital) {
    // Estado actual
    const currentStatus = document.getElementById('currentStatus');
    currentStatus.textContent = getStatusText(hospital.estado);
    currentStatus.className = `status-value ${getStatusClass(hospital.estado)}`;
    
    // Métricas generales
    document.getElementById('generalOccupancy').textContent = hospital.porcentajeOcupacion + '%';
    document.getElementById('emergencyOccupancy').textContent = hospital.guardia.porcentajeOcupada + '%';
    document.getElementById('criticalOccupancy').textContent = 
        calculateOccupancy(hospital.camasCriticas.ocupadas, hospital.camasCriticas.totales) + '%';
    document.getElementById('staffAvailability').textContent = 
        Math.round((hospital.personal.disponible / hospital.personal.total) * 100) + '%';
    
    // Indicador de riesgo
    const riskIndicator = document.getElementById('riskIndicator');
    const riskText = getRiskText(hospital.riesgo.level);
    riskIndicator.className = `risk-indicator ${hospital.riesgo.level}`;
    riskIndicator.querySelector('.risk-icon').textContent = riskText.icon;
    riskIndicator.querySelector('.risk-level').textContent = riskText.text;
    document.getElementById('riskScore').textContent = `Score: ${hospital.riesgo.score}/100`;
    
    // Alertas
    renderAlerts(hospital.alertas);
}

/**
 * Renderiza las alertas operativas
 */
function renderAlerts(alerts) {
    const container = document.getElementById('alertsContainer');
    const emergency = typeof loadActiveEmergency === 'function' ? loadActiveEmergency() : null;
    const affected = emergency?.affectedHospitals?.some(item => item.id === currentHospital?.id);
    if (affected) {
        alerts = [{
            type: 'danger',
            icon: '🚨',
            message: 'HOSPITAL AFECTADO POR EMERGENCIA'
        }, ...alerts];
    }
    
    if (alerts.length === 0) {
        container.innerHTML = '<div class="no-alerts"><span>✓ Sin alertas operativas</span></div>';
        return;
    }
    
    container.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <span class="alert-icon">${alert.icon}</span>
            <span>${alert.message}</span>
        </div>
    `).join('');
}

/**
 * Renderiza las tarjetas de resumen superior
 */
function renderSummaryCards(hospital) {
    // Camas disponibles
    document.getElementById('bedsAvailable').textContent = hospital.camas.disponibles;
    document.getElementById('bedsPercentage').textContent = hospital.porcentajeOcupacion + '% ocupación';
    document.getElementById('bedsStatus').className = `card-status ${getStatusClass(hospital.estado)}`;
    
    // Camas críticas
    const criticalOccupancy = calculateOccupancy(hospital.camasCriticas.ocupadas, hospital.camasCriticas.totales);
    document.getElementById('criticalBedsAvailable').textContent = hospital.camasCriticas.disponibles;
    document.getElementById('criticalBedsPercentage').textContent = criticalOccupancy + '% ocupación';
    document.getElementById('criticalBedsStatus').className = `card-status ${getStatusFromPercentage(criticalOccupancy)}`;
    
    // Guardia
    document.getElementById('guardiaOccupancy').textContent = hospital.guardia.porcentajeOcupada + '%';
    const guardiaPacientes = Math.round(hospital.guardia.porcentajeOcupada * 0.6); // Simulado
    document.getElementById('guardiaPatients').textContent = guardiaPacientes + ' pacientes';
    document.getElementById('guardiaStatus').className = `card-status ${getStatusFromPercentage(hospital.guardia.porcentajeOcupada)}`;
    
    // Personal
    const staffPercentage = Math.round((hospital.personal.disponible / hospital.personal.total) * 100);
    document.getElementById('staffAvailable').textContent = hospital.personal.disponible;
    document.getElementById('staffPercentage').textContent = staffPercentage + '% disponible';
    document.getElementById('staffStatus').className = `card-status ${staffPercentage >= 70 ? 'normal' : staffPercentage >= 50 ? 'warning' : 'danger'}`;
    
    // Quirófanos
    document.getElementById('operatingRoomsAvailable').textContent = hospital.quirófanos.disponibles;
    document.getElementById('operatingRoomsTotal').textContent = `de ${hospital.quirófanos.totales}`;
    const operatingStatus = getOperatingRoomsStatus(hospital.quirófanos.disponibles, hospital.quirófanos.totales);
    document.getElementById('operatingRoomsStatus').className = `card-status ${hospital.quirófanos.disponibles === 0 ? 'danger' : hospital.quirófanos.disponibles <= 2 ? 'warning' : 'normal'}`;
    
    // Ambulancias
    const ambulancesTotal = 6; // Valor por defecto
    document.getElementById('ambulancesAvailable').textContent = hospital.ambulancias.disponibles;
    document.getElementById('ambulancesTotal').textContent = `de ${ambulancesTotal}`;
    document.getElementById('ambulancesStatus').className = `card-status ${hospital.ambulancias.disponibles === 0 ? 'danger' : hospital.ambulancias.disponibles <= 2 ? 'warning' : 'normal'}`;
}

/**
 * Renderiza el módulo de camas
 */
function renderBedsModule(hospital) {
    // Camas generales
    document.getElementById('bedsTotalStat').textContent = hospital.camas.totales;
    document.getElementById('bedsOccupiedStat').textContent = hospital.camas.ocupadas;
    document.getElementById('bedsAvailableStat').textContent = hospital.camas.disponibles;
    document.getElementById('bedsOccupancyPercent').textContent = hospital.porcentajeOcupacion + '%';
    
    const bedsBar = document.getElementById('bedsOccupancyBar');
    bedsBar.style.width = hospital.porcentajeOcupacion + '%';
    bedsBar.className = `progress-fill ${getStatusFromPercentage(hospital.porcentajeOcupacion)}`;
    
    // Camas críticas
    const criticalOccupancy = calculateOccupancy(hospital.camasCriticas.ocupadas, hospital.camasCriticas.totales);
    document.getElementById('criticalBedsTotalStat').textContent = hospital.camasCriticas.totales;
    document.getElementById('criticalBedsOccupiedStat').textContent = hospital.camasCriticas.ocupadas;
    document.getElementById('criticalBedsAvailableStat').textContent = hospital.camasCriticas.disponibles;
    document.getElementById('criticalBedsOccupancyPercent').textContent = criticalOccupancy + '%';
    
    const criticalBar = document.getElementById('criticalBedsOccupancyBar');
    criticalBar.style.width = criticalOccupancy + '%';
    criticalBar.className = `progress-fill ${getStatusFromPercentage(criticalOccupancy)}`;
}

/**
 * Renderiza el módulo de guardia con gráfico circular
 */
function renderEmergencyModule(hospital) {
    const occupancy = hospital.guardia.porcentajeOcupada;
    
    // Actualizar gráfico circular SVG
    const circle = document.getElementById('guardiaChartFill');
    const text = document.getElementById('guardiaChartText');
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (occupancy / 100) * circumference;
    
    circle.style.strokeDashoffset = offset;
    
    // Cambiar color según ocupación
    let color = '#00ff88'; // normal
    if (occupancy >= 90) color = '#ff006e'; // saturated
    else if (occupancy >= 80) color = '#ff9900'; // high-demand
    else if (occupancy >= 70) color = '#ffd60a'; // warning
    
    circle.style.stroke = color;
    text.style.fill = color;
    text.textContent = occupancy + '%';
    
    // Estadísticas de guardia (simuladas basadas en ocupación)
    const totalCapacity = Math.round(hospital.camas.totales * 0.15); // 15% de camas para guardia
    const patientsInCare = Math.round(totalCapacity * (occupancy / 100));
    const patientsWaiting = Math.round(patientsInCare * 0.4);
    const patientsCritical = Math.round(patientsInCare * 0.15);
    const waitTime = Math.round(20 + (occupancy / 100) * 60);
    
    document.getElementById('guardiaPatientsWaiting').textContent = patientsWaiting;
    document.getElementById('guardiaPatientsInCare').textContent = patientsInCare;
    document.getElementById('guardiaPatientsCritical').textContent = patientsCritical;
    document.getElementById('guardiaWaitTime').textContent = waitTime + ' min';
}

/**
 * Renderiza el módulo de personal
 */
function renderStaffModule(hospital) {
    const available = hospital.personal.disponible;
    const total = hospital.personal.total;
    const busy = Math.round((total - available) * 0.7);
    const unavailable = total - available - busy;
    
    // Calcular porcentajes
    const availablePercent = (available / total) * 100;
    const busyPercent = (busy / total) * 100;
    const unavailablePercent = (unavailable / total) * 100;
    
    // Actualizar barra de distribución
    document.getElementById('staffAvailableBar').style.width = availablePercent + '%';
    document.getElementById('staffBusyBar').style.width = busyPercent + '%';
    document.getElementById('staffUnavailableBar').style.width = unavailablePercent + '%';
    
    // Estadísticas (simuladas)
    const doctors = Math.round(total * 0.35);
    const nurses = Math.round(total * 0.65);
    
    document.getElementById('staffDoctors').textContent = doctors;
    document.getElementById('staffNurses').textContent = nurses;
    document.getElementById('staffTotalStat').textContent = total;
    document.getElementById('staffAvailableStat').textContent = available;
    document.getElementById('staffAvailablePercent').textContent = Math.round(availablePercent) + '%';
}

/**
 * Renderiza el módulo de quirófanos
 */
function renderOperatingRoomsModule(hospital) {
    const total = hospital.quirófanos.totales;
    const available = hospital.quirófanos.disponibles;
    const inUse = total - available;
    
    // Generar grid de quirófanos
    const grid = document.getElementById('operatingRoomsGrid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= total; i++) {
        const isAvailable = i <= available;
        const room = document.createElement('div');
        room.className = `operating-room ${isAvailable ? 'available' : 'in-use'}`;
        room.innerHTML = `
            <div class="room-icon">${isAvailable ? '🟢' : '🔴'}</div>
            <div class="room-label">Q-${i.toString().padStart(2, '0')}</div>
            <div class="room-status">${isAvailable ? 'Disponible' : 'En uso'}</div>
        `;
        grid.appendChild(room);
    }
    
    // Estadísticas
    document.getElementById('operatingRoomsTotalStat').textContent = total;
    document.getElementById('operatingRoomsInUse').textContent = inUse;
    document.getElementById('operatingRoomsAvailableStat').textContent = available;
    
    // Estado
    const status = getOperatingRoomsStatus(available, total);
    const statusText = document.getElementById('operatingRoomsStatusText');
    statusText.textContent = `${status.icon} ${status.text}`;
    statusText.className = `status-badge ${available === 0 ? 'danger' : available < total * 0.3 ? 'warning' : 'normal'}`;
}

/**
 * Renderiza el módulo de ambulancias
 */
function renderAmbulancesModule(hospital) {
    const available = hospital.ambulancias.disponibles;
    const total = 6; // Valor por defecto
    const inService = total - available;
    
    // Generar grid de ambulancias
    const grid = document.getElementById('ambulancesGrid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= total; i++) {
        const isAvailable = i <= available;
        const ambulance = document.createElement('div');
        ambulance.className = `ambulance-item ${isAvailable ? 'available' : 'in-service'}`;
        ambulance.innerHTML = `
            <div class="ambulance-icon">${isAvailable ? '🟢' : '🔴'}</div>
            <div class="ambulance-label">AMB-${i.toString().padStart(2, '0')}</div>
            <div class="ambulance-status">${isAvailable ? 'Disponible' : 'En servicio'}</div>
        `;
        grid.appendChild(ambulance);
    }
    
    // Estadísticas
    document.getElementById('ambulancesTotalStat').textContent = total;
    document.getElementById('ambulancesAvailableStat').textContent = available;
    document.getElementById('ambulancesInService').textContent = inService;
}

/**
 * Renderiza el módulo de insumos
 */
function renderSuppliesModule(hospital) {
    // Simular diferentes tipos de insumos basados en el porcentaje general
    const basePercentage = hospital.insumos.porcentajeDisponible;
    const supplies = {
        medications: Math.min(100, Math.round(basePercentage + (Math.random() * 20 - 10))),
        surgical: Math.min(100, Math.round(basePercentage + (Math.random() * 20 - 10))),
        oxygen: Math.min(100, Math.round(basePercentage + (Math.random() * 20 - 10))),
        disposable: Math.min(100, Math.round(basePercentage + (Math.random() * 20 - 10)))
    };
    
    // Medicamentos
    renderSupplyItem('Medications', supplies.medications);
    
    // Material quirúrgico
    renderSupplyItem('Surgical', supplies.surgical);
    
    // Oxígeno
    renderSupplyItem('Oxygen', supplies.oxygen);
    
    // Material descartable
    renderSupplyItem('Disposable', supplies.disposable);
}

/**
 * Renderiza un item de insumo individual
 */
function renderSupplyItem(type, percentage) {
    document.getElementById(`supply${type}Percent`).textContent = percentage + '%';
    
    const bar = document.getElementById(`supply${type}Bar`);
    bar.style.width = percentage + '%';
    
    let className = 'progress-fill normal';
    if (percentage < 30) className = 'progress-fill saturated';
    else if (percentage < 50) className = 'progress-fill warning';
    
    bar.className = className;
    
    const status = getSupplyStatus(percentage);
    document.getElementById(`supply${type}Status`).textContent = `${status.icon} ${status.text}`;
}

/**
 * Renderiza el módulo de áreas del hospital
 */
function renderAreasModule(hospital) {
    const areas = calculateAreaMetrics(hospital);
    
    // Guardia
    document.getElementById('areaGuardiaStatus').textContent = areas.guardia.statusText;
    document.getElementById('areaGuardiaOccupancy').textContent = areas.guardia.occupancy + '%';
    
    // Internación
    document.getElementById('areaInternacionStatus').textContent = areas.internacion.statusText;
    document.getElementById('areaInternacionOccupancy').textContent = areas.internacion.occupancy + '%';
    
    // UCI
    document.getElementById('areaUCIStatus').textContent = areas.uci.statusText;
    document.getElementById('areaUCIOccupancy').textContent = areas.uci.occupancy + '%';
    
    // Quirófanos
    document.getElementById('areaQuirofanosStatus').textContent = areas.quirofanos.statusText;
    document.getElementById('areaQuirofanosOccupancy').textContent = areas.quirofanos.occupancy + '%';
    
    // Consultorios
    document.getElementById('areaConsultoriosStatus').textContent = areas.consultorios.statusText;
    document.getElementById('areaConsultoriosOccupancy').textContent = areas.consultorios.occupancy + '%';
    
    // Emergencias
    document.getElementById('areaEmergenciasStatus').textContent = areas.emergencias.statusText;
    document.getElementById('areaEmergenciasOccupancy').textContent = areas.emergencias.occupancy + '%';
}

/**
 * Obtiene la clase CSS para un estado
 */
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

/**
 * Función pública para actualizar el hospital (preparada para simulaciones futuras)
 */
function updateHospital() {
    if (currentHospital) {
        currentHospital = updateHospitalMetrics(currentHospital);
        renderHospital(currentHospital);
    }
}

// Exponer funciones globales para uso futuro
window.updateHospital = updateHospital;
window.currentHospital = currentHospital;
