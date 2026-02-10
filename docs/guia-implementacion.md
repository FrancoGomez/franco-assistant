# Franco Assistant — Guía de Implementación Paso a Paso

Cada paso tiene: qué hacer, por qué en ese orden, y qué paralelizar con subagentes.

---

## PASO 0: PREPARACIÓN DEL ENTORNO

### 0.1 Instalar MCPs

```bash
# CORE — antes de tocar código
claude mcp add github -- npx -y @modelcontextprotocol/server-github
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
claude mcp add pencil -- npx @aspect-build/pencil-mcp
```

**¿Por qué primero?** Los MCPs son las herramientas que Claude Code va a usar durante toda la construcción. Si no están instalados desde el inicio, Claude va a trabajar "a ciegas" sin poder verificar docs actualizadas (Context7), pensar problemas complejos paso a paso (Sequential Thinking), ni ver los diseños (Pencil). Instalarlos ahora evita que después tengamos que parar todo para agregarlos.

**¿Por qué estos 4?**
- **GitHub**: para crear el repo, branches, PRs, y manejar Git sin salir de Claude Code
- **Context7**: para consultar documentación actualizada de Next.js 15, Prisma, NextAuth, shadcn/ui, Recharts, @dnd-kit — cuando Claude no esté seguro de una API, busca los docs reales en vez de inventar
- **Sequential Thinking**: para decisiones de arquitectura complejas (cómo modelar la XP de dopamina, cómo manejar eventos recurrentes, etc.) — fuerza a Claude a razonar paso a paso antes de escribir código
- **Pencil**: para que Claude vea los diseños que ya hicimos y genere componentes que matcheen

### 0.2 Crear estructura de docs

```bash
mkdir franco-assistant
cd franco-assistant
mkdir -p docs/designs
```

Copiar a `docs/`:
- `SPEC.md`
- `resumen-ejecucion.md` (este archivo)
- `modales-por-seccion.md`
- Screenshots de Pencil.dev → `docs/designs/`

**¿Por qué antes de crear el proyecto?** Claude Code necesita contexto ANTES de tomar decisiones. Si creamos el proyecto Next.js primero, Claude va a tomar decisiones de estructura sin saber qué estamos construyendo. Con los docs presentes, cada decisión está informada por la spec.

---

## PASO 1: SETUP DEL PROYECTO

### 1.1 Crear proyecto Next.js

```bash
npx create-next-app@latest franco-assistant --typescript --tailwind --eslint --app --src-dir
```

**¿Por qué estas flags?**
- `--typescript`: TypeScript strict desde el día 1. Encontrar errores en compile time, no en runtime.
- `--tailwind`: nuestro único sistema de estilos. No CSS custom.
- `--eslint`: linting automático para mantener consistencia.
- `--app`: App Router (Next.js 15). Server Components por default, mejor performance, layouts anidados.
- `--src-dir`: separar código de config. Todo el código en `src/`, los archivos de config en la raíz.

### 1.2 Instalar dependencias

**¿Por qué instalar todo de entrada?** Para que el primer `npm run build` ya tenga todo resuelto. Si instalamos sobre la marcha, cada instalación nueva puede romper types o crear conflictos.

```bash
# UI — shadcn/ui como base de componentes
npx shadcn@latest init
# → Style: New York | Color: Zinc | CSS variables: yes

# DB — Prisma como ORM
npm install prisma @prisma/client
npx prisma init

# Auth — NextAuth para proteger la app
npm install next-auth@beta @auth/prisma-adapter

# Validación — Zod compartido entre frontend y backend
npm install zod

# Formularios — React Hook Form + integración con Zod
npm install react-hook-form @hookform/resolvers

# Data fetching — TanStack Query para caché y revalidación
npm install @tanstack/react-query

# Gráficos — Recharts para barras de XP y rendimiento
npm install recharts

# Drag & drop — @dnd-kit para Kanban
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Dev tools
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D husky lint-staged
```

