# TESTING - CAPA 2

## ✅ CHECKLIST DE PRUEBAS

### 1. Navegación desde el Mapa

#### Pasos:
1. Abrir `map/index.html`
2. Verificar que se muestren los 8 hospitales en el mapa
3. Hacer clic en cualquier marcador de hospital
4. Verificar que aparezca el popup con información
5. Hacer clic en "Ver Hospital"
6. Verificar que se abra `hospital.html?id=H001` (o el ID correspondiente)

**Resultado esperado:**
- ✅ El dashboard del hospital se carga correctamente
- ✅ Se muestra el nombre correcto del hospital
- ✅ Se muestra la ubicación correcta

---

### 2. Header del Hospital

#### Verificar:
- [ ] Nombre del hospital se muestra correctamente
- [ ] Ubicación: "Córdoba, Córdoba" (o la ciudad correspondiente)
- [ ] Estado operativo con color correcto:
  - 🟢 NORMAL (verde)
  - 🟡 ADVERTENCIA (amarillo)
  - 🟠 ALTA DEMANDA (naranja)
  - 🔴 SATURADO (rojo)
- [ ] Badge "⚠️ DATOS SIMULADOS" visible
- [ ] Botón "← Volver a la Red" funciona y regresa al mapa

---

### 3. Sidebar - Estado General

#### Verificar:
- [ ] Estado actual muestra el estado correcto con color
- [ ] Ocupación general muestra un porcentaje válido (0-100%)
- [ ] Guardia muestra un porcentaje válido
- [ ] Camas críticas muestra un porcentaje válido
- [ ] Personal disponible muestra un porcentaje válido

---

### 4. Sidebar - Riesgo Operativo

#### Verificar:
- [ ] Nivel de riesgo se muestra correctamente:
  - 🟢 BAJO (verde)
  - 🟡 MODERADO (amarillo)
  - 🟠 ALTO (naranja)
  - 🔴 CRÍTICO (rojo)
- [ ] Score muestra un valor entre 0-100
- [ ] Color del borde coincide con el nivel de riesgo

---

### 5. Sidebar - Alertas

#### Verificar:
- [ ] Si no hay alertas: "✓ Sin alertas operativas"
- [ ] Si hay alertas: cada una tiene icono (⚠️ o 🔴) y mensaje
- [ ] Alertas amarillas para advertencias
- [ ] Alertas rojas para peligros críticos

**Ejemplos de alertas a verificar:**
- Disponibilidad de camas baja
- Camas críticas en nivel bajo
- Guardia con alta ocupación
- Personal disponible bajo
- Insumos críticos

---

### 6. Tarjetas de Resumen (6 cards superiores)

#### Verificar cada tarjeta:

##### Camas Disponibles
- [ ] Muestra número de camas disponibles
- [ ] Muestra porcentaje de ocupación
- [ ] Indicador de estado (punto de color) correcto

##### Camas Críticas
- [ ] Muestra número de camas críticas disponibles
- [ ] Muestra porcentaje de ocupación
- [ ] Indicador de estado correcto

##### Guardia
- [ ] Muestra porcentaje de ocupación
- [ ] Muestra número de pacientes
- [ ] Indicador de estado correcto

##### Personal
- [ ] Muestra número de personal disponible
- [ ] Muestra porcentaje disponible
- [ ] Indicador de estado correcto

##### Quirófanos
- [ ] Muestra número disponible
- [ ] Muestra "de X" (total)
- [ ] Indicador de estado correcto

##### Ambulancias
- [ ] Muestra número disponible
- [ ] Muestra "de X" (total)
- [ ] Indicador de estado correcto

---

### 7. Módulo de Camas

#### Verificar:
- [ ] Totales muestra número correcto
- [ ] Ocupadas muestra número correcto
- [ ] Disponibles muestra número correcto
- [ ] Suma: Ocupadas + Disponibles = Totales
- [ ] Barra de progreso muestra ocupación correcta
- [ ] Color de barra según ocupación:
  - Verde: 0-69%
  - Amarillo: 70-79%
  - Naranja: 80-89%
  - Rojo: 90-100%

#### Subsección: Camas Críticas
- [ ] Totales muestra número correcto
- [ ] Ocupadas muestra número correcto
- [ ] Disponibles muestra número correcto
- [ ] Barra de progreso correcta
- [ ] Color según ocupación

---

