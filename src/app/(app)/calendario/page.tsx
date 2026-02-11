import { Calendar } from "lucide-react";

export default function CalendarioPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-sm text-gold mb-1">{"// TOOL_01"}</p>
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-foreground" />
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
            CALENDARIO
          </h1>
        </div>
        <p className="mt-1 text-muted-foreground">Organiza tu tiempo</p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-border-base bg-bg-card p-12">
        <p className="font-mono text-sm text-muted-foreground">
          En construcción...
        </p>
      </div>
    </div>
  );
}
