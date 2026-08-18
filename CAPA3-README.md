# HOSPITAL COMMAND NETWORK - CAPA 3
## CENTRAL DE EMERGENCIAS

### ✅ IMPLEMENTADO

La Capa 3 está completamente funcional y lista para usar.

### 🎯 OBJETIVO

Crear una central de emergencias profesional desde la cual un operador puede generar, configurar y preparar escenarios de emergencia antes de iniciar la simulación.

**Pregunta que responde:** *"¿Qué emergencia ocurrió y dónde?"*

---

## 📁 ARCHIVOS CREADOS

### HTML
- `emergencies.html` - Interfaz de la central de emergencias

### CSS
- `css/emergency.css` - Estilos específicos para emergencias

### JavaScript
- `js/emergency-engine.js` - Motor de cálculo de impacto y emergencias
- `js/emergency.js` - Interfaz de usuario y manejo de eventos

---

## 🚨 FUNCIONALIDADES IMPLEMENTADAS

### 1. Pantalla Principal
- ✅ Estado del sistema (Operativo/En emergencia)
- ✅ Contador de emergencias activas
- ✅ Última emergencia registrada
- ✅ Total de emergencias históricas
- ✅ Botón "NUEVA EMERGENCIA"

### 2. Wizard de Configuración

#### Paso 1: Tipo de Emergencia (6 tipos)
- ✅ 🌎 Terremoto
- ✅ 🌊 Inundación
- ✅ 🔥 Incendio
- ✅ 💥 Explosión
- ✅ 🚗 Accidente Masivo
- ✅ 🏭 Accidente Industrial

Cada tipo incluye:
- Descripción del evento
- Configuración de víctimas base
- Ratios de gravedad (críticos/moderados/leves)

#### Paso 2: Ubicación
- ✅ Selector con 12 localidades de Córdoba
- ✅ Coordenadas geográficas reales
- ✅ Localidades incluidas:
  - Alta Gracia
  - Anisacate
  - Villa del Prado
  - Despeñaderos
  - Rafael García
  - Los Cedros
  - Falda del Carmen
  - La Bolsa
  - Valle de Anisacate
  - Malagueño
  - Villa Carlos Paz
  - Córdoba Capital

#### Paso 3: Radio de Afectación
- ✅ Opciones predefinidas: 1, 3, 5, 10, 20 km
- ✅ Radio personalizado
- ✅ Visualización en mapa

#### Paso 4: Nivel de Gravedad (4 niveles)
- ✅ 🟢 BAJO (~20 pacientes)
- ✅ 🟡 MODERADO (~50 pacientes)
- ✅ 🟠 ALTO (~100 pacientes)
- ✅ 🔴 CRÍTICO (~200 pacientes)

#### Paso 5: Parámetros del Evento

**Terremoto:**
- Magnitud (Richter 3-9)
- Duración estimada (segundos)

**Inundación:**
- Nivel de afectación (Bajo/Medio/Alto)
- Área inundada (km²)

**Incendio:**
- Área afectada (km²)
- Velocidad de propagación (Lenta/Media/Rápida)

**Explosión:**
- Radio de impacto (metros)
- Nivel de daño

**Accidente Masivo:**
- Cantidad de vehículos
- Personas involucradas

**Accidente Industrial:**
- Tipo (Químico/Explosión/Incendio/Estructural)
- Área afectada (km²)

#### Paso 6: Resumen y Visualización
- ✅ Impacto estimado automático
- ✅ Hospitales en zona de impacto
- ✅ Hospitales disponibles para respuesta
- ✅ Mapa interactivo con:
  - Ubicación de la emergencia
  - Círculo del área afectada
  - Todos los hospitales de la red
  - Distancias calculadas

### 3. Cálculos Automáticos

#### Motor de Impacto
```javascript
calculateEstimatedImpact(type, severity, radius, parameters)
```

Calcula:
- **Pacientes totales**: Según tipo + gravedad + radio + parámetros
- **Críticos**: 10-25% según tipo de emergencia
- **Moderados**: 30-40% según tipo
- **Leves**: 35-60% según tipo
- **Ambulancias requeridas**: Críticos + (Moderados / 2)

**Multiplicadores:**
- Radio: 0.5x a 2.0x según extensión
- Parámetros: Variable según configuración específica

