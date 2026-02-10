# Franco Assistant

## Resumen

Asistente personal gamificado para gestionar el día a día organizado en 4 pilares de vida: Financiación, Capacidad, Físico y Relaciones. Cada pilar tiene un sistema de niveles y XP que motiva el progreso a través de eventos recurrentes, objetivos y un escudo de dopamina contra vicios. Además incluye herramientas de productividad (calendario y tablero kanban) integradas con el sistema de XP. App solo para un usuario (Franco), dark mode only, deployada en Vercel.

## Usuarios

Un solo usuario (Franco). No hay registro público ni multi-tenancy. Auth simplificado: login con credenciales o magic link, sin registro abierto. El usuario se crea via seed.

## Features core (MVP)

1. **Sistema de pilares con XP y niveles** — 4 pilares (Financiación, Capacidad, Físico, Relaciones), cada uno con nivel, barra de progreso XP, rendimiento últimos 7 días (gráfico de barras), métricas específicas del pilar, y badge de nivel con borde del color del pilar.
2. **Eventos y objetivos por pilar** — Eventos con descripción, pilar, fecha, hora, recurrencia configurable y XP. Objetivos con descripción, pilar, fecha límite opcional, XP al completar, y toggle "hito importante". CRUD completo con modales de crear/editar/ver detalle. Marcar como completado suma XP y va a historial. Desmarcar revierte todo. Filtros por tipo (Diarios/Semanales/Mensuales).
3. **Escudo de dopamina** — Vicios asociados a un pilar con descripción, XP por día limpio configurable, y toggle de notificaciones diarias. Acumulan XP diaria (configurable por vicio). Recaída resetea contador, pierde TODA la XP acumulada, y registra reflexión + intensidad. Modal de ver detalle con racha actual, racha máxima, XP por día y XP ganada.
4. **Dashboard panorámico** — Resumen de pilares (nivel + progreso), rendimiento XP 7 días (barras stacked por pilar), origen de XP histórico (eventos/objetivos/dopamina), escudo de dopamina resumen, historial reciente unificado, próximos eventos, tareas en progreso, nivel general (suma de niveles, estilo dorado).
5. **Calendario** — Vista mes/semana. Eventos con título, descripción, pilar, fecha/hora, recurrencia, XP. Chips de color en las celdas del calendario. Sidebar derecho con eventos del día. Modal de ver evento con detalle, notas y XP. Pueden marcar como completados desde el calendario.
6. **Tablero Kanban** — Múltiples tableros con nombre, descripción y color. Columnas con items. Tareas con título, descripción, pilar, estado (Por hacer/En progreso/En revisión/Completado), fecha límite, prioridad (Alta/Media/Baja), y XP al completar. Modal de ver tarea con detalle. Drag & drop entre columnas.
7. **Historial** — Log cronológico unificado de toda la actividad. Buscador. Modal de filtros: por pilar, tipo de entrada (Todos/Eventos/Objetivos/Dopamina), rango de fechas (desde/hasta), ordenar por (más reciente/más antiguo). Agrupado por fecha (Hoy/Ayer/fecha). Context menu en cada item (Editar/Duplicar/Eliminar).

## Modelo de datos

### Entidades principales

- **User** — Único usuario. Campos de auth.
- **Pilar** — Enum: `FINANCIACION`, `CAPACIDAD`, `FISICO`, `RELACIONES`.
- **PilarProgress** — Por cada pilar: nivel actual, XP total acumulada.
- **Event** — Título, descripción (opcional), pilar, tipo (DAILY/WEEKLY/MONTHLY), recurrente (con opciones: No repetir/Diario/Semanal/Mensual), fecha, hora, XP, completado.
- **EventCompletion** — Para eventos recurrentes: fecha de completado, referencia al evento.
- **Objective** — Título, descripción (opcional), pilar, fecha límite (opcional), XP al completar, hito importante (bool), completado, progreso (porcentaje).
- **DopamineShield** — Título, descripción (motivación para dejarlo), pilar asociado, XP por día limpio (configurable, default 50), fecha inicio (último reset), racha máxima, notificaciones diarias (bool).
- **DopamineRelapse** — Referencia al vicio, fecha, XP perdida, reflexión (texto opcional), intensidad (Leve/Moderada/Fuerte).
- **HistoryEntry** — Pilar, tipo de origen (event/objective/dopamine/metric), referencia al item, XP, fecha, título.
- **PilarMetric** — Datos por pilar por fecha:
  - Financiación: ingresos, gastos, ahorro
  - Capacidad: horas concentrado, horas no concentrado, nivel de energía (Alto/Medio/Bajo)
  - Físico: peso (kg), horas de sueño, entrenamiento hoy (bool)
  - Relaciones: interacciones sociales (number), calidad (Profunda/Normal/Superficial), notas
