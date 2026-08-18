// HOSPITAL COMMAND NETWORK - CAPA 4
// INTERFAZ DE SIMULACIÓN AVANZADA
// Conecta simulation.html con simulation-engine.js y simulation-state.js

// Verificar que estamos en la página correcta
if (!document.body.classList.contains('simulation-view')) {
    console.warn('Simulation-ui.js: No se debe ejecutar en esta página');
}

let simulationMap = null;
let simulationHospitalMarkers = [];
let simulationEmergencyCircle = null;
let simulationEmergencyMarker = null;
let currentEmergency = null;

const SIMULATION_CHART_MAX_POINTS = 40;
const chartHistory = {
    patients: [],
    critical: [],
    moderate: [],
    minor: [],
    occupancy: [],
    beds: [],
    criticalBeds: [],
    network: []
};

document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar si estamos en la vista de simulación
    if (!document.body.classList.contains('simulation-view')) {
        return;
    }
    
    const emergency = loadActiveEmergency();

    if (!emergency) {
        showSimulationReady();
        return;
    }

    currentEmergency = emergency;
    initializeSimulationPage(emergency);

    const state = getSimulationState();
    if (!state.active) {
        showSimulationReady();
    } else {
        updateSimulationUI();
    }
});

/**
 * Muestra el estado de simulación lista
 */
function showSimulationReady() {
    updateSimulationHeader(null);
    updateNetworkStatusIndicator('ready');
    updateSituationPanel('ready');
    updatePlayPauseButton();
    
    // Mostrar mensaje de navegación si no hay emergencia
    if (!currentEmergency) {
        const content = document.getElementById('situationContent');
        if (content) {
            content.innerHTML = `
                <p class="situation-status ready">⚠️ SIN EMERGENCIA ACTIVA</p>
                <p>No hay ninguna emergencia configurada para simular.</p>
                <p>
                    <a href="emergencies.html" class="emergency-link">
                        📋 Ir a Central de Emergencias para crear una nueva emergencia
                    </a>
                </p>
            `;
        }
    }
}

/**
 * Inicializa la página de simulación
 */
function initializeSimulationPage(emergency) {
    updateSimulationHeader(emergency);
    initializeSimulationMap(emergency);
    initializeSimulationCharts();
    updatePlayPauseButton();
    updateNetworkStatusIndicator();
}

/**
 * Actualiza el header con datos de la emergencia
 */
function updateSimulationHeader(emergency) {
    const subtitle = document.getElementById('simulationSubtitle');
    if (subtitle) {
        if (emergency) {
            const typeName = getEmergencyTypeName(emergency.type);
            const locationName = emergency.location ? emergency.location.name : 'Sin ubicación';
            subtitle.textContent = `SIMULACIÓN: ${typeName.toUpperCase()} — ${locationName.toUpperCase()}`;
        } else {
            subtitle.textContent = 'SIMULACIÓN — CONFIGURAR EMERGENCIA';
        }
    }

    if (emergency) {
        updateSeverityBadge(emergency.severity);
    }
}

/**
 * Actualiza el indicador de estado de la red
 */
function updateNetworkStatusIndicator(forceStatus = null) {
    const indicator = document.getElementById('networkStatusIndicator');
    if (!indicator) return;

    let status = forceStatus;
    
    if (!status) {
        const state = getSimulationState();
        if (!state.active) {
            status = 'ready';
        } else {
            // Calcular estado basado en métricas reales
            const saturatedCount = state.hospitalsSaturated || 0;
            const criticalBedsAvailable = state.networkMetrics?.totalCriticalBedsAvailable || 0;
            
            if (saturatedCount >= 3 || criticalBedsAvailable < 10) {
                status = 'collapse';
            } else if (saturatedCount >= 2 || criticalBedsAvailable < 20) {
                status = 'critical';
            } else if (saturatedCount >= 1 || criticalBedsAvailable < 50) {
                status = 'pressure';
            } else {
                status = 'stable';
            }
        }
    }

    const statusConfig = {
        ready: { icon: '🟡', text: 'RED LISTA', class: 'warning' },
        stable: { icon: '🟢', text: 'RED ESTABLE', class: 'success' },
        pressure: { icon: '🟡', text: 'RED BAJO PRESIÓN', class: 'warning' },
        critical: { icon: '🟠', text: 'RED EN ALTA DEMANDA', class: 'warning' },
        collapse: { icon: '🔴', text: 'RED EN COLAPSO', class: 'danger' }
    };

    const config = statusConfig[status] || statusConfig.ready;
    
    indicator.className = `network-status-indicator ${config.class}`;
    indicator.querySelector('.status-icon').textContent = config.icon;
    indicator.querySelector('.status-text').textContent = config.text;
}

