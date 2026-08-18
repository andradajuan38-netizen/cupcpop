// HOSPITAL COMMAND NETWORK - ESTADO COMPARTIDO
// Fuente persistente de verdad para la red, emergencias y simulacion.

const SHARED_STATE_KEYS = {
    network: 'HOSPITAL_COMMAND_NETWORK_STATE',
    activeEmergency: 'HOSPITAL_COMMAND_ACTIVE_EMERGENCY',
    emergencyHistory: 'HOSPITAL_COMMAND_EMERGENCY_HISTORY',
    simulation: 'HOSPITAL_COMMAND_SIMULATION_STATE'
};

const EMERGENCY_STATUS = Object.freeze({
    DRAFT: 'DRAFT',
    READY: 'READY',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
});

function normalizeEmergencyStatus(status) {
    const normalized = String(status || '').toUpperCase();
    return Object.values(EMERGENCY_STATUS).includes(normalized) ? normalized : EMERGENCY_STATUS.DRAFT;
}

function readSharedJson(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error('No se pudo leer el estado compartido:', key, error);
        return fallback;
    }
}

function writeSharedJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('No se pudo guardar el estado compartido:', key, error);
        return false;
    }
}

function loadSharedState() {
    if (typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        return;
    }

    const persisted = readSharedJson(SHARED_STATE_KEYS.network);
    if (persisted && Array.isArray(persisted.hospitals)) {
        const persistedById = new Map(persisted.hospitals.map(hospital => [hospital.id, hospital]));
        const currentIds = new Set(hospitalNetwork.hospitals.map(hospital => hospital.id));
        const mergedHospitals = hospitalNetwork.hospitals.map(hospital => persistedById.get(hospital.id) || hospital);
        persisted.hospitals.forEach(hospital => {
            if (!currentIds.has(hospital.id)) {
                mergedHospitals.push(hospital);
            }
        });
        hospitalNetwork.hospitals = mergedHospitals;
        hospitalNetwork.lastUpdated = persisted.lastUpdated || hospitalNetwork.lastUpdated;
    }
}

function saveSharedNetwork() {
    if (typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        return false;
    }

    return writeSharedJson(SHARED_STATE_KEYS.network, {
        version: hospitalNetwork.version || '1.0',
        lastUpdated: new Date().toISOString(),
        hospitals: hospitalNetwork.hospitals
    });
}

function createSharedNetworkSnapshot() {
    if (typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        return null;
    }

    return {
        version: hospitalNetwork.version || '1.0',
        timestamp: new Date().toISOString(),
        hospitals: JSON.parse(JSON.stringify(hospitalNetwork.hospitals))
    };
}

function loadSharedActiveEmergency() {
    const current = readSharedJson(SHARED_STATE_KEYS.activeEmergency);
    if (current) {
        current.status = normalizeEmergencyStatus(current.status);
        return current;
    }

    const legacy = readSharedJson('EMERGENCY_MODULE_activeEmergency');
    if (legacy) {
        legacy.status = normalizeEmergencyStatus(legacy.status);
        writeSharedJson(SHARED_STATE_KEYS.activeEmergency, legacy);
    }
    return legacy;
}

function saveSharedActiveEmergency(emergency) {
    return writeSharedJson(SHARED_STATE_KEYS.activeEmergency, emergency);
}

function clearSharedActiveEmergency() {
    localStorage.removeItem(SHARED_STATE_KEYS.activeEmergency);
    localStorage.removeItem('EMERGENCY_MODULE_activeEmergency');
}

function getSharedEmergencyHistory() {
    const current = readSharedJson(SHARED_STATE_KEYS.emergencyHistory);
    if (Array.isArray(current)) {
        return current;
    }

    const legacy = readSharedJson('EMERGENCY_MODULE_emergencyHistory', []);
    if (Array.isArray(legacy) && legacy.length) {
        writeSharedJson(SHARED_STATE_KEYS.emergencyHistory, legacy);
    }
    return legacy;
}

function saveSharedEmergencyHistory(history) {
    return writeSharedJson(SHARED_STATE_KEYS.emergencyHistory, history);
}

function loadSharedSimulationState() {
    return readSharedJson(SHARED_STATE_KEYS.simulation);
}

function saveSharedSimulationState(state) {
    return writeSharedJson(SHARED_STATE_KEYS.simulation, state);
}

function clearSharedSimulationState() {
    localStorage.removeItem(SHARED_STATE_KEYS.simulation);
}

function syncSharedStateOnLoad() {
    loadSharedState();
}

document.addEventListener('DOMContentLoaded', syncSharedStateOnLoad);
