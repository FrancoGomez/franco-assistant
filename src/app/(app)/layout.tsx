/**
 * Layout de la app principal — sidebar + contenido.
 *
 * ¿Por qué es un Server Component (sin "use client")?
 * Porque no necesita estado ni hooks interactivos. Solo estructura
 * HTML. El Sidebar es un Client Component importado, pero este
 * layout en sí es server-rendered. Esto es más eficiente porque
 * Next.js puede renderizarlo en el servidor sin enviar JS al client.
 *
 * ¿Por qué flex en vez de grid?
 * El layout es simple: sidebar fijo a la izquierda + contenido que
 * ocupa el resto. Flexbox con flex-1 resuelve esto sin necesidad
 * de definir columnas. Grid sería overkill para 2 columnas donde
 * una es fija.
 */
import { Sidebar } from "@/components/shared/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
