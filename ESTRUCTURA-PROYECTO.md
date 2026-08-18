# 📁 ESTRUCTURA DEL PROYECTO
## HOSPITAL COMMAND NETWORK

---

## 📂 Árbol de Archivos

```
hospital-command/
│
├── 📄 index.html                    # Dashboard principal (Capa 1)
├── 📄 hospital.html                 # Dashboard individual (Capa 2) ✨ NUEVO
│
├── 📁 css/
│   ├── styles.css                   # Estilos del dashboard principal
│   └── hospital.css                 # Estilos del dashboard individual ✨ NUEVO
│
├── 📁 js/
│   ├── app.js                       # Lógica del dashboard principal
│   ├── hospitals.js                 # Datos de los hospitales (compartido)
│   ├── risk-engine.js              # Motor de cálculo de riesgo ✨ NUEVO
│   └── hospital-detail.js          # Renderizado del dashboard individual ✨ NUEVO
│
├── 📁 map/
│   ├── index.html                   # Página del mapa
│   ├── map.css                      # Estilos del mapa
│   └── map.js                       # Lógica del mapa (actualizado)
│
├── 📁 assets/                       # Recursos adicionales (vacío por ahora)
│
├── 📄 CAPA2-README.md              # Documentación de la Capa 2 ✨ NUEVO
├── 📄 TESTING-CAPA2.md             # Checklist de pruebas ✨ NUEVO
├── 📄 DEMO-RAPIDA.md               # Guía de demostración ✨ NUEVO
└── 📄 ESTRUCTURA-PROYECTO.md       # Este archivo ✨ NUEVO
```

---

## 🗂️ DESCRIPCIÓN DE ARCHIVOS

### 📄 HTML

#### `index.html`
**Propósito:** Dashboard principal de la red hospitalaria (Capa 1)
**Contenido:**
- Vista general de la red
- Estadísticas agregadas
- Enlaces al mapa

#### `hospital.html` ✨ NUEVO
**Propósito:** Dashboard individual de un hospital específico (Capa 2)
**Contenido:**
- Header del hospital
- Sidebar con estado, riesgo y alertas
- Tarjetas de resumen
- Módulos detallados (camas, guardia, personal, etc.)
- Navegación de regreso al mapa

#### `map/index.html`
**Propósito:** Mapa interactivo de Córdoba con hospitales
**Contenido:**
- Mapa Leaflet con OpenStreetMap
- Marcadores de hospitales
- Panel lateral con estadísticas
- Popup con información básica
- Botón "Ver Hospital" → redirige a `hospital.html`

---

### 🎨 CSS

#### `css/styles.css`
**Propósito:** Estilos base del proyecto
**Contenido:**
- Variables CSS globales
- Reset y normalización
- Estilos del dashboard principal
- Tema institucional profesional

#### `css/hospital.css` ✨ NUEVO
**Propósito:** Estilos específicos del dashboard individual
**Contenido:**
- Layout del hospital (grid con sidebar)
- Estilos del header del hospital
- Tarjetas de resumen
- Módulos (camas, guardia, personal, etc.)
- Barras de progreso
- Gráficos
- Grids de quirófanos y ambulancias
- Responsive design
- Estados y colores

#### `map/map.css`
**Propósito:** Estilos del mapa interactivo
**Contenido:**
- Estilos del contenedor del mapa
- Marcadores personalizados
- Popups
- Panel lateral
- Controles de zoom

---

### 💻 JavaScript

#### `js/app.js`
**Propósito:** Lógica del dashboard principal (Capa 1)
**Contenido:**
- Inicialización del dashboard
- Renderizado de estadísticas
- Eventos de interacción

#### `js/hospitals.js`
**Propósito:** Estructura de datos central (compartido entre capas)
**Contenido:**
- Objeto `hospitalNetwork`
- Array de hospitales con todos sus datos
- Funciones de cálculo de estado
**IMPORTANTE:** Fuente única de verdad para todos los hospitales

#### `js/risk-engine.js` ✨ NUEVO
**Propósito:** Motor de cálculo de riesgo y alertas
**Contenido:**
- `calculateOperationalRisk()` - Calcula nivel de riesgo
- `calculateHospitalStatus()` - Determina estado del hospital
- `generateAlerts()` - Genera alertas automáticas
- `updateHospitalMetrics()` - Actualiza todas las métricas
- Funciones auxiliares de cálculo
**PREPARADO PARA:** Simulaciones futuras (Capa 4)

