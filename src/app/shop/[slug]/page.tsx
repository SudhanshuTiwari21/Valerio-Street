import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductPanel } from "@/components/products/product-panel";
import { RelatedProducts } from "@/components/products/related-products";
import { site } from "@/lib/site";
import { formatINR } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!p) return { title: "Not found" };
  return {
    title: p.metaTitle ?? p.name,
    description: p.metaDescription ?? p.description.slice(0, 160),
    openGraph: {
      title: p.metaTitle ?? p.name,
      description: p.metaDescription ?? p.description.slice(0, 160),
      images: p.images?.[0] ? [{ url: p.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  });
  if (!product || product.status !== "ACTIVE") return notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id }, status: "ACTIVE" },
    take: 4,
    include: { category: { select: { name: true } } },
  });

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      url: `${site.url}/shop/${product.slug}`,
      priceCurrency: "INR",
      price: (product.price / 100).toFixed(2),
      availability:
        product.variants.some((v) => v.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <article className="bg-bone">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <div className="container grid gap-12 pt-12 lg:grid-cols-12 lg:gap-16 lg:pt-20">
        <div className="lg:col-span-5">
          <ProductGallery images={product.images} alt={product.name} />
        </div>
        <div className="lg:col-span-7 lg:sticky lg:top-32 lg:self-start">
          <ProductPanel
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              description: product.description,
              story: product.story,
              materials: product.materials,
              stylingNotes: product.stylingNotes,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              images: product.images,
              category: { name: product.category.name },
              variants: product.variants,
              priceLabel: formatINR(product.price),
            }}
          />
        </div>
      </div>

      <RelatedProducts
        products={related.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          images: p.images,
          category: p.category,
        }))}
      />
    </article>
  );
}
