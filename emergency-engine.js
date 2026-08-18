// HOSPITAL COMMAND NETWORK - CAPA 3
// MOTOR DE CÁLCULO DE EMERGENCIAS
// Este módulo calcula el impacto estimado de emergencias y hospitales afectados

// Prefijo único para localStorage de emergencias
const STORAGE_PREFIX = 'EMERGENCY_MODULE_';

/**
 * Configuración de impacto base por tipo de emergencia
 */
const EMERGENCY_TYPES = {
    earthquake: {
        name: 'Terremoto',
        baseCasualties: {
            low: 20,
            moderate: 50,
            high: 100,
            critical: 200
        },
        criticalRatio: 0.15,    // 15% críticos
        moderateRatio: 0.35,    // 35% moderados
        minorRatio: 0.50        // 50% leves
    },
    flood: {
        name: 'Inundación',
        baseCasualties: {
            low: 15,
            moderate: 40,
            high: 80,
            critical: 150
        },
        criticalRatio: 0.10,
        moderateRatio: 0.30,
        minorRatio: 0.60
    },
    fire: {
        name: 'Incendio',
        baseCasualties: {
            low: 25,
            moderate: 60,
            high: 120,
            critical: 250
        },
        criticalRatio: 0.20,
        moderateRatio: 0.40,
        minorRatio: 0.40
    },
    explosion: {
        name: 'Explosión',
        baseCasualties: {
            low: 30,
            moderate: 70,
            high: 150,
            critical: 300
        },
        criticalRatio: 0.25,
        moderateRatio: 0.40,
        minorRatio: 0.35
    },
    'mass-accident': {
        name: 'Accidente Masivo',
        baseCasualties: {
            low: 20,
            moderate: 50,
            high: 100,
            critical: 180
        },
        criticalRatio: 0.18,
        moderateRatio: 0.37,
        minorRatio: 0.45
    },
    industrial: {
        name: 'Accidente Industrial',
        baseCasualties: {
            low: 25,
            moderate: 55,
            high: 110,
            critical: 220
        },
        criticalRatio: 0.20,
        moderateRatio: 0.35,
        minorRatio: 0.45
    }
};

/**
 * Calcula el impacto estimado de una emergencia
 */
function calculateEstimatedImpact(emergencyType, severity, radius, parameters = {}) {
    if (!emergencyType || !severity) {
        return {
            totalPatients: 0,
            criticalPatients: 0,
            moderatePatients: 0,
            minorPatients: 0,
            ambulancesRequired: 0
        };
    }
    
    const typeConfig = EMERGENCY_TYPES[emergencyType];
    if (!typeConfig) {
        console.error('Tipo de emergencia no válido:', emergencyType);
        return {
            totalPatients: 0,
            criticalPatients: 0,
            moderatePatients: 0,
            minorPatients: 0,
            ambulancesRequired: 0
        };
    }
    
    // Obtener base de víctimas según gravedad
    let totalPatients = typeConfig.baseCasualties[severity] || 0;
    
    // Ajustar según radio de afectación
    const radiusMultiplier = calculateRadiusMultiplier(radius);
    totalPatients = Math.round(totalPatients * radiusMultiplier);
    
    // Ajustar según parámetros específicos del evento
    const parametersMultiplier = calculateParametersMultiplier(emergencyType, parameters);
    totalPatients = Math.round(totalPatients * parametersMultiplier);
    
    // Distribuir por gravedad
    const criticalPatients = Math.round(totalPatients * typeConfig.criticalRatio);
    const moderatePatients = Math.round(totalPatients * typeConfig.moderateRatio);
    const minorPatients = totalPatients - criticalPatients - moderatePatients;
    
    // Calcular ambulancias requeridas
    // Críticos necesitan ambulancia individual, moderados pueden compartir
    const ambulancesRequired = Math.ceil(criticalPatients + (moderatePatients / 2));
    
    return {
        totalPatients,
        criticalPatients,
        moderatePatients,
        minorPatients,
        ambulancesRequired
    };
}

