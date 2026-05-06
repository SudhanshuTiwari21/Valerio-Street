import type { Metadata } from "next";
import { Suspense } from "react";

import { prisma } from "@/lib/prisma";
import { ShopGrid } from "@/components/shop/shop-grid";
import { ShopHeader } from "@/components/shop/shop-header";
import { ShopFilters } from "@/components/shop/shop-filters";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "The Collection",
  description: "Quietly considered menswear from Valerio Street.",
};

type SP = {
  category?: string;
  q?: string;
  sort?: string;
  size?: string;
  color?: string;
  min?: string;
  max?: string;
};

async function getData(sp: SP) {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (sp.category) where.category = { slug: sp.category };
  if (sp.q) where.name = { contains: sp.q, mode: "insensitive" };
  if (sp.min || sp.max)
    where.price = {
      gte: sp.min ? Number(sp.min) * 100 : undefined,
      lte: sp.max ? Number(sp.max) * 100 : undefined,
    };
  if (sp.size) where.variants = { some: { size: sp.size } };
  if (sp.color) where.variants = { some: { color: sp.color } };

  const order: Prisma.ProductOrderByWithRelationInput =
    sp.sort === "price-asc"
      ? { price: "asc" }
      : sp.sort === "price-desc"
        ? { price: "desc" }
        : sp.sort === "newest"
          ? { createdAt: "desc" }
          : { createdAt: "desc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: order,
      take: 60,
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
  ]);

  return { products, categories };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { products, categories } = await getData(sp);

  return (
    <div className="bg-bone">
      <ShopHeader title="The Collection" eyebrow="Atelier · Spring MMXXVI" />

      <div className="container grid gap-12 pb-24 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-3">
          <Suspense>
            <ShopFilters categories={categories} />
          </Suspense>
        </aside>
        <section className="lg:col-span-9">
          <ShopGrid
            products={products.map((p) => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              price: p.price,
              compareAtPrice: p.compareAtPrice,
              images: p.images,
              category: p.category,
            }))}
          />
        </section>
      </div>
    </div>
  );
}
