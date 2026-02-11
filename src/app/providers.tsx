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
 * QueryClientProvider: vendrá en el Paso 4 cuando agreguemos TanStack Query.
 */
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
