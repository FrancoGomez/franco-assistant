/**
 * Schemas de validación para DopamineShield (escudo de dopamina).
 *
 * El escudo de dopamina es un sistema para trackear vicios de los que Franco
 * quiere alejarse. Cada día limpio acumula XP progresivamente (día 1 = xpPerDay,
 * día 2 = 2*xpPerDay, etc.). Una recaída resetea TODO el progreso.
 *
 * Hay dos operaciones distintas:
 * 1. CRUD del shield (crear/editar un vicio)
 * 2. Registrar recaída (operación especial con campos propios)
 *
 * Por eso hay schemas separados: el shield y la recaída son conceptos diferentes.
 */

import { z } from "zod";
import { Pilar, Intensity } from "@/generated/prisma/client";

export const createDopamineShieldSchema = z.object({
  /** Nombre del vicio. Ej: "Redes sociales", "Comida chatarra", "Procrastinar" */
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),

  /** Motivación para dejarlo. Aparece en el card como recordatorio */
  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional(),

  /**
   * A qué pilar afecta la XP de este vicio.
   * Ej: "Comida chatarra" → FISICO, "Redes sociales" → CAPACIDAD
   */
  pilar: z.enum(Pilar),

  /**
   * XP base por día limpio. La XP real de cada día es: díaActual × xpPerDay.
   * Día 1 = 50 XP, Día 2 = 100 XP, Día 3 = 150 XP, etc.
   * Min 1 porque 0 no tendría sentido. Max 500 para evitar inflación.
   * Default 50 = valor razonable para vicios comunes.
   */
  xpPerDay: z
    .number()
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 XP por día")
    .max(500, "Máximo 500 XP por día")
    .default(50),

  /**
   * Toggle para notificaciones diarias (futuro: integración con n8n).
   * Por ahora solo se guarda el flag, no hace nada funcional.
   */
  notifications: z.boolean().default(false),
});

export const updateDopamineShieldSchema = createDopamineShieldSchema.partial();

/**
 * Schema para registrar una recaída. Está separado del CRUD del shield
 * porque tiene campos completamente diferentes (reflexión, intensidad).
 *
 * La reflexión es clave para el crecimiento personal — Franco puede
 * escribir qué lo llevó a recaer y revisarlo después.
 */
export const relapseSchema = z.object({
  /**
   * Reflexión post-recaída. Opcional porque a veces no querés escribir
   * en el momento, pero se recomienda llenarla.
   * Max 1000 para permitir una reflexión más profunda que una descripción normal.
   */
  reflection: z
    .string()
    .max(1000, "Máximo 1000 caracteres")
    .optional(),

  /**
   * Intensidad de la recaída. Útil para ver patrones:
   * - LEVE: un desliz menor (ej: 5 min en redes)
   * - MODERADA: una recaída normal (ej: 1 hora en redes)
   * - FUERTE: una recaída seria (ej: todo el día en redes)
   */
  intensity: z.enum(Intensity),
});

export type CreateDopamineShieldInput = z.infer<typeof createDopamineShieldSchema>;
export type UpdateDopamineShieldInput = z.infer<typeof updateDopamineShieldSchema>;
export type RelapseInput = z.infer<typeof relapseSchema>;
