# Franco Assistant

## Qué es
Asistente personal gamificado con 4 pilares de vida (Financiación, Capacidad, Físico, Relaciones), sistema de XP/niveles, escudo de dopamina, calendario, y tablero kanban. Dark mode only. Único usuario.

## Documentación del proyecto
- `docs/SPEC.md` — Spec completa (features, modelo de datos, modales, decisiones técnicas)
- `docs/guia-implementacion.md` — Guía paso a paso con razonamiento de cada decisión
- `docs/modales-por-seccion.md` — Inventario de modales y qué componente los activa
- `docs/designs/` — Screenshots de Pencil.dev como referencia visual

**LEÉ ESTOS ARCHIVOS ANTES DE TOMAR CUALQUIER DECISIÓN DE ARQUITECTURA O DISEÑO.**

## Stack
- Next.js 15 (App Router), TypeScript strict, Tailwind CSS, shadcn/ui
- Prisma + PostgreSQL
- NextAuth.js v5 para auth (credentials, único usuario)
- Zod para validación (compartida frontend/backend)
- React Hook Form + @hookform/resolvers
- @tanstack/react-query para data fetching
- Recharts para gráficos
- @dnd-kit para drag & drop en Kanban
- Vitest (unit tests), Playwright (e2e)

## Fuentes
- **Space Grotesk**: headings, UI, body text (`font-display`)
- **JetBrains Mono**: datos, números, labels, badges, meta info (`font-mono`)

## Colores
- Fondo: #0a0a0a | Cards: #111111 | Bordes: #1a1a1a
- Texto: #f5f5f5 | Secundario: #737373
- Financiación: #22c55e | Capacidad: #3b82f6 | Físico: #f59e0b | Relaciones: #f43f5e
- Dorado: #C9A962 | Error: #ef4444

## Comandos
- `npm run dev` — Dev server (puerto 3000)
- `npm run build` — Build de producción
- `npm run lint` — ESLint
- `npm run typecheck` — Verificar tipos (`tsc --noEmit`)
- `npx prisma migrate dev` — Migraciones
- `npx prisma studio` — UI de la DB
- `npx prisma db seed` — Seed de datos
- `npm run test` — Vitest
- `npm run test:e2e` — Playwright
- `docker compose up -d` — Levantar PostgreSQL

## Estructura
```
src/app/              → Páginas y layouts (App Router)
src/app/api/          → Route handlers (API)
src/components/ui/    → shadcn/ui base
src/components/shared/→ Modal, Toast, EmptyState, Skeleton, ContextMenu
src/components/[feature]/ → Componentes por feature
src/lib/              → db.ts, auth.ts, utils.ts, errors.ts, xp.ts
src/lib/validations/  → Schemas Zod por entidad
src/server/services/  → Lógica de negocio
src/server/repositories/ → Queries Prisma (si se separan de servicios)
tests/                → Unit y E2E
docs/                 → Spec, guía, modales, designs
```

---

## REGLA PRINCIPAL: EXPLICÁ TODO

**Por cada acción que tomes, explicale a Franco la lógica detrás.** Franco está aprendiendo mientras construye. No asumas que sabe por qué hacés algo — decíselo.

Ejemplos de lo que SÍ hacer:

```
✅ "Voy a crear el servicio de eventos ANTES que la API porque
    la lógica de negocio debe funcionar independiente de HTTP.
    Así podemos testearla sin levantar un server."

✅ "Uso cuid() en vez de autoincrement para los IDs porque:
    1) Son únicos globalmente (no solo por tabla)
    2) No exponen el orden de creación
    3) Se pueden generar en el cliente sin consultar la DB"

✅ "Pongo el validar con Zod en el route handler y NO en el
    servicio porque el servicio ya recibe datos tipados.
    La validación es un concern de la capa HTTP."

✅ "Este componente es Client Component ('use client') porque
    usa useState para el modal. Los Server Components no pueden
    tener estado interactivo."
```

Ejemplos de lo que NO hacer:

```
❌ [Crea un archivo sin explicar por qué]
❌ "Acá va el servicio" [sin explicar la decisión de diseño]
❌ [Elige una librería sin explicar por qué esa y no otra]
```

**Nivel de detalle:** Explicá como si Franco supiera programar pero NO supiera por qué se estructura así. No expliques qué es un `if` — explicá por qué elegiste validar en el server y no en el client.

---

## MCPs disponibles y cuándo usarlos

### Context7 — Documentación actualizada
**USALO** antes de usar cualquier API de librería que pueda haber cambiado.
```
Ejemplos de cuándo usar:
- "Voy a configurar NextAuth v5 — deja que verifique la API actual con Context7"
- "Necesito el hook de @dnd-kit para sortable — lo verifico primero"
- "No estoy seguro si Recharts soporta stacked bars — deja que busque"
```

