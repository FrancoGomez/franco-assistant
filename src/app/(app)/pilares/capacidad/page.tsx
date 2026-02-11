/**
 * Pilar: Capacidad — desarrollo intelectual y profesional.
 *
 * Misma estructura que los otros pilares. El color text-pilar-capacidad
 * (#3b82f6, azul) identifica visualmente este pilar en toda la app.
 */
import { Brain } from "lucide-react";

export default function CapacidadPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-sm text-gold mb-1">{"// PILAR_02"}</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-pilar-capacidad flex items-center gap-3">
          <Brain className="h-9 w-9" />
          CAPACIDAD
        </h1>
        <p className="mt-1 text-muted-foreground">
          Desarrollo intelectual y profesional
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
