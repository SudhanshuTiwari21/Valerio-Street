"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useEffect, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["Bone", "Charcoal", "Olive", "Camel", "Navy"];
const PRICES = [
  { label: "Under ₹10,000", min: 0, max: 10000 },
  { label: "₹10,000 - ₹20,000", min: 10000, max: 20000 },
  { label: "₹20,000 - ₹35,000", min: 20000, max: 35000 },
  { label: "Over ₹35,000", min: 35000, max: 999999 },
];

type Cat = { id: string; slug: string; name: string };

export function ShopFilters({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => setQ(params.get("q") ?? ""), [params]);

  function set(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value == null || value === "") next.delete(key);
    else next.set(key, value);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  function setPrice(min: number, max: number) {
    const next = new URLSearchParams(params.toString());
    next.set("min", String(min));
    next.set("max", String(max));
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  return (
    <div className="sticky top-32 space-y-6">
      <div>
        <p className="editorial-eyebrow mb-3">Search</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            set("q", q);
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the atelier"
            className="h-11 w-full border-b border-charcoal/30 bg-transparent text-sm placeholder:text-charcoal/40 focus:border-charcoal focus:outline-none"
          />
        </form>
      </div>

      <Accordion type="multiple" defaultValue={["category", "size", "price"]}>
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3">
              <FilterButton
                active={!params.get("category")}
                onClick={() => set("category", null)}
                label="All"
              />
              {categories.map((c) => (
                <FilterButton
                  key={c.id}
                  active={params.get("category") === c.slug}
                  onClick={() => set("category", c.slug)}
                  label={c.name}
                />
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => {
                const active = params.get("size") === s;
                return (
                  <button
                    key={s}
                    onClick={() => set("size", active ? null : s)}
                    className={`h-9 min-w-9 border px-3 text-[11px] uppercase tracking-editorial transition-colors ${
                      active ? "border-charcoal bg-charcoal text-bone" : "border-charcoal/20 text-charcoal hover:border-charcoal"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color">
          <AccordionTrigger>Colour</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3">
              {COLORS.map((c) => (
                <li key={c} className="flex items-center gap-3">
                  <Checkbox
                    checked={params.get("color") === c}
                    onCheckedChange={(v) => set("color", v ? c : null)}
                    id={`c-${c}`}
                  />
                  <label htmlFor={`c-${c}`} className="text-sm text-charcoal">
                    {c}
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3">
              {PRICES.map((p) => {
                const active = params.get("min") === String(p.min) && params.get("max") === String(p.max);
                return (
                  <FilterButton
                    key={p.label}
                    active={active}
                    onClick={() => setPrice(p.min, p.max)}
                    label={p.label}
                  />
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`text-left text-sm transition-colors ${
          active ? "text-charcoal" : "text-charcoal/60 hover:text-charcoal"
        }`}
      >
        {active && <span className="mr-2 inline-block h-px w-4 -translate-y-1 bg-charcoal align-middle" />}
        {label}
      </button>
    </li>
  );
}