**¿Por qué cada una?**
- **shadcn/ui**: no es una librería, son componentes que se copian a tu proyecto. Los podés modificar libremente. Matchean perfecto con Tailwind.
- **Prisma**: type-safe por default. El schema genera tipos de TypeScript automáticamente. Prisma Studio para ver la DB visual.
- **NextAuth beta**: la versión 5 funciona con App Router nativamente. PrismaAdapter conecta sesiones directo a la DB.
- **Zod**: definís el schema una vez, lo usás para validar en el server Y para tipar forms en el client. Una sola fuente de verdad.
- **React Hook Form**: no re-renderiza el form entero en cada keystroke. Con @hookform/resolvers conecta directo a Zod.
- **TanStack Query**: caché automático, revalidación, optimistic updates. Sin esto tendríamos que manejar loading/error states manualmente en cada fetch.
- **Recharts**: composable con React, declarativo. Más simple que D3 para nuestros gráficos.
- **@dnd-kit**: modular, accesible, mejor que react-beautiful-dnd (deprecated). Solo importamos lo que usamos.

### 1.3 Docker + PostgreSQL

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: franco_assistant
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**¿Por qué Docker y no SQLite?** PostgreSQL es lo que vamos a usar en producción (Railway/Supabase). Desarrollar con la misma DB evita sorpresas de compatibilidad (tipos de datos, JSON, full-text search, etc.). Docker lo hace reproducible — un `docker compose up -d` y tenés la DB corriendo.

### 1.4 Configurar Tailwind con colores custom

**¿Por qué ahora?** Los colores de los pilares y el tema dark se usan en TODOS los componentes. Definirlos en tailwind.config una vez evita hardcodear hex codes en cada archivo.

Extender tailwind.config con:
- Colores de pilares: `pilar-financiacion`, `pilar-capacidad`, `pilar-fisico`, `pilar-relaciones`
- Dorado: `gold`
- Fondos: `bg-base`, `bg-card`, `bg-sidebar`
- Bordes: `border-base`
- Fuentes: `font-display` (Space Grotesk), `font-mono` (JetBrains Mono)

### 1.5 Configurar fuentes

Importar Space Grotesk y JetBrains Mono via `next/font/google` en el layout root.

**¿Por qué next/font?** Optimiza las fuentes automáticamente: las descarga en build time, las sirve desde tu dominio (no Google Fonts), y elimina layout shift.

### 1.6 Crear archivos base

- `src/lib/db.ts` — Prisma client singleton (evita crear múltiples conexiones en dev)
- `src/lib/utils.ts` — función `cn()` para merge de clases Tailwind
- `src/lib/errors.ts` — clases de error tipadas (AppError, ValidationError, AuthError, NotFoundError) + `formatErrorResponse()`
- `src/lib/xp.ts` — funciones de cálculo de XP, niveles, dopamina
- `.env.local` — variables de entorno
- `.env.example` — template sin secrets

### 1.7 CLAUDE.md

Crear en la raíz. Detallado en el archivo separado.

### 1.8 Git init + primer commit

```bash
git init
git add .
git commit -m "chore: initial project setup with Next.js 15, Prisma, shadcn/ui"
```

**¿Por qué commitear acá?** Checkpoint limpio. Si algo se rompe después, podemos volver a este punto donde todo compila sin errores.

### 1.9 Agregar MCP de PostgreSQL

```bash
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres --connection-string "postgresql://dev:dev@localhost:5432/franco_assistant"
```

**¿Por qué ahora y no antes?** Necesitábamos Docker corriendo y la DB creada primero. Con este MCP, Claude Code puede consultar la DB directamente para verificar datos, debug queries, y confirmar que las migraciones corrieron bien.

**🔀 Subagentes en Paso 1:** La instalación de dependencias, la config de Tailwind, y la creación de archivos base son independientes entre sí. Claude puede paralelizar: un subagente instala paquetes, otro configura tailwind.config, otro crea los archivos en `src/lib/`.

