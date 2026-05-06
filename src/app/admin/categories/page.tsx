import { prisma } from "@/lib/prisma";
import { CategoriesTable } from "@/components/admin/categories-table";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { order: "asc" },
  });
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-editorial text-bone/50">Categories</p>
        <h2 className="mt-2 font-serif text-4xl font-light">The houses.</h2>
      </div>
      <CategoriesTable categories={categories.map((c) => ({ ...c, productCount: c._count.products }))} />
    </div>
  );
}
