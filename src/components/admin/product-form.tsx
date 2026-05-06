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

type Cat = { id: string; name: string };

export function ProductForm({
  product,
  categories,
}: {
  product?: any;
  categories: Cat[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [imageInput, setImageInput] = useState("");

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

  function addImage() {
    if (!imageInput) return;
    form.setValue("images", [...(images ?? []), imageInput]);
    setImageInput("");
  }

  function onSubmit(values: ProductInput) {
    start(async () => {
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
    if (!confirm("Archive this piece? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (!res.ok) toast.error("Could not delete");
    else {
      toast.success("Archived");
      router.push("/admin/products");
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-bone">
      <Section title="Identity">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input
            {...form.register("name")}
            onBlur={(e) => {
              if (!form.getValues("slug")) form.setValue("slug", slugify(e.target.value));
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

      <div className="flex items-center justify-between gap-4">
        <Button type="submit" disabled={pending} className="bg-bone text-charcoal hover:bg-sand">
          {pending ? "Saving…" : product ? "Save changes" : "Create piece"}
        </Button>
        {product && (
          <Button type="button" variant="ghost" onClick={onDelete} className="text-bone/60 hover:text-bone">
            Archive
          </Button>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      {label && <Label className="mb-1 block text-bone/60">{label}</Label>}
      {children}
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
