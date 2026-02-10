/**
 * Sistema de XP y niveles — funciones puras.
 *
 * ¿Por qué funciones puras separadas? Porque esta lógica se usa en:
 * - Servicios del backend (calcular nivel al completar eventos)
 * - Componentes de UI (mostrar barras de progreso)
 * - Tests (verificar cálculos)
 *
 * Al ser funciones puras (sin dependencia de React, Prisma, ni HTTP),
 * son fáciles de testear y reutilizar en cualquier contexto.
 *
 * Fórmula de niveles:
 * - Nivel N necesita: sum(1..N-1) * 100 = (N-1)*N/2 * 100 XP acumulada
 * - Nivel 1→2: 100 XP | Nivel 2→3: 300 XP | Nivel 3→4: 600 XP
 *
 * La implementación completa viene en el Paso 5 de la guía.
 */

/** XP total necesaria para LLEGAR a un nivel dado. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return ((level - 1) * level) / 2 * 100;
}

/** Dado XP total, calcula el nivel actual. */
export function calculateLevel(totalXP: number): number {
  if (totalXP <= 0) return 1;
  // Resolvemos: (level-1)*level/2 * 100 <= totalXP
  // level^2 - level - 2*totalXP/100 <= 0
  // level <= (1 + sqrt(1 + 8*totalXP/100)) / 2
  const level = Math.floor((1 + Math.sqrt(1 + (8 * totalXP) / 100)) / 2);
  return Math.max(1, level);
}

/** XP progreso dentro del nivel actual (para barras de progreso). */
export function xpProgress(totalXP: number): {
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const level = calculateLevel(totalXP);
  const currentLevelStart = xpForLevel(level);
  const nextLevelStart = xpForLevel(level + 1);
  const xpInLevel = totalXP - currentLevelStart;
  const xpNeeded = nextLevelStart - currentLevelStart;

  return {
    currentLevelXP: xpInLevel,
    nextLevelXP: xpNeeded,
    progress: xpNeeded > 0 ? xpInLevel / xpNeeded : 0,
  };
}

/**
 * XP acumulada del escudo de dopamina.
 * Fórmula: días × (días + 1) / 2 × xpPorDía
 *
 * ¿Por qué esta fórmula? Porque cada día suma más XP que el anterior
 * (día 1 = 1×xpPorDía, día 2 = 2×xpPorDía, etc.).
 * Es una progresión aritmética: sum(1..n) = n(n+1)/2
 */
export function calculateDopamineXP(days: number, xpPerDay: number): number {
  if (days <= 0 || xpPerDay <= 0) return 0;
  return (days * (days + 1)) / 2 * xpPerDay;
}

/** XP que da un día específico del escudo. */
export function calculateDopamineDailyXP(
  day: number,
  xpPerDay: number
): number {
  if (day <= 0 || xpPerDay <= 0) return 0;
  return day * xpPerDay;
}
