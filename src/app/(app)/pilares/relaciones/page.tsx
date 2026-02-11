/**
 * Pilar: Relaciones — conexiones y vida social.
 *
 * El color text-pilar-relaciones (#f43f5e, rose) identifica este pilar.
 * Heart de lucide-react como ícono representativo.
 */
import { Heart } from "lucide-react";

export default function RelacionesPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-sm text-gold mb-1">{"// PILAR_04"}</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-pilar-relaciones flex items-center gap-3">
          <Heart className="h-9 w-9" />
          RELACIONES
        </h1>
        <p className="mt-1 text-muted-foreground">
          Conexiones y vida social
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
