/**
 * Route handler de NextAuth.
 *
 * ¿Por qué solo dos líneas? En NextAuth v5, toda la config vive en auth.ts.
 * Este archivo solo re-exporta los handlers GET y POST que NextAuth necesita.
 * El catch-all [...nextauth] captura todas las rutas de auth:
 * /api/auth/signin, /api/auth/signout, /api/auth/callback, etc.
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
