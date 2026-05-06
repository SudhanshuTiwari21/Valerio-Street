import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="font-serif text-2xl font-light">Wishlist</h2>
      {items.length === 0 ? (
        <p className="mt-6 text-charcoal/60">Saved pieces will live here.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((w) => (
            <ProductCard
              key={w.id}
              product={{
                id: w.product.id,
                slug: w.product.slug,
                name: w.product.name,
                price: w.product.price,
                compareAtPrice: w.product.compareAtPrice,
                images: w.product.images,
                category: w.product.category,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