---

## PASO 2: MODELO DE DATOS

### 2.1 Diseñar schema Prisma

**¿Por qué antes que cualquier feature?** El modelo de datos es el cimiento. Si está mal, TODO lo que construimos arriba se tiene que rehacer. Mejor invertir tiempo acá.

Usar Sequential Thinking MCP para razonar:
- Cómo manejar eventos recurrentes (Event + EventCompletion)
- Cómo calcular XP de dopamina (acumulativa por día)
- Cómo hacer el historial genérico (referencia polimórfica vs tabla unificada)
- Dónde poner índices (campos que se consultan frecuentemente)

Reglas del schema:
- Todo modelo: `id` (cuid), `createdAt`, `updatedAt`
- Soft delete con `deletedAt` donde tenga sentido
- `onDelete` explícito en todas las relaciones
- Enums para valores fijos (Pilar, EventType, TaskStatus, Priority, Intensity, EnergyLevel, RelationshipQuality)
- Campos de NextAuth en User

### 2.2 Migración inicial

```bash
docker compose up -d
npx prisma migrate dev --name init
```

Verificar con `npx prisma studio` que las tablas están correctas.

### 2.3 Seed con datos de ejemplo

Crear `prisma/seed.ts`:
- Usuario Franco (email/password)
- 4 PilarProgress (uno por pilar, con niveles y XP variados)
- 3-4 eventos por pilar (variando tipo y recurrencia)
- 2-3 objetivos por pilar
- 3 vicios en el escudo de dopamina (con días variados)
- Métricas de ejemplo para la última semana
- Entries de historial
- 1 board de kanban con 4 columnas y 5-6 tareas
- 4-5 eventos de calendario

**¿Por qué un seed tan completo?** Para que cuando hagamos UI, tengamos datos reales para ver. No queremos desarrollar componentes contra una pantalla vacía — los empty states se implementan al final, no al principio.

**🔀 Subagentes:** El schema es secuencial (necesita diseño pensado), pero una vez definido, la migración y el seed pueden correr en paralelo con la verificación en Prisma Studio.

---

## PASO 3: AUTENTICACIÓN

### 3.1 Configurar NextAuth

**¿Por qué antes del layout?** El layout necesita saber si el usuario está logueado para mostrar la sidebar o redirigir al login. Sin auth, no podemos construir la navegación correctamente.

Usar Context7 MCP para verificar la API actual de NextAuth v5 (cambió bastante vs v4).

- `src/lib/auth.ts` — config de NextAuth + PrismaAdapter
- `src/app/api/auth/[...nextauth]/route.ts` — route handler
- `src/middleware.ts` — proteger todas las rutas de `(app)/`, permitir `(auth)/`

### 3.2 Página de login

Página simple en `src/app/(auth)/login/page.tsx`:
- Estilo dark, industrial, centrada
- Input email + password
- Botón dorado "Iniciar sesión"
- Sin registro (usuario creado por seed)

### 3.3 Provider de sesión

Wrapper de SessionProvider para el client side.

### 3.4 Verificar flujo completo

Login → acceso a ruta protegida → logout → redirect a login.

```bash
git commit -m "feat: authentication with NextAuth.js credentials"
```

**¿Por qué no Google OAuth?** Es un solo usuario. Credentials es más simple y no requiere configurar proyecto en Google Cloud. Si después querés agregar Google, el adapter ya lo soporta.

---

## PASO 4: LAYOUT Y NAVEGACIÓN

### 4.1 Layout root

`src/app/layout.tsx`:
- Providers: SessionProvider, QueryClientProvider, ThemeProvider (dark only)
- Fuentes: Space Grotesk + JetBrains Mono
- Metadata SEO básica
- Fondo #0a0a0a

**¿Por qué providers acá?** El layout root wrappea toda la app. Poner providers acá los hace disponibles en todas las páginas sin repetir código.

### 4.2 Layout de app con sidebar

