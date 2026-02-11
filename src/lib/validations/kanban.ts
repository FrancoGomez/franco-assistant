/**
 * Schemas de validación para Kanban (tableros, columnas, tareas).
 *
 * El sistema kanban tiene 3 niveles: Board → Column → Task.
 * Cada nivel tiene su propio schema porque se crean/editan por separado.
 *
 * Schemas especiales:
 * - moveTaskSchema: para drag & drop (solo necesita columnId + order)
 * - updateTaskSchema: no incluye columnId (mover entre columnas es moveTask)
 *
 * ¿Por qué separar moveTask de updateTask?
 * Porque son operaciones semánticamente diferentes:
 * - updateTask = editar contenido (título, descripción, prioridad)
 * - moveTask = drag & drop (cambiar posición/columna)
 * Mezclarlas haría el código más confuso y los permisos más difíciles.
 */

import { z } from "zod";
import { Pilar, TaskStatus, Priority } from "@/generated/prisma/client";

/** Regex para color hexadecimal (#RRGGBB) */
const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

// ─── Board ────────────────────────────────────────────────────────

export const createBoardSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),

  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional(),

  /**
   * Color del tablero en hex. Se usa para el borde/acento visual del board.
   * Default azul (#3b82f6) = el color de Capacidad, que es el más neutral.
   * Validamos hex porque queremos colores consistentes, no "rojo" o "rgb(...)".
   */
  color: z
    .string()
    .regex(hexColorRegex, "Debe ser un color hex válido (ej: #3b82f6)")
    .default("#3b82f6"),
});

export const updateBoardSchema = createBoardSchema.partial();

// ─── Column ───────────────────────────────────────────────────────

export const createColumnSchema = z.object({
  /**
   * Título más corto que board/task (max 50) porque las columnas
   * tienen espacio limitado en el header del kanban.
   */
  title: z.string().min(1, "El título es obligatorio").max(50, "Máximo 50 caracteres"),

  /** ID del board al que pertenece. String porque usamos CUID */
  boardId: z.string().min(1, "El boardId es obligatorio"),
});

// ─── Task ─────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  /**
   * Título más largo que otros (200) porque las tareas pueden ser
   * más descriptivas: "Implementar validación de formulario de registro con Zod"
   */
  title: z.string().min(1, "El título es obligatorio").max(200, "Máximo 200 caracteres"),

  /** Descripción más larga (1000) para especificaciones detalladas */
  description: z
    .string()
    .max(1000, "Máximo 1000 caracteres")
    .optional(),

  /** Pilar opcional — no toda tarea de kanban es de un pilar */
  pilar: z.enum(Pilar).optional(),

  /**
   * Status de la tarea. Default POR_HACER porque las tareas nuevas
   * empiezan en la primera columna.
   * Nota: el status se actualiza automáticamente al mover entre columnas,
   * pero también se puede setear manualmente.
   */
  status: z.enum(TaskStatus).default("POR_HACER"),

  deadline: z.coerce.date({ message: "Fecha inválida" }).optional(),

  /**
   * Prioridad para ordenar visualmente. Default MEDIA = prioridad normal.
   * ALTA se muestra con badge rojo, BAJA con gris.
   */
  priority: z.enum(Priority).default("MEDIA"),

  /**
   * XP por completar la tarea. Min 0 (algunas tareas son administrativas),
   * max 500 (menos que Event/Objective porque las tareas son más granulares).
   */
  xp: z
    .number()
    .int("La XP debe ser un número entero")
    .min(0, "La XP no puede ser negativa")
    .max(500, "Máximo 500 XP")
    .default(10),

  /** ID de la columna donde se crea la tarea */
  columnId: z.string().min(1, "El columnId es obligatorio"),
});

/**
 * Update NO incluye columnId. Si querés mover la tarea a otra columna,
 * usás moveTaskSchema. Esto separa "editar contenido" de "mover posición".
 */
export const updateTaskSchema = createTaskSchema.omit({ columnId: true }).partial();

/**
 * Schema para mover una tarea (drag & drop).
 * Solo necesita: a qué columna va y en qué posición.
 * El servicio se encarga de reordenar las demás tareas.
 */
export const moveTaskSchema = z.object({
  /** Columna destino (puede ser la misma si solo reordenás) */
  columnId: z.string().min(1, "El columnId es obligatorio"),

  /**
   * Posición dentro de la columna (0-based).
   * El servicio reordena las demás tareas automáticamente.
   */
  order: z.number().int("El orden debe ser entero").min(0, "El orden no puede ser negativo"),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
