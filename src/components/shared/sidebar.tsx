/**
 * Sidebar de navegación principal.
 *
 * ¿Por qué Client Component? Necesita hooks interactivos:
 * - usePathname() para detectar la ruta activa y resaltar el item correcto
 * - useSession() para mostrar info del usuario (nombre, nivel)
 *
 * ¿Por qué ancho fijo de 280px? El diseño en Pencil lo define así.
 * No implementamos sidebar colapsable en el MVP — simplifica el layout
 * y en desktop 280px es un ancho razonable que deja suficiente espacio
 * para el contenido principal.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  DollarSign,
  Brain,
  Dumbbell,
  Heart,
  Shield,
  Calendar,
  Columns3,
  Clock,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Definición de items de navegación.
 *
 * ¿Por qué un array de objetos y no hardcodeado en JSX?
 * 1. Más fácil de mantener — agregar una página es agregar un objeto
 * 2. Permite mapear sobre el array (DRY)
 * 3. El color del pilar se usa para la barra activa del sidebar
 *
 * accentColor: el color CSS del pilar asociado. Se usa para la barra
 * izquierda cuando el item está activo. null = usa el color default.
 */
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string | null;
}

const pagesNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    accentColor: null,
  },
  {
    label: "Financiación",
    href: "/pilares/financiacion",
    icon: DollarSign,
    accentColor: "var(--color-pilar-financiacion)",
  },
  {
    label: "Capacidad",
    href: "/pilares/capacidad",
    icon: Brain,
    accentColor: "var(--color-pilar-capacidad)",
  },
  {
    label: "Físico",
    href: "/pilares/fisico",
    icon: Dumbbell,
    accentColor: "var(--color-pilar-fisico)",
  },
  {
    label: "Relaciones",
    href: "/pilares/relaciones",
    icon: Heart,
    accentColor: "var(--color-pilar-relaciones)",
  },
  {
    label: "Escudo de Dopamina",
    href: "/escudo-dopamina",
    icon: Shield,
    accentColor: null,
  },
];

const toolsNav: NavItem[] = [
  {
    label: "Calendario",
    href: "/calendario",
    icon: Calendar,
    accentColor: null,
  },
  {
    label: "Kanban",
    href: "/kanban",
    icon: Columns3,
    accentColor: null,
  },
  {
    label: "Historial",
    href: "/historial",
    icon: Clock,
    accentColor: null,
  },
];

/**
 * ¿Cómo detecta el item activo?
 * - Para "/" (Dashboard): solo es activo si la ruta es exactamente "/"
 * - Para el resto: startsWith() porque "/pilares/financiacion/algo" sigue
 *   estando "dentro" de Financiación
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-screen w-[280px] flex-col border-r border-border-base bg-bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold font-mono text-sm font-bold text-gold">
          FA
        </div>
        <span className="font-mono text-sm font-semibold tracking-wider text-foreground">
          FRANCO ASSISTANT
        </span>
      </div>

      {/* Navegación */}
      <ScrollArea className="flex-1 px-3">
        {/* Sección PÁGINAS */}
        <div className="mb-2 px-3 pt-2">
          <span className="font-mono text-[11px] tracking-widest text-muted-foreground">
            {"// PÁGINAS"}
          </span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {pagesNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
            />
          ))}
        </nav>

        <Separator className="my-4 bg-border-base" />

        {/* Sección HERRAMIENTAS */}
        <div className="mb-2 px-3">
          <span className="font-mono text-[11px] tracking-widest text-muted-foreground">
            {"// HERRAMIENTAS"}
          </span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {toolsNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Usuario — abajo del sidebar */}
      <div className="border-t border-border-base px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-mono text-xs font-bold text-muted-foreground">
            FR
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-semibold tracking-wider text-foreground">
              {session?.user?.name?.toUpperCase() ?? "FRANCO"}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              ADMIN :: L23
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * Item individual de navegación.
 *
 * ¿Por qué componente separado? Encapsula la lógica de active state
 * y la barra de color. Si lo ponemos inline en el map(), el JSX se
 * vuelve difícil de leer.
 *
 * La barra de color izquierda usa style={{ backgroundColor }} en vez
 * de clases de Tailwind porque el color viene dinámico del pilar.
 * Tailwind necesita clases conocidas en build time, pero los colores
 * de pilar varían por item.
 */
interface NavLinkProps {
  item: NavItem;
  active: boolean;
}

function NavLink({ item, active }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      {/* Barra de color activa — solo visible cuando el item está seleccionado */}
      {active && (
        <div
          className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
          style={{
            backgroundColor: item.accentColor ?? "var(--color-foreground)",
          }}
        />
      )}
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}