#### Hospitales Afectados
```javascript
calculateAffectedHospitals(location, radius)
```

Utiliza fórmula de Haversine para calcular:
- Distancia real entre emergencia y cada hospital
- Hospitales dentro del radio → **AFECTADOS**
- Hospitales cercanos (hasta 3x radio) → **DISPONIBLES**

### 4. Visualización en Mapa
- ✅ Mapa interactivo con Leaflet
- ✅ Marcador rojo en ubicación de emergencia
- ✅ Círculo rojo semitransparente del área afectada
- ✅ Hospitales con colores según estado
- ✅ Ajuste automático de zoom para mostrar todo

### 5. Sistema de Persistencia
- ✅ LocalStorage para emergencia activa
- ✅ LocalStorage para historial
- ✅ Recuperación al recargar página
- ✅ No se pierden datos

### 6. Emergencia Activa
- ✅ Vista detallada de la emergencia preparada
- ✅ Detalles del evento
- ✅ Impacto estimado
- ✅ Hospitales afectados
- ✅ Recursos estimados
- ✅ Botón "INICIAR SIMULACIÓN" (preparado para Capa 4)
- ✅ Botón "Finalizar Emergencia"

### 7. Historial
- ✅ Registro de todas las emergencias creadas
- ✅ Tarjetas con:
  - ID único
  - Tipo
  - Ubicación
  - Gravedad (con color)
  - Fecha (formato relativo: "Hace 2 días")
- ✅ Muestra las últimas 6 emergencias

### 8. Validaciones
- ✅ No permite crear sin tipo de emergencia
- ✅ No permite crear sin ubicación
- ✅ No permite crear sin gravedad
- ✅ No permite crear sin radio
- ✅ Mensajes claros de error

---

## 🧮 MOTOR DE CÁLCULO

### Configuración por Tipo

Cada tipo de emergencia tiene:
```javascript
{
    name: 'Nombre legible',
    baseCasualties: {
        low: número,
        moderate: número,
        high: número,
        critical: número
    },
    criticalRatio: 0.XX,    // % de críticos
    moderateRatio: 0.XX,    // % de moderados
    minorRatio: 0.XX        // % de leves
}
```

### Ejemplo de Cálculo

**Terremoto Crítico en Alta Gracia, radio 10km:**

1. **Base**: 200 pacientes (crítico)
2. **Radio 10km**: x1.3 = 260 pacientes
3. **Magnitud 6.5**: x1.3 = 338 pacientes
4. **Distribución**:
   - Críticos (15%): 51 pacientes
   - Moderados (35%): 118 pacientes
   - Leves (50%): 169 pacientes
5. **Ambulancias**: 51 + (118/2) = 110 ambulancias

### Distancia entre Puntos

