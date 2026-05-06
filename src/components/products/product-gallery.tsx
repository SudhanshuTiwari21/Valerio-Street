"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const safe = images?.length ? images : ["/placeholder.jpg"];
  return (
    <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
      <div className="order-2 flex gap-3 overflow-x-auto pb-2 sm:order-1 sm:flex-col sm:gap-4 sm:overflow-visible">
        {safe.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1}`}
            className={`relative aspect-[3/4] w-20 shrink-0 overflow-hidden border transition ${
              active === i ? "border-charcoal" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <div className="order-1 sm:order-2">
            <div className="relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden bg-sand/40">
              <AnimatePresence mode="wait">
                <motion.div
                  key={safe[active]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={safe[active]}
                    alt={alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent side="center" className="max-w-5xl bg-charcoal p-0">
          <div className="relative aspect-[3/4] w-full">
            <Image src={safe[active]} alt={alt} fill className="object-contain" sizes="100vw" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
