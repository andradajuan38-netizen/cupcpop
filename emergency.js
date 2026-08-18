// HOSPITAL COMMAND NETWORK - CAPA 3
// INTERFAZ DE CENTRAL DE EMERGENCIAS
// Este módulo maneja la interfaz de usuario para crear y gestionar emergencias

// Verificar que estamos en la página correcta
if (!document.body.classList.contains('emergency-view')) {
    console.warn('Emergency.js: No se debe ejecutar en esta página');
}

let emergencyConfig = {
    type: null,
    location: null,
    affectedRadius: null,
    severity: null,
    parameters: {}
};

let emergencyMap = null;
let emergencyCircle = null;
let emergencyMarker = null;

/**
 * Inicialización al cargar la página
 */
document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar si estamos en la vista de emergencias
    if (!document.body.classList.contains('emergency-view')) {
        return;
    }
    
    loadSystemStatus();
    loadActiveEmergencyIfExists();
    loadEmergencyHistoryList();
    setupEventListeners();
});

/**
 * Carga el estado del sistema
 */
function loadSystemStatus() {
    const activeEmergency = loadActiveEmergency();
    const history = getEmergencyHistory();
    
    document.getElementById('activeEmergenciesCount').textContent = activeEmergency ? 1 : 0;
    document.getElementById('totalEmergencies').textContent = history.length;
    
    if (history.length > 0) {
        const last = history[history.length - 1];
        document.getElementById('lastEmergency').textContent = 
            `${getEmergencyTypeName(last.type)} - ${last.location.name}`;
    }
}

/**
 * Carga la emergencia activa si existe
 */
function loadActiveEmergencyIfExists() {
    const activeEmergency = loadActiveEmergency();
    
    if (activeEmergency) {
        document.getElementById('createEmergencySection').style.display = 'none';
        document.getElementById('activeEmergencySection').style.display = 'block';
        renderActiveEmergency(activeEmergency);
    }
}

/**
 * Renderiza la emergencia activa
 */
