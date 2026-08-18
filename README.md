# 🏥 HOSPITAL COMMAND NETWORK

Sistema de gestión y simulación de red hospitalaria para Córdoba, Argentina.

---

## 🎯 OBJETIVO

Crear un sistema completo de comando y control hospitalario que permita:
1. **Monitorear** la red hospitalaria en tiempo real
2. **Gestionar** recursos de cada hospital individualmente
3. **Simular** catástrofes y emergencias
4. **Coordinar** derivaciones entre hospitales
5. **Optimizar** la respuesta ante crisis

---

## ✅ CAPAS IMPLEMENTADAS

### ✅ CAPA 1 - RED HOSPITALARIA
**Estado:** Completada y funcional

**Características:**
- Mapa interactivo de Córdoba con OpenStreetMap
- 8 hospitales marcados con coordenadas reales
- Marcadores con colores según estado (Normal, Advertencia, Alta Demanda, Saturado)
- Panel lateral con estadísticas de la red
- Popups informativos con datos básicos
- Buscador de hospitales y localidades
- Filtros por estado

**Archivo principal:** `map/index.html`

---

### ✅ CAPA 2 - GESTIÓN INDIVIDUAL DEL HOSPITAL
**Estado:** Completada y funcional

**Características:**
- Dashboard completo de cada hospital
- Cálculo automático de riesgo operativo
- Sistema de alertas automáticas
- 6 tarjetas de resumen (camas, guardia, personal, quirófanos, ambulancias)
- Módulos detallados:
  - 🛏️ Capacidad de camas (generales y críticas)
  - 🚨 Guardia (con gráfico circular animado)
  - 👨‍⚕️ Personal (distribución visual)
  - 🔬 Quirófanos (grid individual)
  - 🚑 Ambulancias (grid individual)
  - 📦 Insumos (4 categorías)
  - 🏥 Áreas del hospital (6 áreas)
- Navegación integrada con el mapa
- Responsive design (desktop, tablet, móvil)
- Preparado para simulaciones futuras

**Archivo principal:** `hospital.html`

**Documentación completa:** `CAPA2-README.md`

---

### ✅ CAPA 3 - CENTRAL DE EMERGENCIAS
**Estado:** Completada y funcional ✨ NUEVO

**Características:**
- Centro de operaciones para gestión de emergencias
- 6 tipos de emergencias configurables:
  - 🌎 Terremoto
  - 🌊 Inundación
  - 🔥 Incendio
  - 💥 Explosión
  - 🚗 Accidente Masivo
  - 🏭 Accidente Industrial
- Configuración detallada:
  - Ubicación (12 localidades)
  - Radio de afectación (1-20+ km)
  - Nivel de gravedad (Bajo, Moderado, Alto, Crítico)
  - Parámetros específicos por tipo
- Cálculos automáticos:
  - Impacto estimado (pacientes críticos/moderados/leves)
  - Ambulancias requeridas
  - Hospitales afectados (con distancias reales)
  - Hospitales disponibles para respuesta
- Visualización en mapa interactivo con área afectada
- Sistema de persistencia (localStorage)
- Historial de emergencias
- Preparado para motor de simulación (Capa 4)

**Archivo principal:** `emergencies.html`

**Documentación completa:** `CAPA3-README.md`

---

## 🚀 INICIO RÁPIDO

### 1. Abrir el Mapa
```
Abrir: map/index.html
```

### 2. Seleccionar un Hospital
- Hacer clic en cualquier marcador del mapa
- Hacer clic en "Ver Hospital" en el popup

### 3. Explorar el Dashboard
- Ver estado operativo
- Revisar nivel de riesgo
- Consultar recursos disponibles
- Leer alertas automáticas

### 4. Volver al Mapa
- Hacer clic en "← Volver a la Red"

**Guía detallada:** `DEMO-RAPIDA.md`

---

## 📂 ESTRUCTURA DEL PROYECTO