`src/app/(app)/layout.tsx`:
- Sidebar 280px (siguiendo el diseño de Pencil)
- Logo "FA" + "FRANCO ASSISTANT"
- Nivel general con badge dorado
- Navegación: PÁGINAS + HERRAMIENTAS
- Item activo con barra de color del pilar
- Usuario abajo
- Área de contenido con scroll

**¿Por qué route groups `(app)` y `(auth)`?** Next.js App Router permite layouts diferentes para grupos de rutas. Las páginas de la app tienen sidebar, las de auth no. Los paréntesis hacen que no afecten la URL.

### 4.3 Layout de auth

`src/app/(auth)/layout.tsx`: centrado, sin sidebar, fondo dark.

### 4.4 Componentes base reutilizables

Crear los componentes que se usan en TODAS las páginas:
- `Modal` — wrapper reutilizable (overlay, card, header, body, footer)
- `ConfirmModal` — modal destructivo
- `EmptyState` — icono + texto + CTA
- `Toast` — notificaciones (éxito, level up, recaída, error, info)
- `Skeleton` — loading states
- `ContextMenu` — editar/duplicar/eliminar

**¿Por qué ahora?** Cada feature va a necesitar modales, toasts, y loading states. Si los hacemos antes, las features se construyen más rápido porque solo enchufan componentes que ya existen.

### 4.5 Páginas placeholder

Crear todas las 9 páginas con un título y "Coming soon" para verificar que la navegación funciona completa.

```bash
git commit -m "feat: app layout with sidebar navigation and base components"
```

**🔀 Subagentes:** La sidebar, los componentes base (Modal, Toast, EmptyState, Skeleton, ContextMenu), y las páginas placeholder son totalmente independientes. 3 subagentes en paralelo.

---

## PASO 5: SISTEMA DE XP Y LÓGICA CORE

### 5.1 Lógica de XP y niveles

`src/lib/xp.ts`:
- `calculateLevel(totalXP)` — dado XP total, devuelve nivel actual
- `xpForLevel(level)` — XP necesaria para llegar a un nivel
- `xpProgress(totalXP)` — XP actual en el nivel / XP necesaria para el siguiente
- `calculateDopamineXP(days, xpPerDay)` — XP acumulada del escudo
- `calculateDopamineDailyXP(day, xpPerDay)` — XP de un día específico

**¿Por qué como módulo separado?** Esta lógica se usa en servicios, en componentes de UI, y en los tests. Extraerla la hace testeable y reutilizable. No depende de React ni de Prisma — funciones puras.

### 5.2 Schemas Zod

Crear TODOS los schemas de validación de una vez:
- `src/lib/validations/event.ts`
- `src/lib/validations/objective.ts`
- `src/lib/validations/dopamine.ts`
- `src/lib/validations/metric.ts`
- `src/lib/validations/calendar.ts`
- `src/lib/validations/kanban.ts`
- `src/lib/validations/history.ts`

**¿Por qué todos juntos?** Los schemas definen la "forma" de los datos en toda la app. Hacerlos todos ahora nos da una visión completa de los tipos y evita inconsistencias entre features. Además, son totalmente paralelizables.

### 5.3 Tests de XP

Tests unitarios de `xp.ts`:
- Nivel correcto para distintos rangos de XP
- Progreso correcto al siguiente nivel
- XP de dopamina acumulativa
- XP perdida en recaída

**¿Por qué testear esto primero?** La XP es el corazón de la app. Si los cálculos están mal, todo lo demás muestra datos incorrectos. Tests acá nos dan confianza para construir todo lo demás encima.

```bash
git commit -m "feat: XP calculation system with Zod validation schemas"
```

**🔀 Subagentes:** Los 7 schemas Zod son independientes entre sí. xp.ts y sus tests son independientes de los schemas. Perfectamente paralelizable en 3-4 subagentes.

---

## PASO 6: PILARES (FINANCIACIÓN COMO TEMPLATE)

