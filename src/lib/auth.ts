/**
 * Configuración central de NextAuth v5.
 *
 * ¿Por qué un archivo separado y no en el route handler?
 * Porque NextAuth v5 exporta { handlers, auth, signIn, signOut } que se usan
 * en distintos lugares: route handler, middleware, server components, client.
 * Tener todo en un archivo central evita duplicación.
 *
 * ¿Por qué JWT en vez de sesiones en DB?
 * Cuando usás Credentials provider con un adapter (Prisma), NextAuth REQUIERE
 * strategy: "jwt". Credentials no persiste sesiones automáticamente en la DB.
 * JWT funciona perfecto para un solo usuario.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login", // Redirigir a nuestra página custom en vez del default de NextAuth
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) {
          return null;
        }

        // Este objeto se serializa en el JWT token
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * El callback `jwt` agrega el userId al token.
     * Sin esto, el token solo tiene name/email pero no el id del user.
     */
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    /**
     * El callback `session` expone el userId en la sesión del client.
     * Así podemos hacer `session.user.id` en cualquier componente.
     */
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