```
hospital-command/
├── index.html                    # Dashboard principal
├── hospital.html                 # Dashboard individual
├── emergencies.html              # Central de emergencias ✨
│
├── css/
│   ├── styles.css               # Estilos generales
│   ├── hospital.css             # Estilos del hospital
│   └── emergency.css            # Estilos de emergencias ✨
│
├── js/
│   ├── app.js                   # Lógica principal
│   ├── hospitals.js             # Datos (compartido)
│   ├── risk-engine.js          # Motor de riesgo
│   ├── hospital-detail.js      # Renderizado hospital
│   ├── emergency-engine.js     # Motor de emergencias ✨
│   └── emergency.js            # Interfaz emergencias ✨
│
├── map/
│   ├── index.html               # Mapa interactivo
│   ├── map.css                  # Estilos del mapa
│   └── map.js                   # Lógica del mapa
│
└── 📚 Documentación:
    ├── README.md                # Este archivo
    ├── CAPA2-README.md         # Documentación Capa 2
    ├── CAPA3-README.md         # Documentación Capa 3 ✨
    ├── DEMO-RAPIDA.md          # Guía rápida
    ├── TESTING-CAPA2.md        # Checklist de pruebas
    └── ESTRUCTURA-PROYECTO.md   # Estructura detallada
```

✨ = Archivos nuevos de la Capa 3

**Documentación completa:** `ESTRUCTURA-PROYECTO.md`

---

## 🏥 HOSPITALES INCLUIDOS

### Córdoba Capital (8 hospitales)

1. **H001 - Hospital Central Córdoba**
   - Estado: 🟡 Advertencia
   - Ocupación: 70%
   - 450 camas totales

2. **H002 - Hospital Municipal**
   - Estado: 🟢 Normal
   - Ocupación: 50%
   - 280 camas totales

3. **H003 - Hospital Privado**
   - Estado: 🔴 Saturado
   - Ocupación: 90%
   - 200 camas totales

4. **H004 - Hospital Clínicas**
   - Estado: 🟢 Normal
   - Ocupación: 30%
   - 320 camas totales

5. **H005 - Hospital Infantil**
   - Estado: 🟠 Alta Demanda
   - Ocupación: 80%
   - 180 camas totales

6. **H006 - Hospital Emergencias**
   - Estado: 🟠 Alta Demanda
   - Ocupación: 80%
   - 250 camas totales

7. **H007 - Hospital Traumatológico**
   - Estado: 🟢 Normal
   - Ocupación: 30%
   - 150 camas totales

8. **H008 - Hospital Regional**
   - Estado: 🟠 Alta Demanda
   - Ocupación: 80%
   - 380 camas totales

**Todos los datos son simulados y no corresponden a pacientes reales.**

---

## 🧮 MOTOR DE RIESGO

El sistema calcula automáticamente el riesgo operativo de cada hospital mediante:

### Factores Ponderados
- **Camas:** 25%
- **Camas Críticas:** 25%
- **Guardia:** 15%
- **Personal:** 15%
- **Quirófanos:** 10%
- **Insumos:** 10%

### Niveles de Riesgo
- 🟢 **BAJO:** 0-49 puntos
- 🟡 **MODERADO:** 50-69 puntos
- 🟠 **ALTO:** 70-84 puntos
- 🔴 **CRÍTICO:** 85-100 puntos

### Sistema de Alertas
Genera automáticamente alertas cuando:
- Recursos disponibles < 20%
- Recursos críticos < 10%
- Ocupación > 85%
- Personal disponible < 60%

---

## 🎨 DISEÑO

### Identidad Visual
- **Estilo:** Profesional, institucional, tecnológico
- **Inspiración:** Centro de operaciones hospitalarias
- **Colores:**
  - 🟢 Normal: `#00ff88`
  - 🟡 Advertencia: `#ffd60a`
  - 🟠 Alta Demanda: `#ff9900`
  - 🔴 Saturado: `#ff006e`
  - Fondo: `#0a0e27`

### Responsive
- ✅ Desktop (>1200px)
- ✅ Tablet (768px - 1200px)
- ✅ Móvil (<768px)

