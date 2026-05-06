import { PolicyPage } from "@/components/policies/policy-page";

export const metadata = { title: "Returns & Refunds" };

export default function Page() {
  return (
    <PolicyPage
      eyebrow="Service"
      title="Considered returns."
      sections={[
        {
          heading: "14-day exchange",
          body: "We offer a 14-day considered exchange on full-price garments. Pieces must be returned in atelier condition, with the original seal intact.",
        },
        {
          heading: "Refund process",
          body: "Refunds are issued to the original method of payment within 7 business days of receipt and inspection.",
        },
        {
          heading: "Final sale",
          body: "Garments marked Final Atelier Sale, made-to-measure pieces, and personalised orders are not eligible for return.",
        },
      ]}
    />
  );
}
