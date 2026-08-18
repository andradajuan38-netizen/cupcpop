# HOSPITAL COMMAND NETWORK - CAPA 2
## GESTIÓN INDIVIDUAL DEL HOSPITAL

### ✅ IMPLEMENTADO

La Capa 2 está completamente funcional y lista para usar.

### 🎯 OBJETIVO

Proporcionar una vista detallada del estado operativo interno de cada hospital individual.

**Pregunta que responde:** *"¿Cómo está funcionando este hospital por dentro?"*

---

## 📁 ARCHIVOS CREADOS

### HTML
- `hospital.html` - Dashboard individual del hospital

### CSS
- `css/hospital.css` - Estilos específicos para la gestión hospitalaria

### JavaScript
- `js/risk-engine.js` - Motor de cálculo de riesgo y alertas
- `js/hospital-detail.js` - Renderizado del dashboard

---

## 🔗 INTEGRACIÓN CON CAPA 1

### Navegación
- **Desde el mapa** → Clic en hospital → "Ver Hospital" → Dashboard individual
- **Desde el dashboard** → "Volver a la Red" → Regresa al mapa

### Datos compartidos
- Utiliza la misma estructura `hospitalNetwork` de la Capa 1
- No duplica información
- Una única fuente de verdad

### URL
```
hospital.html?id=H001
```

El parámetro `id` identifica el hospital en `hospitalNetwork.hospitals`

---

## 🏥 COMPONENTES DEL DASHBOARD

### Header
- Nombre del hospital
- Ubicación
- Estado operativo
- Badge de "DATOS SIMULADOS"
- Botón "Volver a la Red"

### Sidebar Izquierda

#### 1. Estado del Hospital
- Estado actual
- Ocupación general
- Guardia
- Camas críticas  
- Personal disponible

#### 2. Riesgo Operativo
- Nivel: BAJO / MODERADO / ALTO / CRÍTICO
- Score: 0-100
- Indicador visual con color

#### 3. Alertas Operativas
- Generadas automáticamente
- Basadas en umbrales críticos
- Tipos: advertencia / peligro

#### 4. Botón de Simulación
- Deshabilitado (preparado para Capa 4)
- "Disponible próximamente"

### Contenido Principal

#### Tarjetas de Resumen (6)
1. Camas Disponibles
2. Camas Críticas
3. Guardia
4. Personal
5. Quirófanos
6. Ambulancias

#### Módulos Detallados

##### 🛏️ Capacidad de Camas
- Camas totales / ocupadas / disponibles
- Barra de progreso con colores según estado
- Subsección: Camas Críticas

##### 🚨 Guardia
- Gráfico circular SVG animado
- Pacientes en espera / atención / críticos
- Tiempo promedio de espera

##### 👨‍⚕️ Personal
- Barra de distribución: Disponible / En servicio / No disponible
- Médicos / Enfermeros
- Porcentaje de disponibilidad

##### 🔬 Quirófanos
- Grid visual de cada quirófano
- Estado individual: Disponible / En uso
- Estado general calculado automáticamente

##### 🚑 Ambulancias
- Grid visual de cada ambulancia
- Estado: Disponible / En servicio
- Total y disponibles

##### 📦 Insumos
- Medicamentos
- Material quirúrgico
- Oxígeno
- Material descartable
- Barras de progreso con indicadores: Suficiente / Bajo / Crítico

##### 🏥 Áreas del Hospital
- 6 áreas principales con ocupación:
  - Guardia
  - Internación
  - UCI
  - Quirófanos
  - Consultorios
  - Emergencias

---

## 🧮 MOTOR DE CÁLCULO DE RIESGO

### Función: `calculateOperationalRisk(hospital)`

Calcula el riesgo operativo mediante factores ponderados:

```javascript
{
    beds: 25%,
    criticalBeds: 25%,
    emergency: 15%,
    staff: 15%,
    operatingRooms: 10%,
    supplies: 10%
}
```

**Retorna:**
```javascript
{
    level: 'low' | 'moderate' | 'high' | 'critical',
    score: 0-100,
    factors: { ... }
}
```

### Niveles de Riesgo
- **BAJO:** Score 0-49
- **MODERADO:** Score 50-69
- **ALTO:** Score 70-84
- **CRÍTICO:** Score 85-100

---

## ⚠️ SISTEMA DE ALERTAS

### Función: `generateAlerts(hospital)`

Genera alertas automáticas basadas en:

1. **Camas < 10%** → 🔴 Crítico
2. **Camas < 20%** → ⚠️ Advertencia
3. **Camas críticas < 10%** → 🔴 Crítico
4. **Camas críticas < 20%** → ⚠️ Advertencia
5. **Guardia > 95%** → 🔴 Saturada
6. **Guardia > 85%** → ⚠️ Alta ocupación
7. **Personal < 50%** → 🔴 Crítico
8. **Personal < 60%** → ⚠️ Bajo
9. **Quirófanos = 0** → 🔴 Sin disponibilidad
10. **Quirófanos < 25%** → ⚠️ Baja disponibilidad
11. **Ambulancias = 0** → 🔴 Sin disponibilidad
12. **Insumos < 30%** → 🔴 Crítico
13. **Insumos < 50%** → ⚠️ Bajo

---

## 🎨 DISEÑO

### Identidad Visual
- Mantiene la estética de la Capa 1
- Profesional e institucional
- Centro de operaciones hospitalarias
- **NO** estética de videojuego

