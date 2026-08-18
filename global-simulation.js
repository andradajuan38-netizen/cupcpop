// HOSPITAL COMMAND NETWORK - SISTEMA GLOBAL DE SIMULACIÓN
// Este módulo maneja el estado global de simulación que afecta a toda la plataforma

/**
 * CLAVE DE ALMACENAMIENTO GLOBAL
 */
const GLOBAL_SIMULATION_KEY = 'HOSPITAL_COMMAND_GLOBAL_SIMULATION';

/**
 * Estado global de simulación
 */
let globalSimulationState = {
    active: false,
    paused: false,
    simulationTime: 0,
    speed: 'x1',
    
    // Emergencia activa
    emergencyId: null,
    emergencyType: null,
    emergencyLocation: null,
    emergencySeverity: null,
    
    // Snapshot para restauración
    originalSnapshot: null,
    
    // Métricas de la simulación
    patientsGenerated: 0,
    criticalGenerated: 0,
    moderateGenerated: 0,
    minorGenerated: 0,
    
    // Totales del escenario
    totalPatients: 0,
    totalCritical: 0,
    totalModerate: 0,
    totalMinor: 0,
    
    // Eventos y alertas
    events: [],
    alerts: [],
    
    // Métricas de red
    networkMetrics: {
        totalBedsAvailable: 0,
        totalCriticalBedsAvailable: 0,
        networkOccupancy: 0,
        hospitalsSaturated: 0,
        averageResources: 0
    },
    
    // Timestamp para sincronización
    lastUpdated: null
};

/**
 * Verifica si hay una simulación activa
 */
function isSimulationActive() {
    loadGlobalSimulationState();
    return globalSimulationState.active;
}

/**
 * Verifica si la simulación está pausada
 */
function isSimulationPaused() {
    loadGlobalSimulationState();
    return globalSimulationState.active && globalSimulationState.paused;
}

/**
 * Obtiene el estado global de la simulación
 */
function getGlobalSimulationState() {
    loadGlobalSimulationState();
    return { ...globalSimulationState };
}

/**
 * Carga el estado global desde localStorage
 */
function loadGlobalSimulationState() {
    try {
        const stored = localStorage.getItem(GLOBAL_SIMULATION_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            globalSimulationState = { ...globalSimulationState, ...parsed };
            
            // Aplicar estado a la red hospitalaria si hay simulación activa
            if (globalSimulationState.active && globalSimulationState.modifiedHospitals) {
                applySimulatedStateToNetwork();
            }
        }
    } catch (error) {
        console.error('Error cargando estado global de simulación:', error);
    }
}

/**
 * Guarda el estado global en localStorage
 */
function saveGlobalSimulationState() {
    try {
        globalSimulationState.lastUpdated = new Date().toISOString();
        localStorage.setItem(GLOBAL_SIMULATION_KEY, JSON.stringify(globalSimulationState));
    } catch (error) {
        console.error('Error guardando estado global de simulación:', error);
    }
}

/**
 * Crea un snapshot del estado actual de la red
 */
function createNetworkSnapshot() {
    if (typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        console.error('hospitalNetwork no disponible para snapshot');
        return null;
    }
    
    return {
        hospitals: JSON.parse(JSON.stringify(hospitalNetwork.hospitals)),
        timestamp: new Date().toISOString(),
        version: hospitalNetwork.version || '1.0'
    };
}

/**
 * Inicia una simulación global
 */
