import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-editorial text-bone/50">Products</p>
          <h2 className="mt-2 font-serif text-4xl font-light">The collection.</h2>
        </div>
        <Button asChild className="bg-bone text-charcoal hover:bg-sand">
          <Link href="/admin/products/new">New piece</Link>
        </Button>
      </div>

      <div className="overflow-x-auto border border-bone/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-editorial text-bone/50">
              <th className="px-6 py-3"></th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-bone/10 hover:bg-bone/5">
                <td className="px-6 py-3">
                  <div className="relative h-12 w-10 overflow-hidden bg-bone/10">
                    {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />}
                  </div>
                </td>
                <td className="px-6 py-3">
                  <Link href={`/admin/products/${p.id}`} className="font-serif text-base text-bone hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="px-6 py-3 text-bone/70">{p.category.name}</td>
                <td className="px-6 py-3 font-serif">{formatINR(p.price)}</td>
                <td className="px-6 py-3 text-[11px] uppercase tracking-editorial text-bone/70">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
