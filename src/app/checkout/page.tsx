import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="container py-16 md:py-24">
      <p className="editorial-eyebrow">Checkout</p>
      <h1 className="mt-3 font-serif text-4xl font-light md:text-6xl text-balance">
        A quiet moment.
      </h1>
      <p className="mt-3 max-w-md text-charcoal/60">
        Considered, encrypted, and complete in three considered steps.
      </p>
      <CheckoutView />
    </div>
  );
}
