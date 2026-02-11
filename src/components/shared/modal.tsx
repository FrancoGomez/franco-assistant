"use client"

/**
 * Modal -- wrapper reutilizable sobre el Dialog de shadcn.
 *
 * Por que un wrapper y no usar Dialog directamente?
 * Porque cada modal en la app repite la misma estructura:
 *   Dialog > DialogContent > DialogHeader > DialogTitle > DialogDescription > children
 *
 * Con Modal, el consumidor solo pasa props declarativas (title, size, etc.)
 * y el wrapper arma toda esa estructura internamente. Esto garantiza:
 *   1. Consistencia visual (mismo padding, bordes, fondo)
 *   2. Un sistema de tamaños centralizado (sm/md/lg)
 *   3. Menos código repetido en cada feature
 *
 * Es "use client" porque Dialog de Radix usa estado interno (open/closed),
 * y los Server Components de Next.js no pueden tener interactividad.
 */

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Tamaños disponibles:
 * - sm: formularios simples, confirmaciones (max-w-sm = 384px)
 * - md: formularios estándar, la mayoría de modales (max-w-lg = 512px)
 * - lg: modales con contenido complejo, tablas, previews (max-w-2xl = 672px)
 *
 * Usamos max-w en vez de width fijo porque el DialogContent de shadcn
 * ya tiene w-full + max-w-[calc(100%-2rem)] para responsividad en mobile.
 * Nuestro max-w se aplica como override via sm: breakpoint del DialogContent base.
 */
const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
} as const

interface ModalProps {
  /** Controla si el modal está abierto. Viene del estado del componente padre. */
  open: boolean
  /** Callback para cerrar el modal. Radix lo llama al hacer click en overlay o presionar Escape. */
  onOpenChange: (open: boolean) => void
  /** Título del modal -- requerido para accesibilidad (aria-labelledby). */
  title: string
  /** Descripción opcional bajo el título -- se renderiza con DialogDescription para aria-describedby. */
  description?: string
  /** Contenido del modal: formularios, listas, lo que sea. */
  children: React.ReactNode
  /** Clases CSS extra para el DialogContent (ej: padding custom para un caso especial). */
  className?: string
  /** Tamaño del modal. Default "md" porque es el más común (formularios CRUD). */
  size?: "sm" | "md" | "lg"
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  size = "md",
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Fondo de card (#111111) y borde base (#1a1a1a) para mantener
          // consistencia con el sistema de colores dark-only.
          // bg-card y border ya vienen de las CSS variables, pero ser
          // explícitos con bg-bg-card refuerza que es el fondo de card.
          "bg-bg-card border-border-base",
          sizeClasses[size],
          className
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