- **CalendarEvent** — Título, descripción, pilar (opcional), fecha, hora inicio-fin, notas, XP, completado.
- **KanbanBoard** — Título, descripción, color (seleccionable de paleta).
- **KanbanColumn** — Referencia al board, título, orden.
- **KanbanTask** — Título, descripción, pilar (opcional), estado (POR_HACER/EN_PROGRESO/EN_REVISION/COMPLETADO), fecha límite (opcional), prioridad (ALTA/MEDIA/BAJA), XP al completar, orden, referencia a columna.

### Relaciones clave

- User 1:N PilarProgress (4 registros fijos)
- User 1:N Event, Objective, DopamineShield
- Event 1:N EventCompletion
- DopamineShield 1:N DopamineRelapse
- User 1:N HistoryEntry
- User 1:N CalendarEvent, KanbanBoard
- KanbanBoard 1:N KanbanColumn 1:N KanbanTask

### Curva de niveles

- XP necesaria para nivel N: `(N-1) * 100`
- Nivel 1→2: 100 XP
- Nivel 2→3: 300 XP (ya tenés 100 del nivel anterior)
- Nivel 3→4: 600 XP (ya tenés 300)
- La barra de progreso muestra XP actual / XP necesaria para el siguiente nivel
- XP total acumulada nunca se resetea (excepto por recaída de dopamina en el pilar asociado)

### Escudo de dopamina - XP

- XP por día limpio es configurable por vicio (default 50 XP)
- Día 1: +xpPorDia, Día 2: +2×xpPorDia, Día N: +N×xpPorDia
- Total acumulado: `N × (N + 1) / 2 × xpPorDia`
- Recaída: se pierde TODA la XP acumulada de ese vicio, contador vuelve a 0
- Se registra: reflexión (opcional), intensidad (Leve/Moderada/Fuerte)
- Se guarda racha máxima para motivación

## Integraciones externas

Ninguna para el MVP. Todo es carga manual.

Post-MVP: n8n para notificaciones diarias de vicios, Google Drive para archivos adjuntos.

## Automatizaciones (n8n)

No aplica para MVP. Notificaciones diarias de vicios preparadas (toggle en el modelo).

## Decisiones técnicas

### Stack
- **Next.js 15** (App Router) + TypeScript strict + Tailwind CSS + shadcn/ui
- **Prisma + PostgreSQL** (Supabase o Railway para producción)
- **NextAuth.js** para auth (credentials, único usuario)
- **Recharts** para gráficos (rendimiento XP barras stacked, origen de XP)
- **Zod** para validación
- **React Hook Form** para formularios
- **@tanstack/react-query** para data fetching
- **@dnd-kit** para drag & drop en Kanban
- **Dark mode only** — sin toggle de tema

### Tipografía
- **Space Grotesk**: headings, UI, body text
- **JetBrains Mono**: datos, números, labels, meta info, badges, monospace

### Colores
- Fondo principal: #0a0a0a
- Fondo cards/sidebar: #111111
- Bordes: #1a1a1a
- Texto principal: #f5f5f5
- Texto secundario: #737373
- **Financiación**: #22c55e (verde)
- **Capacidad**: #3b82f6 (azul)
- **Físico**: #f59e0b (amber)
- **Relaciones**: #f43f5e (rosa)
- **Dorado** (nivel general, highlights): #C9A962
- **Error/destructivo**: #ef4444