function renderActiveEmergency(emergency) {
    const container = document.getElementById('activeEmergencyContent');
    const statusInfo = getEmergencyStatus(emergency);
    const simulation = typeof loadSharedSimulationState === 'function' ? loadSharedSimulationState() : null;
    const alerts = emergency.alerts || [];
    
    container.innerHTML = `
        <div class="emergency-info-grid">
            <div class="info-card">
                <h3>DETALLES DEL EVENTO</h3>
                <div class="info-row">
                    <span class="label">ID:</span>
                    <span class="value">${emergency.id}</span>
                </div>
                <div class="info-row">
                    <span class="label">Tipo:</span>
                    <span class="value">${getEmergencyTypeName(emergency.type)}</span>
                </div>
                <div class="info-row">
                    <span class="label">Ubicación:</span>
                    <span class="value">${emergency.location.name}</span>
                </div>
                <div class="info-row">
                    <span class="label">Nivel:</span>
                    <span class="value" style="color: ${getSeverityColor(emergency.severity)}">${emergency.severity.toUpperCase()}</span>
                </div>
                <div class="info-row">
                    <span class="label">Radio de afectación:</span>
                    <span class="value">${emergency.affectedRadius} km</span>
                </div>
                <div class="info-row">
                    <span class="label">Estado:</span>
                    <span class="value">${statusInfo.icon} ${statusInfo.text}</span>
                </div>
                <div class="info-row">
                    <span class="label">Tiempo transcurrido:</span>
                    <span class="value">T+${simulation?.simulationTime || 0} min</span>
                </div>
            </div>
            
            <div class="info-card">
                <h3>IMPACTO ESTIMADO</h3>
                <div class="info-row">
                    <span class="label">Pacientes totales:</span>
                    <span class="value">${emergency.estimatedImpact.totalPatients}</span>
                </div>
                <div class="info-row">
                    <span class="label">Críticos:</span>
                    <span class="value" style="color: var(--emergency-danger)">${emergency.estimatedImpact.criticalPatients}</span>
                </div>
                <div class="info-row">
                    <span class="label">Moderados:</span>
                    <span class="value" style="color: var(--emergency-warning)">${emergency.estimatedImpact.moderatePatients}</span>
                </div>
                <div class="info-row">
                    <span class="label">Leves:</span>
                    <span class="value" style="color: var(--emergency-success)">${emergency.estimatedImpact.minorPatients}</span>
                </div>
                <div class="info-row">
                    <span class="label">Ambulancias requeridas:</span>
                    <span class="value">${emergency.estimatedImpact.ambulancesRequired}</span>
                </div>
            </div>
            
            <div class="info-card">
                <h3>HOSPITALES AFECTADOS</h3>
                ${emergency.affectedHospitals.map(h => `
                    <div class="info-row">
                        <span class="label">${h.nombre}</span>
                        <span class="value" style="color: var(--emergency-danger)">${h.distance} km</span>
                    </div>
                `).join('')}
                ${emergency.affectedHospitals.length === 0 ? 
                    '<div class="info-row"><span class="label">Ninguno en zona directa</span></div>' : ''}
            </div>
            
            <div class="info-card">
                <h3>RECURSOS ESTIMADOS</h3>
                <div class="info-row">
                    <span class="label">Camas necesarias:</span>
                    <span class="value">${emergency.estimatedImpact.totalPatients}</span>
                </div>
                <div class="info-row">
                    <span class="label">Camas críticas necesarias:</span>
                    <span class="value">${emergency.estimatedImpact.criticalPatients}</span>
                </div>
                <div class="info-row">
                    <span class="label">Ambulancias necesarias:</span>
                    <span class="value">${emergency.estimatedImpact.ambulancesRequired}</span>
                </div>
            </div>
            <div class="info-card">
                <h3>ALERTAS OPERATIVAS</h3>
                ${alerts.length ? alerts.map(alert => `<div class="info-row"><span class="label">${alert.type === 'critical' ? '🔴' : '⚠️'}</span><span class="value">${alert.message}</span></div>`).join('') : '<div class="info-row"><span class="label">Sin alertas</span></div>'}
            </div>
        </div>
        
        ${String(emergency.status).toUpperCase() === 'READY' ? `
            <div style="margin-top: 2rem; text-align: center;">
                <button class="btn-primary" onclick="activateEmergency()" style="font-size: 1.25rem; padding: 1.5rem 3rem;">
                    🚨 ACTIVAR EMERGENCIA
                </button>
            </div>
        ` : ''}
        ${['ACTIVE', 'PAUSED'].includes(String(emergency.status).toUpperCase()) ? `
            <div style="margin-top: 2rem; text-align: center;">
                <button class="btn-primary" onclick="initiateSimulation()" style="font-size: 1.25rem; padding: 1.5rem 3rem;">
                    ▶ INICIAR SIMULACIÓN
                </button>
                <p style="margin-top: 1rem; color: var(--emergency-text-muted); font-size: 0.875rem;">
                    Esta acción preparará el escenario para la simulación (Capa 4)
                </p>
            </div>
        ` : ''}
    `;
}

/**
 * Muestra el wizard de creación de emergencia
 */
function showEmergencyWizard() {
    document.getElementById('createEmergencySection').style.display = 'none';
    document.getElementById('emergencyWizard').style.display = 'block';
    
    // Resetear configuración
    emergencyConfig = {
        type: null,
        location: null,
        affectedRadius: null,
        severity: null,
        parameters: {}
    };
    document.getElementById('estimatedDuration').value = 60;
    document.getElementById('eventDateTime').value = new Date().toISOString().slice(0, 16);
    document.getElementById('estimatedAffected').value = 0;
    
    // Inicializar mapa
    setTimeout(() => {
        initializeEmergencyMap();
    }, 100);
}