function startGlobalSimulation(emergency) {
    if (!emergency) {
        console.error('No se puede iniciar simulación sin emergencia');
        return false;
    }
    
    // Crear snapshot antes de modificar cualquier dato
    const snapshot = createNetworkSnapshot();
    if (!snapshot) {
        console.error('No se pudo crear snapshot de la red');
        return false;
    }
    
    // Configurar estado global
    globalSimulationState = {
        active: true,
        paused: false,
        simulationTime: 0,
        speed: 'x1',
        
        emergencyId: emergency.id,
        emergencyType: emergency.type,
        emergencyLocation: emergency.location?.name || 'Sin ubicación',
        emergencySeverity: emergency.severity,
        
        originalSnapshot: snapshot,
        
        patientsGenerated: 0,
        criticalGenerated: 0,
        moderateGenerated: 0,
        minorGenerated: 0,
        
        totalPatients: emergency.estimatedImpact?.totalPatients || 0,
        totalCritical: emergency.estimatedImpact?.criticalPatients || 0,
        totalModerate: emergency.estimatedImpact?.moderatePatients || 0,
        totalMinor: emergency.estimatedImpact?.minorPatients || 0,
        
        events: [],
        alerts: [],
        
        networkMetrics: calculateInitialNetworkMetrics(),
        
        modifiedHospitals: {},
        
        lastUpdated: new Date().toISOString()
    };
    
    // Registrar evento inicial
    recordGlobalEvent('🚨 Simulación iniciada: ' + emergency.location?.name, 'critical');
    recordGlobalEvent('📍 Tipo: ' + getEmergencyTypeName(emergency.type), 'info');
    recordGlobalEvent('⚠️ Severidad: ' + emergency.severity.toUpperCase(), 'warning');
    
    // Guardar estado
    saveGlobalSimulationState();
    
    console.log('Simulación global iniciada:', globalSimulationState.emergencyLocation);
    return true;
}

/**
 * Avanza la simulación global
 */
function advanceGlobalSimulation(minutes = 1) {
    if (!globalSimulationState.active || globalSimulationState.paused) {
        return false;
    }
    
    // Avanzar tiempo
    globalSimulationState.simulationTime += minutes;
    
    // Generar y distribuir pacientes
    generateAndDistributePatients();
    
    // Actualizar métricas de red
    updateGlobalNetworkMetrics();
    
    // Generar alertas
    generateGlobalAlerts();
    
    // Guardar estado
    saveGlobalSimulationState();
    
    return true;
}

/**
 * Genera y distribuye pacientes según el tiempo transcurrido
 */
function generateAndDistributePatients() {
    // Calcular cuántos pacientes deberían haber llegado a este tiempo
    const arrivalPercentage = getPatientArrivalPercentage(globalSimulationState.simulationTime);
    const shouldHaveArrived = Math.floor((arrivalPercentage / 100) * globalSimulationState.totalPatients);
    
    // Calcular nuevos pacientes
    const newPatients = shouldHaveArrived - globalSimulationState.patientsGenerated;
    
    if (newPatients > 0) {
        // Distribuir por gravedad
        const criticalRatio = globalSimulationState.totalCritical / globalSimulationState.totalPatients;
        const moderateRatio = globalSimulationState.totalModerate / globalSimulationState.totalPatients;
        
        const newCritical = Math.min(
            Math.floor(newPatients * criticalRatio),
            globalSimulationState.totalCritical - globalSimulationState.criticalGenerated
        );
        const newModerate = Math.min(
            Math.floor(newPatients * moderateRatio),
            globalSimulationState.totalModerate - globalSimulationState.moderateGenerated
        );
        const newMinor = newPatients - newCritical - newModerate;
        
        // Actualizar contadores
        globalSimulationState.patientsGenerated += newPatients;
        globalSimulationState.criticalGenerated += newCritical;
        globalSimulationState.moderateGenerated += newModerate;
        globalSimulationState.minorGenerated += newMinor;
        
        // Distribuir a hospitales (modifica hospitalNetwork)
        distributeGlobalPatients(newCritical, newModerate, newMinor);
        
        // Registrar evento
        if (newPatients > 0) {
            let message = `👥 ${newPatients} pacientes ingresan a la red`;
            if (newCritical > 0) {
                message += ` (${newCritical} críticos)`;
            }
            recordGlobalEvent(message, newCritical > 5 ? 'critical' : 'info');
        }
    }
}

/**
 * Distribuye pacientes entre hospitales (MODIFICA EL ESTADO REAL)
 */
