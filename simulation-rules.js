// HOSPITAL COMMAND NETWORK - CAPA 4
// REGLAS DE SIMULACIÓN
// Este módulo define las reglas centrales de la simulación

/**
 * Reglas de consumo de recursos por tipo de paciente
 */
const SIMULATION_RULES = {
    // Consumo de camas
    beds: {
        criticalConsumption: 0,      // Críticos usan camas críticas, no generales
        moderateConsumption: 1,      // Moderados usan 1 cama general
        minorConsumption: 1          // Leves usan 1 cama general
    },
    
    // Consumo de camas críticas
    criticalBeds: {
        criticalConsumption: 1,      // Críticos usan 1 cama crítica
        moderateConsumption: 0,      // Moderados no usan camas críticas
        minorConsumption: 0          // Leves no usan camas críticas
    },
    
    // Impacto en personal (porcentaje de capacidad consumida)
    staff: {
        criticalImpact: 0.8,         // Crítico consume 80% de un staff member
        moderateImpact: 0.4,         // Moderado consume 40%
        minorImpact: 0.1             // Leve consume 10%
    },
    
    // Impacto en guardia (incremento de ocupación por paciente)
    emergency: {
        criticalImpact: 5,           // Crítico aumenta 5% la guardia
        moderateImpact: 2,           // Moderado aumenta 2%
        minorImpact: 1               // Leve aumenta 1%
    },
    
    // Consumo de insumos (porcentaje por paciente)
    supplies: {
        medications: {
            critical: 2.0,           // Crítico consume 2% de medicamentos
            moderate: 0.8,           // Moderado consume 0.8%
            minor: 0.3               // Leve consume 0.3%
        },
        surgical: {
            critical: 1.5,           // Crítico consume 1.5% de material quirúrgico
            moderate: 0.5,
            minor: 0.2
        },
        oxygen: {
            critical: 2.5,           // Crítico consume 2.5% de oxígeno
            moderate: 0.5,
            minor: 0.1
        },
        disposable: {
            critical: 1.8,
            moderate: 0.7,
            minor: 0.4
        }
    },
    
    // Probabilidad de uso de quirófano (0-1)
    operatingRoom: {
        criticalProbability: 0.4,    // 40% de críticos necesitan quirófano
        moderateProbability: 0.1,    // 10% de moderados
        minorProbability: 0.02       // 2% de leves
    },
    
    // Tiempo de atención (minutos simulados)
    treatmentTime: {
        critical: 120,               // 2 horas
        moderate: 60,                // 1 hora
        minor: 30                    // 30 minutos
    },
    
    // Ambulancias requeridas
    ambulances: {
        criticalPerPatient: 1,       // 1 ambulancia por crítico
        moderatePerPatients: 2,      // 1 ambulancia cada 2 moderados
        minorPerPatients: 3          // 1 ambulancia cada 3 leves
    },
    
    // Distribución temporal de llegada de pacientes
    patientArrival: {
        // Porcentaje de pacientes que llegan en cada intervalo de 5 minutos
        timeline: [
            { time: 0, percentage: 0 },      // 0%
            { time: 5, percentage: 15 },     // 15%
            { time: 10, percentage: 30 },    // 30%
            { time: 15, percentage: 50 },    // 50%
            { time: 20, percentage: 70 },    // 70%
            { time: 25, percentage: 85 },    // 85%
            { time: 30, percentage: 95 },    // 95%
            { time: 35, percentage: 100 }    // 100%
        ]
    },
    
    // Umbrales de estado del hospital
    statusThresholds: {
        normal: { max: 69 },         // 0-69%
        warning: { min: 70, max: 79 },    // 70-79%
        highDemand: { min: 80, max: 89 }, // 80-89%
        saturated: { min: 90 }       // 90-100%
    },
    
    // Umbrales de riesgo
    riskThresholds: {
        low: { max: 49 },
        moderate: { min: 50, max: 69 },
        high: { min: 70, max: 84 },
        critical: { min: 85 }
    },
    
    // Pesos para cálculo de prioridad de hospital (distribución inicial)
    hospitalPriority: {
        distanceWeight: 0.4,         // 40% peso de la distancia
        capacityWeight: 0.3,         // 30% peso de la capacidad disponible
        statusWeight: 0.2,           // 20% peso del estado actual
        affectedWeight: 0.1          // 10% peso de estar en zona afectada
    },
    
    // Velocidades de simulación disponibles
    simulationSpeeds: {
        x1: 1000,   // 1 segundo real = 1 minuto simulado (1000ms)
        x2: 500,    // 1 segundo real = 2 minutos simulados (500ms)
        x5: 200,    // 1 segundo real = 5 minutos simulados (200ms)
        x10: 100    // 1 segundo real = 10 minutos simulados (100ms)
    },
    
    // Configuración de alertas
    alerts: {
        criticalBeds: {
            threshold: 10,           // Alerta cuando quedan menos de 10% camas críticas
            level: 'critical'
        },
        beds: {
            threshold: 20,           // Alerta cuando quedan menos de 20% camas
            level: 'warning'
        },
        emergency: {
            threshold: 85,           // Alerta cuando guardia supera 85%
            level: 'warning'
        },
        staff: {
            threshold: 60,           // Alerta cuando personal disponible < 60%
            level: 'warning'
        },
        operatingRooms: {
            threshold: 0,            // Alerta cuando no quedan quirófanos
            level: 'critical'
        },
        supplies: {
            threshold: 30,           // Alerta cuando insumos < 30%
            level: 'critical'
        }
    }
};

