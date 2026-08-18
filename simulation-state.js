// HOSPITAL COMMAND NETWORK - CAPA 4
// ESTADO DE LA SIMULACIÓN
// Este módulo mantiene el estado actual de la simulación

let simulationState = {
    active: false,
    paused: false,
    simulationTime: 0,           // Tiempo en minutos simulados
    speed: 'x1',                 // Velocidad actual (x1, x2, x5, x10)
    intervalId: null,            // ID del interval para poder pausar/cancelar
    
    // Pacientes
    patientsGenerated: 0,
    criticalGenerated: 0,
    moderateGenerated: 0,
    minorGenerated: 0,
    
    // Pacientes totales del escenario
    totalPatients: 0,
    totalCritical: 0,
    totalModerate: 0,
    totalMinor: 0,
    
    // Ambulancias
    ambulancesActive: 0,
    ambulancesTotal: 0,
    
    // Hospitales
    hospitalsAffected: [],
    hospitalsAvailable: [],
    hospitalsSaturated: 0,
    
    // Eventos de la simulación
    events: [],
    
    // Alertas generadas
    alerts: [],
    
    // Métricas de la red
    networkMetrics: {
        totalBedsAvailable: 0,
        totalCriticalBedsAvailable: 0,
        networkOccupancy: 0,
        averageEmergencyOccupancy: 0,
        totalStaffAvailable: 0
    },
    
    // Estado inicial (snapshot para poder reiniciar)
    initialSnapshot: null
};

/**
 * Inicializa el estado de la simulación con una emergencia
 */
function initializeSimulationState(emergency) {
    const persisted = typeof loadSharedSimulationState === 'function' ? loadSharedSimulationState() : null;
    if (persisted && persisted.emergencyId === emergency.id && persisted.active) {
        simulationState = { ...simulationState, ...persisted, intervalId: null };
        return simulationState;
    }

    simulationState = {
        active: true,
        paused: false,
        simulationTime: 0,
        speed: 'x1',
        intervalId: null,
        
        patientsGenerated: 0,
        criticalGenerated: 0,
        moderateGenerated: 0,
        minorGenerated: 0,
        
        totalPatients: emergency.estimatedImpact.totalPatients,
        totalCritical: emergency.estimatedImpact.criticalPatients,
        totalModerate: emergency.estimatedImpact.moderatePatients,
        totalMinor: emergency.estimatedImpact.minorPatients,
        
        ambulancesActive: 0,
        ambulancesTotal: emergency.estimatedImpact.ambulancesRequired,
        
        hospitalsAffected: emergency.affectedHospitals.map(h => h.id),
        hospitalsAvailable: emergency.availableHospitals.map(h => h.id),
        hospitalsSaturated: 0,
        
        events: [],
        alerts: [],
        
        networkMetrics: calculateInitialNetworkMetrics(),
        
        initialSnapshot: createHospitalSnapshot()
    };

    persistSimulationState();
    
    // Registrar evento inicial
    recordEvent('🚨 Simulación iniciada: ' + emergency.location.name, 'critical');
    
    return simulationState;
}

/**
 * Crea un snapshot (copia profunda) del estado actual de los hospitales
 */
function createHospitalSnapshot() {
    return JSON.parse(JSON.stringify(hospitalNetwork.hospitals));
}

/**
 * Restaura el estado de los hospitales desde un snapshot
 */
function restoreHospitalSnapshot(snapshot) {
    if (!snapshot) return;
    
    hospitalNetwork.hospitals = JSON.parse(JSON.stringify(snapshot));
    
    // Recalcular métricas de cada hospital
    hospitalNetwork.hospitals.forEach(hospital => {
        updateHospitalMetrics(hospital);
    });
    if (typeof saveSharedNetwork === 'function') {
        saveSharedNetwork();
    }
}

function persistSimulationState() {
    if (typeof saveSharedSimulationState !== 'function') return;
    const state = { ...simulationState, intervalId: null };
    saveSharedSimulationState(state);
    if (typeof saveSharedNetwork === 'function') {
        saveSharedNetwork();
    }
}

/**
 * Calcula las métricas iniciales de la red
 */
function calculateInitialNetworkMetrics() {
    let totalBeds = 0;
    let totalCriticalBeds = 0;
    let totalOccupied = 0;
    let totalCapacity = 0;
    let totalEmergencyOccupancy = 0;
    let totalStaff = 0;
    
    hospitalNetwork.hospitals.forEach(hospital => {
        totalBeds += hospital.camas.disponibles;
        totalCriticalBeds += hospital.camasCriticas.disponibles;
        totalOccupied += hospital.camas.ocupadas;
        totalCapacity += hospital.camas.totales;
        totalEmergencyOccupancy += hospital.guardia.porcentajeOcupada;
        totalStaff += hospital.personal.disponible;
    });
    
    return {
        totalBedsAvailable: totalBeds,
        totalCriticalBedsAvailable: totalCriticalBeds,
        networkOccupancy: Math.round((totalOccupied / totalCapacity) * 100),
        averageEmergencyOccupancy: Math.round(totalEmergencyOccupancy / hospitalNetwork.hospitals.length),
        totalStaffAvailable: totalStaff
    };
}