Utiliza fórmula de Haversine para calcular distancias reales en kilómetros:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
    // Implementación de Haversine
    // Retorna distancia en km
}
```

---

## 📊 ESTRUCTURA DE DATOS

### Objeto Emergency
```javascript
{
    id: "E001",                     // Generado automáticamente
    type: "earthquake",              // Tipo de emergencia
    location: {
        name: "Alta Gracia",
        id: "alta-gracia",
        latitude: -31.6529,
        longitude: -64.4283
    },
    severity: "critical",            // low|moderate|high|critical
    affectedRadius: 10,              // km
    parameters: {                    // Específicos del tipo
        magnitude: 6.5,
        duration: 30
    },
    estimatedImpact: {
        totalPatients: 338,
        criticalPatients: 51,
        moderatePatients: 118,
        minorPatients: 169,
        ambulancesRequired: 110
    },
    affectedHospitals: [            // Dentro del radio
        {
            id: "H001",
            nombre: "Hospital Alta Gracia",
            distance: 2.3,
            estado: "ADVERTENCIA",
            camasDisponibles: 29,
            // ...
        }
    ],
    availableHospitals: [           // Cercanos disponibles
        // ...
    ],
    status: "ready",                // preparing|ready|active|completed
    createdAt: "2024-01-15T10:30:00Z",
    completedAt: null
}
```

---

## 🔗 INTEGRACIÓN CON CAPAS ANTERIORES

### Usa hospitalNetwork
```javascript
// Lee de la estructura existente
hospitalNetwork.hospitals.forEach(hospital => {
    // Calcula distancia
    // Determina si está afectado
});
```

### NO modifica hospitalNetwork
- ✅ Solo lectura
- ✅ No cambia estado de hospitales
- ✅ No modifica recursos
- ✅ Solo calcula y estima

---

## 🚀 PREPARACIÓN PARA CAPA 4

### Objeto activeEmergency Listo
La Capa 4 recibirá:
```javascript
const emergency = loadActiveEmergency();
// Contiene toda la configuración necesaria
```

### Funciones Preparadas
```javascript
// Ya implementadas:
calculateEstimatedImpact()
calculateAffectedHospitals()
saveActiveEmergency()
loadActiveEmergency()
validateEmergency()
```

### Botón "INICIAR SIMULACIÓN"
- ✅ Cambia status a 'active'
- ✅ Guarda emergencia
- ✅ Listo para Capa 4 que:
  - Iniciará el cronómetro
  - Generará pacientes
  - Modificará hospitales
  - Coordinará derivaciones

---

## 🎨 DISEÑO

### Identidad Visual
- Mantiene estética de HOSPITAL COMMAND NETWORK
- Centro de operaciones profesional
- Color principal: Rojo (#ff006e) para emergencias
- Sin estética de videojuego
- Sin exceso de neón

### Colores por Gravedad
- 🟢 **Bajo**: #00ff88
- 🟡 **Moderado**: #ffd60a
- 🟠 **Alto**: #ff9900
- 🔴 **Crítico**: #ff006e

### Responsive
- ✅ Desktop (>1200px)
- ✅ Tablet (768px - 1200px)
- ✅ Móvil (<768px)

---

## 📱 FLUJO DE USUARIO

1. **Entrar a Central de Emergencias**
   - Ver estado del sistema
   - Ver emergencias activas

2. **Crear Nueva Emergencia**
   - Clic en "NUEVA EMERGENCIA"
   - Wizard se abre

3. **Configurar Emergencia**
   - Seleccionar tipo
   - Seleccionar ubicación
   - Definir radio
   - Elegir gravedad
   - Configurar parámetros
   - Ver resumen automático

4. **Preparar Emergencia**
   - Clic en "PREPARAR EMERGENCIA"
   - Validación automática
   - Cálculos finales

5. **Emergencia Lista**
   - Vista de emergencia activa
   - Ver todos los detalles
   - Ver hospitales afectados
   - Ver impacto estimado

6. **Iniciar Simulación** (preparado para Capa 4)
   - Clic en "INICIAR SIMULACIÓN"
   - Status cambia a 'active'
   - Listo para motor de simulación

7. **Finalizar Emergencia**
   - Clic en "Finalizar Emergencia"
   - Se guarda en historial
   - Se limpia emergencia activa

---

## 🧪 TESTING

### Probar Diferentes Tipos
- [ ] Crear terremoto
- [ ] Crear inundación
- [ ] Crear incendio
- [ ] Crear explosión
- [ ] Crear accidente masivo
- [ ] Crear accidente industrial

### Probar Diferentes Ubicaciones
- [ ] Alta Gracia (centro)
- [ ] Córdoba Capital (gran ciudad)
- [ ] Anisacate (pueblo pequeño)

### Probar Diferentes Radios
- [ ] 1 km (muy localizado)
- [ ] 5 km (zona media)
- [ ] 20 km (gran área)

### Probar Diferentes Gravedades
- [ ] Bajo
- [ ] Moderado
- [ ] Alto
- [ ] Crítico

### Verificar Cálculos
- [ ] Pacientes totales son razonables
- [ ] Distribución críticos/moderados/leves suma 100%
- [ ] Ambulancias son proporcionales
- [ ] Hospitales afectados están dentro del radio
- [ ] Distancias son correctas

### Verificar Persistencia
- [ ] Crear emergencia
- [ ] Recargar página
- [ ] La emergencia sigue activa
- [ ] El historial se mantiene

---

## 📝 EJEMPLOS DE EMERGENCIAS

### Ejemplo 1: Terremoto Moderado
```
Tipo: Terremoto
Ubicación: Alta Gracia
Radio: 5 km
Gravedad: Moderado
Magnitud: 5.5
Duración: 30 seg

