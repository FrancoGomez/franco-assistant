/**
 * Schemas de validación para Objective (objetivos a largo plazo).
 *
 * Los objetivos se diferencian de los eventos en que:
 * - No se repiten (no hay recurrence)
 * - Tienen deadline opcional (fecha límite)
 * - Pueden ser "milestone" (hito importante, se muestra con estilo dorado)
 * - Dan más XP por defecto (25 vs 10) porque son logros más grandes
 */

import { z } from "zod";
import { Pilar } from "@/generated/prisma/client";

export const createObjectiveSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),

  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional(),

  pilar: z.enum(Pilar),

  /**
   * Deadline opcional. No todos los objetivos tienen fecha límite.
   * Ejemplo: "Leer 12 libros este año" tiene deadline, pero
   * "Aprender a tocar guitarra" quizás no.
   */
  deadline: z.coerce.date({ message: "Fecha inválida" }).optional(),

  /**
   * XP más alta que eventos porque los objetivos representan logros mayores.
   * Default 25 = un objetivo normal. Un milestone puede tener más.
   */
  xp: z
    .number()
    .int("La XP debe ser un número entero")
    .min(1, "Mínimo 1 XP")
    .max(1000, "Máximo 1000 XP")
    .default(25),

  /**
   * Milestone = hito importante. Se muestra con borde dorado y estrella.
   * Ejemplo: "Primer cliente" en Financiación, "Correr 10K" en Físico.
   * Default false porque la mayoría de objetivos son normales.
   */
  milestone: z.boolean().default(false),
});

/**
 * Partial para PATCH — solo mandás los campos que cambiaron.
 * Ejemplo: si solo querés cambiar el título, mandás { title: "Nuevo título" }
 * sin necesidad de incluir pilar, xp, etc.
 */
export const updateObjectiveSchema = createObjectiveSchema.partial();

export type CreateObjectiveInput = z.infer<typeof createObjectiveSchema>;
export type UpdateObjectiveInput = z.infer<typeof updateObjectiveSchema>;
