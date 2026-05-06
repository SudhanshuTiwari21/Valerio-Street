import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { site } from "@/lib/site";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const metadata: Metadata = { title: "Contact" };

const FAQ = [
  {
    q: "How long does shipping take?",
    a: "Within India, 3 - 5 business days. Internationally, 7 - 12 business days, with discreet door-to-door tracking.",
  },
  {
    q: "Can I exchange a piece?",
    a: "Yes. We offer a 14-day considered exchange. Pieces must arrive in atelier condition with the original seal.",
  },
  {
    q: "Do you offer alterations?",
    a: "We do. Complimentary alterations for all garments purchased through our atelier. Please write to us first.",
  },
  {
    q: "How can I visit the atelier?",
    a: "Our Milano atelier is open Tuesday to Saturday, by appointment only.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="container pb-12 pt-16 md:pt-24">
        <p className="editorial-eyebrow">Atelier</p>
        <h1 className="mt-4 font-serif text-5xl font-light leading-[1.02] md:text-7xl text-balance">
          A quiet word.
        </h1>
      </section>

      <section className="container grid gap-12 pb-24 lg:grid-cols-12 lg:gap-20 md:pb-32">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

        <aside className="lg:col-span-5">
          <div className="space-y-10 border-t border-charcoal/10 pt-10 lg:border-0 lg:pt-0">
            <Block label="Email" value={site.contact.email} />
            <Block label="Telephone" value={site.contact.phone} />
            <Block label="Atelier" value={site.contact.address} />
          </div>
        </aside>
      </section>

      <section className="bg-sand/40">
        <div className="container py-24 md:py-32">
          <p className="editorial-eyebrow">Frequent enquiries</p>
          <h2 className="mt-3 font-serif text-4xl font-light md:text-6xl text-balance">Considered answers.</h2>
          <Accordion type="single" collapsible className="mt-10 max-w-3xl">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`f${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}

function Block({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <p className="editorial-eyebrow">{label}</p>
      <p className="mt-2 font-serif text-xl">{value}</p>
    </div>
  );
}
