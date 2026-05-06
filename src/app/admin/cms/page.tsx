import { prisma } from "@/lib/prisma";
import { CMSEditor } from "@/components/admin/cms-editor";

const KEYS = ["hero", "philosophy", "lookbook_banner"] as const;

export default async function CMSPage() {
  const items = await prisma.cMSContent.findMany({ where: { key: { in: [...KEYS] } } });
  const map = Object.fromEntries(items.map((i) => [i.key, i]));
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-editorial text-bone/50">CMS</p>
        <h2 className="mt-2 font-serif text-4xl font-light">Storefront content.</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {KEYS.map((k) => (
          <CMSEditor
            key={k}
            slot={k}
            initial={
              map[k]
                ? { title: map[k].title ?? "", body: typeof map[k].body === "string" ? (map[k].body as any) : "" }
                : { title: "", body: "" }
            }
          />
        ))}
      </div>
    </div>
  );
}
