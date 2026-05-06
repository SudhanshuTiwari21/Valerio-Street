import { NewsletterForm } from "./newsletter-form";

export function NewsletterSection() {
  return (
    <section className="bg-bone py-24 md:py-32">
      <div className="container max-w-3xl text-center">
        <p className="editorial-eyebrow">The Letter</p>
        <h2 className="mt-5 font-serif text-4xl font-light leading-[1.05] md:text-6xl text-balance">
          Sparingly sent. Always considered.
        </h2>
        <p className="mt-6 text-base leading-relaxed text-charcoal/70">
          Receive seasonal lookbooks, atelier notes and quiet news. Never hurried.
        </p>
        <div className="mx-auto mt-10 max-w-md">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
