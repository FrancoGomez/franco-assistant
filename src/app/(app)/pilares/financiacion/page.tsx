/**
 * Pilar: Financiación — gestión financiera y monetaria.
 *
 * ¿Por qué importamos el ícono de lucide-react en un Server Component?
 * Los íconos de lucide-react son componentes que renderizan SVG puro.
 * No usan hooks ni estado, así que funcionan perfecto en Server
 * Components. Next.js los renderiza en el servidor y envía el SVG
 * ya generado al browser — sin JS adicional.
 *
 * ¿Por qué text-pilar-financiacion?
 * Es una clase custom definida en globals.css (--color-pilar-financiacion: #22c55e).
 * Cada pilar tiene su color semántico para que sea consistente en toda la app.
 */
import { DollarSign } from "lucide-react";

export default function FinanciacionPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-sm text-gold mb-1">{"// PILAR_01"}</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-pilar-financiacion flex items-center gap-3">
          <DollarSign className="h-9 w-9" />
          FINANCIACIÓN
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gestión financiera y monetaria
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