function distributeGlobalPatients(critical, moderate, minor) {
    if (typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        console.error('hospitalNetwork no disponible para distribución');
        return;
    }
    
    const emergency = loadActiveEmergency();
    if (!emergency) return;
    
    // Obtener hospitales para distribución
    const affectedHospitals = hospitalNetwork.hospitals.filter(h => 
        emergency.affectedHospitals?.some(ah => ah.id === h.id)
    );
    
    const availableHospitals = hospitalNetwork.hospitals.filter(h =>
        emergency.availableHospitals?.some(ah => ah.id === h.id)
    );
    
    const targetHospitals = affectedHospitals.length > 0 ? 
        [...affectedHospitals, ...availableHospitals] : 
        hospitalNetwork.hospitals;
    
    if (targetHospitals.length === 0) return;
    
    // Calcular prioridades
    const priorities = targetHospitals.map(hospital => {
        const distance = emergency.affectedHospitals?.find(h => h.id === hospital.id)?.distance ||
                        emergency.availableHospitals?.find(h => h.id === hospital.id)?.distance ||
                        100;
        
        const capacity = (hospital.camas.disponibles / hospital.camas.totales) * 100;
        const status = hospital.porcentajeOcupacion;
        const isAffected = emergency.affectedHospitals?.some(h => h.id === hospital.id) ? 1 : 0;
        
        const score = 
            (1 - (distance / 100)) * 0.4 +
            (capacity / 100) * 0.3 +
            (1 - (status / 100)) * 0.2 +
            isAffected * 0.1;
        
        return { hospital, score };
    });
    
    // Ordenar por prioridad
    priorities.sort((a, b) => b.score - a.score);
    
    // Distribuir pacientes (MODIFICA DATOS REALES)
    distributePatientsByType(priorities, critical, 'critical');
    distributePatientsByType(priorities, moderate, 'moderate');
    distributePatientsByType(priorities, minor, 'minor');
    
    // Guardar hospitales modificados
    saveModifiedHospitals();
}

/**
 * Distribuye pacientes de un tipo específico
 */
function distributePatientsByType(priorities, patientCount, severity) {
    if (patientCount === 0) return;
    
    let remaining = patientCount;
    
    for (const { hospital } of priorities) {
        if (remaining <= 0) break;
        
        // Calcular capacidad
        let capacity = 0;
        if (severity === 'critical') {
            capacity = hospital.camasCriticas.disponibles;
        } else {
            capacity = hospital.camas.disponibles;
        }
        
        if (capacity > 0) {
            const assigned = Math.min(remaining, Math.ceil(capacity * 0.5));
            
            if (assigned > 0) {
                // MODIFICAR EL ESTADO REAL DEL HOSPITAL
                modifyHospitalResources(hospital, severity, assigned);
                remaining -= assigned;
            }
        }
    }
    
    // Pacientes sin asignar (saturación completa)
    if (remaining > 0) {
        recordGlobalEvent(
            `⚠️ ${remaining} pacientes ${severity} sin capacidad hospitalaria`,
            'critical'
        );
    }
}

/**
 * Modifica los recursos de un hospital (CAMBIOS REALES EN LOS DATOS)
 */