### 8. Módulo de Guardia

#### Verificar:
- [ ] Gráfico circular SVG se muestra correctamente
- [ ] Porcentaje en el centro del gráfico
- [ ] Color del gráfico según ocupación:
  - Verde: 0-69%
  - Amarillo: 70-79%
  - Naranja: 80-89%
  - Rojo: 90-100%
- [ ] Pacientes en espera: número válido
- [ ] Pacientes en atención: número válido
- [ ] Pacientes críticos: número válido
- [ ] Tiempo promedio espera: en minutos

---

### 9. Módulo de Personal

#### Verificar:
- [ ] Barra de distribución muestra 3 segmentos:
  - Verde: Disponible
  - Amarillo: En servicio
  - Rojo: No disponible
- [ ] Médicos: número válido
- [ ] Enfermeros: número válido
- [ ] Personal total: número válido
- [ ] Disponible: número válido
- [ ] Porcentaje disponible: 0-100%

---

### 10. Módulo de Quirófanos

#### Verificar:
- [ ] Grid muestra todos los quirófanos
- [ ] Cada quirófano tiene:
  - Icono (🟢 disponible o 🔴 en uso)
  - Label: Q-01, Q-02, etc.
  - Estado: "Disponible" o "En uso"
- [ ] Total correcto
- [ ] En uso correcto
- [ ] Disponibles correcto
- [ ] Estado general:
  - 🟢 Disponibles
  - 🟡 Alta utilización
  - 🔴 Sin disponibilidad

---

### 11. Módulo de Ambulancias

#### Verificar:
- [ ] Grid muestra todas las ambulancias (6 por defecto)
- [ ] Cada ambulancia tiene:
  - Icono (🟢 disponible o 🔴 en servicio)
  - Label: AMB-01, AMB-02, etc.
  - Estado: "Disponible" o "En servicio"
- [ ] Total correcto
- [ ] Disponibles correcto
- [ ] En servicio correcto

---

### 12. Módulo de Insumos

#### Verificar cada insumo:

##### Medicamentos
- [ ] Porcentaje entre 0-100%
- [ ] Barra de progreso correcta
- [ ] Estado:
  - 🟢 Suficiente (≥50%)
  - 🟡 Bajo (30-49%)
  - 🔴 Crítico (<30%)

##### Material quirúrgico
- [ ] Porcentaje correcto
- [ ] Barra correcta
- [ ] Estado correcto

##### Oxígeno
- [ ] Porcentaje correcto
- [ ] Barra correcta
- [ ] Estado correcto

##### Material descartable
- [ ] Porcentaje correcto
- [ ] Barra correcta
- [ ] Estado correcto

---

### 13. Módulo de Áreas del Hospital

#### Verificar las 6 áreas:

##### Guardia
- [ ] Estado con emoji y texto
- [ ] Porcentaje de ocupación

##### Internación
- [ ] Estado correcto
- [ ] Porcentaje correcto

##### UCI
- [ ] Estado correcto
- [ ] Porcentaje correcto

##### Quirófanos
- [ ] Estado correcto
- [ ] Porcentaje correcto

##### Consultorios
- [ ] Estado correcto
- [ ] Porcentaje correcto

##### Emergencias
- [ ] Estado correcto
- [ ] Porcentaje correcto

---

### 14. Responsive Design

#### Desktop (>1200px)
- [ ] Sidebar a la izquierda
- [ ] Contenido principal a la derecha
- [ ] Grid de módulos en 2 columnas

#### Tablet (768px - 1200px)
- [ ] Sidebar se adapta
- [ ] Módulos en 1-2 columnas

#### Móvil (<768px)
- [ ] Todo apilado verticalmente
- [ ] Header adaptado
- [ ] Cards legibles
- [ ] Botones accesibles

---

### 15. Consistencia de Datos

#### Probar con diferentes hospitales:

##### Hospital H001 (Central Córdoba)
- [ ] Estado: ADVERTENCIA
- [ ] Ocupación: 70%
- [ ] Datos cargados correctamente

##### Hospital H002 (Municipal)
- [ ] Estado: NORMAL
- [ ] Ocupación: 50%
- [ ] Datos cargados correctamente

##### Hospital H003 (Privado)
- [ ] Estado: SATURADO
- [ ] Ocupación: 90%
- [ ] Datos cargados correctamente

