import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });
  return (
    <div>
      <p className="text-[10px] uppercase tracking-editorial text-bone/50">New piece</p>
      <h2 className="mt-2 font-serif text-4xl font-light">Add to atelier.</h2>
      <div className="mt-10 max-w-3xl">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
