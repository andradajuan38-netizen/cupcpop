// HOSPITAL COMMAND NETWORK - CAPA 2
// MOTOR DE CÁLCULO DE RIESGO Y ALERTAS
// Este módulo calcula automáticamente el estado, riesgo y alertas de cada hospital

/**
 * Calcula el porcentaje de ocupación de un recurso
 */
function calculateOccupancy(occupied, total) {
    if (total === 0) return 0;
    return Math.round((occupied / total) * 100);
}

/**
 * Determina el estado basado en porcentaje de ocupación
 */
function getStatusFromPercentage(percentage) {
    if (percentage >= 90) return 'saturated';
    if (percentage >= 80) return 'high-demand';
    if (percentage >= 70) return 'warning';
    return 'normal';
}

/**
 * Determina el estado de un recurso basado en disponibilidad
 */
function getResourceStatus(available, total) {
    const availability = (available / total) * 100;
    if (availability <= 10) return 'critical';
    if (availability <= 30) return 'danger';
    if (availability <= 50) return 'warning';
    return 'normal';
}

/**
 * Calcula el riesgo operativo del hospital
 * Retorna un objeto con nivel (low, moderate, high, critical) y score (0-100)
 */
function calculateOperationalRisk(hospital) {
    const weights = {
        beds: 0.25,
        criticalBeds: 0.25,
        emergency: 0.15,
        staff: 0.15,
        operatingRooms: 0.10,
        supplies: 0.10
    };
    
    // Calcular factores de riesgo (0-100, donde 100 es máximo riesgo)
    const bedsRisk = calculateOccupancy(hospital.camas.ocupadas, hospital.camas.totales);
    const criticalBedsRisk = calculateOccupancy(hospital.camasCriticas.ocupadas, hospital.camasCriticas.totales);
    const emergencyRisk = hospital.guardia.porcentajeOcupada;
    const staffRisk = 100 - Math.round((hospital.personal.disponible / hospital.personal.total) * 100);
    const operatingRoomsRisk = calculateOccupancy(
        hospital.quirófanos.totales - hospital.quirófanos.disponibles,
        hospital.quirófanos.totales
    );
    
    // Calcular riesgo de insumos (promedio de todos los insumos)
    let suppliesRisk = 100 - hospital.insumos.porcentajeDisponible;
    
    // Calcular score total ponderado
    const riskScore = Math.round(
        (bedsRisk * weights.beds) +
        (criticalBedsRisk * weights.criticalBeds) +
        (emergencyRisk * weights.emergency) +
        (staffRisk * weights.staff) +
        (operatingRoomsRisk * weights.operatingRooms) +
        (suppliesRisk * weights.supplies)
    );
    
    // Determinar nivel de riesgo
    let level = 'low';
    if (riskScore >= 85) level = 'critical';
    else if (riskScore >= 70) level = 'high';
    else if (riskScore >= 50) level = 'moderate';
    
    return {
        level: level,
        score: riskScore,
        factors: {
            beds: bedsRisk,
            criticalBeds: criticalBedsRisk,
            emergency: emergencyRisk,
            staff: staffRisk,
            operatingRooms: operatingRoomsRisk,
            supplies: suppliesRisk
        }
    };
}

/**
 * Calcula el estado general del hospital
 */
function calculateHospitalStatus(hospital) {
    const risk = calculateOperationalRisk(hospital);
    
    // El estado se basa en el nivel de riesgo
    if (risk.level === 'critical') return 'SATURADO';
    if (risk.level === 'high') return 'ALTA DEMANDA';
    if (risk.level === 'moderate') return 'ADVERTENCIA';
    return 'NORMAL';
}

/**
 * Genera alertas automáticas basadas en el estado del hospital
 */