/**
 * Actualiza las métricas de la red
 */
function updateNetworkMetrics() {
    simulationState.networkMetrics = calculateInitialNetworkMetrics();
    
    // Contar hospitales saturados
    simulationState.hospitalsSaturated = hospitalNetwork.hospitals.filter(
        h => h.estado === 'SATURADO'
    ).length;
}

/**
 * Registra un evento en la línea de tiempo
 */
function recordEvent(message, level = 'info') {
    const event = {
        time: simulationState.simulationTime,
        message: message,
        level: level,
        timestamp: new Date().toISOString()
    };
    
    simulationState.events.push(event);
    
    console.log(`[${formatSimulationTime(simulationState.simulationTime)}] ${message}`);
    
    return event;
}

/**
 * Agrega una alerta
 */
function addAlert(message, level, hospitalId = null) {
    const alert = {
        time: simulationState.simulationTime,
        message: message,
        level: level,
        hospitalId: hospitalId,
        timestamp: new Date().toISOString()
    };
    
    // Evitar duplicados
    const exists = simulationState.alerts.some(
        a => a.message === message && a.hospitalId === hospitalId
    );
    
    if (!exists) {
        simulationState.alerts.push(alert);
        recordEvent(message, level);
    }
    
    return alert;
}

/**
 * Formatea el tiempo de simulación
 */
function formatSimulationTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Obtiene el estado actual de la simulación
 */
function getSimulationState() {
    return simulationState;
}

/**
 * Actualiza la velocidad de la simulación
 */
function setSimulationSpeed(speed) {
    simulationState.speed = speed;
}

/**
 * Pausa la simulación
 */
function pauseSimulationState() {
    simulationState.paused = true;
    if (simulationState.intervalId) {
        clearInterval(simulationState.intervalId);
        simulationState.intervalId = null;
    }
    recordEvent('⏸ Simulación pausada', 'info');
    const emergency = loadActiveEmergency();
    if (emergency) {
        emergency.status = EMERGENCY_STATUS.PAUSED;
        saveActiveEmergency(emergency);
    }
}

/**
 * Reanuda la simulación
 */
function resumeSimulationState() {
    simulationState.paused = false;
    recordEvent('▶ Simulación reanudada', 'info');
    const emergency = loadActiveEmergency();
    if (emergency) {
        emergency.status = EMERGENCY_STATUS.ACTIVE;
        saveActiveEmergency(emergency);
    }
}

/**
 * Detiene la simulación
 */
function stopSimulationState() {
    if (simulationState.intervalId) {
        clearInterval(simulationState.intervalId);
        simulationState.intervalId = null;
    }
    simulationState.active = false;
    simulationState.paused = false;
    recordEvent('⏹ Simulación finalizada', 'info');
    persistSimulationState();
}

/**
 * Reinicia la simulación
 */
function resetSimulationState() {
    if (simulationState.intervalId) {
        clearInterval(simulationState.intervalId);
        simulationState.intervalId = null;
    }
    
    // Restaurar hospitales al estado inicial
    if (simulationState.initialSnapshot) {
        restoreHospitalSnapshot(simulationState.initialSnapshot);
    }

    // Limpiar pacientes simulados (Capa 5 — modelo disponible)
    if (typeof clearAllPatients === 'function') {
        clearAllPatients();
    }
    
    // Resetear estado
    const emergency = loadActiveEmergency();
    if (emergency) {
        initializeSimulationState(emergency);
    }
    
    recordEvent('↻ Simulación reiniciada', 'info');
}

/**
 * Obtiene el progreso de generación de pacientes (0-100%)
 */
function getPatientGenerationProgress() {
    if (simulationState.totalPatients === 0) return 0;
    return Math.round((simulationState.patientsGenerated / simulationState.totalPatients) * 100);
}

/**
 * Verifica si la simulación está completa (todos los pacientes generados)
 */
function isSimulationComplete() {
    return simulationState.patientsGenerated >= simulationState.totalPatients;
}

/**
 * Obtiene las últimas N alertas
 */
function getRecentAlerts(count = 10) {
    return simulationState.alerts.slice(-count);
}

/**
 * Obtiene los últimos N eventos
 */
function getRecentEvents(count = 10) {
    return simulationState.events.slice(-count);
}

/**
 * Limpia alertas antiguas (opcional, para evitar acumulación excesiva)
 */
function clearOldAlerts(keepLast = 50) {
    if (simulationState.alerts.length > keepLast) {
        simulationState.alerts = simulationState.alerts.slice(-keepLast);
    }
}
