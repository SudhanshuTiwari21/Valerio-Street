export function PolicyPage({
  eyebrow,
  title,
  sections,
}: {
  eyebrow: string;
  title: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <article className="container max-w-3xl py-16 md:py-24">
      <p className="editorial-eyebrow">{eyebrow}</p>
      <h1 className="mt-4 font-serif text-5xl font-light leading-[1.05] md:text-7xl text-balance">{title}</h1>
      <div className="mt-14 space-y-10 text-lg leading-relaxed text-charcoal/80">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-serif text-2xl font-light text-charcoal">{s.heading}</h2>
            <p className="mt-3 whitespace-pre-line">{s.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