function generateAlerts(hospital) {
    const alerts = [];
    
    // Verificar disponibilidad de camas
    const bedsAvailability = (hospital.camas.disponibles / hospital.camas.totales) * 100;
    if (bedsAvailability < 10) {
        alerts.push({
            type: 'danger',
            icon: '🔴',
            message: 'Disponibilidad de camas crítica (<10%)'
        });
    } else if (bedsAvailability < 20) {
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            message: 'Disponibilidad de camas baja (<20%)'
        });
    }
    
    // Verificar camas críticas
    const criticalBedsAvailability = (hospital.camasCriticas.disponibles / hospital.camasCriticas.totales) * 100;
    if (criticalBedsAvailability < 10) {
        alerts.push({
            type: 'danger',
            icon: '🔴',
            message: 'Capacidad crítica próxima a agotarse (<10%)'
        });
    } else if (criticalBedsAvailability < 20) {
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            message: 'Camas críticas en nivel bajo (<20%)'
        });
    }
    
    // Verificar guardia
    if (hospital.guardia.porcentajeOcupada >= 95) {
        alerts.push({
            type: 'danger',
            icon: '🔴',
            message: 'Guardia saturada (>95%)'
        });
    } else if (hospital.guardia.porcentajeOcupada >= 85) {
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            message: 'Guardia con alta ocupación (>85%)'
        });
    }
    
    // Verificar personal
    const staffAvailability = (hospital.personal.disponible / hospital.personal.total) * 100;
    if (staffAvailability < 50) {
        alerts.push({
            type: 'danger',
            icon: '🔴',
            message: 'Disponibilidad de personal crítica (<50%)'
        });
    } else if (staffAvailability < 60) {
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            message: 'Personal disponible en nivel bajo (<60%)'
        });
    }
    
    // Verificar quirófanos
    const operatingRoomsAvailability = (hospital.quirófanos.disponibles / hospital.quirófanos.totales) * 100;
    if (operatingRoomsAvailability === 0) {
        alerts.push({
            type: 'danger',
            icon: '🔴',
            message: 'Sin quirófanos disponibles'
        });
    } else if (operatingRoomsAvailability < 25) {
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            message: 'Disponibilidad de quirófanos baja (<25%)'
        });
    }
    
    // Verificar ambulancias
    const ambulancesAvailability = (hospital.ambulancias.disponibles / (hospital.ambulancias.disponibles + (hospital.ambulancias.totales || 6) - hospital.ambulancias.disponibles)) * 100;
    if (ambulancesAvailability === 0) {
        alerts.push({
            type: 'danger',
            icon: '🔴',
            message: 'Sin ambulancias disponibles'
        });
    } else if (ambulancesAvailability < 30) {
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            message: 'Pocas ambulancias disponibles (<30%)'
        });
    }
    
    // Verificar insumos
    if (hospital.insumos.porcentajeDisponible < 30) {
        alerts.push({
            type: 'danger',
            icon: '🔴',
            message: 'Nivel de insumos crítico (<30%)'
        });
    } else if (hospital.insumos.porcentajeDisponible < 50) {
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            message: 'Insumos en nivel bajo (<50%)'
        });
    }
    
    return alerts;
}

/**
 * Actualiza métricas calculadas del hospital
 * Esta función prepara el hospital para ser usado por futuras simulaciones
 */
function updateHospitalMetrics(hospital) {
    // Calcular ocupación general
    hospital.porcentajeOcupacion = calculateOccupancy(hospital.camas.ocupadas, hospital.camas.totales);
    
    // Actualizar estado
    hospital.estado = calculateHospitalStatus(hospital);
    
    // Calcular riesgo
    hospital.riesgo = calculateOperationalRisk(hospital);
    
    // Generar alertas
    hospital.alertas = generateAlerts(hospital);
    
    return hospital;
}

/**
 * Obtiene el texto de estado legible
 */
function getStatusText(status) {
    const statusMap = {
        'NORMAL': '🟢 OPERACIÓN NORMAL',
        'ADVERTENCIA': '🟡 ADVERTENCIA',
        'ALTA DEMANDA': '🟠 ALTA DEMANDA',
        'SATURADO': '🔴 SATURADO',
        'FUERA DE SERVICIO': '⚫ FUERA DE SERVICIO'
    };
    return statusMap[status] || status;
}

/**
 * Obtiene el texto de riesgo legible
 */
function getRiskText(level) {
    const riskMap = {
        'low': { icon: '🟢', text: 'BAJO' },
        'moderate': { icon: '🟡', text: 'MODERADO' },
        'high': { icon: '🟠', text: 'ALTO' },
        'critical': { icon: '🔴', text: 'CRÍTICO' }
    };
    return riskMap[level] || riskMap['low'];
}

/**
 * Obtiene el estado de insumos basado en porcentaje
 */
