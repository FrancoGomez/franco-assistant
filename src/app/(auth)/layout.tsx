/**
 * Layout para páginas de auth (login).
 *
 * ¿Por qué un layout separado con route group (auth)?
 * Las páginas de auth no tienen sidebar ni navegación.
 * Con route groups, Next.js aplica este layout solo a las rutas
 * dentro de (auth)/ sin afectar la URL (no agrega /auth/ al path).
 *
 * Resultado: /login usa este layout centrado, /dashboard usa el layout con sidebar.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base">
      {children}
    </div>
  );
}
