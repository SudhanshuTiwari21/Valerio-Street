import { prisma } from "@/lib/prisma";
import { StaffManager } from "@/components/admin/staff-manager";
import type { PermissionKey, UserRole } from "@prisma/client";

export default async function StaffPage() {
  const [staff, permissions] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["CONTENT_EDITOR", "MANAGER", "ADMIN", "SUPER_ADMIN"] } },
      include: { permissions: true },
      orderBy: { role: "asc" },
    }),
    prisma.permission.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-editorial text-bone/50">Staff & Roles</p>
      <h2 className="mt-2 font-serif text-4xl font-light">The atelier team.</h2>
      <StaffManager
        staff={staff.map((u) => ({
          id: u.id,
          name: u.name ?? "",
          email: u.email,
          role: u.role,
          permissions: u.permissions.map((p) => p.key),
          isActive: u.isActive,
        }))}
        permissions={permissions.map((p) => ({ key: p.key as PermissionKey, label: p.label }))}
      />
    </div>
  );
}