### Colores
- **Normal:** Verde (`#00ff88`)
- **Advertencia:** Amarillo (`#ffd60a`)
- **Alta Demanda:** Naranja (`#ff9900`)
- **Saturado:** Rojo (`#ff006e`)
- **Fondo:** Azul oscuro (`#0a0e27`)

### Responsive
- **Desktop:** Sidebar + contenido completo
- **Tablet:** Sidebar adaptable
- **Móvil:** Cards apiladas verticalmente

---

## 🔧 FUNCIONES PREPARADAS PARA FUTURAS CAPAS

Estas funciones están listas pero no se usan todavía:

### `updateHospital()`
Actualiza todos los datos y re-renderiza el dashboard.
**Uso futuro:** Simulaciones en tiempo real

### `updateHospitalMetrics(hospital)`
Recalcula métricas, estado, riesgo y alertas.
**Uso futuro:** Motor de simulación

### `calculateHospitalStatus(hospital)`
Determina el estado actual del hospital.
**Uso futuro:** Cambios dinámicos de estado

---

## 📊 EJEMPLO DE USO

### Desde el Mapa
1. Usuario hace clic en un marcador de hospital
2. Aparece popup con información básica
3. Usuario hace clic en "Ver Hospital"
4. Se abre `hospital.html?id=H001`
5. Se carga y muestra el dashboard completo

### Navegación
```
Mapa (Capa 1)
    ↓
Hospital Individual (Capa 2)
    ↓
Volver a la Red → Mapa (Capa 1)
```

---

## 🚀 PREPARACIÓN PARA CAPAS FUTURAS

### CAPA 3: Catástrofes
- Los datos de hospitales podrán ser modificados
- Las alertas se actualizarán automáticamente

### CAPA 4: Motor de Simulación
- `updateHospital()` re-renderizará cambios en tiempo real
- El riesgo se recalculará dinámicamente

Ejemplo:
```javascript
hospital.camas.disponibles -= 10;
updateHospital(); // Dashboard se actualiza
```

### CAPA 5: Pacientes
- Los datos de guardia reflejarán flujo real de pacientes

### CAPA 6: Derivaciones
- Las ambulancias cambiarán de estado dinámicamente

---

## ✅ CHECKLIST DE FUNCIONALIDADES

- [x] Navegación desde mapa a hospital individual
- [x] Navegación de regreso al mapa
- [x] Header con información del hospital
- [x] Indicador de datos simulados
- [x] Estado general del hospital
- [x] Cálculo automático de riesgo operativo
- [x] Sistema de alertas automáticas
- [x] 6 tarjetas de resumen
- [x] Módulo de camas con subsección de camas críticas
- [x] Módulo de guardia con gráfico circular SVG
- [x] Módulo de personal con distribución visual
- [x] Módulo de quirófanos con grid individual
- [x] Módulo de ambulancias con grid individual
- [x] Módulo de insumos con 4 categorías
- [x] Módulo de áreas del hospital (6 áreas)
- [x] Barras de progreso con colores dinámicos
- [x] Responsive design (desktop/tablet/móvil)
- [x] Integración con `hospitalNetwork`
- [x] Motor de riesgo reutilizable
- [x] Funciones preparadas para simulaciones
- [x] Botón de simulación (deshabilitado)

---

## 🎯 RESULTADO FINAL

Al seleccionar cualquier hospital desde el mapa, el usuario puede:

1. ✅ Ver su nombre y ubicación
2. ✅ Ver su estado operativo actual
3. ✅ Conocer el nivel de riesgo
4. ✅ Ver alertas críticas
5. ✅ Consultar camas disponibles
6. ✅ Consultar camas críticas disponibles
7. ✅ Ver ocupación de guardia
8. ✅ Ver personal disponible
9. ✅ Ver quirófanos disponibles
10. ✅ Ver ambulancias disponibles
11. ✅ Ver estado de insumos
12. ✅ Ver ocupación de todas las áreas
13. ✅ Volver al mapa sin perder contexto

---

## 📝 NOTAS TÉCNICAS

### Cálculo de Ocupación
```javascript
function calculateOccupancy(occupied, total) {
    if (total === 0) return 0;
    return Math.round((occupied / total) * 100);
}
```

### Determinación de Estado
```javascript
function getStatusFromPercentage(percentage) {
    if (percentage >= 90) return 'saturated';
    if (percentage >= 80) return 'high-demand';
    if (percentage >= 70) return 'warning';
    return 'normal';
}
```

### Sincronización con Capa 1
- Usa el mismo archivo: `js/hospitals.js`
- Lee de `hospitalNetwork.hospitals`
- Busca por `id` del hospital

---

## 🐛 TROUBLESHOOTING

### "Hospital no encontrado"
- Verificar que el `id` en la URL existe en `hospitalNetwork.hospitals`
- Verificar que `hospitals.js` se cargó correctamente

### "No se especificó un hospital"
- La URL debe incluir `?id=H001` (o el ID correspondiente)

### Los datos no se actualizan
- Llamar a `updateHospital()` después de modificar `currentHospital`

---

## 📄 LICENCIA

Parte del proyecto HOSPITAL COMMAND NETWORK.
Todos los datos son simulados y no corresponden a pacientes reales.

---

**CAPA 2 COMPLETADA ✅**

Siguiente paso: **CAPA 3 - CATÁSTROFES**
