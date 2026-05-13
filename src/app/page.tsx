import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/marketing/hero";
import { FeaturedCategories } from "@/components/marketing/featured-categories";
import { Philosophy } from "@/components/marketing/philosophy";
import { EditorialBanner } from "@/components/marketing/editorial-banner";
import { FeaturedProducts } from "@/components/marketing/featured-products";
import { Lifestyle } from "@/components/marketing/lifestyle";
import { Craftsmanship } from "@/components/marketing/craftsmanship";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { InstagramGrid } from "@/components/marketing/instagram-grid";
import { ComingSoonStrip } from "@/components/marketing/coming-soon";
import type { ProductCardData } from "@/components/products/product-card";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Valerio Street - Quiet Luxury for the Modern Gentleman",
  description:
    "European-inspired menswear essentials, crafted for quiet luxury and refined living.",
};

async function getNewInAtelier(): Promise<ProductCardData[]> {
  try {
    const list = await prisma.product.findMany({
      // Homepage “New In Atelier”: show newest ACTIVE pieces (not just manually featured).
      where: { status: "ACTIVE" },
      include: { category: { select: { name: true } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
    return list.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images,
      category: p.category,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getNewInAtelier();

  return (
    <>
      <Hero />
      <FeaturedCategories />
      <Philosophy />
      <EditorialBanner />
      {featured.length > 0 ? <FeaturedProducts products={featured} /> : <ComingSoonStrip />}
      <Lifestyle />
      <Craftsmanship />
      <NewsletterSection />
      <InstagramGrid />
    </>
  );
}
