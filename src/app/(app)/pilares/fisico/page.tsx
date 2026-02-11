/**
 * Pilar: Físico — salud, ejercicio y bienestar.
 *
 * El color text-pilar-fisico (#f59e0b, amber) identifica este pilar.
 * Usamos Dumbbell de lucide-react como ícono representativo.
 */
import { Dumbbell } from "lucide-react";

export default function FisicoPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-sm text-gold mb-1">{"// PILAR_03"}</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-pilar-fisico flex items-center gap-3">
          <Dumbbell className="h-9 w-9" />
          FÍSICO
        </h1>
        <p className="mt-1 text-muted-foreground">
          Salud, ejercicio y bienestar
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
