/**
 * Escudo de Dopamina — sistema de defensa contra vicios.
 *
 * Esta es una de las features más únicas de la app: trackear
 * días sin recaída en vicios, con XP acumulada que se pierde
 * en caso de recaída. El ícono Shield representa la protección.
 */
import { Shield } from "lucide-react";

export default function EscudoDopaminaPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-sm text-gold mb-1">{"// DEFENSE_SYS"}</p>
        <h1 className="font-display text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <Shield className="h-9 w-9" />
          ESCUDO DE DOPAMINA
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tu escudo contra los vicios
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
