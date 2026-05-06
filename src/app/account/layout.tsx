import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Settings", href: "/account/settings" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/account");

  return (
    <div className="container py-16 md:py-24">
      <p className="editorial-eyebrow">Member</p>
      <h1 className="mt-3 font-serif text-4xl font-light md:text-5xl text-balance">
        Hello, {session.user.name?.split(" ")[0] ?? "Guest"}.
      </h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav className="flex gap-x-6 gap-y-3 overflow-x-auto lg:flex-col">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="luxe-link text-[11px] uppercase tracking-editorial text-charcoal/70">
                {n.label}
              </Link>
            ))}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="luxe-link text-[11px] uppercase tracking-editorial text-charcoal/40">
                Sign out
              </button>
            </form>
          </nav>
        </aside>
        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
