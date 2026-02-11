/**
 * Página de login.
 *
 * ¿Por qué client component? Porque usa useState para manejar
 * el estado del form (email, password, error, loading).
 * Los Server Components no pueden tener estado interactivo.
 *
 * ¿Por qué signIn de next-auth/react? Porque maneja todo el flujo:
 * envía las credenciales al endpoint de NextAuth, recibe el JWT,
 * lo guarda en cookies, y redirige. No necesitamos hacer fetch manual.
 */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // No redirigir automáticamente — manejamos el resultado
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      return;
    }

    router.push("/");
    router.refresh(); // Forzar re-render para que el middleware detecte la sesión
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Logo */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-gold">FA</span>
          <span className="font-display text-lg font-medium text-muted-foreground">
            FRANCO ASSISTANT
          </span>
        </div>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          SISTEMA DE PILARES v1.0
        </p>
      </div>

      {/* Card */}
      <div className="rounded-lg border border-border-base bg-bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Iniciar sesión
        </h2>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          Ingresá tus credenciales para continuar
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="font-mono text-xs font-medium text-muted-foreground"
            >
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="franco@assistant.dev"
              required
              className="w-full rounded-md border border-border-base bg-bg-base px-3 py-2 font-display text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="font-mono text-xs font-medium text-muted-foreground"
            >
              CONTRASEÑA
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-md border border-border-base bg-bg-base px-3 py-2 font-display text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="font-mono text-xs text-error">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gold px-4 py-2.5 font-display text-sm font-semibold text-bg-base transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center font-mono text-[10px] text-muted-foreground">
        ÚNICO USUARIO — SIN REGISTRO PÚBLICO
      </p>
    </div>
  );
}
