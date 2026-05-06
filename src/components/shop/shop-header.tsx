export function ShopHeader({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <section className="container pb-12 pt-16 md:pt-24">
      {eyebrow && <p className="editorial-eyebrow">{eyebrow}</p>}
      <h1 className="mt-4 font-serif text-5xl font-light leading-[1.02] md:text-7xl text-balance">
        {title}
      </h1>
    </section>
  );
}
