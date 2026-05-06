"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export function Philosophy() {
  return (
    <section className="bg-sand/50">
      <div className="container grid items-center gap-12 py-24 md:py-32 lg:grid-cols-12 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] overflow-hidden lg:col-span-6"
        >
          <Image
            src="/brand/home-philosophy.png"
            alt="Quiet luxury, considered tailoring"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6"
        >
          <p className="editorial-eyebrow">Our Philosophy</p>
          <h2 className="mt-5 font-serif text-4xl font-light leading-[1.05] md:text-6xl text-balance">
            Quiet, by design.<br />Considered, by hand.
          </h2>
          <p className="mt-8 max-w-xl font-serif text-xl font-light leading-relaxed text-charcoal/80">
            We believe in the slow craft. In garments that arrive without
            announcement, and stay long after the season.
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-charcoal/70">
            Every piece is finished in small ateliers across Italy, Portugal and
            Spain - chosen for hand-feel before label, for cloth before campaign.
            This is luxury for those who never asked for it.
          </p>
          <div className="mt-10 flex items-center gap-8">
            <Link href="/about" className="luxe-link text-[11px] uppercase tracking-editorial">
              Read the manifesto
            </Link>
            <span className="editorial-rule" />
            <span className="text-[10px] uppercase tracking-editorial text-charcoal/50">Est. 2020</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