function modifyHospitalResources(hospital, severity, patientCount) {
    const previousState = hospital.estado;
    
    // Consumir camas
    if (severity === 'critical') {
        const consumption = Math.min(patientCount, hospital.camasCriticas.disponibles);
        hospital.camasCriticas.disponibles -= consumption;
        hospital.camasCriticas.ocupadas += consumption;
    } else {
        const consumption = Math.min(patientCount, hospital.camas.disponibles);
        hospital.camas.disponibles -= consumption;
        hospital.camas.ocupadas += consumption;
    }
    
    // Recalcular ocupación
    hospital.porcentajeOcupacion = Math.round(
        (hospital.camas.ocupadas / hospital.camas.totales) * 100
    );
    
    // Impactar guardia
    let emergencyImpact = 0;
    if (severity === 'critical') emergencyImpact = 5;
    else if (severity === 'moderate') emergencyImpact = 2;
    else emergencyImpact = 1;
    
    hospital.guardia.porcentajeOcupada = Math.min(
        100,
        hospital.guardia.porcentajeOcupada + (emergencyImpact * patientCount)
    );
    
    // Impactar personal
    let staffImpact = 0;
    if (severity === 'critical') staffImpact = 0.8;
    else if (severity === 'moderate') staffImpact = 0.4;
    else staffImpact = 0.1;
    
    const staffReduction = Math.floor(patientCount * staffImpact);
    hospital.personal.disponible = Math.max(
        0,
        hospital.personal.disponible - staffReduction
    );
    
    // Consumir insumos
    let supplyConsumption = 0;
    if (severity === 'critical') supplyConsumption = 2.0;
    else if (severity === 'moderate') supplyConsumption = 0.8;
    else supplyConsumption = 0.3;
    
    hospital.insumos.porcentajeDisponible = Math.max(
        0,
        hospital.insumos.porcentajeDisponible - (supplyConsumption * patientCount)
    );
    
    // Consumir quirófanos si es necesario
    const roomsNeeded = severity === 'critical' ? Math.ceil(patientCount * 0.4) : 
                       severity === 'moderate' ? Math.ceil(patientCount * 0.1) : 0;
    
    hospital.quirófanos.disponibles = Math.max(
        0,
        hospital.quirófanos.disponibles - roomsNeeded
    );
    
    // Recalcular estado del hospital
    hospital.estado = calculateHospitalStatus(hospital);
    
    // Si cambió el estado, registrar evento
    if (previousState !== hospital.estado) {
        const emoji = hospital.estado === 'SATURADO' ? '🔴' :
                     hospital.estado === 'ALTA DEMANDA' ? '🟠' :
                     hospital.estado === 'ADVERTENCIA' ? '🟡' : '🟢';
        
        recordGlobalEvent(
            `${emoji} ${hospital.nombre}: ${hospital.estado}`,
            hospital.estado === 'SATURADO' ? 'critical' : 'warning'
        );
    }
}

/**
 * Guarda los hospitales modificados para sincronización
 */
function saveModifiedHospitals() {
    if (typeof hospitalNetwork !== 'undefined' && hospitalNetwork.hospitals) {
        globalSimulationState.modifiedHospitals = {};
        hospitalNetwork.hospitals.forEach(hospital => {
            globalSimulationState.modifiedHospitals[hospital.id] = {
                ...hospital
            };
        });
    }
}

/**
 * Aplica el estado simulado a la red hospitalaria
 */
function applySimulatedStateToNetwork() {
    if (!globalSimulationState.modifiedHospitals || 
        typeof hospitalNetwork === 'undefined' || 
        !hospitalNetwork.hospitals) {
        return;
    }
    
    hospitalNetwork.hospitals.forEach(hospital => {
        const modified = globalSimulationState.modifiedHospitals[hospital.id];
        if (modified) {
            // Aplicar todos los cambios
            Object.assign(hospital, modified);
        }
    });
}

/**
 * Actualiza métricas globales de la red
 */
function updateGlobalNetworkMetrics() {
    if (typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        return;
    }
    
    let totalBeds = 0;
    let totalCriticalBeds = 0;
    let totalOccupied = 0;
    let totalCapacity = 0;
    let saturatedCount = 0;
    let totalResources = 0;
    
    hospitalNetwork.hospitals.forEach(hospital => {
        totalBeds += hospital.camas.disponibles;
        totalCriticalBeds += hospital.camasCriticas.disponibles;
        totalOccupied += hospital.camas.ocupadas;
        totalCapacity += hospital.camas.totales;
        totalResources += hospital.insumos.porcentajeDisponible;
        
        if (hospital.estado === 'SATURADO') {
            saturatedCount++;
        }
    });
    
    globalSimulationState.networkMetrics = {
        totalBedsAvailable: totalBeds,
        totalCriticalBedsAvailable: totalCriticalBeds,
        networkOccupancy: Math.round((totalOccupied / totalCapacity) * 100),
        hospitalsSaturated: saturatedCount,
        averageResources: Math.round(totalResources / hospitalNetwork.hospitals.length)
    };
}

/**
 * Genera alertas globales
 */
