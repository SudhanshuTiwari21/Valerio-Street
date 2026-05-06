# Valerio Street

> Quiet luxury for the modern gentleman.

A production-grade, ultra-premium ecommerce platform for a luxury menswear brand -
built with Next.js 15 (App Router), TypeScript, Prisma, NextAuth, Tailwind, Framer Motion
and Razorpay. Designed in the spirit of **Loro Piana, Brunello Cucinelli, Ralph Lauren
Purple Label, Massimo Dutti** and the *Gentleman's Gazette* aesthetic.

```
Italian old-money · quiet luxury · European editorial menswear
```

---

## ✦ Stack

| Layer            | Tooling                                                             |
| ---------------- | ------------------------------------------------------------------- |
| Framework        | Next.js 15 (App Router, Server Actions, Route Handlers)             |
| Language         | TypeScript (strict)                                                 |
| Styling          | Tailwind CSS · custom luxury design tokens · Cormorant Garamond + Inter |
| Animation        | Framer Motion (restrained, cinematic)                               |
| UI Primitives    | shadcn-style on top of Radix UI                                     |
| ORM              | Prisma · PostgreSQL (Neon / Supabase)                               |
| Auth             | NextAuth / Auth.js v5 - Credentials + Google + JWT sessions         |
| Payments         | Razorpay (Orders API + signature verification)                      |
| Image hosting    | Cloudinary (server-side validated uploads)                          |
| State            | Zustand (cart) · React Server Components elsewhere                  |
| Forms            | React Hook Form + Zod                                               |
| Email (optional) | Resend (drop-in stub)                                               |
| Analytics charts | Recharts                                                            |
| Deployment       | Vercel + Neon                                                       |

---

## ✦ Quick start

```bash
# 1. Install
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env
# fill DATABASE_URL, AUTH_SECRET (openssl rand -base64 32), Razorpay & Cloudinary keys

# 3. Apply schema and seed
npm run db:push
npm run db:seed

# 4. Run
npm run dev
```

Open <http://localhost:3000>.

The seed creates:

- A super-admin: `admin@valeriostreet.com` / `ValerioAdmin2026!`
- 6 categories, 8 products with variants, a `VALERIO10` coupon

---

## ✦ Pages

### Storefront

| Path                         | Description                                                |
| ---------------------------- | ---------------------------------------------------------- |
| `/`                          | Cinematic editorial home - 10 sections, parallax hero      |
| `/shop`                      | Filterable, sortable, searchable luxury grid               |
| `/shop/[slug]`               | Editorial product page - gallery, accordions, related      |
| `/cart`                      | Considered minimalist cart                                 |
| `/checkout`                  | Address + Razorpay flow + signature verification           |
| `/checkout/success` / `/failed` | Confirmation states                                     |
| `/auth/login` `/signup` `/forgot` `/reset` | Editorial split-layout auth                  |
| `/account`                   | Member dashboard                                           |
| `/account/orders` `/wishlist` `/addresses` `/settings` | Member modules               |
| `/about`                     | The manifesto                                              |
| `/lookbook`                  | Editorial stories                                          |
| `/contact`                   | Form, FAQ, embedded map                                    |
| `/policies/{shipping,refund,privacy,terms}` | Legal pages                                 |

### Admin (RBAC)

| Path                             | Required permission       |
| -------------------------------- | ------------------------- |
| `/admin`                         | Any staff role            |
| `/admin/analytics`               | `VIEW_ANALYTICS`          |
| `/admin/orders` & `[orderNumber]`| `MANAGE_ORDERS`           |
| `/admin/products` & `[id]/new`   | `MANAGE_PRODUCTS`         |
| `/admin/categories`              | `MANAGE_CATEGORIES`       |
| `/admin/customers`               | `MANAGE_CUSTOMERS`        |
| `/admin/staff`                   | `MANAGE_STAFF`            |
| `/admin/cms`                     | `MANAGE_CMS`              |
| `/admin/settings`                | `MANAGE_SETTINGS`         |

Roles: `SUPER_ADMIN > ADMIN > MANAGER > CONTENT_EDITOR > CUSTOMER`.
`SUPER_ADMIN` bypasses individual permission checks.

---

## ✦ Architecture

