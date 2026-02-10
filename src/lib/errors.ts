import { NextResponse } from "next/server";

/**
 * Clases de error tipadas para la app.
 *
 * ¿Por qué clases custom en vez de `throw new Error()`?
 * Porque cada tipo de error tiene un status code HTTP diferente.
 * Con clases custom, `formatErrorResponse()` puede mapear automáticamente
 * el error al status code correcto sin necesidad de if/else chains.
 *
 * AppError es la base — nunca la tiramos directamente, usamos las específicas.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** 400 — Input inválido (falla validación Zod, campos faltantes, etc.) */
export class ValidationError extends AppError {
  constructor(message: string = "Datos inválidos") {
    super(message, 400, "VALIDATION_ERROR");
  }
}

/** 401 — No autenticado (no hay sesión, token expirado) */
export class AuthError extends AppError {
  constructor(message: string = "No autenticado") {
    super(message, 401, "AUTH_ERROR");
  }
}

/** 403 — Autenticado pero sin permisos */
export class ForbiddenError extends AppError {
  constructor(message: string = "Sin permisos") {
    super(message, 403, "FORBIDDEN");
  }
}

/** 404 — Recurso no encontrado */
export class NotFoundError extends AppError {
  constructor(message: string = "No encontrado") {
    super(message, 404, "NOT_FOUND");
  }
}

/**
 * Convierte cualquier error en una respuesta JSON consistente.
 *
 * ¿Por qué centralizar esto? Para que TODOS los endpoints devuelvan
 * el mismo formato de error: { error: { message, code } }.
 * El frontend puede confiar en esta estructura sin adivinar.
 *
 * Si el error es un AppError, usa su statusCode.
 * Si es cualquier otro error, devuelve 500 genérico (no leakear detalles internos).
 */
export function formatErrorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: error.statusCode }
    );
  }

  // Error desconocido — no exponer detalles internos al cliente
  console.error("Unhandled error:", error);
  return NextResponse.json(
    { error: { message: "Error interno del servidor", code: "INTERNAL_ERROR" } },
    { status: 500 }
  );
}
