/**
 * Schemas de validación para Event (eventos de pilar).
 *
 * Se usan en dos lugares:
 * 1. Route handlers (API) — validan el body del request antes de pasarlo al servicio.
 *    Esto es la línea de defensa real; nunca confiamos en datos del client.
 * 2. React Hook Form (frontend) — validan en tiempo real mientras el usuario tipea.
 *    Mismos schemas = mismas reglas, cero desincronización.
 *
 * ¿Por qué Zod y no validación manual?
 * Porque Zod nos da validación + tipos TypeScript del mismo schema.
 * Si cambiás el schema, los tipos se actualizan solos — imposible que se desincronicen.
 */

import { z } from "zod";
import { Pilar, Recurrence } from "@/generated/prisma/client";

/**
 * Regex para formato HH:mm (00:00 a 23:59).
 * Usamos string en vez de Date para la hora porque:
 * 1. No necesitamos operaciones de tiempo (sumar, restar)
 * 2. Date incluye fecha + zona horaria, que no queremos
 * 3. Un string "14:30" es más simple de guardar y mostrar
 */
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createEventSchema = z.object({
  /** Título del evento. Min 1 para evitar títulos vacíos, max 100 para UI consistente */
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),

  /** Descripción opcional — max 500 para no abusar del espacio en cards */
  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional(),

  /** Pilar al que pertenece. Usamos z.enum() con el const object de Prisma */
  pilar: z.enum(Pilar),

  /**
   * Recurrencia. Default NONE = evento único.
   * Si es recurrente, las completaciones se trackean en EventCompletion (tabla separada).
   * Si es NONE, se usa el campo `completed` directamente en Event.
   */
  recurrence: z.enum(Recurrence).default("NONE"),

  /**
   * Fecha del evento. z.coerce.date() acepta strings ISO, timestamps, etc.
   * y los convierte a Date automáticamente.
   * Esto es clave porque el frontend manda strings JSON y necesitamos Date en el server.
   */
  date: z.coerce.date({ message: "Fecha inválida" }),

  /** Hora opcional en formato HH:mm. Null si el evento es "todo el día" */
  time: z
    .string()
    .regex(timeRegex, "Formato inválido. Usá HH:mm (ej: 14:30)")
    .optional(),

  /**
   * XP que otorga al completarse. Min 1 porque 0 XP no tiene sentido
   * (¿para qué crear un evento que no da XP?). Max 1000 para evitar inflación.
   * Default 10 = un evento normal, bajo esfuerzo.
   */
  xp: z
    .number()
    .int("La XP debe ser un número entero")
    .min(1, "Mínimo 1 XP")
    .max(1000, "Máximo 1000 XP")
    .default(10),
});

/**
 * Schema para actualizar un evento. .partial() hace que TODOS los campos
 * sean opcionales. Así el client solo manda los campos que cambiaron,
 * no todo el objeto completo. Esto es el patrón estándar para PATCH requests.
 */
export const updateEventSchema = createEventSchema.partial();

/** Tipos inferidos del schema — los usa el servicio para tipar sus parámetros */
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
