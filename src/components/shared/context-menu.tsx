"use client"

/**
 * ContextMenu -- menú de 3 puntos para acciones sobre un item.
 *
 * Por que "ContextMenu" y no "DropdownMenu"?
 * Porque en el contexto de nuestra app, este componente tiene un propósito
 * específico: es el menú de acciones de un item (evento, objetivo, tarea).
 * Siempre se activa con el ícono de 3 puntos verticales (MoreVertical).
 *
 * El DropdownMenu de shadcn es el primitivo genérico -- puede tener cualquier
 * trigger y cualquier contenido. Nuestro ContextMenu es la versión opinionada:
 *   - Trigger fijo: ícono MoreVertical
 *   - Items con estructura consistente: ícono opcional + label
 *   - Soporte para variant "destructive" (items rojos para eliminar)
 *
 * Es "use client" porque DropdownMenu de Radix maneja estado de apertura/cierre
 * y necesita event handlers para posicionamiento y keyboard navigation.
 */

import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ContextMenuItem {
  /** Texto visible del item (ej: "Editar", "Eliminar"). */
  label: string
  /**
   * Ícono opcional de lucide-react.
   * Tipado como React.ComponentType para aceptar cualquier ícono.
   */
  icon?: React.ComponentType<{ className?: string }>
  /** Handler que se ejecuta al clickear el item. */
  onClick: () => void
  /**
   * Variante visual:
   * - default: texto normal
   * - destructive: texto rojo para acciones peligrosas (eliminar)
   */
  variant?: "default" | "destructive"
}

interface ContextMenuProps {
  /**
   * Array de items del menú. Se renderizan en orden.
   * Separar en array permite que cada feature defina sus propias acciones
   * sin modificar este componente.
   */
  items: ContextMenuItem[]
}

export function ContextMenu({ items }: ContextMenuProps) {
  return (
    <DropdownMenu>
      {/*
       * Trigger: botón "ghost" con ícono de 3 puntos verticales.
       *
       * Por que ghost y no outline?
       * Porque el menú de 3 puntos debe ser discreto -- no compite
       * visualmente con el contenido del item. ghost no tiene fondo
       * ni borde, solo muestra el ícono. Al hover se ilumina sutilmente.
       *
       * size="icon-sm" (32x32) porque es suficiente para el ícono
       * y no ocupa demasiado espacio en cards compactas.
       *
       * asChild=false (default) para que sea un <button> real.
       * Esto es importante para accesibilidad: Radix necesita un
       * elemento focuseable como trigger.
       */}
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreVertical className="size-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>

      {/*
       * Content: el menú desplegable.
       * align="end" para que se alinee a la derecha del trigger,
       * porque el botón de 3 puntos suele estar en la esquina
       * derecha de una card. Si se alineara a la izquierda, el menú
       * podría salirse de la pantalla en mobile.
       *
       * Los estilos dark (fondo, borde) ya vienen del DropdownMenuContent
       * de shadcn que usa bg-popover (#111111) y border (#1a1a1a).
       */}
      <DropdownMenuContent align="end">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={item.onClick}
            /*
             * El shadcn DropdownMenuItem ya tiene soporte nativo para
             * variant="destructive" con data-[variant=destructive]:text-destructive.
             * Así que le pasamos el variant directamente y shadcn se encarga
             * del color rojo. No necesitamos clases custom.
             */
            variant={item.variant ?? "default"}
          >
            {/*
             * Ícono opcional: se renderiza solo si se pasa.
             * size-4 (16x16) es el tamaño estándar de íconos en menús.
             *
             * Para items destructive, el DropdownMenuItem de shadcn ya
             * tiene la regla data-[variant=destructive]:*:[svg]:!text-destructive
             * que colorea los SVGs hijos en rojo automáticamente.
             */}
            {item.icon && (
              <item.icon className="size-4" />
            )}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
