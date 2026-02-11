/**
 * Schemas de validación para PilarMetric (métricas diarias por pilar).
 *
 * ¿Por qué un schema plano con todos los campos opcionales en vez de
 * un discriminatedUnion por pilar?
 *
 * 1. La tabla PilarMetric en Prisma es una sola tabla con campos opcionales.
 *    Un discriminatedUnion generaría tipos que no matchean con el modelo.
 * 2. El servicio ya valida que los campos correspondan al pilar correcto.
 *    Duplicar esa lógica en Zod agregaría complejidad sin beneficio real.
 * 3. Desde el frontend, cada pilar tiene su propio formulario que solo
 *    muestra los campos relevantes. El schema plano acepta cualquier
 *    combinación y el servicio filtra lo que no corresponde.
 *
 * Es el patrón "schema permisivo + servicio estricto":
 * - Zod valida tipos y rangos (que un número sea número, que esté en rango)
 * - El servicio valida lógica de negocio (que los campos matcheen el pilar)
 */

import { z } from "zod";
import { Pilar, EnergyLevel, RelationshipQuality } from "@/generated/prisma/client";

export const createMetricSchema = z.object({
  /** Pilar al que corresponde esta métrica */
  pilar: z.enum(Pilar),

  /**
   * Fecha de la métrica. Solo puede haber una métrica por pilar por día
   * (constraint @@unique([userId, pilar, date]) en Prisma).
   */
  date: z.coerce.date({ message: "Fecha inválida" }),

  // ─── Financiación ───────────────────────────────────────────────
  /** Ingresos del día. >= 0 porque no existen ingresos negativos */
  ingresos: z.number().min(0, "Los ingresos no pueden ser negativos").optional(),
  /** Gastos del día. >= 0 porque se registran como positivos */
  gastos: z.number().min(0, "Los gastos no pueden ser negativos").optional(),
  /**
   * Ahorro del día. Puede ser negativo (si gastaste más de lo que ingresaste).
   * No tiene constraint de min porque es un cálculo que puede dar negativo.
   */
  ahorro: z.number().optional(),

  // ─── Capacidad ──────────────────────────────────────────────────
  /** Horas de concentración real (deep work). 0-24 por día */
  horasConcentrado: z
    .number()
    .min(0, "Mínimo 0 horas")
    .max(24, "Máximo 24 horas")
    .optional(),
  /** Horas de trabajo no concentrado (shallow work). 0-24 por día */
  horasNoConcentrado: z
    .number()
    .min(0, "Mínimo 0 horas")
    .max(24, "Máximo 24 horas")
    .optional(),
  /** Nivel de energía subjetivo del día */
  energyLevel: z.enum(EnergyLevel).optional(),

  // ─── Físico ─────────────────────────────────────────────────────
  /** Peso en kg. > 0 porque un peso de 0 no es posible */
  peso: z
    .number()
    .positive("El peso debe ser mayor a 0")
    .optional(),
  /** Horas de sueño. 0-24 por día */
  horasSueno: z
    .number()
    .min(0, "Mínimo 0 horas")
    .max(24, "Máximo 24 horas")
    .optional(),
  /** ¿Entrenó hoy? Simple boolean, sin matices */
  entrenamientoHoy: z.boolean().optional(),

  // ─── Relaciones ─────────────────────────────────────────────────
  /** Cantidad de interacciones sociales significativas. Entero >= 0 */
  interaccionesSociales: z
    .number()
    .int("Debe ser un número entero")
    .min(0, "Mínimo 0 interacciones")
    .optional(),
  /** Calidad general de las interacciones del día */
  calidad: z.enum(RelationshipQuality).optional(),
  /** Notas libres sobre el día social */
  notas: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional(),
});

export type CreateMetricInput = z.infer<typeof createMetricSchema>;
