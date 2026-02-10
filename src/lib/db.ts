import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma client singleton con Driver Adapter.
 *
 * ¿Por qué un Driver Adapter? Prisma 7 eliminó su engine binario.
 * Ahora usa adaptadores nativos de Node.js para conectarse a la DB.
 * Para PostgreSQL, usamos @prisma/adapter-pg que wrappea el driver `pg`.
 * Esto da mejor performance y menor tamaño de bundle.
 *
 * ¿Por qué un singleton? En desarrollo, Next.js hace hot-reload y re-ejecuta
 * los módulos. Sin el singleton, cada reload crearía una nueva conexión a la DB,
 * y rápidamente llegaríamos al límite de conexiones de PostgreSQL.
 *
 * La solución: guardamos la instancia en `globalThis` (que persiste entre
 * hot-reloads) y solo creamos una nueva si no existe.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
