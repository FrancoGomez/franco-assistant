/**
 * Dashboard — página principal de la app ("/").
 *
 * ¿Por qué es Server Component (sin "use client")?
 * Porque este placeholder no necesita estado ni interactividad.
 * Cuando lo reemplacemos con el dashboard real, evaluamos si
 * necesita partes client (gráficos interactivos, etc.), pero
 * por ahora el server rendering es más eficiente: cero JS
 * enviado al browser para este componente.
 *
 * ¿Por qué vive en (app)/page.tsx y no en app/page.tsx?
 * Porque el route group (app) tiene un layout con el Sidebar.
 * Al estar dentro de (app)/, esta página hereda ese layout
 * automáticamente. Si estuviera en app/page.tsx (como el
 * placeholder anterior), no tendría el sidebar.
 */
export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-sm text-gold mb-1">{"// SYS_OVERVIEW"}</p>
        <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
          DASHBOARD
        </h1>
        <p className="mt-1 text-muted-foreground">
          Bienvenido de vuelta, Franco
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