---

## 🔧 TECNOLOGÍAS

### Frontend
- HTML5
- CSS3 (Variables, Grid, Flexbox)
- JavaScript (ES6+)

### Librerías
- **Leaflet 1.9.4** - Mapas interactivos
- **OpenStreetMap** - Tiles del mapa

### Arquitectura
- Modular y escalable
- Sin dependencias pesadas
- Preparado para futuras capas

---

## 📊 DATOS

### Fuente de Datos
- **Archivo:** `js/hospitals.js`
- **Objeto:** `hospitalNetwork`
- **Hospitales:** 8 en Córdoba Capital

### Estructura
```javascript
{
    id: "H001",
    nombre: "Hospital Central",
    ciudad: "Córdoba",
    camas: { totales, ocupadas, disponibles },
    camasCriticas: { totales, ocupadas, disponibles },
    personal: { total, disponible },
    guardia: { porcentajeOcupada },
    quirófanos: { totales, disponibles },
    ambulancias: { disponibles },
    insumos: { porcentajeDisponible },
    geolocalizacion: { latitud, longitud, provincia }
}
```

**IMPORTANTE:** Una única fuente de verdad compartida entre todas las capas.

---

## 🧪 TESTING

### Checklist Rápido
1. ✅ Mapa muestra 8 hospitales
2. ✅ Marcadores tienen colores según estado
3. ✅ Popup muestra información básica
4. ✅ Botón "Ver Hospital" funciona
5. ✅ Dashboard se carga correctamente
6. ✅ Todas las métricas se muestran
7. ✅ Gráficos están animados
8. ✅ Alertas se generan automáticamente
9. ✅ Botón "Volver a la Red" funciona
10. ✅ Responsive funciona en todos los tamaños

**Checklist completo:** `TESTING-CAPA2.md`

---

## 🚀 PRÓXIMAS CAPAS

### 🔜 CAPA 3 - CATÁSTROFES
- Simulación de eventos catastróficos
- Zonas de afectación
- Impacto en hospitales cercanos

### 🔜 CAPA 4 - MOTOR DE SIMULACIÓN
- Simulación en tiempo real
- Modificación dinámica de datos
- Actualización automática de dashboards

### 🔜 CAPA 5 - PACIENTES Y FLUJO
- Flujo de pacientes entre áreas
- Priorización por gravedad
- Tiempos de atención

### 🔜 CAPA 6 - DERIVACIONES
- Transferencia entre hospitales
- Cálculo de mejor destino
- Coordinación de recursos

### 🔜 CAPA 7 - RUTAS Y AMBULANCIAS
- Rutas en tiempo real
- Estado de ambulancias
- Optimización de trayectos

### 🔜 CAPA 8 - ANÁLISIS Y RECOMENDACIONES
- Recomendaciones automáticas
- Análisis de capacidad
- Predicción de colapso

### 🔜 CAPA 9 - INTELIGENCIA ARTIFICIAL
- IA para optimización
- Aprendizaje de patrones
- Predicción de demanda

### 🔜 CAPA 10 - INFORMES Y EVALUACIÓN
- Generación de informes
- Evaluación de respuesta
- Estadísticas de simulaciones

---

## 📝 NOTAS IMPORTANTES

### ⚠️ DATOS SIMULADOS
**Todos los datos utilizados son ficticios y no corresponden a:**
- Pacientes reales
- Instituciones reales
- Situaciones reales
- Información médica real

**Propósito:** Demostración y educación únicamente.

### 🎯 Uso del Proyecto
Este proyecto es una simulación educativa para:
- Entrenamiento en gestión hospitalaria
- Simulación de crisis
- Análisis de capacidad
- Planificación de recursos

---

## 🛠️ DESARROLLO

### Requisitos
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- No requiere servidor (puede ejecutarse localmente)
- No requiere instalación de dependencias

### Instalación
1. Clonar o descargar el proyecto
2. Abrir `map/index.html` en un navegador
3. ¡Listo! No se necesita nada más