### 6.1 Servicios de pilar

**¿Por qué servicios antes que API y UI?** El servicio contiene la lógica de negocio pura. Si funciona bien, la API solo lo expone y la UI solo lo muestra. Testeamos la lógica aislada de HTTP y React.

- `event.service.ts` — CRUD de eventos, completar/descompletar (afecta XP + historial), duplicar
- `objective.service.ts` — CRUD de objetivos, completar (afecta XP + historial)
- `metric.service.ts` — registrar métricas por pilar, obtener métricas actuales
- `pilar.service.ts` — obtener progreso de pilar, XP semanal, rendimiento 7 días
- `history.service.ts` — registrar entrada, listar con filtros, eliminar

### 6.2 API Routes

- `POST/GET /api/events` — crear, listar por pilar
- `PUT/DELETE /api/events/[id]` — actualizar, eliminar
- `POST /api/events/[id]/complete` — completar/descompletar
- `POST /api/events/[id]/duplicate` — duplicar
- Mismo patrón para objectives, metrics

Cada route: validar auth → validar input con Zod → llamar servicio → formatErrorResponse si error.

### 6.3 Componentes de pilar

Siguiendo los diseños de Pencil:
- `XPBar` — barra de progreso con color y label
- `LevelBadge` — badge de nivel (normal y dorado)
- `PilarBadge` — badge inline con color + nombre
- `MetricCard` — card de métrica grande
- `EventItem` — checkbox + nombre + meta + hover actions + context menu
- `ObjectiveItem` — checkbox circular + nombre + meta + hover actions
- `PilarChart` — gráfico de barras rendimiento 7 días (Recharts)

### 6.4 Modales de pilar

Usando el componente `Modal` base:
- `CreateEditEventModal` — crear/editar evento (título, desc, pilar chips, fecha, hora, repetir, XP)
- `CreateEditObjectiveModal` — crear/editar objetivo (título, desc, pilar, fecha límite, XP, hito)
- `ViewEventModal` — ver detalle con Editar/Eliminar
- `ViewObjectiveModal` — ver detalle con progreso
- `RegisterMetricModal` — dinámico por pilar
- `ConfirmDeleteModal` — reutilizable

### 6.5 Página de Financiación

`src/app/(app)/pilares/financiacion/page.tsx`:
- Header con prefijo, icono, título, subtítulo, badge nivel
- Card progreso XP
- Card rendimiento 7 días
- Grid: Eventos (con filtros DÍA/SEMANA/MES) + Objetivos
- Métricas (Balance/Ingresos/Gastos)
- Historial reciente

### 6.6 Replicar para los otros 3 pilares

Capacidad, Físico, Relaciones: mismo layout, diferente color y métricas.

**¿Por qué hacer Financiación completa primero?** Es el template. Resolvemos TODOS los problemas (layout, data fetching, modales, XP, etc.) en una página. Las otras 3 son copias con variaciones menores. Sin el template resuelto, multiplicaríamos los problemas ×4.

```bash
git commit -m "feat: pilar pages with events, objectives, metrics, and XP system"
```

**🔀 Subagentes:** Después de que Financiación esté completa y funcionando, los otros 3 pilares son tareas independientes — 3 subagentes en paralelo, cada uno copiando el template y ajustando color + métricas.

---

## PASO 7: ESCUDO DE DOPAMINA

### 7.1 Servicio de dopamina

- `dopamine.service.ts` — CRUD vicios, calcular XP acumulada, calcular XP diaria, registrar recaída (resetear contador + quitar XP + guardar reflexión), obtener stats resumen

**¿Por qué separado de pilares?** La lógica de dopamina es la más compleja: XP acumulativa con fórmula configurable, recaída que afecta XP del pilar asociado, racha máxima histórica. Merece su propio servicio con sus propios tests.

### 7.2 API + Componentes + Página

