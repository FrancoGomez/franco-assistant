/**
 * Providers globales de la app.
 *
 * ¿Por qué un archivo separado? Porque los providers son Client Components
 * (usan contexto de React) y el layout root es un Server Component.
 * No podemos poner "use client" en el layout root porque perdemos
 * Server Components en toda la app. La solución: extraer los providers
 * a un Client Component y usarlo dentro del Server Component.
 *
 * SessionProvider: da acceso a useSession() en cualquier client component.
 * QueryClientProvider: TanStack Query para caché, revalidación, y estados de fetch.
 * TooltipProvider: necesario para que los tooltips de Radix funcionen globalmente.
 * Toaster: componente de sonner que renderiza las notificaciones toast.
 */
"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

/**
 * ¿Por qué useState para QueryClient?
 * En React 18+, los componentes se pueden re-renderizar sin desmontarse.
 * Si creamos el QueryClient fuera del componente o con useMemo, podríamos
 * compartir caché entre requests en SSR (data leak entre usuarios).
 * useState garantiza un QueryClient por instancia del componente.
 *
 * staleTime: 60s → los datos se consideran "frescos" por 1 minuto.
 * Evita refetches innecesarios cuando navegás entre páginas.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