### Modo Desarrollo
- Abrir DevTools (F12) para ver logs
- Modificar archivos CSS/JS en tiempo real
- Recargar página para ver cambios

---

## 📚 DOCUMENTACIÓN

### Archivos de Documentación

- **`README.md`** (este archivo)
  - Resumen general del proyecto
  
- **`CAPA2-README.md`**
  - Documentación completa de la Capa 2
  - Descripción de todas las funcionalidades
  - Funciones preparadas para futuras capas
  
- **`DEMO-RAPIDA.md`**
  - Guía de demostración en 5 minutos
  - Qué probar y cómo probarlo
  
- **`TESTING-CAPA2.md`**
  - Checklist exhaustivo de pruebas
  - Problemas comunes y soluciones
  
- **`ESTRUCTURA-PROYECTO.md`**
  - Estructura detallada de archivos
  - Descripción de cada componente
  - Flujo de datos
  - Convenciones de código

---

## 🤝 CONTRIBUIR

### Agregar un Nuevo Hospital
1. Editar `js/hospitals.js`
2. Agregar objeto al array con todos los campos
3. Definir coordenadas geográficas correctas
4. El sistema lo mostrará automáticamente

### Modificar Cálculo de Riesgo
1. Editar `js/risk-engine.js`
2. Modificar ponderaciones en `calculateOperationalRisk()`
3. Los cambios se reflejan automáticamente

### Agregar Nuevo Módulo
1. Agregar HTML en `hospital.html`
2. Agregar estilos en `css/hospital.css`
3. Agregar función de renderizado en `js/hospital-detail.js`
4. Llamar desde `renderHospital()`

---

## 🐛 PROBLEMAS CONOCIDOS

### Ninguno actualmente
Las Capas 1 y 2 están completamente funcionales.

---

## 📄 LICENCIA

Proyecto educativo.
Todos los datos son simulados.

---

## 👥 EQUIPO

Desarrollado para demostración del sistema de gestión hospitalaria.

---

## 📧 CONTACTO

Para preguntas o sugerencias:
- Revisar la documentación en los archivos MD
- Abrir DevTools para debugging
- Verificar la consola del navegador

---

## 🎉 ESTADO DEL PROYECTO

```
✅ CAPA 1 - Red Hospitalaria................ COMPLETADA
✅ CAPA 2 - Gestión Individual.............. COMPLETADA
✅ CAPA 3 - Central de Emergencias.......... COMPLETADA
🔜 CAPA 4 - Motor de Simulación............. PRÓXIMAMENTE
🔜 CAPA 5 - Pacientes y Flujo............... PRÓXIMAMENTE
🔜 CAPA 6 - Derivaciones.................... PRÓXIMAMENTE
🔜 CAPA 7 - Rutas y Ambulancias............. PRÓXIMAMENTE
🔜 CAPA 8 - Análisis y Recomendaciones...... PRÓXIMAMENTE
🔜 CAPA 9 - Inteligencia Artificial......... PRÓXIMAMENTE
🔜 CAPA 10 - Informes y Evaluación.......... PRÓXIMAMENTE
```

---

## 🌟 CARACTERÍSTICAS DESTACADAS

- ✅ Mapa interactivo en tiempo real
- ✅ Dashboard completo por hospital
- ✅ Cálculo automático de riesgo
- ✅ Sistema de alertas inteligente
- ✅ Central de emergencias profesional ✨
- ✅ 6 tipos de emergencias configurables ✨
- ✅ Cálculo de impacto automático ✨
- ✅ Identificación de hospitales afectados ✨
- ✅ Visualizaciones animadas (SVG)
- ✅ Diseño responsive
- ✅ Arquitectura modular
- ✅ Sin dependencias pesadas
- ✅ Preparado para simulaciones
- ✅ Documentación completa

---

**HOSPITAL COMMAND NETWORK - v2.0**

**Sistema de Gestión Hospitalaria Integral**

**Córdoba, Argentina**

---

*"Preparados para cualquier emergencia"* 🏥
