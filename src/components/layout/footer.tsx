import Link from "next/link";
import { site, NAV } from "@/lib/site";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { Brand } from "@/components/brand/brand";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-charcoal/10 bg-bone">
      <div className="container grid gap-16 py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Brand
            className="text-charcoal"
            size="md"
            markClassName="h-11 w-11"
            textClassName="text-2xl"
          />
          <p className="mt-6 max-w-md font-serif text-2xl font-light leading-snug text-charcoal text-balance">
            Quiet luxury, considered tailoring, and the slow craft of European menswear.
          </p>
          <div className="mt-10">
            <p className="editorial-eyebrow">The Letter</p>
            <p className="mt-3 max-w-md text-sm text-charcoal/60">
              Receive new arrivals, atelier notes and seasonal lookbooks. Sparingly sent.
            </p>
            <div className="mt-6 max-w-md">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
          <FooterCol title="Shop" links={[...NAV.shop]} />
          <FooterCol
            title="House"
            links={[
              { label: "Philosophy", href: "/about" },
              { label: "Lookbook", href: "/lookbook" },
              { label: "Contact", href: "/contact" },
              { label: "Sign in", href: "/auth/login" },
            ]}
          />
          <FooterCol title="Service" links={[...NAV.policies]} />
        </div>
      </div>

      <div className="border-t border-charcoal/10">
        <div className="container flex flex-col items-start justify-between gap-4 py-6 text-[10px] uppercase tracking-editorial text-charcoal/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href={site.social.instagram} className="luxe-link">Instagram</a>
            <a href={site.social.pinterest} className="luxe-link">Pinterest</a>
            <a href={site.social.linkedin} className="luxe-link">LinkedIn</a>
          </div>
          <p>{site.contact.address}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: Readonly<{ title: string; links: { label: string; href: string }[] }>) {
  return (
    <div>
      <p className="editorial-eyebrow">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="luxe-link text-sm text-charcoal/80">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
