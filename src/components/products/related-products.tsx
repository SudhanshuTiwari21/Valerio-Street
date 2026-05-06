import { ProductCard, type ProductCardData } from "@/components/products/product-card";

export function RelatedProducts({ products }: { products: ProductCardData[] }) {
  if (!products.length) return null;
  return (
    <section className="container py-24 md:py-32">
      <div className="mb-10">
        <p className="editorial-eyebrow">Worn Together</p>
        <h2 className="mt-3 font-serif text-3xl font-light md:text-5xl text-balance">
          Considered companions.
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