- API: CRUD vicios + endpoint de recaída
- `ShieldCard` — card grande con días, XP, botón recaída
- `RelapseItem` — entrada en historial de recaídas
- Modales: crear/editar/ver vicio, confirmar recaída
- Página con stats resumen + grid de vicios + historial recaídas

### 7.3 Tests de dopamina

- XP acumulativa correcta para distintos días y xpPerDay
- Recaída resetea correctamente
- Racha máxima se actualiza solo si es mayor

```bash
git commit -m "feat: dopamine shield with configurable XP, relapse tracking, and streaks"
```

---

## PASO 8: DASHBOARD

### 8.1 Servicio de dashboard

`dashboard.service.ts` — agrega datos de todos los servicios existentes:
- Progreso de los 4 pilares
- XP semanal por pilar (para barras stacked)
- Origen de XP total (eventos vs objetivos vs dopamina)
- Últimos 3 vicios activos con resumen
- Últimos 5 items de historial (todos los pilares)
- Próximos eventos del calendario
- Tareas en progreso del kanban

**¿Por qué el dashboard después de los pilares y escudo?** El dashboard es una vista de LECTURA que agrega datos de todo lo demás. Si lo hacemos antes, no tiene datos que mostrar. Ahora que pilares y escudo funcionan, el dashboard solo los consume.

### 8.2 Componentes + Página

- `PilarCard` — card con nombre, nivel, progreso, mini gráfico
- `ShieldCardMini` — versión compacta de vicio
- `XPChart` — barras stacked por pilar (Recharts)
- `XPOriginChart` — barras horizontales proporcionales
- `HistoryEntry` — entrada de historial con icono pilar
- `QuickCard` — cards de próximos eventos y tareas
- Nivel general dorado en el header

```bash
git commit -m "feat: dashboard with pillar overview, XP charts, and activity summary"
```

**🔀 Subagentes:** Los componentes del dashboard (PilarCard, ShieldCardMini, XPChart, XPOriginChart, HistoryEntry, QuickCard) son independientes. 2-3 subagentes en paralelo.

---

## PASO 9: CALENDARIO

### 9.1 Servicio + API

- `calendar.service.ts` — CRUD eventos de calendario, obtener eventos por mes/semana/día, completar evento (afecta XP del pilar si tiene asociación)

### 9.2 Componentes + Página

- `CalendarGrid` — grid mensual 7×5/6
- `DayCell` — celda con número + chips
- `EventChip` — chip de color en celda
- `EventSidebar` — panel derecho con eventos del día
- `CalendarEventItem` — item en sidebar
- Modal crear/editar/ver evento de calendario
- Navegación entre meses

**¿Por qué el calendario en este punto?** Depende del sistema de XP (completar eventos da XP) que ya está implementado en los pilares. Además, el dashboard ya referencia "próximos eventos" así que necesitamos datos reales.

```bash
git commit -m "feat: calendar with monthly view, event sidebar, and pillar XP integration"
```

---

## PASO 10: KANBAN

### 10.1 Servicio + API

- `kanban.service.ts` — CRUD boards/columns/tasks, reordenar (drag & drop), mover task entre columnas, completar task (afecta XP)

### 10.2 Componentes + Página

- `KanbanBoard` — container de columnas con scroll horizontal
- `KanbanColumn` — columna con header, items, botón agregar
- `KanbanItem` — card de tarea con badge pilar + XP
- Drag & drop con @dnd-kit (sortable dentro de columna + between columns)
- Tabs de boards
- Modales: crear/editar/ver board, tarea
- Context menu en items

**¿Por qué @dnd-kit?** Usar Context7 MCP para verificar la API actual. @dnd-kit es composable: importamos SortableContext y DndContext, wrapeamos los componentes, y funciona. No tiene opiniones sobre estilo.

```bash
git commit -m "feat: kanban boards with drag-and-drop, task management, and XP integration"
```

---

## PASO 11: HISTORIAL

### 11.1 Servicio + API

