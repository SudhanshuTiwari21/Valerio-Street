"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const PILLARS = [
  {
    n: "01",
    title: "Cloth, sourced.",
    body: "Mills in Biella, Como and Porto - chosen for hand-feel before label.",
  },
  {
    n: "02",
    title: "Hands, slow.",
    body: "Garments finished in small ateliers. Single-needle, hand-set sleeves.",
  },
  {
    n: "03",
    title: "Pieces, kept.",
    body: "Cuts that age into the wardrobe. Made to be worn for years, not seasons.",
  },
];

export function Craftsmanship() {
  return (
    <section className="bg-charcoal text-bone">
      <div className="container grid gap-16 py-24 md:py-32 lg:grid-cols-12 lg:gap-24">
        <div className="lg:col-span-5">
          <p className="editorial-eyebrow text-bone/60">The Craft</p>
          <h2 className="mt-5 font-serif text-4xl font-light leading-[1.05] md:text-6xl text-balance">
            The slow craft<br />of dressing well.
          </h2>
          <div className="relative mt-12 aspect-[4/5] overflow-hidden">
            <Image
              src="/brand/home-craftsmanship.png"
              alt="Atelier hands"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="space-y-12 lg:col-span-7 lg:pt-24">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-[auto_1fr] gap-8 border-t border-bone/15 pt-12"
            >
              <span className="font-serif text-2xl text-bone/60">{p.n}</span>
              <div>
                <h3 className="font-serif text-3xl font-light text-bone md:text-4xl">{p.title}</h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-bone/70">{p.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
