// HOSPITAL COMMAND NETWORK - CAPA 4
// MOTOR DE SIMULACIÓN
// Este módulo ejecuta la simulación de catástrofes

/**
 * Inicia la simulación
 */
function startSimulation() {
    const emergency = loadActiveEmergency();
    
    if (!emergency) {
        alert('No hay ninguna emergencia activa para simular');
        return false;
    }
    
    // Actualizar estado de la emergencia
    emergency.status = 'active';
    saveActiveEmergency(emergency);
    
    // Inicializar estado de simulación
    initializeSimulationState(emergency);
    
    // Registrar evento inicial
    recordEvent(`🚨 Emergencia: ${getEmergencyTypeName(emergency.type)}`, 'critical');
    recordEvent(`📍 Ubicación: ${emergency.location.name}`, 'info');
    recordEvent(`⚠️ Gravedad: ${emergency.severity.toUpperCase()}`, emergency.severity === 'critical' ? 'critical' : 'warning');
    
    // Iniciar el loop de simulación
    runSimulationLoop();
    
    return true;
}

/**
 * Loop principal de la simulación
 */
function runSimulationLoop() {
    const state = getSimulationState();
    const speed = SIMULATION_RULES.simulationSpeeds[state.speed];
    
    state.intervalId = setInterval(() => {
        if (!state.paused && state.active) {
            advanceSimulation(1); // Avanzar 1 minuto
        }
    }, speed);
}

/**
 * Avanza la simulación N minutos
 */
function advanceSimulation(minutes = 1) {
    const state = getSimulationState();
    
    if (!state.active) return;
    
    // Avanzar tiempo
    state.simulationTime += minutes;
    
    // Generar pacientes según el tiempo
    generatePatients();
    
    // Actualizar métricas de la red
    updateNetworkMetrics();

    if (typeof persistSimulationState === 'function') {
        persistSimulationState();
    }
    
    // Generar alertas si es necesario
    generateSimulationAlerts();
    
    // Actualizar UI
    if (typeof updateSimulationUI === 'function') {
        updateSimulationUI();
    }
    
    // Verificar si la simulación está completa
    if (isSimulationComplete() && state.simulationTime >= 35) {
        // Dar tiempo adicional para observar el estado final
        if (state.simulationTime >= 40) {
            recordEvent('✓ Todos los pacientes han sido procesados', 'info');
        }
    }
}

/**
 * Genera pacientes según el tiempo transcurrido
 */
function generatePatients() {
    const state = getSimulationState();
    
    // Calcular cuántos pacientes deberían haber llegado a este tiempo
    const arrivalPercentage = getPatientArrivalPercentage(state.simulationTime);
    const shouldHaveArrived = Math.floor((arrivalPercentage / 100) * state.totalPatients);
    
    // Calcular cuántos nuevos pacientes llegan en este ciclo
    const newPatients = shouldHaveArrived - state.patientsGenerated;
    
    if (newPatients > 0) {
        // Distribuir pacientes por gravedad
        const criticalRatio = state.totalCritical / state.totalPatients;
        const moderateRatio = state.totalModerate / state.totalPatients;
        
        const newCritical = Math.min(
            Math.floor(newPatients * criticalRatio),
            state.totalCritical - state.criticalGenerated
        );
        const newModerate = Math.min(
            Math.floor(newPatients * moderateRatio),
            state.totalModerate - state.moderateGenerated
        );
        const newMinor = newPatients - newCritical - newModerate;
        
        // Actualizar contadores
        state.patientsGenerated += newPatients;
        state.criticalGenerated += newCritical;
        state.moderateGenerated += newModerate;
        state.minorGenerated += newMinor;
        
        // Distribuir pacientes a hospitales
        distributePatients(newCritical, newModerate, newMinor);
        
        // Registrar evento
        if (newPatients > 0) {
            let message = `👥 ${newPatients} pacientes ingresan a la red`;
            if (newCritical > 0) {
                message += ` (${newCritical} críticos)`;
            }
            recordEvent(message, newCritical > 5 ? 'warning' : 'info');
        }
    }
}

/**
 * Distribuye pacientes entre los hospitales
 */
