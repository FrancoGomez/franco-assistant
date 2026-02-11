/**
 * Schemas de validación para filtros del historial (HistoryEntry).
 *
 * A diferencia de los otros schemas, este NO es para crear/editar entidades.
 * Las HistoryEntry se crean automáticamente cuando completás un evento,
 * objetivo, etc. Este schema valida los FILTROS de búsqueda.
 *
 * ¿Por qué validar filtros con Zod?
 * Porque los filtros vienen como query params del URL, que son siempre strings.
 * Zod nos permite:
 * 1. Coercionar tipos (string "2024-01-15" → Date)
 * 2. Validar rangos (sortBy solo acepta "recent" o "oldest")
 * 3. Dar defaults (sortBy default "recent")
 * 4. Inferir el tipo del objeto filtro completo
 */

import { z } from "zod";
import { Pilar, HistoryEntryType } from "@/generated/prisma/client";

export const historyFiltersSchema = z.object({
  /** Filtrar por pilar. Si no se manda, muestra todos los pilares */
  pilar: z.enum(Pilar).optional(),

  /**
   * Filtrar por tipo de fuente. Útil para ver solo eventos,
   * solo objetivos, solo dopamina, etc.
   */
  sourceType: z.enum(HistoryEntryType).optional(),

  /**
   * Rango de fechas. Ambas opcionales — se pueden usar juntas o por separado.
   * Ej: solo dateFrom = "desde tal fecha en adelante"
   * Ej: solo dateTo = "hasta tal fecha"
   * Ej: ambas = rango cerrado
   */
  dateFrom: z.coerce.date({ message: "Fecha inválida" }).optional(),
  dateTo: z.coerce.date({ message: "Fecha inválida" }).optional(),

  /** Búsqueda por texto en el título. Max 100 para evitar queries enormes */
  search: z
    .string()
    .max(100, "Máximo 100 caracteres de búsqueda")
    .optional(),

  /**
   * Orden de resultados. Solo dos opciones porque el historial
   * solo tiene sentido ordenado por fecha.
   * Default "recent" porque casi siempre querés ver lo último primero.
   */
  sortBy: z.enum(["recent", "oldest"]).default("recent"),

  /**
   * Cursor para paginación basada en cursor (no offset).
   * ¿Por qué cursor y no page/offset?
   * - Cursor es más eficiente con grandes volúmenes de datos
   * - No se "rompe" cuando se insertan nuevos registros
   * - Es el estándar para feeds cronológicos (como el historial)
   * El cursor es el ID de la última entrada que viste.
   */
  cursor: z.string().optional(),
});

export type HistoryFiltersInput = z.infer<typeof historyFiltersSchema>;