function generateGlobalAlerts() {
    if (typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        return;
    }
    
    hospitalNetwork.hospitals.forEach(hospital => {
        const hospitalName = hospital.nombre;
        
        // Alerta de camas críticas
        const criticalBedsPercent = (hospital.camasCriticas.disponibles / hospital.camasCriticas.totales) * 100;
        if (criticalBedsPercent < 10 && hospital.camasCriticas.disponibles > 0) {
            addGlobalAlert(
                `${hospitalName}: Camas críticas en nivel crítico (${Math.round(criticalBedsPercent)}%)`,
                'critical',
                hospital.id
            );
        }
        
        // Alerta de saturación
        if (hospital.estado === 'SATURADO') {
            addGlobalAlert(
                `${hospitalName}: Hospital saturado (${hospital.porcentajeOcupacion}%)`,
                'critical',
                hospital.id
            );
        }
        
        // Alerta de insumos
        if (hospital.insumos.porcentajeDisponible < 30) {
            addGlobalAlert(
                `${hospitalName}: Insumos críticos (${Math.round(hospital.insumos.porcentajeDisponible)}%)`,
                'critical',
                hospital.id
            );
        }
    });
    
    // Alerta de red saturada
    if (globalSimulationState.networkMetrics.hospitalsSaturated > 0) {
        addGlobalAlert(
            `⚠️ Red hospitalaria: ${globalSimulationState.networkMetrics.hospitalsSaturated} hospitales saturados`,
            'critical'
        );
    }
}

/**
 * Registra un evento global
 */
function recordGlobalEvent(message, level = 'info') {
    const event = {
        time: globalSimulationState.simulationTime,
        message: message,
        level: level,
        timestamp: new Date().toISOString()
    };
    
    globalSimulationState.events.push(event);
    
    console.log(`[T+${formatSimulationTime(globalSimulationState.simulationTime)}] ${message}`);
    
    return event;
}

/**
 * Agrega una alerta global
 */
function addGlobalAlert(message, level, hospitalId = null) {
    const alert = {
        time: globalSimulationState.simulationTime,
        message: message,
        level: level,
        hospitalId: hospitalId,
        timestamp: new Date().toISOString()
    };
    
    // Evitar duplicados
    const exists = globalSimulationState.alerts.some(
        a => a.message === message && a.hospitalId === hospitalId
    );
    
    if (!exists) {
        globalSimulationState.alerts.push(alert);
        recordGlobalEvent(message, level);
    }
    
    return alert;
}

/**
 * Pausa la simulación global
 */
function pauseGlobalSimulation() {
    if (!globalSimulationState.active) return false;
    
    globalSimulationState.paused = true;
    saveGlobalSimulationState();
    recordGlobalEvent('⏸ Simulación pausada', 'info');
    
    return true;
}

/**
 * Reanuda la simulación global
 */
function resumeGlobalSimulation() {
    if (!globalSimulationState.active) return false;
    
    globalSimulationState.paused = false;
    saveGlobalSimulationState();
    recordGlobalEvent('▶ Simulación reanudada', 'info');
    
    return true;
}

/**
 * Finaliza la simulación y restaura el estado original
 */
function finishGlobalSimulation() {
    if (!globalSimulationState.active) return false;
    
    // Restaurar snapshot original
    if (globalSimulationState.originalSnapshot && 
        typeof hospitalNetwork !== 'undefined' && 
        hospitalNetwork.hospitals) {
        
        hospitalNetwork.hospitals = JSON.parse(
            JSON.stringify(globalSimulationState.originalSnapshot.hospitals)
        );
        
        console.log('Estado original de la red restaurado');
    }
    
    // Limpiar estado global
    globalSimulationState = {
        active: false,
        paused: false,
        simulationTime: 0,
        speed: 'x1',
        emergencyId: null,
        emergencyType: null,
        emergencyLocation: null,
        emergencySeverity: null,
        originalSnapshot: null,
        patientsGenerated: 0,
        criticalGenerated: 0,
        moderateGenerated: 0,
        minorGenerated: 0,
        totalPatients: 0,
        totalCritical: 0,
        totalModerate: 0,
        totalMinor: 0,
        events: [],
        alerts: [],
        networkMetrics: {
            totalBedsAvailable: 0,
            totalCriticalBedsAvailable: 0,
            networkOccupancy: 0,
            hospitalsSaturated: 0,
            averageResources: 0
        },
        modifiedHospitals: {},
        lastUpdated: null
    };
    
    // Limpiar localStorage
    localStorage.removeItem(GLOBAL_SIMULATION_KEY);
    
    console.log('Simulación global finalizada y estado restaurado');
    return true;
}

/**
 * Reinicia la simulación global
 */