function calculateCatastropheReport(emergency) {
    const impact = emergency?.estimatedImpact || {};
    const severityBase = {
        low: 15,
        moderate: 35,
        high: 60,
        critical: 85
    };
    const typeFatalityMultiplier = {
        earthquake: 1,
        flood: 0.7,
        fire: 1.2,
        explosion: 1.8,
        'mass-accident': 1.1,
        industrial: 1.5
    };
    const fatalityRatio = Math.min(
        0.35,
        (severityBase[emergency?.severity] || 0) / 1000 * (typeFatalityMultiplier[emergency?.type] || 1)
    );
    const fatalities = Math.min(
        impact.totalPatients || 0,
        Math.round((impact.totalPatients || 0) * fatalityRatio)
    );
    const affectedHospitals = emergency?.affectedHospitals || [];
    const availableHospitals = emergency?.availableHospitals || [];
    const affectedIds = new Set(affectedHospitals.map(hospital => hospital.id));
    const networkHospitals = typeof hospitalNetwork !== 'undefined' ? hospitalNetwork.hospitals || [] : [];
    const affectedNetworkHospitals = networkHospitals.filter(hospital => affectedIds.has(hospital.id));
    const bedsCompromised = affectedNetworkHospitals.reduce(
        (total, hospital) => total + (hospital.camas?.totales || 0),
        0
    );
    const unavailableHospitals = affectedNetworkHospitals.filter(
        hospital => hospital.estado === 'FUERA DE SERVICIO'
    ).length;
    const averageRisk = affectedNetworkHospitals.length && typeof calculateOperationalRisk === 'function'
        ? Math.round(affectedNetworkHospitals.reduce((total, hospital) => total + calculateOperationalRisk(hospital).score, 0) / affectedNetworkHospitals.length)
        : 0;
    const destructionScore = Math.min(
        100,
        Math.round((severityBase[emergency?.severity] || 0) + Math.min(20, (emergency?.radius || emergency?.affectedRadius || 0) / 2) + affectedHospitals.length * 3)
    );
    const destructionLevel = destructionScore >= 80 ? 'CRÍTICA' :
        destructionScore >= 55 ? 'ALTA' :
        destructionScore >= 30 ? 'MODERADA' : 'BAJA';
    const networkRisk = averageRisk >= 85 || emergency?.severity === 'critical' ? 'CRÍTICO' :
        averageRisk >= 70 || emergency?.severity === 'high' ? 'ALTO' :
        averageRisk >= 50 ? 'MODERADO' : 'BAJO';
    const networkResources = networkHospitals.reduce((resources, hospital) => {
        resources.bedsAvailable += hospital.camas?.disponibles || 0;
        resources.criticalBedsAvailable += hospital.camasCriticas?.disponibles || 0;
        resources.ambulancesAvailable += hospital.ambulancias?.disponibles || 0;
        resources.operatingRoomsAvailable += hospital.quirófanos?.disponibles || 0;
        resources.suppliesTotal += hospital.insumos?.porcentajeDisponible || 0;
        return resources;
    }, { bedsAvailable: 0, criticalBedsAvailable: 0, ambulancesAvailable: 0, operatingRoomsAvailable: 0, suppliesTotal: 0 });
    const affectedResources = affectedNetworkHospitals.reduce((resources, hospital) => {
        resources.bedsAvailable += hospital.camas?.disponibles || 0;
        resources.criticalBedsAvailable += hospital.camasCriticas?.disponibles || 0;
        return resources;
    }, { bedsAvailable: 0, criticalBedsAvailable: 0 });

    return {
        affectedPopulation: emergency?.estimatedAffected || impact.totalPatients || 0,
        injured: Math.max(0, (impact.totalPatients || 0) - fatalities),
        fatalities,
        criticalInjured: impact.criticalPatients || 0,
        moderateInjured: impact.moderatePatients || 0,
        minorInjured: impact.minorPatients || 0,
        bedsCompromised,
        affectedHospitals: affectedHospitals.length,
        operationalHospitals: availableHospitals.length,
        unavailableHospitals,
        resources: {
            bedsAvailable: networkResources.bedsAvailable,
            criticalBedsAvailable: networkResources.criticalBedsAvailable,
            ambulancesAvailable: networkResources.ambulancesAvailable,
            operatingRoomsAvailable: networkResources.operatingRoomsAvailable,
            averageSupplies: networkHospitals.length ? Math.round(networkResources.suppliesTotal / networkHospitals.length) : 0,
            affectedBedsAvailable: affectedResources.bedsAvailable,
            affectedCriticalBedsAvailable: affectedResources.criticalBedsAvailable
        },
        destructionScore,
        destructionLevel,
        networkRisk,
        resourcesPressure: networkRisk === 'CRÍTICO' || networkRisk === 'ALTO' ? 'ALTA PRESIÓN' : 'PRESIÓN MODERADA'
    };
}

