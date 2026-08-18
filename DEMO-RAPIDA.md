# 🚀 DEMO RÁPIDA - CAPA 2

## Cómo probar HOSPITAL COMMAND NETWORK en 5 minutos

---

## 📍 PASO 1: Abrir el Mapa

1. Abre el archivo: `map/index.html`
2. Deberías ver el mapa de Córdoba con 8 hospitales marcados

**Qué buscar:**
- ✅ Mapa de Córdoba centrado
- ✅ 8 marcadores de hospitales con diferentes colores:
  - 🟢 Verde = Normal
  - 🟡 Amarillo = Advertencia
  - 🟠 Naranja = Alta Demanda
  - 🔴 Rojo = Saturado

---

## 🏥 PASO 2: Seleccionar un Hospital

1. Haz clic en cualquier marcador de hospital
2. Se abrirá un popup con información básica
3. Haz clic en el botón "Ver Hospital"

**Recomendación:** Prueba con estos hospitales para ver diferentes estados:

### Hospital Central Córdoba (H001)
- **Estado:** 🟡 ADVERTENCIA
- **Ocupación:** 70%
- **Características:** Múltiples alertas, riesgo moderado

### Hospital Municipal (H002)
- **Estado:** 🟢 NORMAL
- **Ocupación:** 50%
- **Características:** Sin alertas, riesgo bajo

### Hospital Privado (H003)
- **Estado:** 🔴 SATURADO
- **Ocupación:** 90%
- **Características:** Múltiples alertas críticas, riesgo alto

---

## 📊 PASO 3: Explorar el Dashboard

Al abrir el dashboard del hospital, verás:

### Header (Arriba)
- Nombre y ubicación del hospital
- Estado operativo con color
- Badge "DATOS SIMULADOS"
- Botón "Volver a la Red"

### Sidebar Izquierda
1. **Estado del Hospital:** Métricas generales
2. **Riesgo Operativo:** Nivel de riesgo calculado automáticamente
3. **Alertas:** Problemas críticos detectados
4. **Botón Simulación:** Deshabilitado (próxima capa)

### Contenido Principal
1. **6 Tarjetas de Resumen:**
   - Camas disponibles
   - Camas críticas
   - Guardia
   - Personal
   - Quirófanos
   - Ambulancias

2. **Módulos Detallados:**
   - 🛏️ Camas (con subsección de camas críticas)
   - 🚨 Guardia (con gráfico circular animado)
   - 👨‍⚕️ Personal (con barra de distribución)
   - 🔬 Quirófanos (grid visual)
   - 🚑 Ambulancias (grid visual)
   - 📦 Insumos (4 categorías)
   - 🏥 Áreas del hospital (6 áreas)

---

## 🎯 PASO 4: Verificar Funcionalidades Clave

### 1. Gráfico Circular de Guardia
- Debe estar animado
- Color cambia según ocupación
- Porcentaje en el centro

### 2. Barras de Progreso
- Todas las barras deben tener color según nivel
- Verde = bien, Amarillo = cuidado, Rojo = crítico

### 3. Grid de Quirófanos
- Cada quirófano se ve individualmente
- 🟢 = Disponible, 🔴 = En uso

### 4. Grid de Ambulancias
- Cada ambulancia se ve individualmente
- 🟢 = Disponible, 🔴 = En servicio

### 5. Alertas Automáticas
- Si el hospital tiene problemas, aparecen aquí
- ⚠️ = Advertencia, 🔴 = Crítico

### 6. Nivel de Riesgo
- Calculado automáticamente
- 🟢 Bajo / 🟡 Moderado / 🟠 Alto / 🔴 Crítico

---

## 🔄 PASO 5: Probar Navegación

1. Haz clic en "← Volver a la Red"
2. Deberías regresar al mapa
3. El mapa sigue mostrando todos los hospitales
4. Selecciona otro hospital diferente
5. El dashboard se actualiza con los datos del nuevo hospital

---

## 🎨 PASO 6: Probar Responsive

### Desktop
- Sidebar a la izquierda
- Contenido a la derecha
- Todo visible

### Tablet (reducir ventana)
- Sidebar se adapta
- Módulos en 1-2 columnas

### Móvil (ventana muy pequeña)
- Todo apilado verticalmente
- Sidebar arriba del contenido
- Scroll vertical

**Cómo probar:**
1. Abre DevTools (F12)
2. Activa el modo responsive
3. Prueba diferentes tamaños

---

## 📱 HOSPITALES DE PRUEBA RECOMENDADOS

### Para ver RIESGO BAJO:
- **H002 - Hospital Municipal:** 50% ocupación, sin problemas
- **H004 - Hospital Clínicas:** 30% ocupación, recursos abundantes
- **H007 - Hospital Traumatológico:** 30% ocupación, todo normal

