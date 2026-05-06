import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      permissions: string[];
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    permissions: string[];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/auth/login", error: "/auth/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: { permissions: true },
        });
        if (!user?.passwordHash || !user.isActive) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          permissions: user.permissions.map((p) => p.key),
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "CUSTOMER";
        token.permissions = (user as any).permissions ?? [];
      }
      if (trigger === "update" && token.id) {
        const u = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { permissions: true },
        });
        if (u) {
          token.role = u.role;
          token.permissions = u.permissions.map((p) => p.key);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.permissions = (token.permissions as string[]) ?? [];
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email && !user.name) {
        await prisma.user.update({
          where: { id: user.id },
          data: { name: user.email.split("@")[0] },
        });
      }
    },
    async signIn({ user }) {
      if (!user?.id || !user.email) return;
      // Claim guest orders for this email the moment the user signs in.
      await prisma.order.updateMany({
        where: { userId: null, email: user.email.toLowerCase() },
        data: { userId: user.id },
      });
    },
  },
});
