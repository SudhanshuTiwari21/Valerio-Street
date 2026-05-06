"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/utils";

export function CartDrawer() {
  const { open, setOpen, items, updateQty, removeItem, subtotal } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="px-8 pb-6 pt-10">
          <SheetTitle>Your Atelier</SheetTitle>
          <p className="text-[11px] uppercase tracking-editorial text-charcoal/50">
            {items.length} {items.length === 1 ? "piece" : "pieces"}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-8">
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-start gap-6 py-16"
              >
                <p className="font-serif text-3xl font-light leading-tight text-charcoal text-balance">
                  Your atelier is quiet for now.
                </p>
                <p className="text-sm text-charcoal/60">
                  Begin with a piece chosen with intention.
                </p>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link href="/shop">Discover the collection</Link>
                </Button>
              </motion.div>
            ) : (
              <ul className="divide-y divide-charcoal/10">
                {items.map((it) => {
                  const k = `${it.productId}-${it.variantId ?? "_"}`;
                  return (
                    <motion.li
                      key={k}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      className="flex gap-5 py-6"
                    >
                      <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-sand/40">
                        {it.image ? (
                          <Image src={it.image} alt={it.name} fill className="object-cover" sizes="80px" />
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            href={`/shop/${it.slug}`}
                            onClick={() => setOpen(false)}
                            className="font-serif text-lg leading-tight text-charcoal hover:text-charcoal/70"
                          >
                            {it.name}
                          </Link>
                          <button
                            aria-label="Remove"
                            onClick={() => removeItem(it.productId, it.variantId)}
                            className="text-charcoal/40 hover:text-charcoal"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] uppercase tracking-editorial text-charcoal/50">
                          {[it.size, it.color].filter(Boolean).join(" · ")}
                        </p>
                        <div className="mt-auto flex items-end justify-between gap-3">
                          <div className="flex items-center border border-charcoal/15">
                            <button
                              aria-label="Decrease"
                              onClick={() => updateQty(it.productId, it.variantId, it.quantity - 1)}
                              className="flex h-9 w-9 items-center justify-center text-charcoal hover:bg-charcoal/5"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex h-9 w-9 items-center justify-center font-sans text-sm">
                              {it.quantity}
                            </span>
                            <button
                              aria-label="Increase"
                              onClick={() => updateQty(it.productId, it.variantId, it.quantity + 1)}
                              className="flex h-9 w-9 items-center justify-center text-charcoal hover:bg-charcoal/5"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="font-serif text-lg text-charcoal">
                            {formatINR(it.unitPrice * it.quantity)}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </AnimatePresence>
        </div>

        {items.length > 0 && (
          <div className="border-t border-charcoal/10 bg-bone px-8 py-6">
            <div className="flex items-center justify-between font-sans text-sm">
              <span className="uppercase tracking-editorial text-charcoal/60">Subtotal</span>
              <span className="font-serif text-2xl text-charcoal">{formatINR(subtotal())}</span>
            </div>
            <p className="mt-1 text-[11px] uppercase tracking-editorial text-charcoal/40">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="mt-6 grid gap-3">
              <Button asChild size="lg" onClick={() => setOpen(false)}>
                <Link href="/checkout">Proceed to checkout</Link>
              </Button>
              <Button asChild variant="ghost" onClick={() => setOpen(false)}>
                <Link href="/cart">View bag</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
