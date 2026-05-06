export const site = {
  name: "Valerio Street",
  tagline: "Quiet Luxury for the Modern Gentleman.",
  description:
    "European-inspired menswear essentials, crafted for quiet luxury and refined living.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://valeriostreet.com",
  social: {
    instagram: "https://instagram.com/valeriostreet",
    linkedin: "https://linkedin.com/company/valeriostreet",
    pinterest: "https://pinterest.com/valeriostreet",
  },
  contact: {
    email: "support@valeriostreet.in",
    phone: "+918210423816",
    address: "New Delhi, India",
  },
} as const;

export const NAV = {
  shop: [
    { label: "All", href: "/shop" },
    { label: "Polos", href: "/shop?category=polos" },
    { label: "Shirts", href: "/shop?category=shirts" },
    { label: "Trousers", href: "/shop?category=trousers" },
    { label: "Essentials", href: "/shop?category=essentials" },
    { label: "Footwear", href: "/shop?category=footwear" },
    { label: "Accessories", href: "/shop?category=accessories" },
  ],
  primary: [
    { label: "Shop", href: "/shop" },
    { label: "Lookbook", href: "/lookbook" },
    { label: "Philosophy", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  policies: [
    { label: "Shipping", href: "/policies/shipping" },
    { label: "Returns", href: "/policies/refund" },
    { label: "Privacy", href: "/policies/privacy" },
    { label: "Terms", href: "/policies/terms" },
  ],
} as const;
