"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Script from "next/script";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/utils";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutView() {
  const cart = useCart();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setHydrated(true), []);

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      phone: "",
      address: { fullName: "", phone: "", line1: "", city: "", state: "", postalCode: "", country: "India" },
    },
  });

  if (!hydrated) return null;

  if (cart.items.length === 0) {
    return (
      <div className="mt-16">
        <p className="font-serif text-2xl">Your atelier is empty.</p>
        <Button asChild className="mt-6">
          <Link href="/shop">Discover the collection</Link>
        </Button>
      </div>
    );
  }

  const subtotal = cart.subtotal();
  const shipping = subtotal >= 1500000 ? 0 : 49900;
  const total = subtotal + shipping;

  async function onSubmit(values: CheckoutInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: cart.items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place order");

      const opts = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Valerio Street",
        description: data.orderNumber,
        order_id: data.razorpayOrderId,
        prefill: { email: values.email, contact: values.phone, name: values.address.fullName },
        notes: { orderNumber: data.orderNumber },
        theme: { color: "#1A1A1A" },
        handler: async (resp: any) => {
          try {
            const verify = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: resp.razorpay_order_id,
                razorpayPaymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature,
                orderNumber: data.orderNumber,
              }),
            });
            if (!verify.ok) throw new Error();
            cart.clear();
            toast.success("Order confirmed");
            router.push(`/checkout/success?order=${data.orderNumber}`);
          } catch {
            toast.error("Payment verification failed");
            router.push(`/checkout/failed?order=${data.orderNumber}`);
          }
        },
        modal: {
          ondismiss() {
            setSubmitting(false);
          },
        },
      };
      const rz = new window.Razorpay(opts);
      rz.open();
    } catch (e: any) {
      toast.error(e.message);
      setSubmitting(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-12 lg:col-span-7">
          <Section title="Contact">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Email" error={form.formState.errors.email?.message}>
                <Input type="email" {...form.register("email")} />
              </Field>
              <Field label="Phone" error={form.formState.errors.phone?.message}>
                <Input type="tel" {...form.register("phone")} />
              </Field>
            </div>
          </Section>

          <Section title="Delivery Address">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Full Name" error={form.formState.errors.address?.fullName?.message}>
                <Input {...form.register("address.fullName")} />
              </Field>
              <Field label="Phone" error={form.formState.errors.address?.phone?.message}>
                <Input {...form.register("address.phone")} />
              </Field>
              <Field className="sm:col-span-2" label="Address line 1" error={form.formState.errors.address?.line1?.message}>
                <Input {...form.register("address.line1")} />
              </Field>
              <Field className="sm:col-span-2" label="Address line 2 (optional)">
                <Input {...form.register("address.line2")} />
              </Field>
              <Field label="City" error={form.formState.errors.address?.city?.message}>
                <Input {...form.register("address.city")} />
              </Field>
              <Field label="State" error={form.formState.errors.address?.state?.message}>
                <Input {...form.register("address.state")} />
              </Field>
              <Field label="Postal code" error={form.formState.errors.address?.postalCode?.message}>
                <Input {...form.register("address.postalCode")} />
              </Field>
              <Field label="Country">
                <Input defaultValue="India" {...form.register("address.country")} />
              </Field>
            </div>
          </Section>

          <Section title="Order notes (optional)">
            <Textarea placeholder="Special instructions for the atelier" {...form.register("notes")} />
          </Section>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-32 border border-charcoal/10 bg-bone p-8">
            <p className="editorial-eyebrow">Your order</p>
            <ul className="mt-6 divide-y divide-charcoal/10">
              {cart.items.map((it) => (
                <li key={`${it.productId}-${it.variantId ?? "_"}`} className="flex justify-between gap-4 py-3 text-sm">
                  <span>
                    <span className="text-charcoal">{it.name}</span>
                    <span className="block text-[11px] uppercase tracking-editorial text-charcoal/50">
                      {[it.size, `× ${it.quantity}`].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="text-charcoal">{formatINR(it.unitPrice * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 text-sm">
              <Row label="Subtotal" value={formatINR(subtotal)} />
              <Row label="Shipping" value={shipping ? formatINR(shipping) : "Complimentary"} />
            </dl>
            <div className="mt-6 border-t border-charcoal/10 pt-6">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-editorial text-charcoal/60">Total</span>
                <span className="font-serif text-3xl">{formatINR(total)}</span>
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-editorial text-charcoal/40">
                Inclusive of duties and taxes
              </p>
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="mt-8 w-full">
              {submitting ? "Opening secure payment…" : `Pay ${formatINR(total)}`}
            </Button>
            <p className="mt-4 text-center text-[10px] uppercase tracking-editorial text-charcoal/50">
              Encrypted payments by Razorpay
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-light text-charcoal">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-charcoal/60">{label}</span>
      <span>{value}</span>
    </div>
  );
}
