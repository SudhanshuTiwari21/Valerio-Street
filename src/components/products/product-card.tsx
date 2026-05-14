"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  category?: { name: string } | null;
};

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const [a, b] = product.images;
  return (
    <motion.div whileHover="hover" initial="initial" className="group">
      <Link
        href={`/shop/${product.slug}`}
        className="block"
        scroll
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-sand/30">
          {a && (
            <motion.div
              variants={{ initial: { opacity: 1 }, hover: { opacity: b ? 0 : 1 } }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <Image
                src={a}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                priority={priority}
                className="object-cover"
              />
            </motion.div>
          )}
          {b && (
            <motion.div
              variants={{ initial: { opacity: 0 }, hover: { opacity: 1 } }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <Image src={b} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </motion.div>
          )}
        </div>

        <div className="mt-5 flex items-start justify-between gap-3">
          <div>
            {product.category && (
              <p className="text-[10px] uppercase tracking-editorial text-charcoal/50">
                {product.category.name}
              </p>
            )}
            <h3 className="mt-1 font-serif text-lg font-light leading-snug text-charcoal">
              {product.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="font-serif text-base text-charcoal">{formatINR(product.price)}</p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-[11px] text-charcoal/40 line-through">
                {formatINR(product.compareAtPrice)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