/**
 * Obtiene el porcentaje de pacientes que deben haber llegado en un tiempo dado
 */
function getPatientArrivalPercentage(simulationTime) {
    const timeline = SIMULATION_RULES.patientArrival.timeline;
    
    // Encontrar el intervalo correspondiente
    for (let i = 0; i < timeline.length - 1; i++) {
        const current = timeline[i];
        const next = timeline[i + 1];
        
        if (simulationTime >= current.time && simulationTime < next.time) {
            // Interpolar linealmente entre los dos puntos
            const progress = (simulationTime - current.time) / (next.time - current.time);
            return current.percentage + (next.percentage - current.percentage) * progress;
        }
    }
    
    // Si superamos el tiempo máximo, retornar 100%
    if (simulationTime >= timeline[timeline.length - 1].time) {
        return 100;
    }
    
    return 0;
}

/**
 * Calcula el estado del hospital según su ocupación
 */
function calculateStatusFromOccupancy(occupancy) {
    const thresholds = SIMULATION_RULES.statusThresholds;
    
    if (occupancy >= thresholds.saturated.min) return 'SATURADO';
    if (occupancy >= thresholds.highDemand.min) return 'ALTA DEMANDA';
    if (occupancy >= thresholds.warning.min) return 'ADVERTENCIA';
    return 'NORMAL';
}

/**
 * Calcula el nivel de riesgo según el score
 */
function calculateRiskLevel(riskScore) {
    const thresholds = SIMULATION_RULES.riskThresholds;
    
    if (riskScore >= thresholds.critical.min) return 'critical';
    if (riskScore >= thresholds.high.min) return 'high';
    if (riskScore >= thresholds.moderate.min) return 'moderate';
    return 'low';
}

/**
 * Calcula cuántas ambulancias se necesitan para un grupo de pacientes
 */
function calculateAmbulancesNeeded(critical, moderate, minor) {
    const rules = SIMULATION_RULES.ambulances;
    
    const criticalAmbulances = critical * rules.criticalPerPatient;
    const moderateAmbulances = Math.ceil(moderate / rules.moderatePerPatients);
    const minorAmbulances = Math.ceil(minor / rules.minorPerPatients);
    
    return criticalAmbulances + moderateAmbulances + minorAmbulances;
}

/**
 * Calcula el consumo de recursos para un conjunto de pacientes
 */
function calculateResourceConsumption(critical, moderate, minor) {
    const rules = SIMULATION_RULES.supplies;
    
    return {
        medications: (critical * rules.medications.critical + 
                     moderate * rules.medications.moderate + 
                     minor * rules.medications.minor),
        surgical: (critical * rules.surgical.critical + 
                  moderate * rules.surgical.moderate + 
                  minor * rules.surgical.minor),
        oxygen: (critical * rules.oxygen.critical + 
                moderate * rules.oxygen.moderate + 
                minor * rules.oxygen.minor),
        disposable: (critical * rules.disposable.critical + 
                    moderate * rules.disposable.moderate + 
                    minor * rules.disposable.minor)
    };
}

/**
 * Calcula el impacto en el personal
 */
function calculateStaffImpact(critical, moderate, minor) {
    const rules = SIMULATION_RULES.staff;
    
    return (critical * rules.criticalImpact + 
            moderate * rules.moderateImpact + 
            minor * rules.minorImpact);
}

/**
 * Calcula el incremento de guardia
 */
function calculateEmergencyImpact(critical, moderate, minor) {
    const rules = SIMULATION_RULES.emergency;
    
    return (critical * rules.criticalImpact + 
            moderate * rules.moderateImpact + 
            minor * rules.minorImpact);
}

/**
 * Calcula cuántos quirófanos se necesitan probabilísticamente
 */
function calculateOperatingRoomsNeeded(critical, moderate, minor) {
    const rules = SIMULATION_RULES.operatingRoom;
    
    return Math.ceil(
        critical * rules.criticalProbability + 
        moderate * rules.moderateProbability + 
        minor * rules.minorProbability
    );
}
