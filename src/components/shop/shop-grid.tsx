"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { ProductCard, type ProductCardData } from "@/components/products/product-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ShopGrid({ products }: { products: ProductCardData[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const sort = params.get("sort") ?? "featured";

  function setSort(v: string) {
    const next = new URLSearchParams(params.toString());
    if (v === "featured") next.delete("sort");
    else next.set("sort", v);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-charcoal/10 pb-5">
        <p className="text-[11px] uppercase tracking-editorial text-charcoal/60">
          {products.length} pieces
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-editorial text-charcoal/50">Sort</span>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-8 w-44 border-0 border-b">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price · Low to High</SelectItem>
              <SelectItem value="price-desc">Price · High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-32 text-center">
          <p className="editorial-eyebrow">Atelier</p>
          <p className="mt-4 font-serif text-3xl font-light text-charcoal">
            No pieces match this brief.
          </p>
          <p className="mt-2 text-sm text-charcoal/60">
            Adjust your filters or return to the full collection.
          </p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
          className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14"
        >
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <ProductCard product={p} priority={i < 4} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