- Ya tenemos `history.service.ts` del paso 6. Extender con: búsqueda por texto, filtros combinados, paginación cursor-based.

### 11.2 Componentes + Página

- Barra de búsqueda
- Botón filtros → modal de filtros (pilar, tipo, fechas, ordenar)
- Lista agrupada por fecha ("HOY", "AYER", "8 FEB 2026")
- Items con icono pilar, título, hora, XP, context menu
- Scroll infinito o "Cargar más"

**¿Por qué al final?** El historial es una vista de lectura que muestra datos de TODAS las demás features. Necesitamos que eventos, objetivos, dopamina, calendario y kanban estén funcionando para que el historial tenga datos reales.

```bash
git commit -m "feat: unified history with search, filters, and context menu"
```

---

## PASO 12: PULIDO Y TESTING

### 12.1 Empty states

Recorrer CADA sección y agregar empty states donde la lista puede estar vacía. Usar el componente `EmptyState` creado en Paso 4.

**¿Por qué al final?** Durante el desarrollo usamos datos del seed. Ahora verificamos la experiencia de un usuario nuevo.

### 12.2 Loading states (skeletons)

Agregar `loading.tsx` en cada ruta y skeletons en componentes que hacen fetch.

### 12.3 Toasts

Verificar que TODA acción exitosa/fallida muestra un toast apropiado. Level up muestra toast dorado.

### 12.4 Tests

- Unit: servicios de XP, dopamina, eventos (Vitest)
- E2E: login → crear evento → completar → ver XP actualizada → ver en historial (Playwright)

### 12.5 Checklist de seguridad

```
□ No hay secrets en código
□ .env.local en .gitignore
□ .env.example existe sin valores
□ Todos los endpoints validan auth
□ Todos los inputs validados con Zod
□ Headers de seguridad en next.config
□ npm audit sin vulnerabilidades críticas
```

```bash
git commit -m "chore: add empty states, loading skeletons, toasts, and security review"
```

**🔀 Subagentes:** Empty states, loading states, toasts, y tests son totalmente independientes. 4 subagentes en paralelo.

---

## PASO 13: CI/CD Y DEPLOY

### 13.1 GitHub Actions

`.github/workflows/ci.yml`:
- lint + typecheck + build + test en cada push/PR

### 13.2 Base de datos producción

Crear PostgreSQL en Railway o Supabase. Correr migraciones.

### 13.3 Deploy a Vercel

Variables de entorno de producción. Verificar que todo funciona.

### 13.4 MCP de Sentry

```bash
claude mcp add sentry --url https://mcp.sentry.dev/sse
```

Configurar error tracking para producción.

```bash
git commit -m "chore: CI/CD pipeline and production deployment"
```

---

## RESUMEN DE SUBAGENTES POR PASO

| Paso | Tareas paralelizables | Subagentes |
|---|---|---|
| 1 | Dependencias + tailwind config + archivos base | 3 |
| 4 | Sidebar + componentes base + páginas placeholder | 3 |
| 5 | 7 schemas Zod + xp.ts + tests | 3-4 |
| 6.6 | 3 pilares (Capacidad, Físico, Relaciones) después del template | 3 |
| 8 | 6 componentes del dashboard | 2-3 |
| 12 | Empty states + loading + toasts + tests | 4 |

---

## RESUMEN DE MCPs Y CUÁNDO USARLOS

| MCP | Cuándo usarlo |
|---|---|
| **Context7** | Antes de usar cualquier API de librería. "Verificá con Context7 cómo funciona X en la versión actual." |
| **Sequential Thinking** | Para decisiones de arquitectura: modelado de datos, flujo de XP, manejo de recurrencia. |
| **GitHub** | Crear repo, branches por feature, PRs. |
| **Pencil** | Al construir componentes de UI, para que matcheen con los diseños. |
| **PostgreSQL** | Debug de queries, verificar datos después de migraciones/seeds. |
| **Sentry** | Post-deploy, para monitorear errores en producción. |