/**
 * Actualiza el panel de situación general
 */
function updateSituationPanel(status = null) {
    const content = document.getElementById('situationContent');
    const timestamp = document.getElementById('situationTimestamp');
    if (!content) return;

    const now = new Date();
    if (timestamp) {
        timestamp.textContent = `Actualizado: ${now.toLocaleTimeString()}`;
    }

    const state = getSimulationState();
    
    if (status === 'ready' || !state.active) {
        content.innerHTML = `
            <p class="situation-status">⏸ SIMULACIÓN LISTA</p>
            <p>Configure la emergencia y presione INICIAR para comenzar la simulación.</p>
        `;
        return;
    }

    // Generar resumen dinámico
    const totalHospitals = hospitalNetwork.hospitals.length;
    const saturatedHospitals = state.hospitalsSaturated || 0;
    const patientsGenerated = state.patientsGenerated || 0;
    const criticalPatients = state.criticalGenerated || 0;
    const networkOccupancy = state.networkMetrics?.networkOccupancy || 0;
    const criticalBedsAvailable = state.networkMetrics?.totalCriticalBedsAvailable || 0;

    let statusText = '';
    let statusClass = '';

    if (state.paused) {
        statusText = '⏸ SIMULACIÓN PAUSADA';
        statusClass = 'warning';
    } else {
        statusText = '● SIMULACIÓN ACTIVA';
        statusClass = 'active';
    }

    let situation = '';
    if (saturatedHospitals >= 3) {
        situation = `⚠️ <span class="highlight">SITUACIÓN CRÍTICA:</span> ${saturatedHospitals} de ${totalHospitals} hospitales saturados.`;
    } else if (saturatedHospitals >= 1) {
        situation = `⚠️ <span class="highlight">${saturatedHospitals} hospital${saturatedHospitals > 1 ? 'es' : ''} saturado${saturatedHospitals > 1 ? 's' : ''}.</span>`;
    } else if (networkOccupancy >= 80) {
        situation = `📊 <span class="highlight">La red presenta alta demanda</span> con ${networkOccupancy}% de ocupación.`;
    } else {
        situation = `✅ <span class="highlight">La red mantiene capacidad operativa</span> con ${networkOccupancy}% de ocupación.`;
    }

    let bedsStatus = '';
    if (criticalBedsAvailable < 10) {
        bedsStatus = `🔴 <span class="highlight">CRÍTICO:</span> Solo ${criticalBedsAvailable} camas críticas disponibles.`;
    } else if (criticalBedsAvailable < 30) {
        bedsStatus = `⚠️ Capacidad crítica limitada: ${criticalBedsAvailable} camas disponibles.`;
    } else {
        bedsStatus = `✅ Capacidad crítica suficiente: ${criticalBedsAvailable} camas disponibles.`;
    }

    content.innerHTML = `
        <p class="situation-status ${statusClass}">${statusText}</p>
        <p>${situation}</p>
        <p>Se han generado <span class="highlight">${patientsGenerated} pacientes</span>, incluyendo <span class="highlight">${criticalPatients} críticos</span>.</p>
        <p>${bedsStatus}</p>
    `;
}