function resetGlobalSimulation() {
    if (!globalSimulationState.active) return false;
    
    // Restaurar snapshot
    if (globalSimulationState.originalSnapshot && 
        typeof hospitalNetwork !== 'undefined' && 
        hospitalNetwork.hospitals) {
        
        hospitalNetwork.hospitals = JSON.parse(
            JSON.stringify(globalSimulationState.originalSnapshot.hospitals)
        );
    }
    
    // Resetear tiempo y métricas pero mantener la emergencia
    globalSimulationState.simulationTime = 0;
    globalSimulationState.paused = false;
    globalSimulationState.patientsGenerated = 0;
    globalSimulationState.criticalGenerated = 0;
    globalSimulationState.moderateGenerated = 0;
    globalSimulationState.minorGenerated = 0;
    globalSimulationState.events = [];
    globalSimulationState.alerts = [];
    globalSimulationState.modifiedHospitals = {};
    
    // Recalcular métricas iniciales
    globalSimulationState.networkMetrics = calculateInitialNetworkMetrics();
    
    saveGlobalSimulationState();
    recordGlobalEvent('↻ Simulación reiniciada', 'info');
    
    return true;
}

/**
 * Calcula métricas iniciales de la red
 */
function calculateInitialNetworkMetrics() {
    if (typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        return {
            totalBedsAvailable: 0,
            totalCriticalBedsAvailable: 0,
            networkOccupancy: 0,
            hospitalsSaturated: 0,
            averageResources: 0
        };
    }
    
    let totalBeds = 0;
    let totalCriticalBeds = 0;
    let totalOccupied = 0;
    let totalCapacity = 0;
    let totalResources = 0;
    
    hospitalNetwork.hospitals.forEach(hospital => {
        totalBeds += hospital.camas.disponibles;
        totalCriticalBeds += hospital.camasCriticas.disponibles;
        totalOccupied += hospital.camas.ocupadas;
        totalCapacity += hospital.camas.totales;
        totalResources += hospital.insumos.porcentajeDisponible;
    });
    
    return {
        totalBedsAvailable: totalBeds,
        totalCriticalBedsAvailable: totalCriticalBeds,
        networkOccupancy: Math.round((totalOccupied / totalCapacity) * 100),
        hospitalsSaturated: 0,
        averageResources: Math.round(totalResources / hospitalNetwork.hospitals.length)
    };
}

/**
 * Obtiene el estado visual de la simulación
 */
function getGlobalSimulationStatus() {
    loadGlobalSimulationState();
    
    if (!globalSimulationState.active) {
        return {
            icon: '🟢',
            text: 'OPERACIÓN NORMAL',
            class: 'normal'
        };
    } else if (globalSimulationState.paused) {
        return {
            icon: '🟡',
            text: 'SIMULACIÓN PAUSADA',
            class: 'paused'
        };
    } else {
        return {
            icon: '🔴',
            text: 'SIMULACIÓN ACTIVA',
            class: 'active'
        };
    }
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
 * Inicializa el sistema global al cargar cualquier página
 */
function initializeGlobalSimulation() {
    loadGlobalSimulationState();
    
    // Si hay simulación activa, aplicar estado
    if (globalSimulationState.active) {
        applySimulatedStateToNetwork();
    }
}

// Inicializar automáticamente al cargar el script
document.addEventListener('DOMContentLoaded', function() {
    initializeGlobalSimulation();
});

// Exponer funciones globalmente
window.isSimulationActive = isSimulationActive;
window.isSimulationPaused = isSimulationPaused;
window.getGlobalSimulationState = getGlobalSimulationState;
window.getGlobalSimulationStatus = getGlobalSimulationStatus;
window.loadGlobalSimulationState = loadGlobalSimulationState;
window.startGlobalSimulation = startGlobalSimulation;
window.advanceGlobalSimulation = advanceGlobalSimulation;
window.pauseGlobalSimulation = pauseGlobalSimulation;
window.resumeGlobalSimulation = resumeGlobalSimulation;
window.finishGlobalSimulation = finishGlobalSimulation;
window.resetGlobalSimulation = resetGlobalSimulation;
window.formatSimulationTime = formatSimulationTime;