/**
 * Cancela el wizard y vuelve a la vista principal
 */
function cancelEmergencyWizard() {
    document.getElementById('emergencyWizard').style.display = 'none';
    document.getElementById('createEmergencySection').style.display = 'block';
    
    if (emergencyMap) {
        emergencyMap.remove();
        emergencyMap = null;
    }
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Selección de tipo de emergencia
    document.querySelectorAll('.emergency-type-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.emergency-type-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            emergencyConfig.type = this.dataset.type;
            
            // Renderizar parámetros específicos
            renderEventParameters(emergencyConfig.type);
            updateEstimatedImpact();
        });
    });
    
    // Selección de ubicación
    document.getElementById('locationSelect').addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            emergencyConfig.location = {
                name: selectedOption.textContent,
                id: selectedOption.value,
                latitude: parseFloat(selectedOption.dataset.lat),
                longitude: parseFloat(selectedOption.dataset.lon)
            };
            
            updateMapLocation();
            updateEstimatedImpact();
        }
    });
    
    // Selección de radio
    document.querySelectorAll('.radius-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.radius-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            emergencyConfig.affectedRadius = parseInt(this.dataset.radius);
            document.getElementById('customRadius').value = '';
            
            updateMapRadius();
            updateEstimatedImpact();
        });
    });
    
    // Radio personalizado
    document.getElementById('customRadius').addEventListener('input', function() {
        if (this.value) {
            document.querySelectorAll('.radius-btn').forEach(b => b.classList.remove('selected'));
            emergencyConfig.affectedRadius = parseFloat(this.value);
            
            updateMapRadius();
            updateEstimatedImpact();
        }
    });
    
    // Selección de gravedad
    document.querySelectorAll('.severity-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.severity-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            emergencyConfig.severity = this.dataset.severity;
            
            updateEstimatedImpact();
        });
    });

    document.getElementById('estimatedDuration').addEventListener('input', function() {
        emergencyConfig.durationMinutes = Math.max(1, Number(this.value) || 1);
    });

    document.getElementById('eventDateTime').addEventListener('change', function() {
        emergencyConfig.eventDateTime = this.value ? new Date(this.value).toISOString() : new Date().toISOString();
    });
}

/**
 * Renderiza los parámetros específicos del evento
 */
function renderEventParameters(type) {
    const container = document.getElementById('eventParameters');
    const parameters = getEmergencyParameters(type);
    
    if (parameters.length === 0) {
        container.innerHTML = '<p style="color: var(--emergency-text-muted);">No hay parámetros adicionales para este tipo de emergencia.</p>';
        return;
    }
    
    container.innerHTML = parameters.map(param => {
        if (param.type === 'select') {
            return `
                <div class="parameter-field">
                    <label class="form-label">${param.label}</label>
                    <select class="form-select" data-param="${param.id}">
                        ${param.options.map(opt => 
                            `<option value="${opt.value}">${opt.label}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
        } else {
            return `
                <div class="parameter-field">
                    <label class="form-label">${param.label}</label>
                    <input type="${param.type}" class="form-input" data-param="${param.id}"
                           min="${param.min || ''}" max="${param.max || ''}" 
                           step="${param.step || ''}" value="${param.default || ''}">
                </div>
            `;
        }
    }).join('');
    
    // Event listeners para parámetros
    container.querySelectorAll('[data-param]').forEach(input => {
        input.addEventListener('change', function() {
            emergencyConfig.parameters[this.dataset.param] = this.type === 'number' ? 
                parseFloat(this.value) : this.value;
            updateEstimatedImpact();
        });
        
        // Inicializar valores por defecto
        const param = parameters.find(p => p.id === input.dataset.param);
        if (param && param.default) {
            emergencyConfig.parameters[input.dataset.param] = 
                param.type === 'number' ? param.default : param.options[0].value;
        }
    });
}

