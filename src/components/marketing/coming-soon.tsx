"use client";

import { motion } from "framer-motion";

export function ComingSoonStrip() {
  return (
    <section className="border-y border-charcoal/10 bg-bone">
      <div className="container py-12">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="editorial-eyebrow"
        >
          The Atelier
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          className="mt-4 max-w-3xl font-serif text-3xl font-light leading-snug text-balance md:text-5xl"
        >
          The Spring Collection arrives in atelier shortly. Please return, or join The Letter for a quiet word.
        </motion.p>
      </div>
    </section>
  );
}
