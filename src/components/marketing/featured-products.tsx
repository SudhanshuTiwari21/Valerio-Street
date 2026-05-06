"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback } from "react";

import { ProductCard, type ProductCardData } from "@/components/products/product-card";

export function FeaturedProducts({ products }: { products: ProductCardData[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false, dragFree: true });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!products.length) return null;

  return (
    <section className="container py-24 md:py-32">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="editorial-eyebrow">Selected · This Week</p>
          <h2 className="mt-3 font-serif text-4xl font-light leading-[1.05] md:text-6xl text-balance">
            New In Atelier.
          </h2>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={scrollPrev}
            aria-label="Previous"
            className="flex h-11 w-11 items-center justify-center border border-charcoal/15 text-charcoal transition-colors hover:bg-charcoal hover:text-bone"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next"
            className="flex h-11 w-11 items-center justify-center border border-charcoal/15 text-charcoal transition-colors hover:bg-charcoal hover:text-bone"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <Link href="/shop" className="luxe-link ml-4 text-[11px] uppercase tracking-editorial">
            View all
          </Link>
        </div>
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4 md:gap-6">
          {products.map((p) => (
            <div key={p.id} className="min-w-0 flex-[0_0_70%] sm:flex-[0_0_45%] lg:flex-[0_0_28%]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
