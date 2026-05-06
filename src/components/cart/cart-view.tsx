"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/utils";

export function CartView() {
  const cart = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

  const subtotal = cart.subtotal();
  const total = Math.max(0, subtotal - discount);

  async function applyCoupon() {
    setError(null);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: coupon, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Invalid code");
      setDiscount(0);
      return;
    }
    setDiscount(data.discount ?? 0);
  }

  if (cart.items.length === 0) {
    return (
      <div className="mt-16 max-w-xl">
        <p className="font-serif text-3xl font-light leading-tight text-balance">
          Your atelier is quiet for now.
        </p>
        <p className="mt-4 text-charcoal/60">Begin with a piece chosen with intention.</p>
        <Button asChild className="mt-8">
          <Link href="/shop">Discover the collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
      <ul className="divide-y divide-charcoal/10 lg:col-span-8">
        {cart.items.map((it) => (
          <motion.li
            key={`${it.productId}-${it.variantId ?? "_"}`}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-6 py-8"
          >
            <div className="relative h-44 w-32 shrink-0 overflow-hidden bg-sand/40">
              {it.image && (
                <Image src={it.image} alt={it.name} fill className="object-cover" sizes="128px" />
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/shop/${it.slug}`} className="font-serif text-xl text-charcoal hover:text-charcoal/70">
                    {it.name}
                  </Link>
                  <p className="mt-1 text-[11px] uppercase tracking-editorial text-charcoal/50">
                    {[it.size, it.color].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button
                  aria-label="Remove"
                  onClick={() => cart.removeItem(it.productId, it.variantId)}
                  className="text-charcoal/40 hover:text-charcoal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-auto flex items-end justify-between gap-3">
                <div className="flex items-center border border-charcoal/15">
                  <button
                    aria-label="Decrease"
                    onClick={() => cart.updateQty(it.productId, it.variantId, it.quantity - 1)}
                    className="flex h-10 w-10 items-center justify-center hover:bg-charcoal/5"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="flex h-10 w-10 items-center justify-center text-sm">{it.quantity}</span>
                  <button
                    aria-label="Increase"
                    onClick={() => cart.updateQty(it.productId, it.variantId, it.quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center hover:bg-charcoal/5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="font-serif text-xl text-charcoal">{formatINR(it.unitPrice * it.quantity)}</p>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>

      <aside className="lg:col-span-4">
        <div className="sticky top-32 border border-charcoal/10 bg-bone p-8">
          <p className="editorial-eyebrow">Order summary</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-charcoal/60">Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-charcoal/60">Shipping</dt><dd className="text-charcoal/60">At checkout</dd></div>
            {discount > 0 && (
              <div className="flex justify-between text-olive"><dt>Discount</dt><dd>− {formatINR(discount)}</dd></div>
            )}
          </dl>
          <div className="mt-6 border-t border-charcoal/10 pt-6">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-editorial text-charcoal/60">Total</span>
              <span className="font-serif text-3xl text-charcoal">{formatINR(total)}</span>
            </div>
          </div>

          <div className="mt-8">
            <p className="editorial-eyebrow mb-2">Have a code?</p>
            <div className="flex items-end gap-3 border-b border-charcoal/30">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="VALERIO10"
                className="h-11 flex-1 bg-transparent text-sm placeholder:text-charcoal/40 focus:outline-none"
              />
              <button onClick={applyCoupon} className="luxe-link text-[11px] uppercase tracking-editorial">
                Apply
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </div>

          <Button asChild size="lg" className="mt-8 w-full">
            <Link href="/checkout">Continue to checkout</Link>
          </Button>
          <Link href="/shop" className="mt-4 block text-center luxe-link text-[11px] uppercase tracking-editorial">
            Continue browsing
          </Link>
        </div>
      </aside>
    </div>
  );
}
