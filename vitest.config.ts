/**
 * Config de Vitest.
 *
 * ¿Por qué Vitest y no Jest?
 * - Usa la misma config de TypeScript/ESM que Vite/Next.js
 * - Soporta path aliases (@/) sin config extra
 * - Mucho más rápido que Jest para proyectos TypeScript
 * - Compatible con la API de Jest (describe, it, expect)
 */
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
