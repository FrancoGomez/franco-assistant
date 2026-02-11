/**
 * Middleware de autenticación.
 *
 * ¿Por qué middleware y no verificar auth en cada página?
 * Porque el middleware corre ANTES del render, a nivel de edge.
 * Si el usuario no está autenticado, lo redirige al login sin siquiera
 * cargar el JavaScript de la página. Es más rápido y seguro.
 *
 * El matcher excluye:
 * - /login → para que puedas acceder sin estar logueado
 * - /api/auth → para que NextAuth funcione (signin, callback, etc.)
 * - /_next, favicon, archivos estáticos → recursos del framework
 */
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLogin = req.nextUrl.pathname === "/login";
  const isAuthApi = req.nextUrl.pathname.startsWith("/api/auth");

  // Si está en el login y ya está logueado → mandarlo al dashboard
  if (isOnLogin && isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl.origin));
  }

  // Si no está logueado y no está en login ni en auth API → mandarlo al login
  if (!isLoggedIn && !isOnLogin && !isAuthApi) {
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