```
src/
├── app/
│   ├── (storefront pages)
│   ├── admin/                # RBAC-protected SaaS dashboard
│   ├── account/              # Member dashboard
│   ├── auth/                 # Editorial auth flow
│   ├── api/                  # Route handlers (storefront + admin)
│   │   ├── auth/             # NextAuth + signup, forgot, reset
│   │   ├── orders/           # Create + verify Razorpay payment
│   │   ├── coupons/validate
│   │   ├── newsletter, contact, wishlist
│   │   └── admin/            # Permission-gated admin APIs
│   ├── layout.tsx, page.tsx
│   ├── robots.ts, sitemap.ts, manifest.ts
│   └── globals.css           # Luxury design tokens
├── components/
│   ├── ui/                   # Buttons, inputs, sheet, dialog, accordion…
│   ├── layout/               # Header, footer, announcement bar
│   ├── marketing/            # Hero, philosophy, lifestyle, lookbook strip
│   ├── products/             # Card, gallery, panel, related
│   ├── cart/                 # Drawer, full cart view
│   ├── checkout/             # Razorpay-driven checkout
│   ├── auth/                 # Login & signup forms
│   ├── policies/             # Editorial policy renderer
│   └── admin/                # Sidebar, charts, RBAC manager, forms
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── prisma.ts             # Prisma singleton
│   ├── rbac.ts               # Permission gates
│   ├── razorpay.ts           # Order + signature
│   ├── cloudinary.ts         # Server uploads
│   ├── rate-limit.ts         # In-memory IP throttling
│   ├── validations.ts        # Zod schemas
│   ├── cart-store.ts         # Zustand persisted cart
│   ├── site.ts               # Brand constants
│   └── utils.ts
└── middleware.ts             # Security headers
```

---

## ✦ Design system

Editorial luxury, defined in `tailwind.config.ts`:

| Token        | Value     | Use                       |
| ------------ | --------- | ------------------------- |
| `bone`       | `#F5F1EA` | Primary background        |
| `sand`       | `#D8CBB8` | Secondary surfaces        |
| `charcoal`   | `#1A1A1A` | Primary type / actions    |
| `olive`      | `#5E6B57` | Accent (sale, success)    |
| `gold`       | `#B89B72` | Quiet metal accent        |
| `ink`        | `#111111` | Body type                 |

- Serif: **Cormorant Garamond** for editorial headings
- Sans: **Inter** for UI / sub-copy with `tracking-editorial` (`0.18em`)
- Generous whitespace · soft shadows · slow `cubic-bezier(0.22, 1, 0.36, 1)` motion
- Dark mode is wired (CSS variables in `globals.css`)

---

## ✦ Security

- All admin APIs gated by `requirePermission(key)` middleware
- Server-side re-pricing on order creation (cart cannot be tampered with)
- Razorpay signature verified with `crypto.timingSafeEqual`
- Strict security headers (`X-Frame-Options`, CSP-friendly)
- Zod validation on every server boundary
- Bcrypt password hashing
- IP-based rate limiting on signup, contact, newsletter, orders
- `.env` is git-ignored; use Vercel's encrypted environment variables in production

---

## ✦ Razorpay flow

1. Client posts `/api/orders` with cart + address + (optional) coupon
2. Server re-prices from DB, applies coupon, creates DB order, calls Razorpay Orders API
3. Returns `{ razorpayOrderId, amount }` to the client
4. Client opens Razorpay Checkout (`checkout.razorpay.com/v1/checkout.js`)
5. On `handler` callback, client posts `/api/orders/verify` with the signature
6. Server verifies signature, marks order `PAID + CONFIRMED`, redirects to `/checkout/success`

For local testing without Razorpay keys, set `RAZORPAY_KEY_ID=""` and the order will
be created with `razorpayOrderId = null`. Wire real keys in production.

---

## ✦ Environment variables

See `.env.example`. The required minimum to run locally:

```
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional but recommended:

```
AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NEXT_PUBLIC_RAZORPAY_KEY_ID
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
RESEND_API_KEY
```

---

## ✦ Deployment

### 1. Database (Neon)

```bash
# Create a Postgres database in Neon
# Copy the pooled connection string into DATABASE_URL
# Copy the direct connection string into DIRECT_URL
npx prisma migrate deploy
npm run db:seed
```

### 2. Vercel

- Import this repo into Vercel
- Add **all** environment variables from `.env.example`
- Build command: `npm run build`  (auto: runs `prisma generate` then `next build`)
- Output: Vercel auto-detects Next.js - no overrides needed
- Set `NEXT_PUBLIC_APP_URL` to the production domain
- Set `AUTH_URL` to the production domain

### 3. Razorpay

- Use **Live** API keys in production
- Add allowed origins/webhook URL in the Razorpay dashboard
- (Optional) Add a webhook handler at `/api/webhooks/razorpay` (skeleton-ready)

### 4. Cloudinary

- Create an unsigned upload preset, or use the server route `/api/admin/upload`
  (preferred - validates type + size, requires `MANAGE_PRODUCTS`)

---

## ✦ Scripts

```bash
npm run dev         # Local dev server
npm run build       # Production build (prisma generate + next build)
npm run start       # Start production server
npm run db:push     # Push schema to DB (no migration history)
npm run db:migrate  # Create + apply a migration
npm run db:seed     # Seed admin, categories, products, coupon
npm run db:studio   # Prisma Studio
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
```

---

## ✦ The atelier

> "Quiet luxury, considered tailoring, and the slow craft of European menswear."

Made with intention.