### Para ver RIESGO MODERADO:
- **H001 - Hospital Central:** 70% ocupación, algunas alertas

### Para ver RIESGO ALTO:
- **H005 - Hospital Infantil:** 80% ocupación, múltiples alertas
- **H006 - Hospital Emergencias:** 80% ocupación, recursos ajustados
- **H008 - Hospital Regional:** 80% ocupación, personal limitado

### Para ver RIESGO CRÍTICO:
- **H003 - Hospital Privado:** 90% ocupación, múltiples alertas críticas

---

## ✅ CHECKLIST DE 1 MINUTO

Verifica rápidamente:

1. [ ] El mapa muestra 8 hospitales
2. [ ] Puedo hacer clic en un hospital
3. [ ] Se abre el dashboard
4. [ ] Veo el nombre correcto del hospital
5. [ ] Veo las 6 tarjetas de resumen
6. [ ] El gráfico circular de guardia está animado
7. [ ] Las barras de progreso tienen colores
8. [ ] Veo el grid de quirófanos
9. [ ] Veo el grid de ambulancias
10. [ ] El nivel de riesgo se muestra
11. [ ] Puedo volver al mapa
12. [ ] Puedo seleccionar otro hospital

**Si todos están marcados: ✅ CAPA 2 FUNCIONA CORRECTAMENTE**

---

## 🐛 SOLUCIÓN RÁPIDA DE PROBLEMAS

### No se ven los hospitales en el mapa
**Solución:** Abre la consola (F12) y verifica si hay errores. Los hospitales deberían aparecer automáticamente.

### Al hacer clic en "Ver Hospital" no pasa nada
**Solución:** Verifica que el archivo `hospital.html` esté en la raíz del proyecto (junto a `index.html`)

### El dashboard no muestra datos
**Solución:** 
1. Verifica que la URL tenga `?id=H001` (o similar)
2. Abre la consola y busca errores
3. Verifica que `hospitals.js` esté cargado

### Los gráficos no se ven
**Solución:** Verifica que `hospital.css` esté cargado correctamente

---

## 🎯 QUÉ DEBERÍAS VER

### En el Hospital Privado (H003 - SATURADO):
```
Estado: 🔴 SATURADO
Riesgo: 🟠 ALTO o 🔴 CRÍTICO
Ocupación: 90%
Alertas: Múltiples alertas rojas
Camas disponibles: 20 de 200 (10%)
Guardia: 95% ocupación
```

### En el Hospital Municipal (H002 - NORMAL):
```
Estado: 🟢 NORMAL
Riesgo: 🟢 BAJO
Ocupación: 50%
Alertas: Sin alertas o pocas
Camas disponibles: 140 de 280 (50%)
Guardia: 45% ocupación
```

---

## 📸 CAPTURA DE PANTALLA ESPERADA

### Mapa:
- Mapa de Córdoba centrado
- 8 marcadores de hospitales
- Colores diferentes según estado
- Panel lateral con estadísticas

### Dashboard del Hospital:
- Header con nombre y estado
- Sidebar con riesgo y alertas
- 6 tarjetas de resumen superiores
- Gráfico circular animado en guardia
- Grids de quirófanos y ambulancias
- Barras de progreso coloridas
- 6 áreas del hospital

---

## 🚀 PRÓXIMOS PASOS

Una vez que hayas probado la Capa 2:

1. ✅ **CAPA 1:** Mapa de la red hospitalaria
2. ✅ **CAPA 2:** Gestión individual del hospital ← **ESTÁS AQUÍ**
3. 🔜 **CAPA 3:** Catástrofes
4. 🔜 **CAPA 4:** Motor de simulación
5. 🔜 **CAPA 5:** Pacientes y flujo
6. 🔜 **CAPA 6:** Derivaciones
7. 🔜 **CAPA 7:** Rutas y ambulancias
8. 🔜 **CAPA 8:** Análisis y recomendaciones
9. 🔜 **CAPA 9:** Inteligencia Artificial
10. 🔜 **CAPA 10:** Informes y evaluación

---

## 💡 TIPS

1. **Prueba múltiples hospitales:** Cada uno tiene datos diferentes
2. **Observa los colores:** Verde = bien, Amarillo = cuidado, Rojo = problema
3. **Lee las alertas:** Te dicen exactamente qué está mal
4. **Revisa el riesgo:** Es un cálculo automático ponderado
5. **Explora todas las áreas:** Hay información en cada módulo

---

## 📞 CONTACTO

Si encuentras problemas:
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que todos los archivos estén en su lugar
4. Consulta `TESTING-CAPA2.md` para pruebas detalladas

---

**¡DISFRUTA EXPLORANDO HOSPITAL COMMAND NETWORK! 🏥**