function distributePatients(critical, moderate, minor) {
    const emergency = loadActiveEmergency();
    if (!emergency) return;
    
    // Obtener hospitales para distribución
    const affectedHospitals = hospitalNetwork.hospitals.filter(h => 
        emergency.affectedHospitals.some(ah => ah.id === h.id)
    );
    
    const availableHospitals = hospitalNetwork.hospitals.filter(h =>
        emergency.availableHospitals.some(ah => ah.id === h.id)
    );
    
    // Si no hay hospitales afectados, usar los disponibles
    const targetHospitals = affectedHospitals.length > 0 ? 
        [...affectedHospitals, ...availableHospitals] : 
        hospitalNetwork.hospitals;
    
    if (targetHospitals.length === 0) return;
    
    // Calcular prioridades de cada hospital
    const priorities = targetHospitals.map(hospital => {
        const distance = emergency.affectedHospitals.find(h => h.id === hospital.id)?.distance ||
                        emergency.availableHospitals.find(h => h.id === hospital.id)?.distance ||
                        100;
        
        const capacity = (hospital.camas.disponibles / hospital.camas.totales) * 100;
        const status = hospital.porcentajeOcupacion;
        const isAffected = emergency.affectedHospitals.some(h => h.id === hospital.id) ? 1 : 0;
        
        // Calcular score (mayor es mejor)
        const rules = SIMULATION_RULES.hospitalPriority;
        const score = 
            (1 - (distance / 100)) * rules.distanceWeight +
            (capacity / 100) * rules.capacityWeight +
            (1 - (status / 100)) * rules.statusWeight +
            isAffected * rules.affectedWeight;
        
        return { hospital, score };
    });
    
    // Ordenar por prioridad
    priorities.sort((a, b) => b.score - a.score);
    
    // Distribuir críticos
    distributePatientsToHospitals(priorities, critical, 'critical');
    
    // Distribuir moderados
    distributePatientsToHospitals(priorities, moderate, 'moderate');
    
    // Distribuir leves
    distributePatientsToHospitals(priorities, minor, 'minor');
}

/**
 * Distribuye un tipo de pacientes entre hospitales
 */
function distributePatientsToHospitals(priorities, patientCount, severity) {
    if (patientCount === 0) return;
    
    let remaining = patientCount;
    
    for (const { hospital, score } of priorities) {
        if (remaining <= 0) break;
        
        // Calcular cuántos pacientes puede recibir este hospital
        let capacity = 0;
        
        if (severity === 'critical') {
            capacity = hospital.camasCriticas.disponibles;
        } else {
            capacity = hospital.camas.disponibles;
        }
        
        if (capacity > 0) {
            const assigned = Math.min(remaining, Math.ceil(capacity * 0.5)); // Usar hasta 50% de capacidad disponible
            
            if (assigned > 0) {
                consumeHospitalResources(hospital, severity, assigned);
                remaining -= assigned;
            }
        }
    }
    
    // Si quedan pacientes sin asignar (saturación completa)
    if (remaining > 0) {
        recordEvent(
            `⚠️ ${remaining} pacientes ${severity} sin capacidad hospitalaria`,
            'critical'
        );
    }
}

/**
 * Consume recursos de un hospital por pacientes
 */
function consumeHospitalResources(hospital, severity, patientCount) {
    const rules = SIMULATION_RULES;
    
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
    
    // Incrementar guardia
    let emergencyImpact = 0;
    if (severity === 'critical') emergencyImpact = rules.emergency.criticalImpact;
    else if (severity === 'moderate') emergencyImpact = rules.emergency.moderateImpact;
    else emergencyImpact = rules.emergency.minorImpact;
    
    hospital.guardia.porcentajeOcupada = Math.min(
        100,
        hospital.guardia.porcentajeOcupada + (emergencyImpact * patientCount)
    );
    
    // Impactar personal
    let staffImpact = 0;
    if (severity === 'critical') staffImpact = rules.staff.criticalImpact;
    else if (severity === 'moderate') staffImpact = rules.staff.moderateImpact;
    else staffImpact = rules.staff.minorImpact;
    
    const staffReduction = Math.floor(patientCount * staffImpact);
    hospital.personal.disponible = Math.max(
        0,
        hospital.personal.disponible - staffReduction
    );
    
    // Consumir insumos
    const supplyConsumption = calculateResourceConsumption(
        severity === 'critical' ? patientCount : 0,
        severity === 'moderate' ? patientCount : 0,
        severity === 'minor' ? patientCount : 0
    );
    
    hospital.insumos.porcentajeDisponible = Math.max(
        0,
        hospital.insumos.porcentajeDisponible - (supplyConsumption.medications / 10)
    );
    
    // Consumir quirófanos si es necesario
    const roomsNeeded = calculateOperatingRoomsNeeded(
        severity === 'critical' ? patientCount : 0,
        severity === 'moderate' ? patientCount : 0,
        severity === 'minor' ? patientCount : 0
    );
    
    hospital.quirófanos.disponibles = Math.max(
        0,
        hospital.quirófanos.disponibles - roomsNeeded
    );
    
    // Recalcular estado y riesgo del hospital
    updateHospitalState(hospital);
}

/**
 * Actualiza el estado de un hospital
 */
function updateHospitalState(hospital) {
    // Actualizar métricas
    updateHospitalMetrics(hospital);
    
    // Determinar nuevo estado
    const previousState = hospital.estado;
    hospital.estado = calculateHospitalStatus(hospital);
    
    // Registrar cambio de estado
    if (previousState !== hospital.estado) {
        const emoji = hospital.estado === 'SATURADO' ? '🔴' :
                     hospital.estado === 'ALTA DEMANDA' ? '🟠' :
                     hospital.estado === 'ADVERTENCIA' ? '🟡' : '🟢';
        
        recordEvent(
            `${emoji} ${hospital.nombre}: ${hospital.estado}`,
            hospital.estado === 'SATURADO' ? 'critical' : 'warning'
        );
    }
}