/**
 * Actualiza el impacto estimado
 */
function updateEstimatedImpact() {
    const impact = calculateEstimatedImpact(
        emergencyConfig.type,
        emergencyConfig.severity,
        emergencyConfig.affectedRadius,
        emergencyConfig.parameters
    );
    
    document.getElementById('estimatedTotal').textContent = impact.totalPatients;
    document.getElementById('estimatedCritical').textContent = impact.criticalPatients;
    document.getElementById('estimatedModerate').textContent = impact.moderatePatients;
    document.getElementById('estimatedMinor').textContent = impact.minorPatients;
    document.getElementById('estimatedAmbulances').textContent = impact.ambulancesRequired;
    document.getElementById('estimatedAffected').value = impact.totalPatients;
    
    // Actualizar hospitales afectados
    if (emergencyConfig.location && emergencyConfig.affectedRadius) {
        const hospitals = calculateAffectedHospitals(
            emergencyConfig.location,
            emergencyConfig.affectedRadius
        );
        
        renderAffectedHospitalsList(hospitals.affected);
        renderAvailableHospitalsList(hospitals.available);
    }
}

/**
 * Renderiza la lista de hospitales afectados
 */
function renderAffectedHospitalsList(hospitals) {
    const container = document.getElementById('affectedHospitalsList');
    
    if (hospitals.length === 0) {
        container.innerHTML = '<p style="color: var(--emergency-text-muted); padding: 1rem;">Ningún hospital en zona directa de impacto</p>';
        return;
    }
    
    container.innerHTML = hospitals.map(h => `
        <div class="hospital-item">
            <span class="hospital-name">${h.nombre}</span>
            <span class="hospital-status affected">⚠️ ${h.distance} km</span>
        </div>
    `).join('');
}

/**
 * Renderiza la lista de hospitales disponibles
 */
function renderAvailableHospitalsList(hospitals) {
    const container = document.getElementById('availableHospitalsList');
    
    if (hospitals.length === 0) {
        container.innerHTML = '<p style="color: var(--emergency-text-muted); padding: 1rem;">No hay hospitales cercanos disponibles</p>';
        return;
    }
    
    container.innerHTML = hospitals.map(h => `
        <div class="hospital-item">
            <span class="hospital-name">${h.nombre}</span>
            <span class="hospital-status available">🟢 ${h.distance} km</span>
        </div>
    `).join('');
}

/**
 * Inicializa el mapa de emergencias
 */
