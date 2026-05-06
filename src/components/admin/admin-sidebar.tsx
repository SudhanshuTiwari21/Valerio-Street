"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Users,
  UsersRound,
  FileEdit,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { PermissionKey, UserRole } from "@prisma/client";
import { Brand } from "@/components/brand/brand";

const NAV: { href: string; label: string; icon: any; permission?: PermissionKey }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: "VIEW_ANALYTICS" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, permission: "MANAGE_ORDERS" },
  { href: "/admin/products", label: "Products", icon: Package, permission: "MANAGE_PRODUCTS" },
  { href: "/admin/categories", label: "Categories", icon: Tag, permission: "MANAGE_CATEGORIES" },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "MANAGE_CUSTOMERS" },
  { href: "/admin/staff", label: "Staff & Roles", icon: UsersRound, permission: "MANAGE_STAFF" },
  { href: "/admin/cms", label: "CMS", icon: FileEdit, permission: "MANAGE_CMS" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "MANAGE_SETTINGS" },
];

export function AdminSidebar({
  user,
  signOut,
}: Readonly<{
  user: { name: string | null; email: string; role: UserRole; permissions: PermissionKey[] };
  signOut: () => Promise<void>;
}>) {
  const pathname = usePathname();

  function allowed(p?: PermissionKey) {
    if (!p) return true;
    if (user.role === "SUPER_ADMIN") return true;
    return user.permissions.includes(p);
  }

  return (
    <aside className="hidden border-r border-charcoal/10 bg-bone lg:flex lg:flex-col">
      <div className="px-8 pb-8 pt-10">
        <Brand
          href="/admin"
          ariaLabel="Valerio Street — admin"
          className="text-charcoal"
          size="sm"
          markClassName="h-10 w-10"
          textClassName="text-xl tracking-[0.22em]"
        />
        <p className="mt-2 text-[10px] uppercase tracking-editorial text-charcoal/60">Admin Atelier</p>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {NAV.filter((n) => allowed(n.permission)).map((n) => {
          const active = pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href));
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-[11px] uppercase tracking-editorial transition-colors",
                active ? "bg-charcoal/5 text-charcoal" : "text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-charcoal/10 px-6 py-6">
        <p className="font-serif text-base text-charcoal">{user.name ?? user.email}</p>
        <p className="text-[10px] uppercase tracking-editorial text-charcoal/60">{user.role.replace("_", " ")}</p>
        <form action={signOut} className="mt-4">
          <button className="flex items-center gap-2 text-[11px] uppercase tracking-editorial text-charcoal/60 hover:text-charcoal">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
