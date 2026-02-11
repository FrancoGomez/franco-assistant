/**
 * EmptyState -- placeholder visual para cuando no hay datos.
 *
 * Este es un SERVER Component (sin "use client") a propósito.
 * Por que? Porque no tiene ninguna interactividad propia:
 *   - No tiene useState, useEffect, ni event handlers propios
 *   - Solo renderiza props estáticas (ícono, título, texto)
 *   - El "action" (botón CTA) se pasa como ReactNode desde el padre
 *
 * Al ser Server Component:
 *   1. No se envía JavaScript al browser para este componente
 *   2. Se renderiza en el servidor y llega como HTML puro
 *   3. El bundle del cliente es más liviano
 *
 * Nota: que el padre pase un <Button onClick={...}> como action
 * NO hace que EmptyState necesite ser Client Component. El Button
 * ya es un Client Component por sí mismo, y React lo hidrata
 * independientemente. EmptyState solo lo "pasa through" como children.
 *
 * Se usa en listas vacías de eventos, objetivos, tablero kanban, etc.
 * Ejemplo:
 *   <EmptyState
 *     icon={CalendarOff}
 *     title="Sin eventos"
 *     description="Creá tu primer evento para empezar."
 *     action={<Button onClick={openModal}>Nuevo evento</Button>}
 *   />
 */

import { cn } from "@/lib/utils"

interface EmptyStateProps {
  /**
   * Ícono de lucide-react a mostrar.
   * Tipado como React.ComponentType para aceptar cualquier componente
   * de lucide sin importar cuál (CalendarOff, Target, Users, etc).
   * No tipamos LucideIcon directamente para no acoplar con lucide.
   */
  icon: React.ComponentType<{ className?: string }>
  /** Título principal (ej: "No hay eventos"). */
  title: string
  /** Descripción secundaria (ej: "Creá tu primer evento para empezar a sumar XP"). */
  description: string
  /**
   * CTA opcional. Se pasa como ReactNode para máxima flexibilidad:
   * puede ser un Button, un Link, o lo que el feature necesite.
   */
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    /*
     * Layout: flex column centrado, con padding generoso (py-16)
     * para que se sienta como un "espacio vacío" real, no apretado.
     * px-4 para que no toque los bordes en mobile.
     */
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      {/*
       * Ícono grande (48x48 = size-12) con color muted (#737373).
       * text-muted-foreground es el color estándar para "contenido secundario"
       * en shadcn. Visualmente comunica "acá no hay nada todavía" sin
       * ser agresivo ni llamar demasiado la atención.
       */}
      <Icon className={cn("size-12 text-muted-foreground")} />

      {/*
       * Título: font-medium (no bold) porque no es un heading de página,
       * es solo el mensaje principal del empty state. mt-4 para separarlo
       * del ícono.
       */}
      <h3 className="mt-4 text-lg font-medium text-foreground">{title}</h3>

      {/*
       * Descripción: text-sm + muted para jerarquía visual clara.
       * max-w-sm para que no se extienda demasiado en pantallas anchas
       * (líneas muy largas son difíciles de leer).
       */}
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>

      {/*
       * El action (CTA) solo se renderiza si se pasa.
       * mt-6 para separarlo visualmente del texto -- es una acción,
       * no parte del mensaje, así que necesita su propio espacio.
       */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