/**
 * Calcula el multiplicador según el radio de afectación
 */
function calculateRadiusMultiplier(radius) {
    if (radius <= 1) return 0.5;
    if (radius <= 3) return 0.8;
    if (radius <= 5) return 1.0;
    if (radius <= 10) return 1.3;
    if (radius <= 20) return 1.8;
    return 2.0;
}

/**
 * Calcula el multiplicador según parámetros específicos del evento
 */
function calculateParametersMultiplier(emergencyType, parameters) {
    let multiplier = 1.0;
    
    switch (emergencyType) {
        case 'earthquake':
            // Magnitud afecta el número de víctimas
            if (parameters.magnitude) {
                if (parameters.magnitude >= 7) multiplier = 1.5;
                else if (parameters.magnitude >= 6) multiplier = 1.3;
                else if (parameters.magnitude >= 5) multiplier = 1.1;
            }
            break;
            
        case 'flood':
            // Nivel de agua afecta
            if (parameters.waterLevel) {
                if (parameters.waterLevel === 'high') multiplier = 1.4;
                else if (parameters.waterLevel === 'medium') multiplier = 1.2;
            }
            break;
            
        case 'fire':
            // Velocidad de propagación
            if (parameters.spreadRate) {
                if (parameters.spreadRate === 'fast') multiplier = 1.5;
                else if (parameters.spreadRate === 'medium') multiplier = 1.2;
            }
            break;
            
        case 'explosion':
            // Radio de impacto
            if (parameters.blastRadius) {
                multiplier = 1 + (parameters.blastRadius / 10);
            }
            break;
            
        case 'mass-accident':
            // Cantidad de vehículos
            if (parameters.vehicles) {
                multiplier = 1 + (parameters.vehicles / 10);
            }
            break;
            
        case 'industrial':
            // Tipo de incidente
            if (parameters.incidentType === 'chemical') multiplier = 1.6;
            else if (parameters.incidentType === 'explosion') multiplier = 1.4;
            else if (parameters.incidentType === 'fire') multiplier = 1.3;
            break;
    }
    
    return multiplier;
}

/**
 * Calcula la distancia entre dos puntos geográficos (fórmula de Haversine)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calcula qué hospitales están afectados por la emergencia
 */
function calculateAffectedHospitals(emergencyLocation, affectedRadius) {
    if (!emergencyLocation || !emergencyLocation.latitude || !emergencyLocation.longitude) {
        return [];
    }
    
    const affected = [];
    const available = [];
    
    hospitalNetwork.hospitals.forEach(hospital => {
        if (!hospital.geolocalizacion) return;
        
        const distance = calculateDistance(
            emergencyLocation.latitude,
            emergencyLocation.longitude,
            hospital.geolocalizacion.latitud,
            hospital.geolocalizacion.longitud
        );
        
        const hospitalInfo = {
            id: hospital.id,
            nombre: hospital.nombre,
            ciudad: hospital.ciudad,
            distance: Math.round(distance * 10) / 10, // Redondear a 1 decimal
            estado: hospital.estado,
            camasDisponibles: hospital.camas.disponibles,
            camasCriticasDisponibles: hospital.camasCriticas.disponibles,
            ambulanciasDisponibles: hospital.ambulancias.disponibles
        };
        
        if (distance <= affectedRadius) {
            affected.push(hospitalInfo);
        } else {
            // Todo hospital fuera del radio permanece operativo para la red.
            available.push(hospitalInfo);
        }
    });
    
    // Ordenar por distancia
    affected.sort((a, b) => a.distance - b.distance);
    available.sort((a, b) => a.distance - b.distance);
    
    return { affected, available };
}