function getSupplyStatus(percentage) {
    if (percentage < 30) return { icon: '🔴', text: 'Crítico' };
    if (percentage < 50) return { icon: '🟡', text: 'Bajo' };
    return { icon: '🟢', text: 'Suficiente' };
}

/**
 * Obtiene el estado de quirófanos
 */
function getOperatingRoomsStatus(available, total) {
    const availability = (available / total) * 100;
    if (availability === 0) return { icon: '🔴', text: 'Sin disponibilidad' };
    if (availability < 30) return { icon: '🟡', text: 'Alta utilización' };
    return { icon: '🟢', text: 'Disponibles' };
}

/**
 * Calcula datos simulados para áreas del hospital
 */
function calculateAreaMetrics(hospital) {
    return {
        guardia: {
            status: getStatusFromPercentage(hospital.guardia.porcentajeOcupada),
            statusText: getStatusText(
                hospital.guardia.porcentajeOcupada >= 90 ? 'SATURADO' :
                hospital.guardia.porcentajeOcupada >= 80 ? 'ALTA DEMANDA' :
                hospital.guardia.porcentajeOcupada >= 70 ? 'ADVERTENCIA' : 'NORMAL'
            ).replace('OPERACIÓN ', ''),
            occupancy: hospital.guardia.porcentajeOcupada
        },
        internacion: {
            status: getStatusFromPercentage(hospital.porcentajeOcupacion),
            statusText: getStatusText(
                hospital.porcentajeOcupacion >= 90 ? 'SATURADO' :
                hospital.porcentajeOcupacion >= 80 ? 'ALTA DEMANDA' :
                hospital.porcentajeOcupacion >= 70 ? 'ADVERTENCIA' : 'NORMAL'
            ).replace('OPERACIÓN ', ''),
            occupancy: hospital.porcentajeOcupacion
        },
        uci: {
            status: getStatusFromPercentage(calculateOccupancy(hospital.camasCriticas.ocupadas, hospital.camasCriticas.totales)),
            statusText: getStatusText(
                calculateOccupancy(hospital.camasCriticas.ocupadas, hospital.camasCriticas.totales) >= 90 ? 'SATURADO' :
                calculateOccupancy(hospital.camasCriticas.ocupadas, hospital.camasCriticas.totales) >= 80 ? 'ALTA DEMANDA' :
                calculateOccupancy(hospital.camasCriticas.ocupadas, hospital.camasCriticas.totales) >= 70 ? 'ADVERTENCIA' : 'NORMAL'
            ).replace('OPERACIÓN ', ''),
            occupancy: calculateOccupancy(hospital.camasCriticas.ocupadas, hospital.camasCriticas.totales)
        },
        quirofanos: {
            status: getStatusFromPercentage(calculateOccupancy(hospital.quirófanos.totales - hospital.quirófanos.disponibles, hospital.quirófanos.totales)),
            statusText: getStatusText(
                calculateOccupancy(hospital.quirófanos.totales - hospital.quirófanos.disponibles, hospital.quirófanos.totales) >= 90 ? 'SATURADO' :
                calculateOccupancy(hospital.quirófanos.totales - hospital.quirófanos.disponibles, hospital.quirófanos.totales) >= 70 ? 'ALTA DEMANDA' :
                calculateOccupancy(hospital.quirófanos.totales - hospital.quirófanos.disponibles, hospital.quirófanos.totales) >= 50 ? 'ADVERTENCIA' : 'NORMAL'
            ).replace('OPERACIÓN ', ''),
            occupancy: calculateOccupancy(hospital.quirófanos.totales - hospital.quirófanos.disponibles, hospital.quirófanos.totales)
        },
        consultorios: {
            status: 'normal',
            statusText: '🟢 Normal',
            occupancy: Math.round(45 + Math.random() * 30) // Simulado
        },
        emergencias: {
            status: getStatusFromPercentage(hospital.guardia.porcentajeOcupada),
            statusText: getStatusText(
                hospital.guardia.porcentajeOcupada >= 90 ? 'SATURADO' :
                hospital.guardia.porcentajeOcupada >= 80 ? 'ALTA DEMANDA' :
                hospital.guardia.porcentajeOcupada >= 70 ? 'ADVERTENCIA' : 'NORMAL'
            ).replace('OPERACIÓN ', ''),
            occupancy: hospital.guardia.porcentajeOcupada
        }
    };
}
