"use client";

import { useMemo, useState } from "react";
import { Heart, Truck, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/utils";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  sku: string;
  stock: number;
};

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    story?: string | null;
    materials?: string | null;
    stylingNotes?: string | null;
    price: number;
    compareAtPrice?: number | null;
    images: string[];
    category: { name: string };
    variants: Variant[];
    priceLabel: string;
  };
};

export function ProductPanel({ product }: Readonly<Props>) {
  const sizes = useMemo(() => {
    const list = product.variants.map((v) => v.size).filter((x): x is string => typeof x === "string" && x.length > 0);
    return Array.from(new Set(list));
  }, [product.variants]);
  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [qty, setQty] = useState(1);
  const cart = useCart();

  const variant = product.variants.find((v) => v.size === size);
  const inStock = !variant || variant.stock > 0;

  function add() {
    cart.addItem({
      productId: product.id,
      variantId: variant?.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      size: size ?? undefined,
      unitPrice: product.price,
      quantity: qty,
    });
    toast.success(`${product.name} added to your atelier`);
  }

  async function wishlist() {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.status === 401) {
        toast.error("Please sign in to save to your wishlist");
        return;
      }
      if (!res.ok) throw new Error("Wishlist failed");
      toast.success("Saved to wishlist");
    } catch {
      toast.error("Could not save");
    }
  }

  return (
    <div className="lg:py-4">
      <p className="editorial-eyebrow">{product.category.name}</p>
      <h1 className="mt-3 font-serif text-4xl font-light leading-[1.05] md:text-5xl text-balance">
        {product.name}
      </h1>

      <div className="mt-5 flex items-baseline gap-4">
        <p className="font-serif text-2xl text-charcoal">{product.priceLabel}</p>
        {!!product.compareAtPrice && product.compareAtPrice > product.price && (
          <p className="text-sm text-charcoal/40 line-through">{formatINR(product.compareAtPrice)}</p>
        )}
      </div>
      <p className="mt-1 text-[11px] uppercase tracking-editorial text-charcoal/50">
        Inclusive of all duties and taxes
      </p>

      <p className="mt-8 text-base leading-relaxed text-charcoal/75">{product.description}</p>

      {sizes.length > 0 && (
        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <p className="editorial-eyebrow">Size</p>
            <button className="luxe-link text-[10px] uppercase tracking-editorial text-charcoal/60">
              Size guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const v = product.variants.find((x) => x.size === s);
              const active = size === s;
              const out = v ? v.stock <= 0 : false;
              const low = v ? v.stock > 0 && v.stock <= 5 : false;
              return (
                <button
                  key={s}
                  disabled={out}
                  onClick={() => setSize(s)}
                  className={`relative h-12 min-w-12 border px-4 text-[11px] uppercase tracking-editorial transition ${
                    active
                      ? "border-charcoal bg-charcoal text-bone"
                      : "border-charcoal/20 text-charcoal hover:border-charcoal"
                  } ${out ? "opacity-30" : ""}`}
                >
                  {s}
                  {low && (
                    <span
                      className={`absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-editorial ${
                        active ? "bg-bone text-charcoal" : "bg-charcoal text-bone"
                      }`}
                    >
                      Only {v?.stock} left
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-end gap-4">
        <div>
          <p className="editorial-eyebrow mb-3">Quantity</p>
          <div className="flex h-12 w-32 items-center justify-between border border-charcoal/20">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-full w-10 hover:bg-charcoal/5">−</button>
            <span className="font-sans text-sm">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="h-full w-10 hover:bg-charcoal/5">+</button>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-3">
        <Button onClick={add} disabled={!inStock} size="lg" className="w-full">
          {inStock ? "Add to atelier" : "Out of stock"}
        </Button>
        <Button onClick={wishlist} variant="outline" size="lg" className="w-full">
          <Heart className="mr-2 h-3.5 w-3.5" /> Save for later
        </Button>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-5 border-y border-charcoal/10 py-8 text-sm text-charcoal/70 sm:grid-cols-3">
        <li className="flex items-start gap-3">
          <Truck className="mt-0.5 h-4 w-4 text-charcoal" />
          <div>
            <p className="text-charcoal">Complimentary shipping</p>
            <p className="text-xs text-charcoal/60">On orders over ₹15,000</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-charcoal" />
          <div>
            <p className="text-charcoal">Hand-finished</p>
            <p className="text-xs text-charcoal/60">In small Italian ateliers</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-charcoal" />
          <div>
            <p className="text-charcoal">Considered returns</p>
            <p className="text-xs text-charcoal/60">14-day atelier exchange</p>
          </div>
        </li>
      </ul>

      <Accordion type="multiple" className="mt-2">
        {product.story && (
          <AccordionItem value="story">
            <AccordionTrigger>The Story</AccordionTrigger>
            <AccordionContent>{product.story}</AccordionContent>
          </AccordionItem>
        )}
        {product.materials && (
          <AccordionItem value="materials">
            <AccordionTrigger>Materials & Craft</AccordionTrigger>
            <AccordionContent>{product.materials}</AccordionContent>
          </AccordionItem>
        )}
        {product.stylingNotes && (
          <AccordionItem value="styling">
            <AccordionTrigger>Styling Notes</AccordionTrigger>
            <AccordionContent>{product.stylingNotes}</AccordionContent>
          </AccordionItem>
        )}
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping & Returns</AccordionTrigger>
          <AccordionContent>
            Complimentary shipping on orders over ₹15,000. Considered returns within 14 days,
            with the original packaging and atelier seal intact.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