#### `js/hospital-detail.js` ✨ NUEVO
**Propósito:** Renderizado del dashboard individual
**Contenido:**
- `loadHospital()` - Carga datos desde URL
- `renderHospital()` - Renderiza todo el dashboard
- Funciones de renderizado por módulo:
  - `renderHeader()`
  - `renderSidebar()`
  - `renderSummaryCards()`
  - `renderBedsModule()`
  - `renderEmergencyModule()`
  - `renderStaffModule()`
  - `renderOperatingRoomsModule()`
  - `renderAmbulancesModule()`
  - `renderSuppliesModule()`
  - `renderAreasModule()`
- `updateHospital()` - Función pública para actualizar (futuro)

#### `map/map.js`
**Propósito:** Lógica del mapa interactivo
**Contenido:**
- Inicialización de Leaflet
- Carga de hospitales como marcadores
- Creación de popups
- Eventos de interacción
- `viewFullHospital()` - Redirige a dashboard individual ✨ ACTUALIZADO

---

## 🔄 FLUJO DE DATOS

### 1. Carga Inicial
```
map/index.html → map.js → hospitals.js
                            ↓
                    hospitalNetwork.hospitals
```

### 2. Selección de Hospital
```
Usuario hace clic en marcador
    ↓
Popup con información básica
    ↓
Clic en "Ver Hospital"
    ↓
viewFullHospital(hospitalId)
    ↓
Redirección a: hospital.html?id=H001
```

### 3. Carga del Dashboard Individual
```
hospital.html
    ↓
Carga scripts:
    - hospitals.js (datos)
    - risk-engine.js (cálculos)
    - hospital-detail.js (renderizado)
    ↓
loadHospital(id)
    ↓
Busca en hospitalNetwork.hospitals
    ↓
updateHospitalMetrics(hospital)
    ↓
renderHospital(hospital)
```

### 4. Navegación de Regreso
```
Usuario hace clic en "← Volver a la Red"
    ↓
Redirección a: map/index.html
    ↓
Mapa se vuelve a cargar con todos los hospitales
```

---

## 🔗 INTEGRACIÓN ENTRE CAPAS

### Capa 1 → Capa 2
**Archivo:** `map/map.js`
**Función:** `viewFullHospital(hospitalId)`
```javascript
function viewFullHospital(hospitalId) {
    window.location.href = `../hospital.html?id=${hospitalId}`;
}
```

### Capa 2 → Capa 1
**Archivo:** `hospital.html`
**Elemento:** Botón "Volver a la Red"
```html
<a href="map/index.html" class="back-link">
    ← Volver a la Red
</a>
```

### Datos Compartidos
**Archivo:** `js/hospitals.js`
**Objeto:** `hospitalNetwork`

Ambas capas leen del mismo objeto:
- **Capa 1:** Lee para mostrar estadísticas agregadas
- **Capa 2:** Lee para mostrar detalle individual

**IMPORTANTE:** Una única fuente de verdad

---

## 📊 ESTRUCTURA DE DATOS

### Objeto Hospital
```javascript
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
    
    geolocalizacion: {
        latitud: -31.4201,
        longitud: -64.1888,
        provincia: "Córdoba",
        region: "Centro"
    },
    
    // Campos calculados (agregados por updateHospitalMetrics)
    riesgo: {
        level: 'moderate',
        score: 65,
        factors: { ... }
    },
    
    alertas: [
        { type: 'warning', icon: '⚠️', message: '...' }
    ]
}
```

---

## 🎯 DEPENDENCIAS

### Externas
- **Leaflet 1.9.4** (CDN)
  - CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
  - JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`

### Internas
```
hospital.html
    ├── hospitals.js (datos)
    ├── risk-engine.js (cálculos)
    └── hospital-detail.js (renderizado)
           ↓ depende de ↓
        hospitals.js + risk-engine.js

map/index.html
    ├── hospitals.js (datos)
    └── map.js (mapa)
           ↓ depende de ↓
        hospitals.js + Leaflet
