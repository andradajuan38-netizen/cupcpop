// HOSPITAL COMMAND NETWORK - CAPA 5
// GESTIÓN DE PACIENTES
// Sistema de creación y gestión de pacientes simulados

// Contador global para IDs de pacientes
let patientIdCounter = 1;

// Array de pacientes activos
let patients = [];

/**
 * Severidades de pacientes
 */
const SEVERITY = {
    CRITICAL: 'critical',
    MODERATE: 'moderate',
    MINOR: 'minor'
};

/**
 * Estados de pacientes
 */
const PATIENT_STATUS = {
    WAITING: 'waiting',                           // Esperando atención en hospital
    WAITING_FOR_DESTINATION: 'waiting_for_destination', // Necesita derivación
    ASSIGNED: 'assigned',                         // Destino asignado
    IN_TRANSIT: 'in_transit',                    // En traslado
    ARRIVED: 'arrived',                          // Llegó al destino
    CANCELLED: 'cancelled'                        // Derivación cancelada
};

/**
 * Tipos de recursos requeridos
 */
const REQUIRED_RESOURCE = {
    CRITICAL_BED: 'criticalBed',
    NORMAL_BED: 'normalBed',
    EMERGENCY_CARE: 'emergencyCare'
};

/**
 * Configuración de iconos por severidad
 */
const SEVERITY_CONFIG = {
    critical: {
        icon: '🔴',
        label: 'CRÍTICO',
        class: 'critical',
        priority: 1
    },
    moderate: {
        icon: '🟠',
        label: 'MODERADO',
        class: 'moderate',
        priority: 2
    },
    minor: {
        icon: '🟢',
        label: 'LEVE',
        class: 'minor',
        priority: 3
    }
};

/**
 * Configuración de iconos por estado
 */
const STATUS_CONFIG = {
    waiting: {
        icon: '⏳',
        label: 'ESPERANDO',
        class: 'waiting'
    },
    waiting_for_destination: {
        icon: '⚠️',
        label: 'ESPERANDO DERIVACIÓN',
        class: 'waiting-destination'
    },
    assigned: {
        icon: '✓',
        label: 'DESTINO ASIGNADO',
        class: 'assigned'
    },
    in_transit: {
        icon: '🚑',
        label: 'EN TRASLADO',
        class: 'in-transit'
    },
    arrived: {
        icon: '✓',
        label: 'ARRIBÓ',
        class: 'arrived'
    },
    cancelled: {
        icon: '✗',
        label: 'CANCELADO',
        class: 'cancelled'
    }
};

/**
 * Crea un nuevo paciente simulado
 */
function createPatient(severity, originHospitalId, createdAt = null) {
    const patientId = `P-${String(patientIdCounter).padStart(3, '0')}`;
    patientIdCounter++;
    
    // Determinar recurso requerido según severidad
    let requiredResource;
    if (severity === SEVERITY.CRITICAL) {
        requiredResource = REQUIRED_RESOURCE.CRITICAL_BED;
    } else if (severity === SEVERITY.MODERATE) {
        requiredResource = REQUIRED_RESOURCE.NORMAL_BED;
    } else {
        requiredResource = REQUIRED_RESOURCE.EMERGENCY_CARE;
    }
    
    const patient = {
        id: patientId,
        severity: severity,
        originHospital: originHospitalId,
        destinationHospital: null,
        status: PATIENT_STATUS.WAITING,
        requiredResource: requiredResource,
        ambulanceId: null,
        transferId: null,
        createdAt: createdAt !== null ? createdAt : (typeof simulationState !== 'undefined' ? simulationState.simulationTime : 0),
        assignedAt: null,
        departureAt: null,
        arrivalAt: null,
        waitingTime: 0
    };
    
    patients.push(patient);
    
    // Registrar en el estado de simulación si está disponible
    if (typeof recordEvent === 'function') {
        const hospital = getHospitalById(originHospitalId);
        const hospitalName = hospital ? hospital.nombre : `Hospital ${originHospitalId}`;
        const severityLabel = SEVERITY_CONFIG[severity].label;
        recordEvent(`👥 Nuevo paciente ${patientId} (${severityLabel}) en ${hospitalName}`, 'info');
    }
    
    return patient;
}

/**
 * Obtiene un paciente por ID
 */
function getPatientById(patientId) {
    return patients.find(p => p.id === patientId);
}

/**
 * Obtiene todos los pacientes
 */
function getAllPatients() {
    return patients;
}

/**
 * Obtiene pacientes por hospital de origen
 */
function getPatientsByOriginHospital(hospitalId) {
    return patients.filter(p => p.originHospital === hospitalId);
}

/**
 * Obtiene pacientes por estado
 */
function getPatientsByStatus(status) {
    return patients.filter(p => p.status === status);
}

/**
 * Obtiene pacientes por severidad
 */
function getPatientsBySeverity(severity) {
    return patients.filter(p => p.severity === severity);
}

/**
 * Obtiene pacientes que esperan en un hospital
 */
function getWaitingPatientsInHospital(hospitalId) {
    return patients.filter(p => 
        p.originHospital === hospitalId && 
        (p.status === PATIENT_STATUS.WAITING || p.status === PATIENT_STATUS.WAITING_FOR_DESTINATION)
    );
}

/**
 * Obtiene pacientes críticos esperando
 */
function getCriticalWaitingPatients() {
    return patients.filter(p => 
        p.severity === SEVERITY.CRITICAL && 
        (p.status === PATIENT_STATUS.WAITING || p.status === PATIENT_STATUS.WAITING_FOR_DESTINATION)
    );
}