/**
 * Genera alertas basadas en el estado actual
 */
function generateSimulationAlerts() {
    const state = getSimulationState();
    const rules = SIMULATION_RULES.alerts;
    
    hospitalNetwork.hospitals.forEach(hospital => {
        const hospitalName = hospital.nombre;
        
        // Alerta de camas críticas
        const criticalBedsPercent = (hospital.camasCriticas.disponibles / hospital.camasCriticas.totales) * 100;
        if (criticalBedsPercent < rules.criticalBeds.threshold && hospital.camasCriticas.disponibles > 0) {
            addAlert(
                `${hospitalName}: Camas críticas en nivel crítico (${Math.round(criticalBedsPercent)}%)`,
                'critical',
                hospital.id
            );
        }
        
        // Alerta de camas generales
        const bedsPercent = (hospital.camas.disponibles / hospital.camas.totales) * 100;
        if (bedsPercent < rules.beds.threshold && hospital.camas.disponibles > 0) {
            addAlert(
                `${hospitalName}: Disponibilidad de camas baja (${Math.round(bedsPercent)}%)`,
                'warning',
                hospital.id
            );
        }
        
        // Alerta de guardia
        if (hospital.guardia.porcentajeOcupada > rules.emergency.threshold) {
            addAlert(
                `${hospitalName}: Guardia saturada (${Math.round(hospital.guardia.porcentajeOcupada)}%)`,
                'warning',
                hospital.id
            );
        }
        
        // Alerta de personal
        const staffPercent = (hospital.personal.disponible / hospital.personal.total) * 100;
        if (staffPercent < rules.staff.threshold) {
            addAlert(
                `${hospitalName}: Personal insuficiente (${Math.round(staffPercent)}%)`,
                'warning',
                hospital.id
            );
        }
        
        // Alerta de quirófanos
        if (hospital.quirófanos.disponibles === rules.operatingRooms.threshold) {
            addAlert(
                `${hospitalName}: Sin quirófanos disponibles`,
                'critical',
                hospital.id
            );
        }
        
        // Alerta de insumos
        if (hospital.insumos.porcentajeDisponible < rules.supplies.threshold) {
            addAlert(
                `${hospitalName}: Insumos en nivel crítico (${Math.round(hospital.insumos.porcentajeDisponible)}%)`,
                'critical',
                hospital.id
            );
        }
    });
    
    // Alerta de red saturada
    if (state.hospitalsSaturated > 0) {
        addAlert(
            `⚠️ Red hospitalaria: ${state.hospitalsSaturated} hospitales saturados`,
            'critical'
        );
    }
    
    // Alerta de capacidad crítica de red
    if (state.networkMetrics.totalCriticalBedsAvailable < 10) {
        addAlert(
            `🔴 Red hospitalaria: Capacidad crítica insuficiente (${state.networkMetrics.totalCriticalBedsAvailable} camas)`,
            'critical'
        );
    }
}

/**
 * Pausa la simulación
 */
function pauseSimulation() {
    pauseSimulationState();
}

/**
 * Reanuda la simulación
 */
function resumeSimulation() {
    resumeSimulationState();
    runSimulationLoop();
}

/**
 * Cambia la velocidad de la simulación
 */
function changeSimulationSpeed(speed) {
    const state = getSimulationState();
    const wasPaused = state.paused;
    
    // Detener loop actual
    if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }
    
    // Cambiar velocidad
    setSimulationSpeed(speed);
    
    // Reiniciar loop si no estaba pausado
    if (!wasPaused && state.active) {
        runSimulationLoop();
    }
    
    recordEvent(`⏩ Velocidad cambiada a ${speed}`, 'info');
}

/**
 * Finaliza la simulación
 */
function finishSimulation() {
    const state = getSimulationState();
    stopSimulationState();

    if (state.initialSnapshot) {
        restoreHospitalSnapshot(state.initialSnapshot);
    }
    
    // Actualizar emergencia
    const emergency = loadActiveEmergency();
    if (emergency) {
        emergency.status = EMERGENCY_STATUS.COMPLETED;
        emergency.completedAt = new Date().toISOString();
        emergency.durationMinutes = state.simulationTime;
        emergency.patientsGenerated = state.patientsGenerated;
        emergency.hospitalsSaturated = state.hospitalsSaturated;
        emergency.finalStatus = EMERGENCY_STATUS.COMPLETED;
        saveEmergencyToHistory(emergency);
        clearActiveEmergency();
    }

    if (typeof clearSharedSimulationState === 'function') {
        clearSharedSimulationState();
    }
    
    recordEvent('⏹ Simulación finalizada', 'info');
    
    return true;
}

/**
 * Reinicia la simulación
 */
function resetSimulation() {
    resetSimulationState();
    
    // Reiniciar UI
    if (typeof updateSimulationUI === 'function') {
        updateSimulationUI();
    }
}
