import { redirect } from "next/navigation";
import Link from "next/link";

import { auth, signOut } from "@/lib/auth";
import { isStaff } from "@/lib/rbac";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Brand } from "@/components/brand/brand";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/admin");
  if (!isStaff(session.user.role)) redirect("/");

  return (
    <div className="grid min-h-svh bg-bone text-charcoal lg:grid-cols-[260px_1fr]">
      <AdminSidebar
        user={{
          name: session.user.name ?? null,
          email: session.user.email ?? "",
          role: session.user.role as any,
          permissions: (session.user.permissions ?? []) as any,
        }}
        signOut={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      />
      <div className="flex min-h-svh flex-col">
        <header className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4 lg:px-10">
          <div>
            <p className="text-[10px] uppercase tracking-editorial text-charcoal/60">Admin · Atelier</p>
            <Brand
              href="/admin"
              ariaLabel="Valerio Street — admin home"
              className="text-charcoal"
              markClassName="h-7 w-7"
              textClassName="text-2xl tracking-[0.18em] normal-case"
              text="Valerio Street"
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-editorial text-charcoal/60">
            <Link href="/" target="_blank" className="luxe-link">View site</Link>
            <span className="hidden h-4 w-px bg-charcoal/20 sm:block" />
            <span className="hidden sm:block">{session.user.email}</span>
          </div>
        </header>
        <main className="flex-1 px-6 py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
