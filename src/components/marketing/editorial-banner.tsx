"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function EditorialBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="relative h-[90svh] min-h-[540px] w-full overflow-hidden bg-charcoal">
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src="/brand/home-editorial-banner.png"
          alt="Editorial fashion"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/40" />
      </motion.div>

      <div className="container relative z-10 flex h-full items-center text-bone">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="editorial-eyebrow text-bone/80">Atelier Notes · No. 04</p>
          <h2 className="mt-6 font-serif text-5xl font-light leading-[1.02] md:text-7xl text-balance">
            The art of dressing<br />without effort.
          </h2>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-bone/80">
            A study on shoulders, weights and the quiet language of cloth - read in
            the latest Valerio Journal.
          </p>
          <Link
            href="/lookbook"
            className="mt-10 inline-block luxe-link text-[11px] uppercase tracking-editorial text-bone"
          >
            Read the editorial
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
