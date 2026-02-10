export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-foreground">
          Franco Assistant
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          Setup completo — Paso 1
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <span className="inline-block h-3 w-3 rounded-full bg-pilar-financiacion" />
          <span className="inline-block h-3 w-3 rounded-full bg-pilar-capacidad" />
          <span className="inline-block h-3 w-3 rounded-full bg-pilar-fisico" />
          <span className="inline-block h-3 w-3 rounded-full bg-pilar-relaciones" />
        </div>
        <p className="mt-2 font-mono text-xs text-gold">
          XP: 0 / 100
        </p>
      </div>
    </div>
  );
}
