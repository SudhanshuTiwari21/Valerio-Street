"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export function Lifestyle() {
  return (
    <section className="container grid gap-10 py-24 md:grid-cols-2 md:gap-14 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1 }}
        className="relative aspect-[4/5] overflow-hidden md:translate-y-12"
      >
        <Image
          src="/brand/home-lifestyle-1.png"
          alt="The European weekend"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1, delay: 0.15 }}
        className="flex flex-col justify-end"
      >
        <p className="editorial-eyebrow">A Day In Como</p>
        <h2 className="mt-4 font-serif text-4xl font-light leading-[1.05] md:text-6xl text-balance">
          Of long lunches and<br />slower afternoons.
        </h2>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-charcoal/70">
          A summer wardrobe shot at Lake Como - knit polos, pleated linens, the
          house loafer worn without socks.
        </p>
        <Link href="/lookbook" className="mt-8 luxe-link text-[11px] uppercase tracking-editorial">
          See the story
        </Link>
        <div className="relative mt-12 aspect-[4/3] overflow-hidden">
          <Image
            src="/brand/home-lifestyle-2.png"
            alt="Lake Como"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </motion.div>
    </section>
  );
}