### Sequential Thinking — Razonamiento paso a paso
**USALO** para decisiones de arquitectura complejas.
```
Ejemplos de cuándo usar:
- Antes de diseñar el schema de Prisma
- Cuando la lógica de XP/dopamina tiene edge cases
- Cuando no es obvio cómo estructurar un flujo (ej: completar evento → actualizar XP → crear historial → recalcular nivel)
- Cuando hay trade-offs entre dos enfoques
```

### GitHub — Gestión de repo
**USALO** para crear branches por feature, PRs, y reviews.

### Pencil — Diseños de referencia
**USALO** cuando construyas componentes de UI para matchear con los diseños existentes.

### PostgreSQL — Debug de datos
**USALO** para verificar que migraciones, seeds, y queries están correctas.

### Puppeteer — Testing visual (si está instalado)
Para verificar que la UI se ve correcta en el browser.

---

## Reglas de código

### TypeScript
- Strict mode, nunca `any` (usar `unknown` si es necesario)
- Explicá a Franco por qué un tipo es así cuando no sea obvio
- Interfaces para props de componentes, types para unions/intersections

### Componentes
- Funcionales con hooks, nunca clases
- Named exports siempre (excepto pages/layouts de Next.js)
- Un componente por archivo
- Props tipadas con interface
- Explicá cuándo algo es Server Component vs Client Component y por qué

### Validación
- Zod en el servidor para TODOS los inputs — nunca confiar en el client
- Zod schemas exportados para reusar en forms (React Hook Form)
- Explicá qué valida cada campo y por qué (ej: "XP mínimo 1 porque 0 no tiene sentido")

### Estilos
- Solo Tailwind, no CSS custom
- Usar las clases custom de tailwind.config (pilar-financiacion, gold, bg-card, etc.)
- Seguir los diseños de Pencil.dev en docs/designs/

### API
- Toda ruta: validar auth → validar input → llamar servicio → response
- Responses: `{ data: ... }` en éxito, `{ error: { message, code } }` en error
- Usar `formatErrorResponse()` de `@/lib/errors`
- Status codes correctos: 200, 201, 400, 401, 403, 404, 500
- Explicá por qué elegís cada status code

### Servicios
- Funciones puras: reciben datos tipados, devuelven datos, no acceden a request/response
- Explicá la lógica de negocio antes de implementarla
- Efectos secundarios documentados (ej: "completar evento → crea HistoryEntry + actualiza PilarProgress")

### Imports
- Path alias: `@/components`, `@/lib`, `@/server`
- Nunca imports relativos profundos (../../..)

---

## Convenciones de Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Un commit por paso completado de la guía de implementación
- Mensajes descriptivos: `feat: pilar pages with events, objectives, and XP system`
- Nunca push directo a main — usar branches si es apropiado

---

## Flujo de XP (referencia rápida)

### Niveles
- Nivel N necesita: `(N-1) * 100` XP total acumulada
- Nivel 1→2: 100 XP, Nivel 2→3: 300 XP, Nivel 3→4: 600 XP
- Nivel general = suma de niveles de los 4 pilares

### Completar evento/objetivo
1. Marcar como completado
2. Sumar XP al PilarProgress del pilar correspondiente
3. Crear HistoryEntry
4. Recalcular nivel (puede subir → toast dorado)

### Descompletar
1. Desmarcar
2. Restar XP del PilarProgress
3. Eliminar HistoryEntry correspondiente
4. Recalcular nivel (puede bajar)

### Escudo de dopamina
- XP por día = `díaActual × xpPorDía` (configurable por vicio)
- XP total = `días × (días + 1) / 2 × xpPorDía`
- Recaída: restar TODA la XP acumulada del PilarProgress, resetear días a 0, guardar racha máxima si corresponde, crear HistoryEntry negativo, guardar reflexión + intensidad

---

## Seguridad
- NUNCA commitear .env ni secrets
- NUNCA loguear passwords, tokens, datos personales
- Validar TODO en el servidor, nunca confiar en el client
- Headers de seguridad en next.config.js

---

## Orden de implementación
Seguir `docs/guia-implementacion.md` paso a paso. No saltear pasos. Si algo no está claro, preguntar a Franco antes de decidir.

---

## Cuando uses subagentes
- Explicá QUÉ va a hacer cada subagente y POR QUÉ se puede paralelizar
- Verificá que las tareas sean realmente independientes (no comparten archivos que se editan)
- Al terminar los subagentes, verificá con `npm run typecheck && npm run lint && npm run build`
