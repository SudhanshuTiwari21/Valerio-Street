import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Editorial moments from the Valerio Street atelier.",
};

const STORIES = [
  {
    title: "A day in Como",
    eyebrow: "Editorial No. 04 · Spring",
    image: "/brand/lookbook-01.png",
    href: "/shop?category=polos",
    body: "Knit polos and pleated linen, shot at first light by the lake.",
  },
  {
    title: "The slow weekend",
    eyebrow: "Editorial No. 03 · Winter",
    image: "/brand/lookbook-02.png",
    href: "/shop?category=trousers",
    body: "Brushed merino flannels, cashmere knits, the unhurried hour.",
  },
  {
    title: "Atelier hours",
    eyebrow: "Editorial No. 02 · Notes",
    image: "/brand/lookbook-03.png",
    href: "/shop",
    body: "From cloth to garment - a quiet visit to our Italian house.",
  },
  {
    title: "After dinner",
    eyebrow: "Editorial No. 01 · Autumn",
    image: "/brand/lookbook-04.png",
    href: "/shop?category=shirts",
    body: "An evening shirt, an unlined loafer, the long way home.",
  },
];

export default function LookbookPage() {
  return (
    <>
      <section className="container pb-12 pt-16 md:pt-24">
        <p className="editorial-eyebrow">The Journal</p>
        <h1 className="mt-4 font-serif text-5xl font-light leading-[1.02] md:text-8xl text-balance">
          Lookbook.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-charcoal/70">
          Editorial moments and stories from the atelier - a slow record of how
          the wardrobe is worn.
        </p>
      </section>

      <section className="container space-y-32 pb-24 md:pb-32">
        {STORIES.map((s, i) => (
          <article key={s.title} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image src={s.image} alt={s.title} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
              </div>
            </div>
            <div className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
              <p className="editorial-eyebrow">{s.eyebrow}</p>
              <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-6xl text-balance">
                {s.title}
              </h2>
              <p className="mt-6 text-lg text-charcoal/75">{s.body}</p>
              <Button asChild variant="outline" className="mt-8">
                <Link href={s.href}>See the pieces</Link>
              </Button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
