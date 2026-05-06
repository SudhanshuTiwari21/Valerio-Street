import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Your Atelier" };

export default function CartPage() {
  return (
    <div className="container py-16 md:py-24">
      <p className="editorial-eyebrow">The Atelier</p>
      <h1 className="mt-4 font-serif text-5xl font-light md:text-7xl text-balance">Your bag.</h1>
      <CartView />
    </div>
  );
}
