import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Philosophy",
  description: "The slow craft of dressing well. The Valerio Street manifesto.",
};

const PILLARS = [
  { n: "I", title: "Cloth before campaign" },
  { n: "II", title: "Hand before machine" },
  { n: "III", title: "Considered, never loud" },
  { n: "IV", title: "Made to be kept" },
];

export default function AboutPage() {
  return (
    <>
      <section className="container pb-12 pt-16 md:pt-24">
        <p className="editorial-eyebrow">The Manifesto</p>
        <h1 className="mt-4 max-w-4xl font-serif text-5xl font-light leading-[1.02] md:text-8xl text-balance">
          On the quiet art<br />of dressing well.
        </h1>
      </section>

      <section className="relative">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src="/brand/home-editorial-banner.png"
            alt="Atelier"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="container grid gap-16 py-24 md:py-32 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <p className="editorial-eyebrow">Founded 2020 · New Delhi</p>
          <h2 className="mt-5 font-serif text-4xl font-light leading-[1.05] md:text-5xl text-balance">
            Begun with a wardrobe in mind.
          </h2>
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-charcoal/75 lg:col-span-7">
          <p>
            Valerio Street was born of a small frustration. That dressing well had grown loud,
            conspicuous, and, above all, fast. We wanted to build something quieter.
          </p>
          <p>
            We work with families of weavers and tailors across Italy, Portugal and Spain - those
            who have spent generations learning the language of cloth. Our garments arrive without
            announcement, and they stay long after the season.
          </p>
          <p>
            This is luxury for those who never asked for it. A wardrobe of pieces that age well -
            kept for ten years, not ten weeks.
          </p>
        </div>
      </section>

      <section className="bg-sand/40">
        <div className="container grid gap-16 py-24 md:py-32 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <p className="editorial-eyebrow">The four pillars</p>
            <h2 className="mt-5 font-serif text-4xl font-light leading-[1.05] md:text-5xl text-balance">
              What we believe.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
            {PILLARS.map((p) => (
              <div key={p.n} className="border-t border-charcoal/15 pt-6">
                <p className="font-serif text-2xl text-charcoal/40">{p.n}</p>
                <p className="mt-3 font-serif text-2xl font-light">{p.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-24 text-center md:py-32">
        <p className="editorial-eyebrow">Visit the atelier</p>
        <h2 className="mt-4 font-serif text-4xl font-light md:text-6xl text-balance">
          By appointment.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-charcoal/70">
          Tuesday to Saturday. A private session at our Milano atelier - fitting, alterations,
          and a quiet glass of something cold.
        </p>
        <Button asChild className="mt-10">
          <Link href="/contact">Request an appointment</Link>
        </Button>
      </section>
    </>
  );
}
