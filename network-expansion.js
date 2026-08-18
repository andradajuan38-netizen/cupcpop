// HOSPITAL COMMAND NETWORK - EXPANSION GEOGRAFICA
// Hospitales adicionales de la red provincial para calculos de impacto.

(function expandHospitalNetwork() {
    if (typeof hospitalNetwork === 'undefined' || !Array.isArray(hospitalNetwork.hospitals)) {
        return;
    }

    const additionalHospitals = [
        {
            id: 'H009', nombre: 'Hospital Regional Alta Gracia', ciudad: 'Alta Gracia', zona: 'Sierras Chicas',
            camas: { totales: 180, ocupadas: 90, disponibles: 90 },
            camasCriticas: { totales: 24, ocupadas: 8, disponibles: 16 },
            porcentajeOcupacion: 50, estado: 'NORMAL',
            personal: { total: 420, disponible: 350 }, guardia: { porcentajeOcupada: 55 },
            quirófanos: { totales: 5, disponibles: 3 }, ambulancias: { disponibles: 7 },
            insumos: { porcentajeDisponible: 78 }, coordenadas: { x: 35, y: 58 },
            geolocalizacion: { latitud: -31.6529, longitud: -64.4283, provincia: 'Córdoba', region: 'Sierras Chicas' }
        },
        {
            id: 'H010', nombre: 'Hospital Municipal Villa Carlos Paz', ciudad: 'Villa Carlos Paz', zona: 'Punilla',
            camas: { totales: 220, ocupadas: 110, disponibles: 110 },
            camasCriticas: { totales: 28, ocupadas: 10, disponibles: 18 },
            porcentajeOcupacion: 50, estado: 'NORMAL',
            personal: { total: 500, disponible: 410 }, guardia: { porcentajeOcupada: 60 },
            quirófanos: { totales: 6, disponibles: 4 }, ambulancias: { disponibles: 9 },
            insumos: { porcentajeDisponible: 82 }, coordenadas: { x: 28, y: 42 },
            geolocalizacion: { latitud: -31.4167, longitud: -64.5000, provincia: 'Córdoba', region: 'Punilla' }
        },
        {
            id: 'H011', nombre: 'Hospital Regional Río Ceballos', ciudad: 'Río Ceballos', zona: 'Sierras Chicas',
            camas: { totales: 140, ocupadas: 70, disponibles: 70 },
            camasCriticas: { totales: 18, ocupadas: 6, disponibles: 12 },
            porcentajeOcupacion: 50, estado: 'NORMAL',
            personal: { total: 330, disponible: 280 }, guardia: { porcentajeOcupada: 52 },
            quirófanos: { totales: 4, disponibles: 2 }, ambulancias: { disponibles: 5 },
            insumos: { porcentajeDisponible: 75 }, coordenadas: { x: 38, y: 28 },
            geolocalizacion: { latitud: -31.1640, longitud: -64.3220, provincia: 'Córdoba', region: 'Sierras Chicas' }
        },
        {
            id: 'H012', nombre: 'Hospital Regional Villa María', ciudad: 'Villa María', zona: 'Centro Este',
            camas: { totales: 300, ocupadas: 150, disponibles: 150 },
            camasCriticas: { totales: 36, ocupadas: 12, disponibles: 24 },
            porcentajeOcupacion: 50, estado: 'NORMAL',
            personal: { total: 700, disponible: 570 }, guardia: { porcentajeOcupada: 58 },
            quirófanos: { totales: 8, disponibles: 5 }, ambulancias: { disponibles: 11 },
            insumos: { porcentajeDisponible: 80 }, coordenadas: { x: 70, y: 60 },
            geolocalizacion: { latitud: -32.4075, longitud: -63.2400, provincia: 'Córdoba', region: 'Centro Este' }
        },
        {
            id: 'H013', nombre: 'Hospital San Antonio de Padua', ciudad: 'Río Cuarto', zona: 'Sur',
            camas: { totales: 360, ocupadas: 180, disponibles: 180 },
            camasCriticas: { totales: 42, ocupadas: 15, disponibles: 27 },
            porcentajeOcupacion: 50, estado: 'NORMAL',
            personal: { total: 820, disponible: 660 }, guardia: { porcentajeOcupada: 62 },
            quirófanos: { totales: 9, disponibles: 5 }, ambulancias: { disponibles: 13 },
            insumos: { porcentajeDisponible: 77 }, coordenadas: { x: 58, y: 78 },
            geolocalizacion: { latitud: -33.1307, longitud: -64.3499, provincia: 'Córdoba', region: 'Sur' }
        },
        {
            id: 'H014', nombre: 'Hospital Iturraspe', ciudad: 'San Francisco', zona: 'Este',
            camas: { totales: 280, ocupadas: 140, disponibles: 140 },
            camasCriticas: { totales: 32, ocupadas: 11, disponibles: 21 },
            porcentajeOcupacion: 50, estado: 'NORMAL',
            personal: { total: 620, disponible: 500 }, guardia: { porcentajeOcupada: 57 },
            quirófanos: { totales: 7, disponibles: 4 }, ambulancias: { disponibles: 10 },
            insumos: { porcentajeDisponible: 79 }, coordenadas: { x: 88, y: 48 },
            geolocalizacion: { latitud: -31.4300, longitud: -62.0800, provincia: 'Córdoba', region: 'Este' }
        }
    ];

    const existingIds = new Set(hospitalNetwork.hospitals.map(hospital => hospital.id));
    additionalHospitals.forEach(hospital => {
        if (!existingIds.has(hospital.id)) {
            hospitalNetwork.hospitals.push(hospital);
        }
    });
})();
