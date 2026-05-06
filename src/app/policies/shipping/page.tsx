import { PolicyPage } from "@/components/policies/policy-page";

export const metadata = { title: "Shipping" };

export default function Page() {
  return (
    <PolicyPage
      eyebrow="Service"
      title="Shipping."
      sections={[
        {
          heading: "Within India",
          body: "Complimentary express shipping on orders over ₹15,000. Delivered in 3 to 5 business days, with discreet door-to-door tracking and a dedicated dispatch concierge.",
        },
        {
          heading: "International",
          body: "Delivered worldwide via DHL Express within 7 to 12 business days. Duties and taxes are calculated and included at checkout.",
        },
        {
          heading: "Atelier collection",
          body: "If you are in Milano, your pieces may be collected from our atelier by appointment.",
        },
      ]}
    />
  );
}
