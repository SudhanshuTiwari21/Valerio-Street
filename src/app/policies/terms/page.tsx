import { PolicyPage } from "@/components/policies/policy-page";

export const metadata = { title: "Terms" };

export default function Page() {
  return (
    <PolicyPage
      eyebrow="Legal"
      title="Terms & Conditions."
      sections={[
        {
          heading: "About these terms",
          body: "By using valeriostreet.com you agree to these terms. They cover orders, payments, intellectual property and the conduct expected of members and guests.",
        },
        {
          heading: "Orders & payments",
          body: "Prices are stated in Indian Rupees and include applicable taxes. We accept all major cards, UPI and net-banking via Razorpay. Orders are confirmed only after a successful authorisation.",
        },
        {
          heading: "Intellectual property",
          body: "All content on this website is the property of Valerio Street and is protected by copyright. You may not reproduce or commercially use any part without written permission.",
        },
      ]}
    />
  );
}