### Tradeoffs
- **Sin n8n por ahora**: todo corre en la app. Toggle de notificaciones preparado para futuro.
- **Sin archivos adjuntos por ahora**: requiere storage. Post-MVP.
- **Único usuario**: sin roles ni registro público.
- **Métricas de pilar como carga manual**: se puede integrar con APIs después.
- **Recharts sobre Chart.js**: mejor integración con React.
- **@dnd-kit sobre react-beautiful-dnd**: más liviano, mantenido, composable.
- **XP por día configurable**: más flexible que fórmula fija día×100.

## Modales (inventario completo)

### Crear/Editar
1. **Crear evento** — Título, descripción, pilar (chips), fecha, hora, repetir (select: No repetir/Diario/Semanal/Mensual), XP
2. **Editar evento** — Mismo que crear, prellenado
3. **Crear objetivo** — Título, descripción, pilar (chips), fecha límite, XP al completar, hito importante (toggle)
4. **Editar objetivo** — Mismo que crear, prellenado
5. **Crear vicio** — Nombre, descripción, pilar afectado (chips), XP por día limpio, notificaciones diarias (toggle)
6. **Editar vicio** — Mismo que crear, prellenado
7. **Crear tablero** — Nombre, descripción, color del tablero (paleta)
8. **Editar tablero** — Mismo que crear, prellenado
9. **Crear tarea** — Título, descripción, pilar (chips), estado (chips), fecha límite, prioridad (select), XP al completar
10. **Editar tarea** — Mismo que crear, prellenado

### Ver detalle (read-only con Editar/Eliminar)
11. **Ver evento** — Título, pilar, fecha, hora, notas, XP
12. **Ver objetivo** — Título, pilar, descripción, fecha límite, XP, estado, progreso
13. **Ver tarea** — Título, pilar, descripción, estado, prioridad, fecha límite, XP
14. **Ver vicio** — Nombre, pilar, descripción, racha actual, racha máxima, XP por día, XP ganada

### Acciones
15. **Confirmar recaída** — Warning banner, reflexión (textarea), intensidad (select: Leve/Moderada/Fuerte)
16. **Confirmar eliminación** — Warning, detalle de consecuencias
17. **Registrar métricas** — Dinámico por pilar (Financiación: ingresos/gastos/ahorro, Capacidad: horas/energía, Físico: peso/sueño/entrenamiento, Relaciones: interacciones/calidad/notas)

### Otros
18. **Filtros de historial** — Pilar, tipo, rango fechas, ordenar
19. **Context menu** — Editar, Duplicar, Eliminar

## Páginas y navegación

### Sidebar (280px, siempre visible)
- Logo "FA" + "FRANCO ASSISTANT"
- Nivel general con badge dorado
- Sección "PÁGINAS": Dashboard, Financiación, Capacidad, Físico, Relaciones, Escudo de Dopamina
- Sección "HERRAMIENTAS": Calendario, Kanban
- Usuario abajo: "FRANCO" + "ADMIN :: L23"

### Páginas
1. **Dashboard** — 4 pilar cards, rendimiento XP 7 días, origen de XP, escudo resumen, historial reciente, próximos eventos, tareas en progreso
2. **Financiación** — Progreso XP, XP semanal, métricas (balance/ingresos/gastos), eventos con filtros, objetivos, historial reciente
3. **Capacidad** — Mismo layout, métricas (ratio enfoque/horas concentrado/no concentrado)
4. **Físico** — Mismo layout, métricas (peso/hora sueño/entrenamientos semana)
5. **Relaciones** — Mismo layout, métricas (eventos sociales/interacciones/placeholder)
6. **Escudo de Dopamina** — Stats resumen, cards de vicios, historial de recaídas
7. **Historial** — Buscador, filtros modal, lista agrupada por fecha, context menu
8. **Calendario** — Vista mes/semana, grid con chips, sidebar eventos del día
9. **Kanban** — Tabs de boards, columnas, items con drag & drop

## Fuera de alcance (post-MVP)

- Archivos adjuntos en calendario/kanban (requiere storage)
- Automatizaciones con n8n (notificaciones diarias de vicios, recordatorios, reportes)
- Integración con Google Drive para archivos
- Integración con APIs externas para métricas (bancos, toggl, etc.)
- Modo claro / toggle de tema
- PWA / app móvil nativa
- Exportación de datos
- Múltiples usuarios
