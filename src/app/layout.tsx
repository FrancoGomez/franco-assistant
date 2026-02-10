import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * ¿Por qué next/font/google?
 * Optimiza las fuentes automáticamente:
 * - Las descarga en build time (no request a Google Fonts en runtime)
 * - Las sirve desde tu dominio (mejor privacy)
 * - Elimina layout shift (CLS)
 *
 * Space Grotesk → headings, UI, body text (font-display)
 * JetBrains Mono → datos, números, labels, badges (font-mono)
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Franco Assistant",
  description:
    "Asistente personal gamificado con pilares de vida, XP, y escudo de dopamina",
};

/**
 * Layout root — wrappea toda la app.
 *
 * class="dark" → dark mode siempre (la app es dark-only).
 * font-display → Space Grotesk como fuente base del body.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-display antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