Resultado:
- 50 pacientes totales
- 8 críticos
- 18 moderados
- 24 leves
- 17 ambulancias
```

### Ejemplo 2: Incendio Crítico
```
Tipo: Incendio
Ubicación: Villa Carlos Paz
Radio: 10 km
Gravedad: Crítico
Área: 3 km²
Propagación: Rápida

Resultado:
- 325 pacientes totales
- 65 críticos
- 130 moderados
- 130 leves
- 130 ambulancias
```

### Ejemplo 3: Accidente Masivo Alto
```
Tipo: Accidente Masivo
Ubicación: Ruta 36 (Córdoba)
Radio: 3 km
Gravedad: Alto
Vehículos: 15
Personas: 50

Resultado:
- 120 pacientes totales
- 22 críticos
- 44 moderados
- 54 leves
- 44 ambulancias
```

---

## ⚠️ IMPORTANTE

### NO Implementado (pertenece a Capa 4)
- ❌ Motor de simulación en tiempo real
- ❌ Modificación de datos de hospitales
- ❌ Generación de pacientes reales
- ❌ Movimiento de ambulancias
- ❌ Derivaciones entre hospitales
- ❌ Flujo temporal (minuto a minuto)
- ❌ Cambios en camas/personal/recursos

### SÍ Implementado (Capa 3)
- ✅ Configuración de emergencias
- ✅ Estimación de impacto
- ✅ Identificación de hospitales afectados
- ✅ Visualización en mapa
- ✅ Preparación de escenario
- ✅ Persistencia de datos
- ✅ Historial de emergencias

---

## 🔜 PRÓXIMA CAPA

**CAPA 4 - MOTOR DE SIMULACIÓN**

Recibirá:
```javascript
const emergency = loadActiveEmergency();
```

Implementará:
- Cronómetro temporal
- Generación de pacientes según impacto estimado
- Modificación de hospitalNetwork en tiempo real
- Flujo de pacientes entre áreas
- Actualización de dashboards automática
- Sistema de eventos temporales

---

## 📚 DOCUMENTACIÓN DE FUNCIONES

### `calculateEstimatedImpact(type, severity, radius, parameters)`
Calcula el impacto estimado de una emergencia.

**Parámetros:**
- `type`: Tipo de emergencia (string)
- `severity`: Gravedad (low|moderate|high|critical)
- `radius`: Radio de afectación en km (number)
- `parameters`: Parámetros específicos del tipo (object)

**Retorna:**
```javascript
{
    totalPatients: number,
    criticalPatients: number,
    moderatePatients: number,
    minorPatients: number,
    ambulancesRequired: number
}
```

### `calculateAffectedHospitals(location, radius)`
Determina qué hospitales están afectados.

**Parámetros:**
- `location`: Ubicación con latitude/longitude (object)
- `radius`: Radio en km (number)

**Retorna:**
```javascript
{
    affected: [array de hospitales],
    available: [array de hospitales]
}
```

### `validateEmergency(emergency)`
Valida que una emergencia tenga todos los datos.

**Retorna:**
```javascript
{
    isValid: boolean,
    errors: [array de strings]
}
```

---

## ✅ CHECKLIST DE FUNCIONALIDADES

- [x] Pantalla principal con estado del sistema
- [x] Botón "NUEVA EMERGENCIA"
- [x] Wizard de configuración (6 pasos)
- [x] 6 tipos de emergencias
- [x] 12 ubicaciones disponibles
- [x] Radio personalizable
- [x] 4 niveles de gravedad
- [x] Parámetros específicos por tipo
- [x] Cálculo automático de impacto
- [x] Identificación de hospitales afectados
- [x] Mapa interactivo con visualización
- [x] Persistencia en localStorage
- [x] Emergencia activa con detalles
- [x] Botón "INICIAR SIMULACIÓN"
- [x] Historial de emergencias
- [x] Validaciones completas
- [x] Diseño responsive
- [x] Integración con hospitalNetwork
- [x] Preparado para Capa 4

---

**CAPA 3 COMPLETADA ✅**

Siguiente paso: **CAPA 4 - MOTOR DE SIMULACIÓN**
