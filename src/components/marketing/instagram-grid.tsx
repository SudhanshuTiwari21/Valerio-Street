"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const IMAGES = [
  "/brand/lookbook-01.png",
  "/brand/lookbook-02.png",
  "/brand/lookbook-03.png",
  "/brand/lookbook-04.png",
  "/brand/home-philosophy.png",
  "/brand/home-craftsmanship.png",
];

export function InstagramGrid() {
  return (
    <section className="bg-bone py-20">
      <div className="container">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="editorial-eyebrow">@valeriostreet</p>
            <h2 className="mt-3 font-serif text-3xl font-light md:text-5xl text-balance">
              From the journal.
            </h2>
          </div>
          <a
            href="https://instagram.com/valeriostreet"
            className="luxe-link hidden text-[11px] uppercase tracking-editorial md:block"
          >
            Follow
          </a>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {IMAGES.map((src, i) => (
            <motion.a
              key={src}
              href="https://instagram.com/valeriostreet"
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className="group relative aspect-square overflow-hidden bg-sand/40"
            >
              <Image
                src={src}
                alt="Editorial moment"
                fill
                sizes="(min-width: 1024px) 16vw, 50vw"
                className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
