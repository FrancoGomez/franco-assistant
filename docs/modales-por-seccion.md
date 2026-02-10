# Modales por Sección — Franco Assistant

Referencia de qué componentes activan qué modales en cada sección de la aplicación.

---

## Componentes Base de Modales

| Componente | Descripción |
|---|---|
| `Modal` | Wrapper reutilizable (overlay, card, header, body, footer) |
| `ConfirmModal` | Modal destructivo con icono warning, texto y botones Cancelar/Eliminar |

---

## Dashboard

> No tiene modales propios. Los links "Ver todo →" redirigen al Historial o a otras secciones.

---

## Pilares (Financiación · Capacidad · Físico · Relaciones)

Las 4 páginas de pilar comparten la misma estructura de modales. Solo cambia el color contextual y los campos de métricas.

### Modal: Crear/Editar Evento

| Propiedad | Detalle |
|---|---|
| **Activado por** | Botón `+ Nuevo` en sección Eventos · Icono editar (pencil) en hover de un evento |
| **Componentes que lo disparan** | `EventItem` (edición), botón header de card Eventos (creación) |
| **Campos** | Título (input), Tipo (select: Diario/Semanal/Mensual), Recurrente (toggle), XP (number) |
| **Acciones** | Guardar (color pilar) · Cancelar (ghost) · Eliminar (rojo, solo en edición) |

### Modal: Crear/Editar Objetivo

| Propiedad | Detalle |
|---|---|
| **Activado por** | Botón `+ Nuevo` en sección Objetivos · Icono editar (pencil) en hover de un objetivo |
| **Componentes que lo disparan** | `ObjectiveItem` (edición), botón header de card Objetivos (creación) |
| **Campos** | Título (input), XP (number) |
| **Acciones** | Guardar (color pilar) · Cancelar (ghost) · Eliminar (rojo, solo en edición) |

### Modal: Cargar Métricas

| Propiedad | Detalle |
|---|---|
| **Activado por** | Botón `Actualizar métricas` en sección Métricas del Pilar |
| **Componentes que lo disparan** | `MetricCard` (botón en la fila de métricas) |
| **Campos por pilar** | |
| Financiación | Ingresos (number), Gastos (number), Fecha (date) |
| Capacidad | Horas concentrado (number), Horas no concentrado (number), Fecha (date) |
| Físico | Peso en kg (number), Hora de sueño (time), Fecha (date) |
| Relaciones | Eventos sociales (number), Interacciones (number), Fecha (date) |
| **Acciones** | Guardar · Cancelar |

### Modal: Confirmar Eliminación

| Propiedad | Detalle |
|---|---|
| **Activado por** | Icono borrar (trash) en hover de un evento u objetivo |
| **Componentes que lo disparan** | `EventItem` (borrar), `ObjectiveItem` (borrar) |
| **Contenido** | Icono warning rojo · "¿Eliminar [nombre]?" · "Esta acción no se puede deshacer" |
| **Acciones** | Cancelar (ghost) · Eliminar (rojo) |

---

## Escudo de Dopamina

### Modal: Crear/Editar Vicio

| Propiedad | Detalle |
|---|---|
| **Activado por** | Botón `+ Nuevo Vicio` en header · Icono editar (pencil) en `ShieldCard` |
| **Componentes que lo disparan** | Header de página (creación), `ShieldCard` (edición) |
| **Campos** | Título (input), Pilar asociado (select con los 4 pilares) |
| **Acciones** | Guardar (dorado) · Cancelar (ghost) · Eliminar (rojo, solo en edición) |

### Modal: Confirmar Recaída

| Propiedad | Detalle |
|---|---|
| **Activado por** | Botón `Reportar Recaída` dentro de cada `ShieldCard` |
| **Componentes que lo disparan** | `ShieldCard` (botón ghost rojo) |
| **Contenido** | Icono calavera roja · "¿Reportar recaída?" · "Vas a perder **X XP** acumulada en **[vicio]**" · "El contador de días se reseteará a 0" |
| **Acciones** | Cancelar (ghost) · Confirmar Recaída (rojo) |

---

## Historial Completo

> No tiene modales propios. Es una vista de solo lectura con filtros. Los items muestran botones editar/borrar en hover que redirigen o abren los modales del pilar correspondiente.

---

## Calendario

### Modal: Crear/Editar Evento de Calendario

| Propiedad | Detalle |
|---|---|
| **Activado por** | Botón `+ Nuevo Evento` en header · Click en bloque de evento (vista semanal) · Icono editar en `CalendarEventItem` (sidebar) |
| **Componentes que lo disparan** | Header de página (creación), `CalendarEventItem` (edición), bloques de vista semanal (edición) |
| **Campos** | Título (input), Fecha inicio (date) + Hora inicio (time), Fecha fin (date) + Hora fin (time), Descripción (textarea, opcional), Imagen URL (input, opcional con preview), Toggle "Asociar a pilares" → 4 filas: checkbox + pilar + input XP |
| **Acciones** | Guardar · Cancelar (ghost) · Eliminar (rojo, solo en edición) |

---

## Kanban

### Modal: Crear/Editar Board

| Propiedad | Detalle |
|---|---|
| **Activado por** | Botón `+ Nuevo Board` en header · Icono editar en hover de tab de board |
| **Componentes que lo disparan** | Header de página (creación), tabs de boards (edición) |
| **Campos** | Nombre del tablero (input) |
| **Acciones** | Guardar · Cancelar (ghost) · Eliminar (rojo, solo en edición — warning: "Se borrarán todas las columnas e items") |

### Modal: Crear/Editar Item Kanban

| Propiedad | Detalle |
|---|---|
| **Activado por** | Click en un `KanbanItem` · Botón `+ Agregar item` en `KanbanColumn` |
| **Componentes que lo disparan** | `KanbanItem` (edición), `KanbanColumn` (creación) |
| **Campos** | Título (input), Descripción (textarea, opcional), Imagen URL (input, opcional con preview), Toggle "Asociar a pilares" → 4 filas: checkbox + pilar + input XP |
| **Acciones** | Guardar · Cancelar (ghost) · Eliminar (rojo, solo en edición) |

---

## Resumen Rápido

| Sección | Modales | Componentes que los activan |
|---|---|---|
| **Dashboard** | — | — |
| **Pilares** (×4) | Crear/Editar Evento · Crear/Editar Objetivo · Cargar Métricas · Confirmar Eliminación | `EventItem`, `ObjectiveItem`, `MetricCard`, botones header |
| **Escudo de Dopamina** | Crear/Editar Vicio · Confirmar Recaída | `ShieldCard`, botón header |
| **Historial** | — | — |
| **Calendario** | Crear/Editar Evento de Calendario | `CalendarEventItem`, bloques vista semanal, botón header |
| **Kanban** | Crear/Editar Board · Crear/Editar Item | `KanbanItem`, `KanbanColumn`, tabs de board, botón header |
