/**
 * Historial — registro de toda la actividad del usuario.
 *
 * Acá se va a mostrar el timeline de eventos completados,
 * objetivos logrados, XP ganada/perdida, recaídas, etc.
 * Clock de lucide-react como ícono representativo del tiempo.
 */
import { Clock } from "lucide-react";

export default function HistorialPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-sm text-gold mb-1">{"// LOG_01"}</p>
        <h1 className="font-display text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <Clock className="h-9 w-9" />
          HISTORIAL
        </h1>
        <p className="mt-1 text-muted-foreground">
          Registro de toda tu actividad
        </p>
      </div>

      <div className="flex items-center justify-center rounded-lg border border-border-base bg-bg-card p-12">
        <p className="font-mono text-sm text-muted-foreground">
          En construcción...
        </p>
      </div>
    </div>
  );
}
