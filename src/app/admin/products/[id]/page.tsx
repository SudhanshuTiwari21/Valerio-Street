import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
  ]);
  if (!product) return notFound();

  return (
    <div>
      <p className="text-[10px] uppercase tracking-editorial text-bone/50">Edit piece</p>
      <h2 className="mt-2 font-serif text-4xl font-light">{product.name}</h2>
      <div className="mt-10 max-w-3xl">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
