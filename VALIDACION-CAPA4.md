# VALIDACIÓN MÓDULO DE SIMULACIÓN
**HOSPITAL COMMAND NETWORK - CAPA 4**

## ✅ LISTA DE VERIFICACIÓN

### 1. CARGA DE LA PÁGINA
- [ ] La página `simulation.html` carga sin errores
- [ ] Se muestra el header "HOSPITAL COMMAND NETWORK"
- [ ] Aparece el indicador de estado de la red
- [ ] Los controles de simulación están visibles

### 2. ESTADO INICIAL SIN EMERGENCIA
- [ ] Se muestra "SIN EMERGENCIA ACTIVA"
- [ ] Aparece enlace a "Central de Emergencias"
- [ ] El botón principal dice "INICIAR" pero está inactivo
- [ ] Las métricas muestran valores iniciales

### 3. CONFIGURACIÓN DE EMERGENCIA
- [ ] Ir a `emergencies.html` 
- [ ] Crear nueva emergencia (ej: Terremoto en Alta Gracia, Severidad Crítica)
- [ ] La emergencia se guarda correctamente
- [ ] Volver a `simulation.html`

### 4. SIMULACIÓN ACTIVA
- [ ] El header muestra datos de la emergencia
- [ ] El estado cambia a "SIMULACIÓN LISTA"
- [ ] El botón dice "INICIAR"

### 5. CONTROLES BÁSICOS
- [ ] **INICIAR**: Presionar ▶ INICIAR
  - [ ] Cambia a "● SIMULACIÓN ACTIVA"
  - [ ] El botón cambia a "⏸ PAUSAR"
  - [ ] El tiempo comienza a avanzar
- [ ] **PAUSAR**: Presionar ⏸ PAUSAR
  - [ ] Cambia a "⏸ SIMULACIÓN PAUSADA"
  - [ ] El tiempo se detiene
  - [ ] El botón cambia a "▶ CONTINUAR"
- [ ] **CONTINUAR**: Presionar ▶ CONTINUAR
  - [ ] Vuelve a "● SIMULACIÓN ACTIVA"
  - [ ] El tiempo continúa

### 6. CONTROLES AVANZADOS
- [ ] **+5 MIN**: Avanza 5 minutos manualmente
- [ ] **+10 MIN**: Avanza 10 minutos manualmente
- [ ] **VELOCIDADES**:
  - [ ] ×1: Velocidad normal
  - [ ] ×2: Doble velocidad
  - [ ] ×5: Cinco veces más rápido
  - [ ] ×10: Diez veces más rápido
- [ ] **REINICIAR**: Restaura estado inicial
- [ ] **FINALIZAR**: Termina la simulación

### 7. MÉTRICAS EN TIEMPO REAL
- [ ] **Hospitales Monitoreados**: Se mantiene en 8
- [ ] **Hospitales Afectados**: Se actualiza según emergencia
- [ ] **Pacientes Generados**: Aumenta progresivamente
- [ ] **Pacientes Críticos**: Se incrementa por separado
- [ ] **Camas Disponibles**: Disminuye conforme llegan pacientes
- [ ] **Camas Críticas**: Baja cuando ingresan críticos
- [ ] **Hospitales Saturados**: Cuenta hospitales al límite
- [ ] **Ocupación de Red**: Porcentaje general
- [ ] **Recursos Disponibles**: Promedio de insumos
- [ ] **Tiempo de Simulación**: Formato T+ HH:MM

### 8. MAPA DINÁMICO
- [ ] El mapa carga correctamente con Leaflet
- [ ] Se muestran todos los hospitales como marcadores
- [ ] Los colores de hospitales cambian según estado:
  - [ ] 🟢 NORMAL
  - [ ] 🟡 ADVERTENCIA  
  - [ ] 🟠 ALTA DEMANDA
  - [ ] 🔴 SATURADO
- [ ] Al hacer clic en un hospital muestra popup con info
- [ ] Se muestra el círculo de la emergencia (si corresponde)
- [ ] El marcador del epicentro aparece

### 9. EVOLUCIÓN DE HOSPITALES
- [ ] Los hospitales cambian de estado durante la simulación
- [ ] Lista lateral muestra estado actualizado
- [ ] Los más críticos aparecen primero
- [ ] Información de ocupación es precisa

