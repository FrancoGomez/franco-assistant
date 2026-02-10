/**
 * Seed de datos de ejemplo.
 *
 * ¿Por qué un seed completo? Para desarrollar UI contra datos reales.
 * Sin datos, cada componente se ve vacío y no podemos verificar layouts,
 * colores, formatos de fecha, barras de XP, etc.
 *
 * Ejecutar: npx prisma db seed
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Limpiar datos previos (orden importa por foreign keys)
  await prisma.dopamineRelapse.deleteMany();
  await prisma.dopamineShield.deleteMany();
  await prisma.eventCompletion.deleteMany();
  await prisma.event.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.historyEntry.deleteMany();
  await prisma.pilarMetric.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.kanbanTask.deleteMany();
  await prisma.kanbanColumn.deleteMany();
  await prisma.kanbanBoard.deleteMany();
  await prisma.pilarProgress.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================
  // USUARIO
  // ============================================================
  const hashedPassword = await hash("franco123", 12);
  const user = await prisma.user.create({
    data: {
      name: "Franco",
      email: "franco@assistant.dev",
      hashedPassword,
    },
  });
  console.log("✅ User created:", user.email);

  // ============================================================
  // PILAR PROGRESS — 4 registros, XP y niveles variados
  // ============================================================
  const pilarProgresses = await Promise.all([
    prisma.pilarProgress.create({
      data: { userId: user.id, pilar: "FINANCIACION", level: 3, totalXP: 450 },
    }),
    prisma.pilarProgress.create({
      data: { userId: user.id, pilar: "CAPACIDAD", level: 4, totalXP: 780 },
    }),
    prisma.pilarProgress.create({
      data: { userId: user.id, pilar: "FISICO", level: 2, totalXP: 220 },
    }),
    prisma.pilarProgress.create({
      data: { userId: user.id, pilar: "RELACIONES", level: 2, totalXP: 180 },
    }),
  ]);
  console.log("✅ Pilar progresses created:", pilarProgresses.length);

  // ============================================================
  // EVENTOS — 3-4 por pilar, variando tipo y recurrencia
  // ============================================================
  const events = await Promise.all([
    // Financiación
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Revisar presupuesto mensual",
        description: "Comparar gastos reales vs presupuesto planificado",
        pilar: "FINANCIACION",
        recurrence: "MONTHLY",
        date: today(),
        time: "09:00",
        xp: 30,
      },
    }),
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Registrar gastos del día",
        pilar: "FINANCIACION",
        recurrence: "DAILY",
        date: today(),
        time: "21:00",
        xp: 10,
      },
    }),
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Transferir a cuenta de ahorro",
        pilar: "FINANCIACION",
        recurrence: "WEEKLY",
        date: today(),
        time: "10:00",
        xp: 20,
      },
    }),
    // Capacidad
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Deep work — proyecto principal",
        description: "2 horas de trabajo enfocado sin distracciones",
        pilar: "CAPACIDAD",
        recurrence: "DAILY",
        date: today(),
        time: "08:00",
        xp: 25,
      },
    }),
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Leer 30 minutos",
        pilar: "CAPACIDAD",
        recurrence: "DAILY",
        date: today(),
        time: "22:00",
        xp: 15,
      },
    }),
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Revisar notas de la semana",
        pilar: "CAPACIDAD",
        recurrence: "WEEKLY",
        date: today(),
        time: "18:00",
        xp: 20,
      },
    }),
    // Físico
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Entrenar en el gym",
        description: "Rutina de fuerza - upper/lower split",
        pilar: "FISICO",
        recurrence: "DAILY",
        date: today(),
        time: "07:00",
        xp: 30,
      },
    }),
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Preparar meal prep",
        pilar: "FISICO",
        recurrence: "WEEKLY",
        date: today(),
        time: "11:00",
        xp: 15,
      },
    }),
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Pesarse y registrar",
        pilar: "FISICO",
        recurrence: "WEEKLY",
        date: today(),
        time: "07:30",
        xp: 5,
      },
    }),
    // Relaciones
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Llamar a un amigo/familiar",
        pilar: "RELACIONES",
        recurrence: "WEEKLY",
        date: today(),
        time: "19:00",
        xp: 20,
      },
    }),
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Escribir mensaje de gratitud",
        pilar: "RELACIONES",
        recurrence: "DAILY",
        date: today(),
        time: "21:30",
        xp: 10,
      },
    }),
    prisma.event.create({
      data: {
        userId: user.id,
        title: "Salir a comer con amigos",
        description: "Reunión mensual del grupo",
        pilar: "RELACIONES",
        recurrence: "MONTHLY",
        date: today(),
        time: "20:00",
        xp: 35,
      },
    }),
  ]);

  // Completaciones de eventos recurrentes (últimos días)
  for (const event of events.slice(0, 8)) {
    for (let i = 1; i <= 3; i++) {
      await prisma.eventCompletion.create({
        data: { eventId: event.id, date: daysAgo(i) },
      });
    }
  }
  console.log("✅ Events created:", events.length, "with completions");

  // ============================================================
  // OBJETIVOS — 2-3 por pilar
  // ============================================================
  const objectives = await Promise.all([
    prisma.objective.create({
      data: {
        userId: user.id,
        title: "Armar fondo de emergencia de 3 meses",
        description: "Ahorrar el equivalente a 3 meses de gastos fijos",
        pilar: "FINANCIACION",
        deadline: new Date("2026-06-30"),
        xp: 100,
        milestone: true,
        progress: 65,
      },
    }),
    prisma.objective.create({
      data: {
        userId: user.id,
        title: "Reducir gastos hormiga un 30%",
        pilar: "FINANCIACION",
        deadline: new Date("2026-03-31"),
        xp: 50,
        progress: 40,
      },
    }),
    prisma.objective.create({
      data: {
        userId: user.id,
        title: "Completar curso de TypeScript avanzado",
        description: "Incluye generics, utility types, y patterns avanzados",
        pilar: "CAPACIDAD",
        deadline: new Date("2026-04-15"),
        xp: 80,
        milestone: true,
        progress: 70,
      },
    }),
    prisma.objective.create({
      data: {
        userId: user.id,
        title: "Leer 12 libros este año",
        pilar: "CAPACIDAD",
        deadline: new Date("2026-12-31"),
        xp: 60,
        progress: 25,
      },
    }),
    prisma.objective.create({
      data: {
        userId: user.id,
        title: "Correr 5km en menos de 25 minutos",
        pilar: "FISICO",
        deadline: new Date("2026-05-01"),
        xp: 75,
        milestone: true,
        progress: 45,
      },
    }),
    prisma.objective.create({
      data: {
        userId: user.id,
        title: "Mantener rutina de gym 4x/semana por 2 meses",
        pilar: "FISICO",
        xp: 50,
        progress: 30,
      },
    }),
    prisma.objective.create({
      data: {
        userId: user.id,
        title: "Reconectar con 5 amigos perdidos",
        pilar: "RELACIONES",
        xp: 60,
        progress: 40,
      },
    }),
    prisma.objective.create({
      data: {
        userId: user.id,
        title: "Organizar un asado mensual",
        pilar: "RELACIONES",
        deadline: new Date("2026-12-31"),
        xp: 40,
        milestone: true,
        progress: 20,
      },
    }),
  ]);
  console.log("✅ Objectives created:", objectives.length);

  // ============================================================
  // ESCUDO DE DOPAMINA — 3 vicios con días variados
  // ============================================================
  const shields = await Promise.all([
    prisma.dopamineShield.create({
      data: {
        userId: user.id,
        title: "Redes sociales",
        description: "No scrollear Instagram, Twitter ni TikTok. Solo uso intencional.",
        pilar: "CAPACIDAD",
        xpPerDay: 50,
        startDate: daysAgo(15),
        maxStreak: 22,
        notifications: true,
      },
    }),
    prisma.dopamineShield.create({
      data: {
        userId: user.id,
        title: "Comida chatarra",
        description: "Nada de delivery de comida rápida ni snacks procesados.",
        pilar: "FISICO",
        xpPerDay: 40,
        startDate: daysAgo(8),
        maxStreak: 30,
        notifications: false,
      },
    }),
    prisma.dopamineShield.create({
      data: {
        userId: user.id,
        title: "YouTube antes de dormir",
        description: "No ver videos después de las 22:00. Leer en vez.",
        pilar: "CAPACIDAD",
        xpPerDay: 30,
        startDate: daysAgo(5),
        maxStreak: 12,
        notifications: true,
      },
    }),
  ]);

  // Recaídas de ejemplo
  await Promise.all([
    prisma.dopamineRelapse.create({
      data: {
        shieldId: shields[0].id,
        date: daysAgo(16),
        xpLost: 2310, // Era racha de 22 días
        reflection: "Entré a ver una notificación y terminé scrolleando 40 minutos.",
        intensity: "MODERADA",
      },
    }),
    prisma.dopamineRelapse.create({
      data: {
        shieldId: shields[2].id,
        date: daysAgo(6),
        xpLost: 780, // Era racha de 12 días
        reflection: "No pude resistir ver un video recomendado. Cascada de autoplay.",
        intensity: "LEVE",
      },
    }),
  ]);
  console.log("✅ Dopamine shields created:", shields.length, "with relapses");

  // ============================================================
  // MÉTRICAS — última semana
  // ============================================================
  for (let i = 0; i < 7; i++) {
    const date = daysAgo(i);
    await Promise.all([
      prisma.pilarMetric.create({
        data: {
          userId: user.id,
          pilar: "FINANCIACION",
          date,
          ingresos: i === 0 ? 250000 : null,
          gastos: Math.floor(Math.random() * 15000) + 5000,
          ahorro: i === 0 ? 50000 : null,
        },
      }),
      prisma.pilarMetric.create({
        data: {
          userId: user.id,
          pilar: "CAPACIDAD",
          date,
          horasConcentrado: Math.floor(Math.random() * 4) + 2,
          horasNoConcentrado: Math.floor(Math.random() * 3) + 1,
          energyLevel: ["ALTO", "MEDIO", "BAJO"][Math.floor(Math.random() * 3)] as "ALTO" | "MEDIO" | "BAJO",
        },
      }),
      prisma.pilarMetric.create({
        data: {
          userId: user.id,
          pilar: "FISICO",
          date,
          peso: 78.5 - i * 0.1,
          horasSueno: Math.floor(Math.random() * 3) + 6,
          entrenamientoHoy: Math.random() > 0.3,
        },
      }),
      prisma.pilarMetric.create({
        data: {
          userId: user.id,
          pilar: "RELACIONES",
          date,
          interaccionesSociales: Math.floor(Math.random() * 5) + 1,
          calidad: ["PROFUNDA", "NORMAL", "SUPERFICIAL"][Math.floor(Math.random() * 3)] as "PROFUNDA" | "NORMAL" | "SUPERFICIAL",
          notas: i === 0 ? "Buena charla con Martín sobre el proyecto" : null,
        },
      }),
    ]);
  }
  console.log("✅ Pilar metrics created: 7 days × 4 pilares");

  // ============================================================
  // HISTORIAL — últimas entradas
  // ============================================================
  const historyEntries = [
    { pilar: "CAPACIDAD" as const, sourceType: "EVENT" as const, xp: 25, title: "Deep work — proyecto principal", daysAgo: 0 },
    { pilar: "FISICO" as const, sourceType: "EVENT" as const, xp: 30, title: "Entrenar en el gym", daysAgo: 0 },
    { pilar: "FINANCIACION" as const, sourceType: "EVENT" as const, xp: 10, title: "Registrar gastos del día", daysAgo: 1 },
    { pilar: "CAPACIDAD" as const, sourceType: "EVENT" as const, xp: 15, title: "Leer 30 minutos", daysAgo: 1 },
    { pilar: "CAPACIDAD" as const, sourceType: "DOPAMINE" as const, xp: -2310, title: "Recaída: Redes sociales", daysAgo: 16 },
    { pilar: "FINANCIACION" as const, sourceType: "OBJECTIVE" as const, xp: 50, title: "Progreso en fondo de emergencia", daysAgo: 3 },
    { pilar: "RELACIONES" as const, sourceType: "EVENT" as const, xp: 20, title: "Llamar a un amigo/familiar", daysAgo: 2 },
    { pilar: "FISICO" as const, sourceType: "METRIC" as const, xp: 5, title: "Métrica registrada: Físico", daysAgo: 1 },
    { pilar: "CAPACIDAD" as const, sourceType: "EVENT" as const, xp: 20, title: "Revisar notas de la semana", daysAgo: 4 },
    { pilar: "FISICO" as const, sourceType: "EVENT" as const, xp: 30, title: "Entrenar en el gym", daysAgo: 2 },
  ];

  for (const entry of historyEntries) {
    await prisma.historyEntry.create({
      data: {
        userId: user.id,
        pilar: entry.pilar,
        sourceType: entry.sourceType,
        referenceId: events[0].id, // Referencia genérica para el seed
        xp: entry.xp,
        title: entry.title,
        date: daysAgo(entry.daysAgo),
      },
    });
  }
  console.log("✅ History entries created:", historyEntries.length);

  // ============================================================
  // CALENDARIO — 4-5 eventos
  // ============================================================
  await Promise.all([
    prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title: "Reunión con contador",
        description: "Revisar declaración jurada",
        pilar: "FINANCIACION",
        date: daysAgo(-2), // 2 días en el futuro
        startTime: "10:00",
        endTime: "11:00",
        xp: 15,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title: "Dentista",
        pilar: "FISICO",
        date: daysAgo(-5),
        startTime: "16:00",
        endTime: "17:00",
        xp: 10,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title: "Cumpleaños de Martín",
        pilar: "RELACIONES",
        date: daysAgo(-7),
        startTime: "20:00",
        endTime: "23:00",
        notes: "Llevar regalo. Le gusta el vino tinto.",
        xp: 25,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title: "Deploy franco-assistant v1",
        description: "Primera versión en producción",
        pilar: "CAPACIDAD",
        date: daysAgo(-14),
        startTime: "09:00",
        endTime: "12:00",
        xp: 50,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title: "Compras del super",
        date: daysAgo(-1),
        startTime: "18:00",
        endTime: "19:00",
        xp: 0,
      },
    }),
  ]);
  console.log("✅ Calendar events created: 5");

  // ============================================================
  // KANBAN — 1 board con 4 columnas y 6 tareas
  // ============================================================
  const board = await prisma.kanbanBoard.create({
    data: {
      userId: user.id,
      title: "Franco Assistant",
      description: "Desarrollo de la app",
      color: "#3b82f6",
    },
  });

  const columns = await Promise.all([
    prisma.kanbanColumn.create({ data: { boardId: board.id, title: "Por hacer", order: 0 } }),
    prisma.kanbanColumn.create({ data: { boardId: board.id, title: "En progreso", order: 1 } }),
    prisma.kanbanColumn.create({ data: { boardId: board.id, title: "En revisión", order: 2 } }),
    prisma.kanbanColumn.create({ data: { boardId: board.id, title: "Completado", order: 3 } }),
  ]);

  await Promise.all([
    prisma.kanbanTask.create({
      data: {
        columnId: columns[0].id,
        title: "Implementar escudo de dopamina",
        description: "Sistema de vicios con XP acumulativa y recaídas",
        pilar: "CAPACIDAD",
        status: "POR_HACER",
        priority: "ALTA",
        xp: 40,
        order: 0,
      },
    }),
    prisma.kanbanTask.create({
      data: {
        columnId: columns[0].id,
        title: "Agregar gráficos de rendimiento",
        pilar: "CAPACIDAD",
        status: "POR_HACER",
        priority: "MEDIA",
        xp: 25,
        order: 1,
      },
    }),
    prisma.kanbanTask.create({
      data: {
        columnId: columns[1].id,
        title: "Diseñar sistema de niveles",
        description: "Fórmula de XP, barras de progreso, badges",
        pilar: "CAPACIDAD",
        status: "EN_PROGRESO",
        priority: "ALTA",
        deadline: new Date("2026-02-15"),
        xp: 35,
        order: 0,
      },
    }),
    prisma.kanbanTask.create({
      data: {
        columnId: columns[1].id,
        title: "Setup de testing con Vitest",
        pilar: "CAPACIDAD",
        status: "EN_PROGRESO",
        priority: "MEDIA",
        xp: 20,
        order: 1,
      },
    }),
    prisma.kanbanTask.create({
      data: {
        columnId: columns[2].id,
        title: "Página de login",
        pilar: "CAPACIDAD",
        status: "EN_REVISION",
        priority: "ALTA",
        xp: 15,
        order: 0,
      },
    }),
    prisma.kanbanTask.create({
      data: {
        columnId: columns[3].id,
        title: "Setup inicial del proyecto",
        description: "Next.js 15 + Prisma + shadcn/ui + Tailwind",
        pilar: "CAPACIDAD",
        status: "COMPLETADO",
        priority: "ALTA",
        xp: 30,
        order: 0,
      },
    }),
  ]);
  console.log("✅ Kanban board created: 1 board, 4 columns, 6 tasks");

  console.log("\n🎉 Seed complete!");
  console.log("   Login: franco@assistant.dev / franco123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
