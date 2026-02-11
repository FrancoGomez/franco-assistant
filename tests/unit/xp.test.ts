/**
 * Tests del sistema de XP y niveles.
 *
 * Estas funciones son el corazon del sistema de gamificacion.
 * Las testeamos exhaustivamente porque un error aca propagaria
 * datos incorrectos a toda la UI (barras de progreso, niveles,
 * escudo de dopamina) y a la logica de negocio (completar eventos,
 * recaidas, etc.).
 *
 * Son funciones puras, asi que los tests son directos:
 * input -> output esperado, sin mocks ni setup.
 */
import {
  xpForLevel,
  calculateLevel,
  xpProgress,
  calculateDopamineXP,
  calculateDopamineDailyXP,
} from "@/lib/xp";

// ---------------------------------------------------------------------------
// 1. xpForLevel — XP total necesaria para LLEGAR a un nivel
// ---------------------------------------------------------------------------
// Formula: (level-1) * level / 2 * 100
// Nivel 1 es el base (0 XP), nivel 2 requiere 100, etc.
// Es una suma aritmetica: para llegar al nivel N necesitas
// 100 + 200 + ... + (N-1)*100 = sum(1..N-1) * 100 XP acumulada.
describe("xpForLevel", () => {
  it("level 1 needs 0 XP (starting level)", () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it("level 2 needs 100 XP", () => {
    expect(xpForLevel(2)).toBe(100);
  });

  it("level 3 needs 300 XP", () => {
    expect(xpForLevel(3)).toBe(300);
  });

  it("level 4 needs 600 XP", () => {
    expect(xpForLevel(4)).toBe(600);
  });

  it("level 5 needs 1000 XP", () => {
    expect(xpForLevel(5)).toBe(1000);
  });

  it("level 0 returns 0 (defensive, level cant be below 1)", () => {
    expect(xpForLevel(0)).toBe(0);
  });

  it("negative level returns 0", () => {
    expect(xpForLevel(-3)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 2. calculateLevel — Dado XP total, devuelve el nivel actual
// ---------------------------------------------------------------------------
// Invierte la formula de xpForLevel. Si tenes 150 XP, estas en nivel 2
// porque 100 <= 150 < 300 (necesitas 300 para nivel 3).
describe("calculateLevel", () => {
  it("0 XP = level 1", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("50 XP = level 1 (not enough for level 2)", () => {
    expect(calculateLevel(50)).toBe(1);
  });

  it("100 XP = level 2 (exactly the threshold)", () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it("150 XP = level 2 (between level 2 and 3)", () => {
    expect(calculateLevel(150)).toBe(2);
  });

  it("299 XP = level 2 (one XP short of level 3)", () => {
    expect(calculateLevel(299)).toBe(2);
  });

  it("300 XP = level 3 (exactly the threshold)", () => {
    expect(calculateLevel(300)).toBe(3);
  });

  it("600 XP = level 4", () => {
    expect(calculateLevel(600)).toBe(4);
  });

  it("1000 XP = level 5", () => {
    expect(calculateLevel(1000)).toBe(5);
  });

  it("negative XP = level 1 (defensive)", () => {
    expect(calculateLevel(-100)).toBe(1);
  });

  it("large XP (10000) returns correct level", () => {
    // (1 + sqrt(1 + 8*10000/100)) / 2 = (1 + sqrt(801)) / 2 ~= 14.65
    // floor(14.65) = 14
    expect(calculateLevel(10000)).toBe(14);
  });
});

// ---------------------------------------------------------------------------
// 3. xpProgress — Progreso dentro del nivel actual (para barras de UI)
// ---------------------------------------------------------------------------
// Devuelve cuanto XP llevas en el nivel actual, cuanto necesitas para
// el siguiente, y un ratio 0-1 para la barra de progreso.
describe("xpProgress", () => {
  it("0 XP: level 1, 0/100 progress", () => {
    const result = xpProgress(0);
    expect(result.currentLevelXP).toBe(0);
    expect(result.nextLevelXP).toBe(100);
    expect(result.progress).toBe(0);
  });

  it("50 XP: level 1, 50/100 = 0.5 progress", () => {
    const result = xpProgress(50);
    expect(result.currentLevelXP).toBe(50);
    expect(result.nextLevelXP).toBe(100);
    expect(result.progress).toBe(0.5);
  });

  it("100 XP: level 2, 0/200 progress (just reached level 2)", () => {
    // Al llegar exacto a nivel 2, empezas de 0 en ese nivel.
    // El tramo nivel 2 -> 3 requiere 300 - 100 = 200 XP.
    const result = xpProgress(100);
    expect(result.currentLevelXP).toBe(0);
    expect(result.nextLevelXP).toBe(200);
    expect(result.progress).toBe(0);
  });

  it("250 XP: level 2, 150/200 = 0.75 progress", () => {
    // Nivel 2 empieza en 100 XP, nivel 3 en 300 XP.
    // 250 - 100 = 150 XP dentro del nivel, tramo = 200.
    const result = xpProgress(250);
    expect(result.currentLevelXP).toBe(150);
    expect(result.nextLevelXP).toBe(200);
    expect(result.progress).toBe(0.75);
  });
});

// ---------------------------------------------------------------------------
// 4. calculateDopamineXP — XP acumulada total del escudo de dopamina
// ---------------------------------------------------------------------------
// Formula: days * (days + 1) / 2 * xpPerDay
// Es una progresion aritmetica: dia 1 da 1*xpPerDay, dia 2 da 2*xpPerDay, etc.
// Esto incentiva mantener la racha porque cada dia vale MAS que el anterior.
describe("calculateDopamineXP", () => {
  it("0 days = 0 XP", () => {
    expect(calculateDopamineXP(0, 50)).toBe(0);
  });

  it("1 day, 50 xpPerDay = 50 XP", () => {
    // sum(1) * 50 = 1 * 50 = 50
    expect(calculateDopamineXP(1, 50)).toBe(50);
  });

  it("3 days, 50 xpPerDay = 300 XP", () => {
    // (50 + 100 + 150) = sum(1..3) * 50 = 6 * 50 = 300
    expect(calculateDopamineXP(3, 50)).toBe(300);
  });

  it("7 days, 50 xpPerDay = 1400 XP", () => {
    // sum(1..7) * 50 = 28 * 50 = 1400
    expect(calculateDopamineXP(7, 50)).toBe(1400);
  });

  it("14 days, 100 xpPerDay = 10500 XP", () => {
    // sum(1..14) * 100 = 105 * 100 = 10500
    expect(calculateDopamineXP(14, 100)).toBe(10500);
  });

  it("negative days = 0 XP (defensive)", () => {
    expect(calculateDopamineXP(-5, 50)).toBe(0);
  });

  it("negative xpPerDay = 0 XP (defensive)", () => {
    expect(calculateDopamineXP(10, -20)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 5. calculateDopamineDailyXP — XP de un dia especifico del escudo
// ---------------------------------------------------------------------------
// Formula: day * xpPerDay
// El dia 1 da 1*xpPerDay, el dia 5 da 5*xpPerDay.
// Se usa para mostrar en la UI cuanto XP va a dar el dia actual.
describe("calculateDopamineDailyXP", () => {
  it("day 1, 50 xpPerDay = 50 XP", () => {
    expect(calculateDopamineDailyXP(1, 50)).toBe(50);
  });

  it("day 5, 50 xpPerDay = 250 XP", () => {
    expect(calculateDopamineDailyXP(5, 50)).toBe(250);
  });

  it("day 10, 100 xpPerDay = 1000 XP", () => {
    expect(calculateDopamineDailyXP(10, 100)).toBe(1000);
  });

  it("day 0 = 0 XP (defensive)", () => {
    expect(calculateDopamineDailyXP(0, 50)).toBe(0);
  });

  it("negative day = 0 XP (defensive)", () => {
    expect(calculateDopamineDailyXP(-3, 50)).toBe(0);
  });
});
