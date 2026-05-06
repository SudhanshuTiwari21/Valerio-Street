import type { PermissionKey, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";

const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "CONTENT_EDITOR"];

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Response("Unauthorized", { status: 401 });
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role as UserRole)) {
    throw new Response("Forbidden", { status: 403 });
  }
  return session;
}

export async function requirePermission(key: PermissionKey) {
  const session = await auth();
  if (!session?.user) throw new Response("Unauthorized", { status: 401 });
  const role = session.user.role as UserRole;
  if (role === "SUPER_ADMIN") return session;
  const perms = (session.user.permissions ?? []) as string[];
  if (!perms.includes(key)) throw new Response("Forbidden", { status: 403 });
  return session;
}

export function hasPermission(
  session: { user?: { role?: UserRole; permissions?: string[] } } | null | undefined,
  key: PermissionKey,
): boolean {
  if (!session?.user) return false;
  if (session.user.role === "SUPER_ADMIN") return true;
  return (session.user.permissions ?? []).includes(key);
}

export function isStaff(role: UserRole | undefined | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}
