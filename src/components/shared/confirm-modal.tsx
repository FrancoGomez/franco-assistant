"use client"

/**
 * ConfirmModal -- modal de confirmación para acciones destructivas o peligrosas.
 *
 * Por que un componente separado de Modal?
 * Porque la confirmación tiene un patrón muy específico:
 *   - Ícono de advertencia
 *   - Título + descripción del peligro
 *   - Dos botones: Cancelar + Confirmar
 *   - Estado de loading mientras se ejecuta la acción
 *
 * Si lo metiéramos todo en Modal con props condicionales, Modal se volvería
 * un "god component" con lógica que no le corresponde. Separándolo:
 *   1. Modal queda simple y genérico
 *   2. ConfirmModal tiene su propia responsabilidad clara
 *   3. Cada feature lo usa sin repetir el layout de confirmación
 *
 * Tiene variant 'destructive' (eliminar) y 'warning' (acciones reversibles
 * pero peligrosas, como resetear una racha del escudo de dopamina).
 */

import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/shared/modal"

interface ConfirmModalProps {
  /** Controla visibilidad del modal. */
  open: boolean
  /** Callback para abrir/cerrar. */
  onOpenChange: (open: boolean) => void
  /** Título de la confirmación (ej: "Eliminar evento"). */
  title: string
  /** Descripción del peligro (ej: "Se perderá toda la XP asociada."). */
  description: string
  /** Callback que se ejecuta al confirmar. Acá va la lógica de negocio (API call, etc). */
  onConfirm: () => void
  /** True mientras se ejecuta la acción (deshabilita botones, muestra loading). */
  loading?: boolean
  /**
   * Texto del botón de confirmación.
   * Default "Eliminar" porque la mayoría de confirmaciones son para borrar cosas.
   * Se puede cambiar a "Resetear", "Archivar", etc.
   */
  confirmText?: string
  /**
   * Variante visual:
   * - destructive: fondo rojo, para eliminar datos permanentemente
   * - warning: fondo amarillo/naranja, para acciones reversibles pero peligrosas
   * Default 'destructive' porque es el caso más común.
   */
  variant?: "destructive" | "warning"
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
  confirmText = "Eliminar",
  variant = "destructive",
}: ConfirmModalProps) {
  return (
    // size="sm" porque los modales de confirmación son simples:
    // solo ícono, texto y 2 botones. No necesitan más ancho.
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm">
      <div className="flex flex-col items-center gap-4 py-4">
        {/*
         * Ícono de advertencia centrado.
         * Usamos TriangleAlert (el "!" dentro de un triángulo) porque es
         * el estándar universal para "cuidado, esto puede salir mal".
         *
         * El color cambia según variant:
         * - destructive: rojo (text-error = #ef4444) -- peligro real
         * - warning: amarillo (text-pilar-fisico = #f59e0b) -- precaución
         *
         * Reutilizamos text-pilar-fisico para warning porque el amarillo
         * ya está definido en nuestro theme y no necesitamos otro color.
         */}
        <div
          className={
            variant === "destructive"
              ? "text-error"
              : "text-pilar-fisico"
          }
        >
          <TriangleAlert className="size-12" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {/*
       * Footer con los botones. flex-col-reverse en mobile para que
       * "Cancelar" quede abajo (más accesible con el pulgar).
       * En desktop (sm:) van en fila, Cancelar a la izquierda.
       */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {/*
         * Cancelar es "secondary" (no "outline" ni "ghost") porque
         * en dark mode necesita contraste suficiente sobre el fondo #111111.
         * secondary (#1a1a1a) le da suficiente presencia visual.
         *
         * disabled={loading} para evitar race conditions: si el usuario
         * clickea "Cancelar" mientras la API está respondiendo, podría
         * cerrar el modal y dejar la acción a medias.
         */}
        <Button
          variant="secondary"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          Cancelar
        </Button>

        {/*
         * El botón de confirmar usa variant "destructive" de shadcn que
         * ya tiene el estilo rojo correcto (#ef4444).
         * disabled={loading} para prevenir doble-click.
         */}
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Procesando..." : confirmText}
        </Button>
      </div>
    </Modal>
  )
}