function initializeEmergencyMap() {
    if (emergencyMap) {
        emergencyMap.remove();
    }
    
    emergencyMap = L.map('emergencyMap', {
        center: [-31.6529, -64.4283], // Alta Gracia
        zoom: 11,
        zoomControl: true
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(emergencyMap);
    
    // Agregar hospitales al mapa
    hospitalNetwork.hospitals.forEach(hospital => {
        if (hospital.geolocalizacion) {
            const marker = L.circleMarker(
                [hospital.geolocalizacion.latitud, hospital.geolocalizacion.longitud],
                {
                    radius: 6,
                    fillColor: getHospitalColor(hospital.estado),
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }
            );
            marker.bindPopup(`<b>${hospital.nombre}</b><br>${hospital.ciudad}`);
            marker.addTo(emergencyMap);
        }
    });
}

/**
 * Actualiza la ubicación en el mapa
 */
function updateMapLocation() {
    if (!emergencyMap || !emergencyConfig.location) return;
    
    // Remover marcador anterior
    if (emergencyMarker) {
        emergencyMap.removeLayer(emergencyMarker);
    }
    
    // Agregar nuevo marcador
    emergencyMarker = L.marker(
        [emergencyConfig.location.latitude, emergencyConfig.location.longitude],
        {
            icon: L.divIcon({
                className: 'emergency-marker-icon',
                html: '<div style="background: #ff006e; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(255,0,110,0.5);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }
    );
    emergencyMarker.addTo(emergencyMap);
    
    // Centrar mapa
    emergencyMap.setView(
        [emergencyConfig.location.latitude, emergencyConfig.location.longitude],
        12
    );
    
    updateMapRadius();
}

/**
 * Actualiza el círculo del radio de afectación
 */
function updateMapRadius() {
    if (!emergencyMap || !emergencyConfig.location || !emergencyConfig.affectedRadius) return;
    
    // Remover círculo anterior
    if (emergencyCircle) {
        emergencyMap.removeLayer(emergencyCircle);
    }
    
    // Agregar nuevo círculo
    emergencyCircle = L.circle(
        [emergencyConfig.location.latitude, emergencyConfig.location.longitude],
        {
            radius: emergencyConfig.affectedRadius * 1000, // Convertir a metros
            color: '#ff006e',
            fillColor: '#ff006e',
            fillOpacity: 0.2,
            weight: 2
        }
    );
    emergencyCircle.addTo(emergencyMap);
    
    // Ajustar vista para mostrar todo el círculo
    emergencyMap.fitBounds(emergencyCircle.getBounds(), { padding: [50, 50] });
}

/**
 * Obtiene el color según el estado del hospital
 */
function getHospitalColor(estado) {
    switch (estado) {
        case 'NORMAL': return '#00ff88';
        case 'ADVERTENCIA': return '#ffd60a';
        case 'ALTA DEMANDA': return '#ff9900';
        case 'SATURADO': return '#ff006e';
        default: return '#8892b0';
    }
}

/**
 * Crea la emergencia
 */
function createEmergency() {
    // Validar
    const validation = validateEmergency(emergencyConfig);
    if (!validation.isValid) {
        alert('Por favor completá todos los campos:\n\n' + validation.errors.join('\n'));
        return;
    }
    
    // Calcular impacto final
    const impact = calculateEstimatedImpact(
        emergencyConfig.type,
        emergencyConfig.severity,
        emergencyConfig.affectedRadius,
        emergencyConfig.parameters
    );
    
    // Calcular hospitales afectados
    const hospitals = calculateAffectedHospitals(
        emergencyConfig.location,
        emergencyConfig.affectedRadius
    );
    
    // Crear objeto de emergencia
    const emergency = {
        id: generateEmergencyId(),
        type: emergencyConfig.type,
        location: emergencyConfig.location,
        severity: emergencyConfig.severity,
        affectedRadius: emergencyConfig.affectedRadius,
        parameters: emergencyConfig.parameters,
        estimatedImpact: impact,
        affectedHospitals: hospitals.affected,
        availableHospitals: hospitals.available,
        coordinates: {
            latitude: emergencyConfig.location.latitude,
            longitude: emergencyConfig.location.longitude
        },
        radius: emergencyConfig.affectedRadius,
        estimatedAffected: impact.totalPatients,
        status: EMERGENCY_STATUS.READY,
        alerts: [],
        createdAt: emergencyConfig.eventDateTime || new Date().toISOString(),
        estimatedDuration: emergencyConfig.durationMinutes || 60,
        simulationStartedAt: null
    };
    emergency.catastropheReport = calculateCatastropheReport(emergency);
    
    // Guardar
    saveActiveEmergency(emergency);
    saveSharedActiveEmergency(emergency);
    
    // Cerrar wizard
    cancelEmergencyWizard();
    
    // Recargar vista
    loadSystemStatus();
    loadActiveEmergencyIfExists();
    loadEmergencyHistoryList();
    
    // Mostrar mensaje
    alert('✅ EMERGENCIA PREPARADA\n\nRevisá el análisis y activala para afectar a toda la red.');
}

function activateEmergency() {
    const emergency = loadActiveEmergency();
    if (!emergency || String(emergency.status).toUpperCase() !== 'READY') {
        alert('La emergencia no está lista para activarse.');
        return;
    }

    emergency.status = EMERGENCY_STATUS.ACTIVE;
    emergency.snapshot = typeof createSharedNetworkSnapshot === 'function' ? createSharedNetworkSnapshot() : null;
    emergency.alerts = [
        { type: 'critical', message: `🚨 Emergencia activada: ${getEmergencyTypeName(emergency.type)}`, createdAt: new Date().toISOString() },
        { type: 'warning', message: `⚠️ ${emergency.affectedHospitals.length} hospitales afectados por el área de impacto.`, createdAt: new Date().toISOString() }
    ];
    emergency.activatedAt = new Date().toISOString();
    if (typeof saveSharedSimulationState === 'function') {
        saveSharedSimulationState({
            active: false,
            prepared: true,
            emergencyId: emergency.id,
            simulationTime: 0,
            initialSnapshot: emergency.snapshot?.hospitals || null
        });
    }
    saveActiveEmergency(emergency);
    saveEmergencyToHistory(emergency);
    loadSystemStatus();
    loadActiveEmergencyIfExists();
    alert('🚨 EMERGENCIA ACTIVADA\n\nLa red hospitalaria ya refleja el escenario.');
}

/**
 * Inicia la simulación y redirige a la Capa 4
 */
function initiateSimulation() {
    const emergency = loadActiveEmergency();
    if (!emergency) {
        alert('No hay ninguna emergencia activa');
        return;
    }
    
    // Actualizar estado
    if (!['READY', 'ACTIVE', 'PAUSED'].includes(String(emergency.status).toUpperCase())) {
        alert('La emergencia no puede iniciar la simulación en su estado actual.');
        return;
    }
    emergency.status = EMERGENCY_STATUS.ACTIVE;
    emergency.simulationStartedAt = emergency.simulationStartedAt || new Date().toISOString();
    saveActiveEmergency(emergency);
    
    window.location.href = 'simulation.html';
}

/**
 * Limpia la emergencia activa
 */
function clearEmergency() {
    const activeSimulation = loadSharedSimulationState();
    if (activeSimulation?.active && !confirm('La simulación ya comenzó. ¿Deseás cancelar y restaurar la red?')) {
        return;
    }
    if (!activeSimulation?.active && !confirm('¿Estás seguro de cancelar esta emergencia?')) {
        return;
    }
    
    const emergency = loadActiveEmergency();
    if (emergency) {
        emergency.status = EMERGENCY_STATUS.CANCELLED;
        emergency.cancelledAt = new Date().toISOString();
        saveEmergencyToHistory(emergency);

        if (activeSimulation?.initialSnapshot && hospitalNetwork?.hospitals) {
            hospitalNetwork.hospitals = JSON.parse(JSON.stringify(activeSimulation.initialSnapshot));
            saveSharedNetwork();
        }
    }

    clearSharedSimulationState();
    
    clearActiveEmergency();
    location.reload();
}

/**
 * Carga el historial de emergencias
 */
function loadEmergencyHistoryList() {
    const history = getEmergencyHistory();
    const container = document.getElementById('emergencyHistory');
    
    if (history.length === 0) {
        container.innerHTML = '<div class="no-history"><span>No hay emergencias registradas</span></div>';
        return;
    }
    
    // Mostrar las últimas 6
    const recent = history.slice(-6).reverse();
    
    container.innerHTML = recent.map(e => {
        const statusInfo = getEmergencyStatus(e);
        return `
            <div class="history-card">
                <div class="history-id">${e.id}</div>
                <div class="history-type">${getEmergencyTypeName(e.type)}</div>
                <div class="history-location">${e.location.name}</div>
                <div class="history-severity" style="background-color: ${getSeverityColor(e.severity)}20; color: ${getSeverityColor(e.severity)}">
                    ${e.severity.toUpperCase()}
                </div>
                <div class="history-date">${formatDate(e.createdAt)}</div>
            </div>
        `;
    }).join('');
}
