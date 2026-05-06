"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const items = [
  {
    title: "Polos",
    href: "/shop?category=polos",
    image: "/brand/cat-polos.png",
  },
  {
    title: "Shirts",
    href: "/shop?category=shirts",
    image: "/brand/cat-shirts.png",
  },
  {
    title: "Trousers",
    href: "/shop?category=trousers",
    image: "/brand/cat-trousers.png",
  },
  {
    title: "Footwear",
    href: "/shop?category=footwear",
    image: "/brand/cat-footwear.png",
  },
];

export function FeaturedCategories() {
  return (
    <section className="container py-24 md:py-32">
      <div className="mb-14 flex items-end justify-between gap-6">
        <div>
          <p className="editorial-eyebrow">The Houses of Valerio</p>
          <h2 className="mt-3 max-w-2xl font-serif text-4xl font-light leading-[1.05] md:text-6xl text-balance">
            Pieces, considered.
          </h2>
        </div>
        <Link href="/shop" className="luxe-link hidden text-[11px] uppercase tracking-editorial md:block">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={it.href} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-sand/40">
                <Image
                  src={it.image}
                  alt={it.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                />
              </div>
              <div className="mt-5 flex items-baseline justify-between">
                <h3 className="font-serif text-2xl font-light text-charcoal">{it.title}</h3>
                <span className="luxe-link text-[10px] uppercase tracking-editorial text-charcoal/60">
                  Explore
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
