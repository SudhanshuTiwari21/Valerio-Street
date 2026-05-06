"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";

type Cat = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  isActive: boolean;
  banner: string | null;
  productCount: number;
};

export function CategoriesTable({ categories: init }: { categories: Cat[] }) {
  const [categories, setCategories] = useState(init);
  const [name, setName] = useState("");
  const [, start] = useTransition();

  async function add() {
    if (!name.trim()) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, slug: slugify(name) }),
    });
    if (!res.ok) return toast.error("Could not create");
    const c = await res.json();
    setCategories((prev) => [...prev, { ...c, productCount: 0 }]);
    setName("");
    toast.success("Created");
  }

  function patch(id: string, body: Partial<Cat>) {
    start(async () => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) toast.error("Could not save");
      else toast.success("Saved");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3 border border-bone/10 p-6">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-editorial text-bone/50">New category</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 text-bone" />
        </div>
        <Button onClick={add} className="bg-bone text-charcoal hover:bg-sand">Add</Button>
      </div>

      <div className="overflow-x-auto border border-bone/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-editorial text-bone/50">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Pieces</th>
              <th className="px-6 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-bone/10">
                <td className="px-6 py-3">
                  <input
                    defaultValue={c.name}
                    onBlur={(e) => patch(c.id, { name: e.target.value })}
                    className="bg-transparent font-serif text-base text-bone focus:outline-none"
                  />
                </td>
                <td className="px-6 py-3 text-bone/60">{c.slug}</td>
                <td className="px-6 py-3 text-bone/70">{c.productCount}</td>
                <td className="px-6 py-3">
                  <input
                    type="checkbox"
                    defaultChecked={c.isActive}
                    onChange={(e) => patch(c.id, { isActive: e.target.checked })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