```

---

## 📦 MÓDULOS Y RESPONSABILIDADES

### `hospitals.js`
**Responsabilidad:** Datos
- Define hospitalNetwork
- Contiene array de hospitales
- Funciones básicas de cálculo de estado

### `risk-engine.js`
**Responsabilidad:** Lógica de negocio
- Calcula riesgo operativo
- Genera alertas
- Determina estados
- Actualiza métricas

### `hospital-detail.js`
**Responsabilidad:** Presentación
- Lee datos del URL
- Renderiza el dashboard
- Actualiza la interfaz
- Maneja eventos

### `map.js`
**Responsabilidad:** Visualización geográfica
- Inicializa mapa
- Crea marcadores
- Maneja interacciones
- Redirige a detalles

---

## 🚀 PREPARACIÓN PARA FUTURAS CAPAS

### Funciones Reutilizables
```javascript
// Ya implementadas y listas:
updateHospital()              // Re-renderiza dashboard
updateHospitalMetrics()       // Recalcula todo
calculateOperationalRisk()    // Calcula riesgo
generateAlerts()              // Genera alertas
```

### Uso Futuro (Capa 4 - Simulación)
```javascript
// Ejemplo de cómo se usará:
hospital.camas.disponibles -= 10;
hospital.camas.ocupadas += 10;
updateHospital(); // Dashboard se actualiza automáticamente
```

---

## 📝 CONVENCIONES

### Nombres de Archivos
- Minúsculas con guiones: `hospital-detail.js`
- CSS por funcionalidad: `hospital.css`, `map.css`
- HTML por vista: `hospital.html`, `index.html`

### Nombres de Funciones
- camelCase: `loadHospital()`, `renderModule()`
- Verbos descriptivos: `calculate`, `render`, `update`, `generate`

### Nombres de Variables
- camelCase: `currentHospital`, `riskLevel`
- Descriptivos: `bedsAvailable` mejor que `ba`

### IDs y Clases CSS
- IDs: camelCase para elementos únicos: `hospitalName`, `riskScore`
- Clases: kebab-case para estilos: `hospital-card`, `summary-cards`

---

## 🔍 CÓMO ENCONTRAR ALGO

### "¿Dónde está la función que calcula el riesgo?"
**Respuesta:** `js/risk-engine.js` → `calculateOperationalRisk()`

### "¿Dónde están los datos de los hospitales?"
**Respuesta:** `js/hospitals.js` → `hospitalNetwork.hospitals`

### "¿Dónde se renderiza el gráfico de guardia?"
**Respuesta:** `js/hospital-detail.js` → `renderEmergencyModule()`

### "¿Dónde se define el estilo del header?"
**Respuesta:** `css/hospital.css` → `.hospital-header`

### "¿Dónde se genera el popup del mapa?"
**Respuesta:** `map/map.js` → `createHospitalPopup()`

### "¿Dónde se calcula si un insumo está bajo?"
**Respuesta:** `js/risk-engine.js` → `getSupplyStatus()`

---

## 🎨 TEMAS Y ESTILOS

### Variables CSS Globales
Definidas en `css/styles.css`:
```css
:root {
    --primary-color: #1e3a5f;
    --status-normal: #48bb78;
    --status-warning: #ecc94b;
    --status-high-demand: #ed8936;
    --status-saturated: #f56565;
}
```

### Variables CSS del Hospital
Definidas en `css/hospital.css`:
```css
:root {
    --hospital-bg: #0a0e27;
    --hospital-accent: #00ff88;
    --hospital-warning: #ffd60a;
    --hospital-danger: #ff006e;
}
```

---

## 🔧 MANTENIMIENTO

### Para Agregar un Nuevo Hospital
1. Editar `js/hospitals.js`
2. Agregar objeto al array `hospitalNetwork.hospitals`
3. Incluir todos los campos requeridos
4. Definir `geolocalizacion` con coordenadas correctas
5. El hospital aparecerá automáticamente en el mapa

### Para Agregar un Nuevo Módulo
1. Editar `hospital.html` → agregar sección HTML
2. Editar `css/hospital.css` → agregar estilos
3. Editar `js/hospital-detail.js` → agregar función render
4. Llamar la función desde `renderHospital()`

### Para Modificar el Cálculo de Riesgo
1. Editar `js/risk-engine.js`
2. Modificar `calculateOperationalRisk()`
3. Ajustar ponderaciones en `weights`
4. Los cambios se reflejan automáticamente

---

## ✅ CHECKLIST DE ARCHIVOS

Verifica que todos estos archivos existan:

- [ ] `index.html`
- [ ] `hospital.html` ✨
- [ ] `css/styles.css`
- [ ] `css/hospital.css` ✨
- [ ] `js/app.js`
- [ ] `js/hospitals.js`
- [ ] `js/risk-engine.js` ✨
- [ ] `js/hospital-detail.js` ✨
- [ ] `map/index.html`
- [ ] `map/map.css`
- [ ] `map/map.js`
- [ ] `CAPA2-README.md` ✨
- [ ] `TESTING-CAPA2.md` ✨
- [ ] `DEMO-RAPIDA.md` ✨
- [ ] `ESTRUCTURA-PROYECTO.md` ✨

✨ = Archivos nuevos de la Capa 2

---

## 📚 DOCUMENTACIÓN

- **`CAPA2-README.md`**: Documentación completa de la Capa 2
- **`TESTING-CAPA2.md`**: Checklist detallado de pruebas
- **`DEMO-RAPIDA.md`**: Guía rápida de demostración
- **`ESTRUCTURA-PROYECTO.md`**: Este archivo

---

**VERSIÓN:** Capa 2 Completada
**ÚLTIMA ACTUALIZACIÓN:** 2024
**PRÓXIMA CAPA:** Capa 3 - Catástrofes
