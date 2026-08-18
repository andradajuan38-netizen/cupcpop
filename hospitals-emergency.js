// HOSPITAL COMMAND NETWORK - DATOS PARA EMERGENCIAS
// Versión independiente de datos de hospitales para el módulo de emergencias
// Aislado para evitar conflictos con otros módulos

// Alias para compatibilidad con otros módulos
var hospitalNetwork = null;

const hospitalNetworkEmergency = {
    version: "1.0",
    lastUpdated: new Date().toISOString(),
    
    thresholds: {
        normal: 69,
        warning: 79,
        highDemand: 89,
        saturated: 100
    },
    
    hospitals: [
        {
            id: "H001",
            nombre: "Hospital Central Córdoba",
            ciudad: "Córdoba",
            zona: "Centro",
            camas: {
                totales: 450,
                ocupadas: 315,
                disponibles: 135
            },
            camasCriticas: {
                totales: 80,
                ocupadas: 65,
                disponibles: 15
            },
            porcentajeOcupacion: 70,
            estado: "ADVERTENCIA",
            personal: {
                total: 1200,
                disponible: 950
            },
            guardia: {
                porcentajeOcupada: 75
            },
            quirófanos: {
                totales: 12,
                disponibles: 4
            },
            ambulancias: {
                disponibles: 8
            },
            insumos: {
                porcentajeDisponible: 60
            },
            coordenadas: {
                x: 50,
                y: 40
            },
            geolocalizacion: {
                latitud: -31.4201,
                longitud: -64.1888,
                provincia: "Córdoba",
                region: "Centro"
            }
        },
        {
            id: "H002",
            nombre: "Hospital Municipal",
            ciudad: "Córdoba",
            zona: "Norte",
            camas: {
                totales: 280,
                ocupadas: 140,
                disponibles: 140
            },
            camasCriticas: {
                totales: 40,
                ocupadas: 20,
                disponibles: 20
            },
            porcentajeOcupacion: 50,
            estado: "NORMAL",
            personal: {
                total: 750,
                disponible: 650
            },
            guardia: {
                porcentajeOcupada: 45
            },
            quirófanos: {
                totales: 8,
                disponibles: 5
            },
            ambulancias: {
                disponibles: 12
            },
            insumos: {
                porcentajeDisponible: 85
            },
            coordenadas: {
                x: 45,
                y: 35
            },
            geolocalizacion: {
                latitud: -31.3833,
                longitud: -64.2000,
                provincia: "Córdoba",
                region: "Norte"
            }
        },
        {
            id: "H003",
            nombre: "Hospital Privado",
            ciudad: "Córdoba",
            zona: "Sur",
            camas: {
                totales: 200,
                ocupadas: 180,
                disponibles: 20
            },
            camasCriticas: {
                totales: 25,
                ocupadas: 22,
                disponibles: 3
            },
            porcentajeOcupacion: 90,
            estado: "SATURADO",
            personal: {
                total: 500,
                disponible: 350
            },
            guardia: {
                porcentajeOcupada: 95
            },
            quirófanos: {
                totales: 6,
                disponibles: 1
            },
            ambulancias: {
                disponibles: 3
            },
            insumos: {
                porcentajeDisponible: 30
            },
            coordenadas: {
                x: 55,
                y: 45
            },
            geolocalizacion: {
                latitud: -31.4500,
                longitud: -64.1667,
                provincia: "Córdoba",
                region: "Sur"
            }
        },
        {
            id: "H004",
            nombre: "Hospital Clínicas",
            ciudad: "Córdoba",
            zona: "Centro",
            camas: {
                totales: 320,
                ocupadas: 96,
                disponibles: 224
            },
            camasCriticas: {
                totales: 50,
                ocupadas: 15,
                disponibles: 35
            },
            porcentajeOcupacion: 30,
            estado: "NORMAL",
            personal: {
                total: 850,
                disponible: 780
            },
            guardia: {
                porcentajeOcupada: 35
            },
            quirófanos: {
                totales: 10,
                disponibles: 7
            },
            ambulancias: {
                disponibles: 15
            },
            insumos: {
                porcentajeDisponible: 90
            },
            coordenadas: {
                x: 48,
                y: 38
            },
            geolocalizacion: {
                latitud: -31.4167,
                longitud: -64.1833,
                provincia: "Córdoba",
                region: "Centro"
            }
        },
        {
            id: "H005",
            nombre: "Hospital Infantil",
            ciudad: "Córdoba",
            zona: "Este",
            camas: {
                totales: 180,
                ocupadas: 144,
                disponibles: 36
            },
            camasCriticas: {
                totales: 30,
                ocupadas: 24,
                disponibles: 6
            },
            porcentajeOcupacion: 80,
            estado: "ALTA DEMANDA",
            personal: {
                total: 450,
                disponible: 380
            },
            guardia: {
                porcentajeOcupada: 85
            },
            quirófanos: {
                totales: 5,
                disponibles: 2
            },
            ambulancias: {
                disponibles: 6
            },
            insumos: {
                porcentajeDisponible: 55
            },
            coordenadas: {
                x: 52,
                y: 42
            },
            geolocalizacion: {
                latitud: -31.4000,
                longitud: -64.1500,
                provincia: "Córdoba",
                region: "Este"
            }
        },
        {
            id: "H006",
            nombre: "Hospital Emergencias",
            ciudad: "Córdoba",
            zona: "Oeste",
            camas: {
                totales: 250,
                ocupadas: 200,
                disponibles: 50
            },
            camasCriticas: {
                totales: 45,
                ocupadas: 38,
                disponibles: 7
            },
            porcentajeOcupacion: 80,
            estado: "ALTA DEMANDA",
            personal: {
                total: 650,
                disponible: 480
            },
            guardia: {
                porcentajeOcupada: 82
            },
            quirófanos: {
                totales: 9,
                disponibles: 3
            },
            ambulancias: {
                disponibles: 5
            },
            insumos: {
                porcentajeDisponible: 45
            },
            coordenadas: {
                x: 42,
                y: 36
            },
            geolocalizacion: {
                latitud: -31.4333,
                longitud: -64.2167,
                provincia: "Córdoba",
                region: "Oeste"
            }
        },
        {
            id: "H007",
            nombre: "Hospital Traumatológico",
            ciudad: "Córdoba",
            zona: "Norte",
            camas: {
                totales: 150,
                ocupadas: 45,
                disponibles: 105
            },
            camasCriticas: {
                totales: 35,
                ocupadas: 10,
                disponibles: 25
            },
            porcentajeOcupacion: 30,
            estado: "NORMAL",
            personal: {
                total: 400,
                disponible: 360
            },
            guardia: {
                porcentajeOcupada: 40
            },
            quirófanos: {
                totales: 8,
                disponibles: 6
            },
            ambulancias: {
                disponibles: 20
            },
            insumos: {
                porcentajeDisponible: 95
            },
            coordenadas: {
                x: 46,
                y: 34
            },
            geolocalizacion: {
                latitud: -31.3667,
                longitud: -64.2167,
                provincia: "Córdoba",
                region: "Norte"
            }
        },
        {
            id: "H008",
            nombre: "Hospital Regional",
            ciudad: "Córdoba",
            zona: "Sur",
            camas: {
                totales: 380,
                ocupadas: 304,
                disponibles: 76
            },
            camasCriticas: {
                totales: 60,
                ocupadas: 48,
                disponibles: 12
            },
            porcentajeOcupacion: 80,
            estado: "ALTA DEMANDA",
            personal: {
                total: 950,
                disponible: 720
            },
            guardia: {
                porcentajeOcupada: 78
            },
            quirófanos: {
                totales: 14,
                disponibles: 5
            },
            ambulancias: {
                disponibles: 10
            },
            insumos: {
                porcentajeDisponible: 70
            },
            coordenadas: {
                x: 54,
                y: 44
            },
            geolocalizacion: {
                latitud: -31.4667,
                longitud: -64.1833,
                provincia: "Córdoba",
                region: "Sur"
            }
        }
    ]
};

function getHospitalByIdEmergency(id) {
    if (!id || typeof hospitalNetworkEmergency === 'undefined' || !hospitalNetworkEmergency.hospitals) {
        return null;
    }

    return hospitalNetworkEmergency.hospitals.find(function(hospital) {
        return hospital.id === id;
    }) || null;
}

// Establecer alias después de definir el objeto
hospitalNetwork = hospitalNetworkEmergency;

// Funciones de compatibilidad
function getHospitalById(id) {
    return getHospitalByIdEmergency(id);
}
