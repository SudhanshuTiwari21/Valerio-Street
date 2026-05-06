"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { productSchema, type ProductInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";

type Cat = { id: string; name: string; sizeScale: "ALPHA" | "SHOE_EU" };
type VariantRow = {
  id?: string;
  localId: string;
  size?: string | null;
  color?: string | null;
  sku: string;
  stock: number;
  priceDiff: number;
};

type VariantFromDb = Omit<VariantRow, "localId">;

function newLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `v_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function uniqueSku(base: string, existing: Set<string>) {
  let sku = base;
  if (!existing.has(sku)) return sku;
  for (let i = 0; i < 50; i++) {
    const suffix = Math.random().toString(16).slice(2, 6).toUpperCase();
    sku = `${base}-${suffix}`;
    if (!existing.has(sku)) return sku;
  }
  return `${base}-${Date.now()}`;
}

export function ProductForm({
  product,
  categories,
  variants,
}: Readonly<{
  product?: any;
  categories: Cat[];
  variants?: VariantFromDb[];
}>) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [imageInput, setImageInput] = useState("");
  const [variantRows, setVariantRows] = useState<VariantRow[]>(
    () =>
      (variants ?? []).map((v, i) => ({
        ...v,
        localId: v.id ?? `seed_${i}_${Date.now()}`,
      })),
  );
  const [variantSaving, setVariantSaving] = useState(false);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          story: product.story ?? "",
          materials: product.materials ?? "",
          stylingNotes: product.stylingNotes ?? "",
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? undefined,
          categoryId: product.categoryId,
          status: product.status,
          isFeatured: product.isFeatured,
          images: product.images ?? [],
          metaTitle: product.metaTitle ?? "",
          metaDescription: product.metaDescription ?? "",
        }
      : {
          name: "",
          slug: "",
          description: "",
          price: 0,
          categoryId: categories[0]?.id ?? "",
          status: "ACTIVE",
          isFeatured: false,
          images: [],
        },
  });

  const images = form.watch("images");
  const categoryId = form.watch("categoryId");
  const sizeScale = categories.find((c) => c.id === categoryId)?.sizeScale ?? "ALPHA";
  const sizeOptions = sizeScale === "SHOE_EU" ? ["39", "40", "41", "42", "43", "44", "45"] : ["XS", "S", "M", "L", "XL", "XXL"];
  const inventoryOk = variantRows.some((v) => (v.stock ?? 0) > 0);

  const submitLabel = (() => {
    if (pending) return "Saving…";
    if (product) return "Save changes";
    return "Create piece";
  })();

  function updateVariant(idx: number, patch: Partial<VariantRow>) {
    setVariantRows((prev) => prev.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }

  function addImage() {
    if (!imageInput) return;
    form.setValue("images", [...(images ?? []), imageInput]);
    setImageInput("");
  }

  function onSubmit(values: ProductInput) {
    start(async () => {
      // Strict admin guardrails: no Active/Featured without inventory
      if ((values.status === "ACTIVE" || values.isFeatured) && !inventoryOk) {
        toast.error("Add at least one variant with stock ≥ 1 before setting Active or Featured.");
        return;
      }
      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = product ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        toast.error("Could not save");
        return;
      }
      const data = await res.json();
      toast.success(product ? "Saved" : "Created");
      router.push(product ? "/admin/products" : `/admin/products/${data.id}`);
      router.refresh();
    });
  }

  async function onDelete() {
    if (!product) return;
    const isArchived = product.status === "ARCHIVED";
    const prompt = isArchived ? "Unarchive this piece?" : "Archive this piece?";
    if (!confirm(prompt)) return;
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: isArchived ? "ACTIVE" : "ARCHIVED" }),
    });
    if (res.ok) {
      toast.success(isArchived ? "Unarchived" : "Archived");
      router.push("/admin/products");
      router.refresh();
      return;
    }
    toast.error("Could not delete");
  }

  async function hardDelete() {
    if (!product) return;
    if (!confirm("Permanently delete this product? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "HARD_DELETE" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not delete");
      toast.success("Deleted permanently");
      router.push("/admin/products");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function addVariantRow() {
    if (!product?.slug) return;
    const existing = new Set(variantRows.map((v) => v.sku.trim()).filter(Boolean));
    const size = sizeOptions[0] ?? null;
    const base = `${product.slug}-${size ?? "VAR"}`.toLowerCase();
    const sku = uniqueSku(base, existing);
    setVariantRows((p) => [
      ...p,
      { localId: newLocalId(), sku, size, color: null, stock: 0, priceDiff: 0 },
    ]);
  }

  function removeVariantRow(idx: number) {
    setVariantRows((p) => p.filter((_, i) => i !== idx));
  }

  async function saveVariants() {
    if (!product?.id) return;
    setVariantSaving(true);
    try {
      const duplicates = (() => {
        const seen = new Set<string>();
        const dups = new Set<string>();
        for (const v of variantRows) {
          const sku = v.sku.trim();
          if (!sku) continue;
          if (seen.has(sku)) dups.add(sku);
          else seen.add(sku);
        }
        return Array.from(dups);
      })();
      if (duplicates.length) {
        throw new Error(`Duplicate SKU(s): ${duplicates.slice(0, 3).join(", ")}`);
      }

      const res = await fetch(`/api/admin/products/${product.id}/variants`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          variants: variantRows.map(({ localId: _localId, ...rest }) => rest),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save variants");
      toast.success("Variants saved");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setVariantSaving(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-bone">
      <Section title="Identity">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input
            {...form.register("name")}
            onBlur={(e) => {
              if (form.getValues("slug")) return;
              form.setValue("slug", slugify(e.target.value));
            }}
            className="text-bone"
          />
        </Field>
        <Field label="Slug" error={form.formState.errors.slug?.message}>
          <Input {...form.register("slug")} className="text-bone" />
        </Field>
        <Field className="sm:col-span-2" label="Description" error={form.formState.errors.description?.message}>
          <Textarea rows={4} {...form.register("description")} className="text-bone" />
        </Field>
        <Field className="sm:col-span-2" label="The story (optional)">
          <Textarea rows={3} {...form.register("story")} className="text-bone" />
        </Field>
        <Field label="Materials">
          <Textarea rows={3} {...form.register("materials")} className="text-bone" />
        </Field>
        <Field label="Styling notes">
          <Textarea rows={3} {...form.register("stylingNotes")} className="text-bone" />
        </Field>
      </Section>

      <Section title="Pricing & status">
        <Field label="Price (paise)" error={form.formState.errors.price?.message}>
          <Input type="number" min={0} {...form.register("price")} className="text-bone" />
        </Field>
        <Field label="Compare-at price (paise)">
          <Input type="number" min={0} {...form.register("compareAtPrice")} className="text-bone" />
        </Field>
        <Field label="Category">
          <select
            {...form.register("categoryId")}
            className="h-11 w-full border-b border-bone/30 bg-transparent text-sm text-bone focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-charcoal">{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            {...form.register("status")}
            className="h-11 w-full border-b border-bone/30 bg-transparent text-sm text-bone focus:outline-none"
          >
            {["DRAFT", "ACTIVE", "ARCHIVED"].map((s) => (
              <option key={s} value={s} className="bg-charcoal">{s}</option>
            ))}
          </select>
        </Field>
        <Field className="sm:col-span-2" label="">
          <label className="mt-2 inline-flex items-center gap-3 text-sm">
            <input type="checkbox" {...form.register("isFeatured")} /> Feature on homepage
          </label>
        </Field>
      </Section>

      <Section title="Imagery (paste URLs)">
        <div className="sm:col-span-2">
          <div className="flex gap-3">
            <Input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="https://res.cloudinary.com/…"
              className="text-bone"
            />
            <Button type="button" variant="outline" className="border-bone/40 text-bone hover:bg-bone hover:text-charcoal" onClick={addImage}>
              Add
            </Button>
          </div>
          <ul className="mt-4 space-y-1 text-xs text-bone/60">
            {(images ?? []).map((u, i) => (
              <li key={u + i} className="flex items-center justify-between gap-3 border-b border-bone/10 pb-2">
                <span className="truncate">{u}</span>
                <button
                  type="button"
                  onClick={() => form.setValue("images", images.filter((_, idx) => idx !== i))}
                  className="text-bone/50 hover:text-bone"
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="SEO">
        <Field label="Meta title"><Input {...form.register("metaTitle")} className="text-bone" /></Field>
        <Field label="Meta description"><Input {...form.register("metaDescription")} className="text-bone" /></Field>
      </Section>

      {product?.id && (
        <Section title="Variants & stock">
          <div className="sm:col-span-2">
            <div className="overflow-x-auto border border-bone/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-editorial text-bone/50">
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Colour</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Price diff</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {variantRows.map((v, idx) => (
                    <tr key={v.id ?? v.localId} className="border-t border-bone/10">
                      <td className="px-4 py-2">
                        <select
                          value={v.size ?? ""}
                          onChange={(e) => updateVariant(idx, { size: e.target.value || null })}
                          className="h-10 w-24 border-b border-bone/30 bg-transparent text-[11px] uppercase tracking-editorial text-bone focus:outline-none"
                        >
                          <option value="" className="bg-charcoal">—</option>
                          {sizeOptions.map((s) => (
                            <option key={s} value={s} className="bg-charcoal">{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={v.color ?? ""}
                          onChange={(e) => updateVariant(idx, { color: e.target.value || null })}
                          className="h-10 w-32 border-b border-bone/30 bg-transparent text-bone focus:outline-none"
                          placeholder="Charcoal"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={v.sku}
                          onChange={(e) => updateVariant(idx, { sku: e.target.value })}
                          className="h-10 w-56 border-b border-bone/30 bg-transparent text-bone focus:outline-none"
                          placeholder="milano-cashmere-polo-M"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) => updateVariant(idx, { stock: Number(e.target.value) })}
                          className="h-10 w-24 border-b border-bone/30 bg-transparent text-bone focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={v.priceDiff}
                          onChange={(e) => updateVariant(idx, { priceDiff: Number(e.target.value) })}
                          className="h-10 w-28 border-b border-bone/30 bg-transparent text-bone focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeVariantRow(idx)}
                          className="text-[11px] uppercase tracking-editorial text-bone/60 hover:text-bone"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {variantRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-bone/50">
                        No variants yet. Add sizes/colours for stock control.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-bone/40 text-bone hover:bg-bone hover:text-charcoal"
                onClick={addVariantRow}
              >
                Add variant
              </Button>
              <Button
                type="button"
                className="bg-bone text-charcoal hover:bg-sand"
                onClick={saveVariants}
                disabled={variantSaving}
              >
                {variantSaving ? "Saving variants…" : "Save variants"}
              </Button>
            </div>
          </div>
        </Section>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button type="submit" disabled={pending} className="bg-bone text-charcoal hover:bg-sand">
          {submitLabel}
        </Button>
        {product && (
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" onClick={onDelete} className="text-bone/60 hover:text-bone">
              {product.status === "ARCHIVED" ? "Unarchive" : "Archive"}
            </Button>
            <Button type="button" variant="ghost" onClick={hardDelete} className="text-red-300/80 hover:text-red-200">
              Delete permanently
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <fieldset className="border border-bone/10 p-6">
      <legend className="px-2 text-[10px] uppercase tracking-editorial text-bone/50">{title}</legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: Readonly<{
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className={className}>
      {label && <Label className="mb-1 block text-bone/60">{label}</Label>}
      {children}
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