/**
 * Actualiza el badge de gravedad
 */
function updateSeverityBadge(severity) {
    const badge = document.getElementById('simulationStateBadge');
    if (!badge) return;

    const labels = {
        low: '🟢 BAJO',
        moderate: '🟡 MODERADO',
        high: '🟠 ALTO',
        critical: '🔴 CRÍTICO'
    };

    badge.textContent = labels[severity] || '🔴 ACTIVO';
}

/**
 * Inicializa el mapa Leaflet de simulación
 */
function initializeSimulationMap(emergency) {
    const container = document.getElementById('simulationMap');
    if (!container || typeof L === 'undefined') return;

    const center = emergency.location
        ? [emergency.location.latitude, emergency.location.longitude]
        : [-31.4201, -64.1888];

    simulationMap = L.map('simulationMap', {
        center: center,
        zoom: 12,
        minZoom: 10,
        maxZoom: 16,
        zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(simulationMap);

    if (emergency.location && emergency.affectedRadius) {
        simulationEmergencyCircle = L.circle(
            [emergency.location.latitude, emergency.location.longitude],
            {
                radius: emergency.affectedRadius * 1000,
                color: '#ff006e',
                fillColor: '#ff006e',
                fillOpacity: 0.15,
                weight: 2
            }
        ).addTo(simulationMap);

        simulationEmergencyMarker = L.marker(
            [emergency.location.latitude, emergency.location.longitude],
            {
                title: emergency.location.name
            }
        ).addTo(simulationMap);

        simulationEmergencyMarker.bindPopup(
            `<strong>${emergency.location.name}</strong><br>Radio: ${emergency.affectedRadius} km`
        );
    }

    loadSimulationHospitalMarkers();

    setTimeout(function() {
        if (simulationMap) {
            simulationMap.invalidateSize();
        }
    }, 150);
}

/**
 * Carga marcadores de hospitales en el mapa de simulación
 */
function loadSimulationHospitalMarkers() {
    if (!simulationMap || typeof hospitalNetwork === 'undefined') return;

    clearSimulationHospitalMarkers();

    hospitalNetwork.hospitals.forEach(function(hospital) {
        if (!hospital.geolocalizacion) return;

        const { latitud, longitud } = hospital.geolocalizacion;
        if (!latitud || !longitud) return;

        const color = getSimulationHospitalColor(hospital.estado);
        const marker = L.circleMarker([latitud, longitud], {
            radius: 10,
            color: color,
            fillColor: color,
            fillOpacity: 0.85,
            weight: 2
        }).addTo(simulationMap);

        marker.bindPopup(
            `<strong>${hospital.nombre}</strong><br>` +
            `Estado: ${hospital.estado}<br>` +
            `Ocupación: ${hospital.porcentajeOcupacion}%<br>` +
            `Camas disp.: ${hospital.camas.disponibles}`
        );

        marker.hospitalId = hospital.id;
        simulationHospitalMarkers.push(marker);
    });
}

/**
 * Actualiza colores de marcadores según estado actual
 */
function updateSimulationMapMarkers() {
    if (!simulationMap) return;

    hospitalNetwork.hospitals.forEach(function(hospital) {
        const marker = simulationHospitalMarkers.find(function(m) {
            return m.hospitalId === hospital.id;
        });

        if (!marker || !hospital.geolocalizacion) return;

        const color = getSimulationHospitalColor(hospital.estado);
        marker.setStyle({
            color: color,
            fillColor: color
        });

        marker.setPopupContent(
            `<strong>${hospital.nombre}</strong><br>` +
            `Estado: ${hospital.estado}<br>` +
            `Ocupación: ${hospital.porcentajeOcupacion}%<br>` +
            `Camas disp.: ${hospital.camas.disponibles}`
        );
    });
}

/**
 * Limpia marcadores de hospitales del mapa
 */
function clearSimulationHospitalMarkers() {
    simulationHospitalMarkers.forEach(function(marker) {
        if (simulationMap) {
            simulationMap.removeLayer(marker);
        }
    });
    simulationHospitalMarkers = [];
}

/**
 * Color del marcador según estado hospitalario
 */
function getSimulationHospitalColor(estado) {
    switch (estado) {
        case 'NORMAL':
            return '#00ff88';
        case 'ADVERTENCIA':
            return '#ffd60a';
        case 'ALTA DEMANDA':
            return '#ff9900';
        case 'SATURADO':
            return '#ff006e';
        case 'FUERA DE SERVICIO':
            return '#666666';
        default:
            return '#8892b0';
    }
}

/**
 * Inicializa los canvas de gráficos
 */
function initializeSimulationCharts() {
    ['patientsChart', 'occupancyChart', 'bedsChart', 'networkChart'].forEach(function(id) {
        const canvas = document.getElementById(id);
        if (canvas) {
            drawSimulationChart(canvas, [], '#ff006e');
        }
    });
}

/**
 * Alterna play/pause
 */
function togglePlayPause() {
    const state = getSimulationState();
    
    if (!state.active && currentEmergency) {
        // Iniciar simulación
        if (startSimulation()) {
            updatePlayPauseButton();
            updateSimulationUI();
        }
    } else if (state.active) {
        if (state.paused) {
            resumeSimulation();
        } else {
            pauseSimulation();
        }
        updatePlayPauseButton();
        updateSimulationUI();
    }
}

/**
 * Actualiza botón play/pause
 */
function updatePlayPauseButton() {
    const state = getSimulationState();
    const icon = document.getElementById('playPauseIcon');
    const text = document.getElementById('playPauseText');
    const badge = document.getElementById('simulationStateBadge');

    if (icon && text) {
        if (!state.active) {
            icon.textContent = '▶';
            text.textContent = 'INICIAR';
        } else if (state.paused) {
            icon.textContent = '▶';
            text.textContent = 'CONTINUAR';
        } else {
            icon.textContent = '⏸';
            text.textContent = 'PAUSAR';
        }
    }

    if (badge) {
        badge.classList.remove('active', 'paused', 'ready');
        if (!state.active) {
            badge.classList.add('ready');
            badge.textContent = '⏸ SIMULACIÓN LISTA';
        } else if (state.paused) {
            badge.classList.add('paused');
            badge.textContent = '⏸ SIMULACIÓN PAUSADA';
        } else {
            badge.classList.add('active');
            badge.textContent = '● SIMULACIÓN ACTIVA';
        }
    }
}

/**
 * Avanza la simulación manualmente
 */
function advanceSimulationManual(minutes) {
    const state = getSimulationState();
    if (!state.active) return;

    advanceSimulation(minutes);
    updateSimulationUI();
}

/**
 * Reinicia la simulación desde la UI
 */
function resetSimulationUI() {
    if (!confirm('¿Reiniciar la simulación? Se restaurará el estado inicial de los hospitales.')) {
        return;
    }

    resetSimulation();
    resetChartHistory();
    updateSimulationMapMarkers();
    updatePlayPauseButton();
    updateSimulationUI();
}

/**
 * Finaliza la simulación desde la UI
 */
function finishSimulationUI() {
    if (!confirm('¿Finalizar la simulación?')) {
        return;
    }

    finishSimulation();
    updateSimulationUI();
    window.location.href = 'emergencies.html';
}

/**
 * Cambia la velocidad de simulación
 */
function setSpeed(speed) {
    changeSimulationSpeed(speed);

    document.querySelectorAll('.speed-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.speed === speed);
    });

    updateSimulationUI();
}

/**
 * Actualiza toda la interfaz de simulación
 */
function updateSimulationUI() {
    const state = getSimulationState();
    if (!state) return;

    updateSimulationMetrics(state);
    updateSimulationAlertsPanel(state);
    updateSimulationTimeline(state);
    updateSimulationHospitalsList();
    updateSimulationMapMarkers();
    updateSimulationCharts(state);
    updatePlayPauseButton();
    updateNetworkStatusIndicator();
    updateSituationPanel();

    const timeDisplay = document.getElementById('simulationTimeDisplay');
    if (timeDisplay) {
        timeDisplay.textContent = 'T+ ' + formatSimulationTime(state.simulationTime);
    }
}

/**
 * Actualiza métricas principales
 */
function updateSimulationMetrics(state) {
    const totalHospitals = hospitalNetwork.hospitals.length;
    const affectedHospitals = state.hospitalsAffected?.length || 0;
    
    // Calcular recursos promedio
    let totalResources = 0;
    hospitalNetwork.hospitals.forEach(h => {
        totalResources += h.insumos.porcentajeDisponible;
    });
    const avgResources = Math.round(totalResources / hospitalNetwork.hospitals.length);
    
    // Calcular tasa de pacientes críticos
    const criticalRate = state.simulationTime > 0 ? 
        Math.round((state.criticalGenerated / state.simulationTime) * 10) / 10 : 0;

    setElementText('metricHospitalsTotal', totalHospitals);
    setElementText('metricHospitalsAffected', affectedHospitals);
    setElementText('metricPatients', state.patientsGenerated);
    setElementText('metricPatientsProgress', getPatientGenerationProgress() + '% del total estimado');
    setElementText('metricCritical', state.criticalGenerated);
    setElementText('metricCriticalRate', criticalRate + '/min');
    setElementText('metricBeds', state.networkMetrics.totalBedsAvailable);
    setElementText('metricCriticalBeds', state.networkMetrics.totalCriticalBedsAvailable);
    setElementText('metricSaturated', state.hospitalsSaturated);
    setElementText('metricNetworkOccupancy', state.networkMetrics.networkOccupancy + '%');
    
    // Actualizar estado de red en métrica
    const networkStatusText = state.networkMetrics.networkOccupancy >= 90 ? 'Red crítica' :
                              state.networkMetrics.networkOccupancy >= 80 ? 'Alta demanda' :
                              state.networkMetrics.networkOccupancy >= 70 ? 'Bajo presión' : 'Red estable';
    setElementText('metricNetworkStatus', networkStatusText);
    
    setElementText('metricResources', avgResources + '%');
    setElementText('metricSimulationTime', formatSimulationTime(state.simulationTime));
    setElementText('metricSimulationSpeed', 'Velocidad ' + state.speed);
}

/**
 * Actualiza panel de alertas
 */
function updateSimulationAlertsPanel(state) {
    const alertsList = document.getElementById('alertsList');
    const alertsCount = document.getElementById('alertsCount');
    if (!alertsList) return;

    const alerts = getRecentAlerts(20);

    if (alertsCount) {
        alertsCount.textContent = alerts.length + ' alerta' + (alerts.length !== 1 ? 's' : '') + ' activa' + (alerts.length !== 1 ? 's' : '');
    }

    if (alerts.length === 0) {
        alertsList.innerHTML = '<div class="no-alerts">Sin alertas</div>';
        return;
    }

    alertsList.innerHTML = alerts.slice().reverse().map(function(alert) {
        const levelClass = alert.level === 'critical' ? 'critical' : (alert.level === 'warning' ? 'warning' : '');
        const icon = alert.level === 'critical' ? '🔴' : (alert.level === 'warning' ? '⚠️' : 'ℹ️');

        return `
            <div class="alert-item ${levelClass}">
                <div class="alert-icon">${icon}</div>
                <div class="alert-content">
                    <div class="alert-time">${formatSimulationTime(alert.time)}</div>
                    <div class="alert-message">${alert.message}</div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Actualiza línea de tiempo
 */
function updateSimulationTimeline(state) {
    const timelineList = document.getElementById('timelineList');
    if (!timelineList) return;

    const events = getRecentEvents(30);

    if (events.length === 0) {
        timelineList.innerHTML = '<div class="no-events">Sin eventos</div>';
        return;
    }

    timelineList.innerHTML = events.slice().reverse().map(function(event) {
        return `
            <div class="timeline-event">
                <span class="event-time">${formatSimulationTime(event.time)}</span>
                <span class="event-message">${event.message}</span>
            </div>
        `;
    }).join('');
}

/**
 * Actualiza lista de estado de hospitales
 */
function updateSimulationHospitalsList() {
    const list = document.getElementById('hospitalsStatusList');
    if (!list || typeof hospitalNetwork === 'undefined') return;

    list.innerHTML = hospitalNetwork.hospitals.map(function(hospital) {
        const statusClass = getSimulationHospitalStatusClass(hospital.estado);

        return `
            <div class="hospital-status-item ${statusClass}">
                <div class="hospital-name">${hospital.nombre}</div>
                <div class="hospital-occupancy">
                    ${hospital.estado} — ${hospital.porcentajeOcupacion}% ocupación —
                    ${hospital.camas.disponibles} camas / ${hospital.camasCriticas.disponibles} críticas
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Clase CSS para estado hospitalario en la UI de simulación
 */
function getSimulationHospitalStatusClass(estado) {
    switch (estado) {
        case 'NORMAL':
            return 'normal';
        case 'ADVERTENCIA':
            return 'warning';
        case 'ALTA DEMANDA':
            return 'high-demand';
        case 'SATURADO':
            return 'saturated';
        default:
            return 'normal';
    }
}

/**
 * Actualiza historial y dibuja gráficos
 */
function updateSimulationCharts(state) {
    pushChartPoint('patients', state.patientsGenerated);
    pushChartPoint('critical', state.criticalGenerated);
    pushChartPoint('moderate', state.moderateGenerated);
    pushChartPoint('minor', state.minorGenerated);
    pushChartPoint('occupancy', state.networkMetrics.networkOccupancy);
    pushChartPoint('beds', state.networkMetrics.totalBedsAvailable);
    pushChartPoint('criticalBeds', state.networkMetrics.totalCriticalBedsAvailable);
    pushChartPoint('network', calculateNetworkScore(state));

    // Gráfico de pacientes por gravedad
    drawPatientsChart(document.getElementById('patientsChart'));
    
    // Gráfico de ocupación
    drawSimulationChart(document.getElementById('occupancyChart'), chartHistory.occupancy, '#ffd60a');
    
    // Gráfico de camas
    drawBedsChart(document.getElementById('bedsChart'));
    
    // Gráfico de red
    drawSimulationChart(document.getElementById('networkChart'), chartHistory.network, '#ff006e');
}

/**
 * Calcula score de estado de la red (0-100)
 */
function calculateNetworkScore(state) {
    const occupancy = state.networkMetrics.networkOccupancy;
    const saturated = state.hospitalsSaturated;
    const criticalBeds = state.networkMetrics.totalCriticalBedsAvailable;
    
    // Combinar métricas para score general
    let score = occupancy;
    score += (saturated * 10); // Cada hospital saturado suma 10 puntos
    score -= Math.max(0, (50 - criticalBeds) / 5); // Restar por falta de camas críticas
    
    return Math.min(100, Math.max(0, score));
}

/**
 * Dibuja gráfico de pacientes por gravedad
 */
function drawPatientsChart(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 200;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Dibujar grid
    drawChartGrid(ctx, width, height);

    if (chartHistory.critical.length === 0) {
        drawNoDataMessage(ctx, width, height);
        return;
    }

    const maxValue = Math.max(
        ...chartHistory.patients,
        ...chartHistory.critical,
        ...chartHistory.moderate,
        ...chartHistory.minor,
        1
    );

    const stepX = chartHistory.patients.length > 1 ? width / (chartHistory.patients.length - 1) : width;

    // Dibujar líneas
    drawChartLine(ctx, chartHistory.critical, stepX, maxValue, height, '#ff006e', 3);
    drawChartLine(ctx, chartHistory.moderate, stepX, maxValue, height, '#ff9900', 2);
    drawChartLine(ctx, chartHistory.minor, stepX, maxValue, height, '#00ff88', 2);

    // Dibujar puntos finales
    if (chartHistory.critical.length > 0) {
        drawChartPoint(ctx, chartHistory.critical, stepX, maxValue, height, '#ff006e');
        drawChartPoint(ctx, chartHistory.moderate, stepX, maxValue, height, '#ff9900');
        drawChartPoint(ctx, chartHistory.minor, stepX, maxValue, height, '#00ff88');
    }
}

/**
 * Dibuja gráfico de camas
 */
function drawBedsChart(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 200;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    drawChartGrid(ctx, width, height);

    if (chartHistory.beds.length === 0) {
        drawNoDataMessage(ctx, width, height);
        return;
    }

    const maxValue = Math.max(...chartHistory.beds, ...chartHistory.criticalBeds, 1);
    const stepX = chartHistory.beds.length > 1 ? width / (chartHistory.beds.length - 1) : width;

    drawChartLine(ctx, chartHistory.beds, stepX, maxValue, height, '#0ea5e9', 2);
    drawChartLine(ctx, chartHistory.criticalBeds, stepX, maxValue, height, '#ff006e', 2);

    if (chartHistory.beds.length > 0) {
        drawChartPoint(ctx, chartHistory.beds, stepX, maxValue, height, '#0ea5e9');
        drawChartPoint(ctx, chartHistory.criticalBeds, stepX, maxValue, height, '#ff006e');
    }
}

/**
 * Utilidades de dibujo de gráficos
 */
function drawChartGrid(ctx, width, height) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawNoDataMessage(ctx, width, height) {
    ctx.fillStyle = '#8892b0';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sin datos', width / 2, height / 2);
}

function drawChartLine(ctx, data, stepX, maxValue, height, color, lineWidth = 2) {
    if (data.length === 0) return;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    data.forEach(function(value, index) {
        const x = index * stepX;
        const y = height - (value / maxValue) * (height - 20) - 10;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}

function drawChartPoint(ctx, data, stepX, maxValue, height, color) {
    if (data.length === 0) return;

    const lastValue = data[data.length - 1];
    const lastX = (data.length - 1) * stepX;
    const lastY = height - (lastValue / maxValue) * (height - 20) - 10;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Agrega un punto al historial de gráficos
 */
function pushChartPoint(key, value) {
    if (!chartHistory[key]) return;

    chartHistory[key].push(value);

    if (chartHistory[key].length > SIMULATION_CHART_MAX_POINTS) {
        chartHistory[key].shift();
    }
}

/**
 * Reinicia historial de gráficos
 */
function resetChartHistory() {
    chartHistory.patients = [];
    chartHistory.critical = [];
    chartHistory.moderate = [];
    chartHistory.minor = [];
    chartHistory.occupancy = [];
    chartHistory.beds = [];
    chartHistory.criticalBeds = [];
    chartHistory.network = [];
}

/**
 * Dibuja un gráfico simple en canvas
 */
function drawSimulationChart(canvas, data, color) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 200;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    if (!data || data.length === 0) {
        ctx.fillStyle = '#8892b0';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sin datos', width / 2, height / 2);
        return;
    }

    const maxValue = Math.max(...data, 1);
    const stepX = data.length > 1 ? width / (data.length - 1) : width;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    data.forEach(function(value, index) {
        const x = index * stepX;
        const y = height - (value / maxValue) * (height - 20) - 10;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    const lastValue = data[data.length - 1];
    const lastX = (data.length - 1) * stepX;
    const lastY = height - (lastValue / maxValue) * (height - 20) - 10;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Helper para setear texto de elemento
 */
function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
    }
}
