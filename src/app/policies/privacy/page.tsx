import { PolicyPage } from "@/components/policies/policy-page";

export const metadata = { title: "Privacy" };

export default function Page() {
  return (
    <PolicyPage
      eyebrow="Legal"
      title="Privacy."
      sections={[
        {
          heading: "What we collect",
          body: "We collect only what is required to fulfil your order and provide the atelier service: name, email, phone, shipping address and payment metadata. We never store full payment card details.",
        },
        {
          heading: "How we use it",
          body: "Your data is used to deliver and improve the experience - to fulfil orders, communicate atelier news (only if you ask), and prevent fraud.",
        },
        {
          heading: "Your rights",
          body: "You may request export or deletion of your data at any time by writing to atelier@valeriostreet.com. We will respond within seven business days.",
        },
      ]}
    />
  );
}