/**
 * Genera un ID único para la emergencia
 */
function generateEmergencyId() {
    const history = getEmergencyHistory();
    return `E${String(history.length + 1).padStart(3, '0')}`;
}

/**
 * Valida que una emergencia tenga todos los datos necesarios
 */
function validateEmergency(emergency) {
    const errors = [];
    
    if (!emergency.type) {
        errors.push('Debe seleccionar un tipo de emergencia');
    }
    
    if (!emergency.location || !emergency.location.name) {
        errors.push('Debe seleccionar una ubicación');
    }
    
    if (!emergency.severity) {
        errors.push('Debe seleccionar un nivel de gravedad');
    }
    
    if (!emergency.affectedRadius || emergency.affectedRadius <= 0) {
        errors.push('Debe definir un radio de afectación');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Obtiene el estado visual para una emergencia
 */
function getEmergencyStatus(emergency) {
    const status = String(emergency.status || '').toUpperCase();
    if (status === 'ACTIVE') {
        return {
            icon: '🔴',
            text: 'ACTIVA',
            class: 'active'
        };
    } else if (status === 'READY') {
        return {
            icon: '🟡',
            text: 'LISTA PARA SIMULACIÓN',
            class: 'ready'
        };
    } else if (status === 'COMPLETED') {
        return {
            icon: '🟢',
            text: 'FINALIZADA',
            class: 'completed'
        };
    } else if (status === 'PAUSED') {
        return {
            icon: '⏸️',
            text: 'PAUSADA',
            class: 'paused'
        };
    } else if (status === 'CANCELLED') {
        return {
            icon: '⚫',
            text: 'CANCELADA',
            class: 'cancelled'
        };
    }
    
    return {
        icon: '⚪',
        text: 'PREPARANDO',
        class: 'preparing'
    };
}

/**
 * Obtiene el nombre legible del tipo de emergencia
 */
function getEmergencyTypeName(type) {
    return EMERGENCY_TYPES[type]?.name || type;
}

/**
 * Obtiene el color para el nivel de gravedad
 */
function getSeverityColor(severity) {
    const colors = {
        low: '#00ff88',
        moderate: '#ffd60a',
        high: '#ff9900',
        critical: '#ff006e'
    };
    return colors[severity] || '#8892b0';
}

/**
 * Guarda una emergencia en localStorage
 */
function saveActiveEmergency(emergency) {
    try {
        if (typeof saveSharedActiveEmergency === 'function') {
            return saveSharedActiveEmergency(emergency);
        }
        localStorage.setItem(STORAGE_PREFIX + 'activeEmergency', JSON.stringify(emergency));
        return true;
    } catch (error) {
        console.error('Error al guardar emergencia:', error);
        return false;
    }
}

/**
 * Carga la emergencia activa desde localStorage
 */
function loadActiveEmergency() {
    try {
        let emergency;
        if (typeof loadSharedActiveEmergency === 'function') {
            emergency = loadSharedActiveEmergency();
        } else {
            const data = localStorage.getItem(STORAGE_PREFIX + 'activeEmergency');
            emergency = data ? JSON.parse(data) : null;
        }

        if (emergency && emergency.location && (emergency.radius || emergency.affectedRadius) && typeof calculateAffectedHospitals === 'function') {
            const hospitals = calculateAffectedHospitals(emergency.location, emergency.radius || emergency.affectedRadius);
            emergency.affectedHospitals = hospitals.affected;
            emergency.availableHospitals = hospitals.available;
            emergency.catastropheReport = calculateCatastropheReport(emergency);
            if (typeof saveSharedActiveEmergency === 'function') {
                saveSharedActiveEmergency(emergency);
            }
        }

        return emergency;
    } catch (error) {
        console.error('Error al cargar emergencia:', error);
        return null;
    }
}

/**
 * Limpia la emergencia activa
 */
function clearActiveEmergency() {
    try {
        if (typeof clearSharedActiveEmergency === 'function') {
            clearSharedActiveEmergency();
            return true;
        }
        localStorage.removeItem(STORAGE_PREFIX + 'activeEmergency');
        return true;
    } catch (error) {
        console.error('Error al limpiar emergencia:', error);
        return false;
    }
}

/**
 * Guarda una emergencia en el historial
 */
function saveEmergencyToHistory(emergency) {
    try {
        const history = typeof getSharedEmergencyHistory === 'function' ? getSharedEmergencyHistory() : getEmergencyHistory();
        const existingIndex = history.findIndex(item => item.id === emergency.id);
        if (existingIndex >= 0) {
            history[existingIndex] = emergency;
        } else {
            history.push(emergency);
        }
        if (typeof saveSharedEmergencyHistory === 'function') {
            return saveSharedEmergencyHistory(history);
        }
        const emergencyWithDate = {
            ...emergency,
            createdAt: new Date().toISOString(),
            completedAt: emergency.status === 'completed' ? new Date().toISOString() : null
        };
        history.push(emergencyWithDate);
        localStorage.setItem(STORAGE_PREFIX + 'emergencyHistory', JSON.stringify(history));
        return true;
    } catch (error) {
        console.error('Error al guardar en historial:', error);
        return false;
    }
}

/**
 * Obtiene el historial de emergencias
 */
function getEmergencyHistory() {
    try {
        if (typeof getSharedEmergencyHistory === 'function') {
            return getSharedEmergencyHistory();
        }
        const data = localStorage.getItem(STORAGE_PREFIX + 'emergencyHistory');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error al cargar historial:', error);
        return [];
    }
}

/**
 * Formatea una fecha para mostrar
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Obtiene parámetros específicos según el tipo de emergencia
 */
function getEmergencyParameters(type) {
    const parameters = {
        earthquake: [
            { id: 'magnitude', label: 'Magnitud (Richter)', type: 'number', min: 3, max: 9, step: 0.1, default: 5.5 },
            { id: 'duration', label: 'Duración estimada (seg)', type: 'number', min: 5, max: 120, default: 30 }
        ],
        flood: [
            { id: 'waterLevel', label: 'Nivel de afectación', type: 'select', options: [
                { value: 'low', label: 'Bajo' },
                { value: 'medium', label: 'Medio' },
                { value: 'high', label: 'Alto' }
            ]},
            { id: 'floodedArea', label: 'Área inundada (km²)', type: 'number', min: 0.1, max: 100, default: 5 }
        ],
        fire: [
            { id: 'affectedArea', label: 'Área afectada (km²)', type: 'number', min: 0.1, max: 50, default: 2 },
            { id: 'spreadRate', label: 'Velocidad de propagación', type: 'select', options: [
                { value: 'slow', label: 'Lenta' },
                { value: 'medium', label: 'Media' },
                { value: 'fast', label: 'Rápida' }
            ]}
        ],
        explosion: [
            { id: 'blastRadius', label: 'Radio de impacto (m)', type: 'number', min: 10, max: 1000, default: 100 },
            { id: 'damageLevel', label: 'Nivel de daño', type: 'select', options: [
                { value: 'low', label: 'Bajo' },
                { value: 'medium', label: 'Medio' },
                { value: 'high', label: 'Alto' },
                { value: 'extreme', label: 'Extremo' }
            ]}
        ],
        'mass-accident': [
            { id: 'vehicles', label: 'Cantidad de vehículos', type: 'number', min: 2, max: 50, default: 8 },
            { id: 'people', label: 'Personas involucradas', type: 'number', min: 5, max: 200, default: 25 }
        ],
        industrial: [
            { id: 'incidentType', label: 'Tipo de incidente', type: 'select', options: [
                { value: 'chemical', label: 'Químico' },
                { value: 'explosion', label: 'Explosión' },
                { value: 'fire', label: 'Incendio' },
                { value: 'structural', label: 'Estructural' }
            ]},
            { id: 'affectedArea', label: 'Área afectada (km²)', type: 'number', min: 0.1, max: 20, default: 1 }
        ]
    };
    
    return parameters[type] || [];
}
