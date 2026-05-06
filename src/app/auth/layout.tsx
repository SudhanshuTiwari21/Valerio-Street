import Image from "next/image";
import { Brand } from "@/components/brand/brand";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-[calc(100svh-3rem)] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="/brand/contact-hero.png"
          alt="Atelier"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-charcoal/30" />
        <div className="absolute inset-x-0 bottom-12 px-12 text-bone">
          <p className="editorial-eyebrow text-bone/70">Valerio Street</p>
          <p className="mt-4 max-w-md font-serif text-3xl font-light leading-tight">
            Quiet luxury for the modern gentleman.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-md">
          <Brand className="text-charcoal" size="md" markClassName="h-11 w-11" textClassName="text-xl" />
          <div className="mt-12">{children}</div>
        </div>
      </div>
    </div>
  );
}
