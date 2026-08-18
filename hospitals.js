// HOSPITAL COMMAND NETWORK - CAPA 1
// Datos de la red hospitalaria ficticia - ZONA ALTA GRACIA, CÓRDOBA
// Este archivo contiene la estructura de datos central de los hospitales
// Preparado para futuras capas donde se modificarán estos datos durante simulaciones

const hospitalNetwork = {
    // Versión de la estructura de datos
    version: "1.0",
    lastUpdated: new Date().toISOString(),
    
    // Configuración de umbrales para cálculo de estados
    thresholds: {
        normal: 69,           // 0-69% ocupación
        warning: 79,          // 70-79% ocupación
        highDemand: 89,       // 80-89% ocupación
        saturated: 100         // 90-100% ocupación
    },
    
    // Array de hospitales - CÓRDOBA CAPITAL
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

/**
 * Obtiene un hospital por ID
 */
function getHospitalById(id) {
    if (!id || typeof hospitalNetwork === 'undefined' || !hospitalNetwork.hospitals) {
        return null;
    }

    return hospitalNetwork.hospitals.find(function(hospital) {
        return hospital.id === id;
    }) || null;
}

// Función para calcular el estado de un hospital basado en sus recursos
// Esta función se usará en futuras capas para recalcular estados durante simulaciones
function calcularEstadoHospital(hospital) {
    const { camas, camasCriticas, insumos, personal, guardia } = hospital;
    
    // Calcular factores de riesgo
    const ocupacionCamas = (camas.ocupadas / camas.totales) * 100;
    const ocupacionCriticas = (camasCriticas.ocupadas / camasCriticas.totales) * 100;
    const nivelInsumos = insumos.porcentajeDisponible;
    const personalDisponible = (personal.disponible / personal.total) * 100;
    const ocupacionGuardia = guardia.porcentajeOcupada;
    
    // Ponderación de factores (camas tiene mayor peso)
    let riesgoTotal = (ocupacionCamas * 0.4) + 
                      (ocupacionCriticas * 0.25) + 
                      ((100 - nivelInsumos) * 0.15) + 
                      ((100 - personalDisponible) * 0.1) + 
                      (ocupacionGuardia * 0.1);
    
    // Determinar estado basado en riesgo total
    if (riesgoTotal >= 90) return "SATURADO";
    if (riesgoTotal >= 80) return "ALTA DEMANDA";
    if (riesgoTotal >= 70) return "ADVERTENCIA";
    return "NORMAL";
}

// Función para actualizar el estado de todos los hospitales
function actualizarEstadosRed() {
    hospitalNetwork.hospitals.forEach(hospital => {
        hospital.estado = calcularEstadoHospital(hospital);
    });
    hospitalNetwork.lastUpdated = new Date().toISOString();
}

// Inicializar estados (se ejecuta al cargar)
actualizarEstadosRed();