/**
 * Actualiza el estado de un paciente
 */
function updatePatientStatus(patientId, newStatus) {
    const patient = getPatientById(patientId);
    if (!patient) return null;
    
    patient.status = newStatus;
    
    // Actualizar timestamps según el estado
    const currentTime = typeof simulationState !== 'undefined' ? simulationState.simulationTime : 0;
    
    if (newStatus === PATIENT_STATUS.ASSIGNED) {
        patient.assignedAt = currentTime;
    } else if (newStatus === PATIENT_STATUS.IN_TRANSIT) {
        patient.departureAt = currentTime;
    } else if (newStatus === PATIENT_STATUS.ARRIVED) {
        patient.arrivalAt = currentTime;
    }
    
    return patient;
}

/**
 * Calcula el tiempo de espera de un paciente (en minutos)
 */
function calculateWaitingTime(patient) {
    const currentTime = typeof simulationState !== 'undefined' ? simulationState.simulationTime : 0;
    return currentTime - patient.createdAt;
}

/**
 * Actualiza los tiempos de espera de todos los pacientes
 */
function updateAllWaitingTimes() {
    patients.forEach(patient => {
        if (patient.status === PATIENT_STATUS.WAITING || 
            patient.status === PATIENT_STATUS.WAITING_FOR_DESTINATION) {
            patient.waitingTime = calculateWaitingTime(patient);
        }
    });
}

/**
 * Prioriza pacientes según severidad y tiempo de espera
 */
function prioritizePatients(patientsList) {
    return patientsList.sort((a, b) => {
        // Primero por severidad (prioridad más baja = más urgente)
        const priorityA = SEVERITY_CONFIG[a.severity].priority;
        const priorityB = SEVERITY_CONFIG[b.severity].priority;
        
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        
        // Si tienen la misma severidad, el que lleva más tiempo esperando
        return a.createdAt - b.createdAt;
    });
}

/**
 * Obtiene el icono de severidad
 */
function getSeverityIcon(severity) {
    return SEVERITY_CONFIG[severity] ? SEVERITY_CONFIG[severity].icon : '⚪';
}

/**
 * Obtiene la etiqueta de severidad
 */
function getSeverityLabel(severity) {
    return SEVERITY_CONFIG[severity] ? SEVERITY_CONFIG[severity].label : 'DESCONOCIDO';
}

/**
 * Obtiene la clase CSS de severidad
 */
function getSeverityClass(severity) {
    return SEVERITY_CONFIG[severity] ? SEVERITY_CONFIG[severity].class : '';
}

/**
 * Obtiene el icono de estado
 */
function getStatusIcon(status) {
    return STATUS_CONFIG[status] ? STATUS_CONFIG[status].icon : '❓';
}

/**
 * Obtiene la etiqueta de estado
 */
function getStatusLabel(status) {
    return STATUS_CONFIG[status] ? STATUS_CONFIG[status].label : 'DESCONOCIDO';
}

/**
 * Obtiene la clase CSS de estado de paciente
 */
function getPatientStatusClass(status) {
    return STATUS_CONFIG[status] ? STATUS_CONFIG[status].class : '';
}

/**
 * Cuenta pacientes por estado
 */
function countPatientsByStatus() {
    return {
        waiting: patients.filter(p => p.status === PATIENT_STATUS.WAITING).length,
        waitingForDestination: patients.filter(p => p.status === PATIENT_STATUS.WAITING_FOR_DESTINATION).length,
        assigned: patients.filter(p => p.status === PATIENT_STATUS.ASSIGNED).length,
        inTransit: patients.filter(p => p.status === PATIENT_STATUS.IN_TRANSIT).length,
        arrived: patients.filter(p => p.status === PATIENT_STATUS.ARRIVED).length,
        cancelled: patients.filter(p => p.status === PATIENT_STATUS.CANCELLED).length
    };
}

/**
 * Cuenta pacientes por severidad
 */
function countPatientsBySeverity() {
    return {
        critical: patients.filter(p => p.severity === SEVERITY.CRITICAL && p.status !== PATIENT_STATUS.ARRIVED).length,
        moderate: patients.filter(p => p.severity === SEVERITY.MODERATE && p.status !== PATIENT_STATUS.ARRIVED).length,
        minor: patients.filter(p => p.severity === SEVERITY.MINOR && p.status !== PATIENT_STATUS.ARRIVED).length
    };
}

/**
 * Limpia pacientes (para reinicio de simulación)
 */
function clearAllPatients() {
    patients = [];
    patientIdCounter = 1;
}

/**
 * Obtiene estadísticas generales de pacientes
 */
function getPatientStatistics() {
    const byStatus = countPatientsByStatus();
    const bySeverity = countPatientsBySeverity();
    
    return {
        total: patients.length,
        active: patients.filter(p => p.status !== PATIENT_STATUS.ARRIVED && p.status !== PATIENT_STATUS.CANCELLED).length,
        byStatus: byStatus,
        bySeverity: bySeverity,
        criticalWaiting: getCriticalWaitingPatients().length
    };
}

/**
 * Exporta el estado de pacientes para localStorage
 */
function exportPatientsState() {
    return {
        patients: patients,
        patientIdCounter: patientIdCounter
    };
}

/**
 * Importa el estado de pacientes desde localStorage
 */
function importPatientsState(state) {
    if (state && state.patients) {
        patients = state.patients;
        patientIdCounter = state.patientIdCounter || 1;
    }
}