##### Hospital H004 (Clínicas)
- [ ] Estado: NORMAL
- [ ] Ocupación: 30%
- [ ] Datos cargados correctamente

##### Hospital H005 (Infantil)
- [ ] Estado: ALTA DEMANDA
- [ ] Ocupación: 80%
- [ ] Datos cargados correctamente

---

### 16. Cálculo Automático

#### Verificar que se calculen correctamente:

##### Ocupación de camas
```
ocupación = (ocupadas / totales) * 100
```
- [ ] Fórmula correcta
- [ ] Resultado redondeado

##### Estado por porcentaje
- [ ] 0-69%: NORMAL (verde)
- [ ] 70-79%: ADVERTENCIA (amarillo)
- [ ] 80-89%: ALTA DEMANDA (naranja)
- [ ] 90-100%: SATURADO (rojo)

##### Riesgo operativo
- [ ] Score entre 0-100
- [ ] Factores ponderados correctamente
- [ ] Nivel asignado correctamente

##### Alertas
- [ ] Generadas automáticamente
- [ ] No duplicadas
- [ ] Ordenadas por prioridad

---

### 17. Botón de Simulación

#### Verificar:
- [ ] Visible en el sidebar
- [ ] Deshabilitado (cursor: not-allowed)
- [ ] Texto: "SIMULACIÓN"
- [ ] Subtítulo: "Disponible próximamente"
- [ ] Opacidad reducida
- [ ] No hace nada al hacer clic

---

### 18. Consola del Navegador

#### Verificar en DevTools:
- [ ] No hay errores de JavaScript
- [ ] No hay errores de CSS
- [ ] Console.log muestra: "Hospital cargado: [objeto]"
- [ ] Todos los scripts se cargaron correctamente:
  - hospitals.js
  - risk-engine.js
  - hospital-detail.js

---

### 19. Performance

#### Verificar:
- [ ] El dashboard carga en menos de 2 segundos
- [ ] Las animaciones son fluidas
- [ ] El gráfico circular se anima correctamente
- [ ] Las barras de progreso se animan
- [ ] No hay lag al hacer scroll

---

### 20. Navegación de Regreso

#### Verificar:
- [ ] Botón "← Volver a la Red" funcional
- [ ] Regresa a `map/index.html`
- [ ] El mapa mantiene su estado (hospitales visibles)
- [ ] No se pierde información

---

## 🐛 PROBLEMAS COMUNES

### Error: "Hospital no encontrado"
**Causa:** ID no existe en hospitalNetwork
**Solución:** Verificar que el ID en la URL existe en hospitals.js

### Error: "No se especificó un hospital"
**Causa:** Falta parámetro ?id= en la URL
**Solución:** Siempre acceder desde el mapa o agregar ?id=H001

### Los gráficos no se ven
**Causa:** CSS no cargado o JavaScript bloqueado
**Solución:** Verificar rutas de archivos y consola del navegador

### Los datos son todos cero
**Causa:** hospitals.js no se cargó
**Solución:** Verificar ruta del script y que exista el archivo

### El riesgo siempre es "BAJO"
**Causa:** Error en el cálculo de riesgo
**Solución:** Verificar risk-engine.js y que esté correctamente cargado

---

## ✅ RESULTADO ESPERADO

Al completar todas las pruebas:

1. ✅ Navegación fluida entre mapa y hospitales
2. ✅ Todos los datos se muestran correctamente
3. ✅ Cálculos automáticos funcionan
4. ✅ Alertas se generan correctamente
5. ✅ Diseño responsive en todos los dispositivos
6. ✅ Sin errores en consola
7. ✅ Performance óptima
8. ✅ Integración perfecta con Capa 1
9. ✅ Preparado para Capa 3 (Catástrofes)
10. ✅ Preparado para Capa 4 (Simulaciones)

---

## 📝 REPORTE DE BUGS

Si encuentras algún problema, documenta:

1. **Descripción:** ¿Qué pasó?
2. **Pasos para reproducir:** ¿Cómo llegaste ahí?
3. **Resultado esperado:** ¿Qué debería pasar?
4. **Resultado actual:** ¿Qué pasó en realidad?
5. **Navegador:** Chrome, Firefox, Edge, Safari
6. **Dispositivo:** Desktop, tablet, móvil
7. **Consola:** Errores en DevTools
8. **Screenshot:** Captura de pantalla

---

**FIN DEL DOCUMENTO DE TESTING**
