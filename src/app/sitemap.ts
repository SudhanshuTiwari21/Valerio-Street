import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/lookbook",
    "/about",
    "/contact",
    "/policies/shipping",
    "/policies/refund",
    "/policies/privacy",
    "/policies/terms",
  ].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly", priority: 0.8 }));

  let products: MetadataRoute.Sitemap = [];
  try {
    const list = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      take: 1000,
    });
    products = list.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {}

  return [...staticRoutes, ...products];
}
