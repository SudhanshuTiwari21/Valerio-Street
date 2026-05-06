"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-charcoal">
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=2400&q=85"
          alt="Valerio Street - quiet luxury menswear"
          fill
          priority
          sizes="100vw"
          className="animate-ken-burns object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/20 to-charcoal/70" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="container relative z-10 flex h-full flex-col justify-end pb-20 text-bone sm:pb-28"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="editorial-eyebrow text-bone/80"
        >
          The Spring Collection · MMXXVI
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-4xl font-serif text-[clamp(2.5rem,7vw,6.5rem)] font-light leading-[0.95] text-balance"
        >
          Timeless menswear<br />for the modern gentleman.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7 }}
          className="mt-8 max-w-xl font-sans text-base leading-relaxed text-bone/80"
        >
          European-inspired essentials, hand-finished in Italian ateliers and
          crafted for quiet luxury and refined living.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.95 }}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          <Button asChild size="lg" variant="bone">
            <Link href="/shop">Explore the Collection</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-bone/60 text-bone hover:bg-bone hover:text-charcoal">
            <Link href="/about">Our Philosophy</Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-bone/70"
      >
        <div className="flex flex-col items-center gap-3 text-[10px] uppercase tracking-editorial">
          <span>Scroll</span>
          <span className="h-12 w-px animate-pulse bg-bone/50" />
        </div>
      </motion.div>
    </section>
  );
}