### 10. ALERTAS AUTOMÁTICAS
- [ ] Aparecen alertas cuando hospitals se saturan
- [ ] Se muestran alertas de camas críticas bajas
- [ ] Las alertas tienen timestamp correcto
- [ ] Diferentes niveles (🔴 crítico, ⚠️ advertencia)

### 11. TIMELINE DE EVENTOS
- [ ] Se registra inicio de simulación
- [ ] Aparecen eventos de llegada de pacientes
- [ ] Se registran cambios de estado hospitalario
- [ ] Los eventos tienen hora correcta

### 12. GRÁFICOS DINÁMICOS
- [ ] **Pacientes por Gravedad**: Muestra líneas diferenciadas
- [ ] **Ocupación Hospitalaria**: Evoluciona en tiempo real
- [ ] **Camas Disponibles**: Muestra generales y críticas
- [ ] **Estado de Red**: Indicador general de capacidad

### 13. PANEL DE SITUACIÓN
- [ ] Muestra resumen dinámico en español natural
- [ ] Se actualiza automáticamente cada cambio
- [ ] Describe la situación crítica cuando corresponde
- [ ] Menciona hospitales saturados y capacidad

### 14. INDICADOR DE ESTADO DE RED
- [ ] 🟢 "RED ESTABLE" cuando todo normal
- [ ] 🟡 "RED BAJO PRESIÓN" con 1 saturado
- [ ] 🟠 "RED EN ALTA DEMANDA" con 2 saturados
- [ ] 🔴 "RED EN COLAPSO" con 3+ saturados

### 15. RESPONSIVIDAD
- [ ] Funciona correctamente en desktop (1920px)
- [ ] Se adapta en tablets (768px)
- [ ] Funciona en móviles (360px)
- [ ] Los gráficos se redimensionan

### 16. PERSISTENCIA DE DATOS
- [ ] El estado se mantiene al refrescar página
- [ ] Las emergencias se guardan en localStorage
- [ ] El historial se preserva entre sesiones

### 17. NAVEGACIÓN
- [ ] El enlace "Central de Emergencias" funciona
- [ ] Se puede volver al mapa principal
- [ ] Los enlaces del menú funcionan correctamente

### 18. RENDIMIENTO
- [ ] No hay errores en consola del navegador
- [ ] Los gráficos se actualizan sin lag
- [ ] El mapa no se recrea innecesariamente
- [ ] La simulación es fluida en todas las velocidades

### 19. COMPATIBILIDAD
- [ ] Funciona en Chrome/Edge
- [ ] Funciona en Firefox
- [ ] Funciona en Safari
- [ ] No depende de framework externo (solo Leaflet)

### 20. INTEGRACIÓN CON CAPAS ANTERIORES
- [ ] Usa datos de `hospitals.js` (Capa 1)
- [ ] Implementa cálculos de `risk-engine.js` (Capa 2)
- [ ] Conecta con `emergency-engine.js` (Capa 3)
- [ ] No rompe funcionalidad existente

---

## 🚨 ESCENARIO DE PRUEBA COMPLETO

### Configuración de Emergencia de Prueba:
1. **Tipo**: Terremoto
2. **Ubicación**: Alta Gracia
3. **Radio**: 10 km
4. **Severidad**: Crítica
5. **Pacientes Estimados**: ~200 (50 críticos, 70 moderados, 80 leves)

### Flujo de Validación:
1. Crear emergencia → Ir a simulación
2. Iniciar simulación → Observar 5 minutos
3. Pausar → Avanzar manualmente +10 min
4. Cambiar velocidad x5 → Continuar 
5. Observar hasta saturación de hospitales
6. Verificar todas las métricas y alertas
7. Reiniciar y repetir

---

## ❌ ERRORES COMUNES A VERIFICAR

- **Console Errors**: No debe haber errores JavaScript
- **Mapa en Blanco**: Verificar carga de Leaflet
- **Métricas en 0**: Verificar conexión con datos
- **Botones No Responden**: Verificar event listeners
- **Gráficos Vacíos**: Verificar canvas y datos
- **Estados No Cambian**: Verificar motor de simulación

---

## ✅ CONFIRMACIÓN FINAL

- [ ] **El módulo está listo para Capa 5 (Derivaciones)**
- [ ] **No hay errores críticos**
- [ ] **La experiencia es profesional**
- [ ] **Los datos son consistentes**
- [ ] **La simulación es realista**

**Firma del Validador**: ________________  
**Fecha**: ________________  
**Estado**: ❌ Pendiente / ✅ Aprobado