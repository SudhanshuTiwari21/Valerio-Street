"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search, ShoppingBag, User, Menu, Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV } from "@/lib/site";
import { useCart } from "@/lib/cart-store";
import { AnnouncementBar } from "./announcement-bar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { isStaff } from "@/lib/rbac";
import { Brand } from "@/components/brand/brand";

export function Header() {
  const { data: session } = useSession();
  const cart = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-700",
        scrolled ? "bg-bone/85 backdrop-blur-md shadow-soft" : "bg-bone",
      )}
    >
      <AnnouncementBar />
      <div className="container relative flex h-20 items-center justify-between">
        <div className="flex items-center gap-3 lg:hidden">
          <Sheet>
            <SheetTrigger aria-label="Open menu" className="text-charcoal">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="bg-bone p-8">
              <Brand
                className="text-charcoal"
                markEm={2.9}
                markNudgeEm={0.04}
                markInnerScale={2.2}
                textClassName="text-xl tracking-[0.22em]"
              />
              <nav className="mt-12 flex flex-col gap-6">
                {NAV.primary.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="font-serif text-3xl text-charcoal hover:text-charcoal/70"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-12 border-t border-charcoal/10 pt-8 text-[11px] uppercase tracking-editorial text-charcoal/60">
                <p>Atelier · Milano</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.primary.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="luxe-link font-sans text-[11px] uppercase tracking-editorial text-charcoal"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Brand
            className="text-charcoal"
            size="lg"
            markEm={3.5}
            markNudgeEm={0.32}
            markInnerScale={2.35}
            textClassName="text-2xl sm:text-3xl"
          />
        </div>

        <div className="flex items-center gap-5 text-charcoal">
          <Link href="/shop" aria-label="Search shop" className="hidden sm:block">
            <Search className="h-4 w-4" />
          </Link>
          {session?.user ? (
            <Link
              href={isStaff(session.user.role as any) ? "/admin" : "/account"}
              aria-label="Account"
            >
              <User className="h-4 w-4" />
            </Link>
          ) : (
            <Link href="/auth/login" aria-label="Sign in">
              <User className="h-4 w-4" />
            </Link>
          )}
          <Link href="/account/wishlist" aria-label="Wishlist" className="hidden sm:block">
            <Heart className="h-4 w-4" />
          </Link>
          <button
            onClick={() => cart.setOpen(true)}
            aria-label={`Open cart, ${cart.count()} items`}
            className="relative"
          >
            <ShoppingBag className="h-4 w-4" />
            {cart.count() > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center bg-charcoal text-[9px] text-bone">
                {cart.count()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
