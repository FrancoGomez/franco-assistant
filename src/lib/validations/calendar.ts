/**
 * Schemas de validación para CalendarEvent (eventos de calendario).
 *
 * CalendarEvent es DIFERENTE de Event (evento de pilar). Las diferencias clave:
 * - CalendarEvent tiene hora inicio/fin (startTime + endTime)
 * - El pilar es OPCIONAL (no todo en el calendario pertenece a un pilar)
 * - Tiene campo de notas adicional
 * - XP default es 0 (muchos eventos de calendario no dan XP)
 *
 * ¿Por qué no unificar Event y CalendarEvent?
 * Porque tienen semántica diferente. Un Event de pilar es un hábito/tarea
 * con recurrencia y XP. Un CalendarEvent es una cita/reunión/bloque de tiempo.
 * Mezclarlos complicaría ambas interfaces.
 */

import { z } from "zod";
import { Pilar } from "@/generated/prisma/client";

/** Regex para formato HH:mm (00:00 a 23:59) */
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createCalendarEventSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),

  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional(),

  /**
   * Pilar OPCIONAL. Un evento de calendario puede no estar asociado a ningún pilar.
   * Ej: "Dentista" no es de ningún pilar, pero "Sesión de gym" sí es FISICO.
   */
  pilar: z.enum(Pilar).optional(),

  date: z.coerce.date({ message: "Fecha inválida" }),

  /**
   * Hora de inicio y fin. Ambas opcionales porque un evento puede ser
   * "todo el día" (sin hora específica).
   * Validación HH:mm asegura formato consistente.
   */
  startTime: z
    .string()
    .regex(timeRegex, "Formato inválido. Usá HH:mm (ej: 09:00)")
    .optional(),
  endTime: z
    .string()
    .regex(timeRegex, "Formato inválido. Usá HH:mm (ej: 10:30)")
    .optional(),

  /** Notas adicionales. Más largo que description (1000 vs 500) para permitir detalle */
  notes: z
    .string()
    .max(1000, "Máximo 1000 caracteres")
    .optional(),

  /**
   * XP default 0 (no 10 como en Event) porque muchos eventos de calendario
   * no son "logros" — son simplemente citas o bloques de tiempo.
   * Min 0 (no 1) por la misma razón: 0 XP es válido acá.
   */
  xp: z
    .number()
    .int("La XP debe ser un número entero")
    .min(0, "La XP no puede ser negativa")
    .max(1000, "Máximo 1000 XP")
    .default(0),
});

export const updateCalendarEventSchema = createCalendarEventSchema.partial();

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;
