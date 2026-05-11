import { PrismaClient, UserRole, ProductStatus, PermissionKey } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMS: { key: PermissionKey; label: string }[] = [
  { key: "MANAGE_PRODUCTS", label: "Manage Products" },
  { key: "MANAGE_ORDERS", label: "Manage Orders" },
  { key: "MANAGE_CUSTOMERS", label: "Manage Customers" },
  { key: "MANAGE_CATEGORIES", label: "Manage Categories" },
  { key: "MANAGE_STAFF", label: "Manage Staff" },
  { key: "MANAGE_CMS", label: "Manage CMS" },
  { key: "MANAGE_SETTINGS", label: "Manage Settings" },
  { key: "VIEW_ANALYTICS", label: "View Analytics" },
  { key: "MANAGE_BLOG", label: "Manage Blog" },
];

const CATEGORIES = [
  { name: "Polos", slug: "polos", description: "Refined knit polos in elevated cotton and cashmere blends.", order: 1 },
  { name: "Shirts", slug: "shirts", description: "Italian-cut shirts cut from poplin, oxford and brushed flannels.", order: 2 },
  { name: "Trousers", slug: "trousers", description: "Pleated, tapered and tailored trousers for the modern gentleman.", order: 3 },
  { name: "Essentials", slug: "essentials", description: "Wardrobe essentials, considered and made to last.", order: 4 },
  { name: "Footwear", slug: "footwear", description: "Hand-finished leathers, suedes and house loafers.", order: 5 },
  { name: "Accessories", slug: "accessories", description: "Belts, leather goods and the small things that matter.", order: 6 },
];

const PLACEHOLDER = "/brand/product-placeholder.png";

const PRODUCTS = [
  {
    slug: "milano-cashmere-polo",
    name: "Milano Cashmere Polo",
    category: "polos",
    price: 1890000,
    compareAtPrice: 2200000,
    description: "A featherweight 12-gauge cashmere polo, knit in Tuscany. Cut for an unhurried drape across the shoulder.",
    story: "Conceived in Milan, knit in a small atelier outside Florence. The Milano polo is our quiet ode to the Italian summer.",
    materials: "100% Mongolian cashmere, 12-gauge knit. Self-faced collar, mother-of-pearl buttons.",
    stylingNotes: "Wear with our pleated linen trouser and unlined suede loafer for an effortless evening silhouette.",
    images: [PLACEHOLDER],
    isFeatured: true,
  },
  {
    slug: "como-poplin-shirt",
    name: "Como Poplin Shirt",
    category: "shirts",
    price: 1450000,
    description: "A long-staple Egyptian cotton poplin shirt with a soft-lined Italian collar and single-needle tailoring.",
    materials: "120s Egyptian cotton poplin. Hand-attached buttons. Mother-of-pearl.",
    stylingNotes: "Tucked into our high-rise wool trouser. Sleeves rolled, never cuffed.",
    images: [PLACEHOLDER],
    isFeatured: true,
  },
  {
    slug: "venezia-pleated-trouser",
    name: "Venezia Pleated Trouser",
    category: "trousers",
    price: 2100000,
    description: "A double-pleated wool trouser with a high rise and a clean, gentle break.",
    materials: "Super 110s Italian wool, half-canvas waistband, hand-finished hem.",
    stylingNotes: "An off-white shirt and a knit polo are the only two things this trouser asks for.",
    images: [PLACEHOLDER],
    isFeatured: true,
  },
  {
    slug: "house-loafer-tobacco-suede",
    name: "House Loafer in Tobacco Suede",
    category: "footwear",
    price: 3200000,
    description: "Our unlined penny loafer, hand-lasted in suede with a Blake-stitched leather sole.",
    materials: "Italian suede upper, vegetable-tanned leather lining, leather sole.",
    stylingNotes: "Worn sockless from May to September. With trousers the rest of the year.",
    images: [PLACEHOLDER],
    isFeatured: true,
  },
  {
    slug: "linen-camp-shirt",
    name: "Linen Camp Shirt",
    category: "shirts",
    price: 1150000,
    description: "A relaxed camp-collar shirt in heavyweight Belgian linen. Garment-washed for an easy hand.",
    materials: "100% Belgian linen, 220 gsm.",
    stylingNotes: "Open at the chest. Sleeves left long. Tuck only with intention.",
    images: [PLACEHOLDER],
  },
  {
    slug: "essential-crew-tee",
    name: "Essential Crew Tee",
    category: "essentials",
    price: 550000,
    description: "A heavyweight Pima cotton tee with a self-faced ribbed collar.",
    materials: "Long-staple Pima cotton. 240 gsm.",
    stylingNotes: "Layered under a sport coat. Worn alone with linen trousers.",
    images: [PLACEHOLDER],
  },
  {
    slug: "calfskin-belt-cognac",
    name: "Calfskin Belt - Cognac",
    category: "accessories",
    price: 980000,
    description: "A 30 mm bridle calfskin belt with a hand-burnished brass buckle.",
    materials: "Italian bridle calfskin. Solid brass hardware.",
    stylingNotes: "The only belt you need.",
    images: [PLACEHOLDER],
  },
  {
    slug: "merino-flannel-trouser",
    name: "Merino Flannel Trouser",
    category: "trousers",
    price: 2450000,
    description: "A brushed merino flannel, single-pleated, with a relaxed leg and gentle taper.",
    materials: "Italian brushed merino flannel.",
    stylingNotes: "With a heavy knit and a brown suede loafer.",
    images: [PLACEHOLDER],
  },
];

async function main() {
  for (const p of PERMS) {
    await prisma.permission.upsert({ where: { key: p.key }, update: { label: p.label }, create: p });
  }

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      brandName: "Valerio Street",
      supportEmail: "support@valeriostreet.com",
      shippingFlatFee: 49900,
      freeShippingMin: 1_500_000,
      taxRate: 0,
      razorpayEnabled: true,
      metaTitle: "Valerio Street - Quiet Luxury for the Modern Gentleman",
      metaDescription:
        "European-inspired menswear essentials, crafted for quiet luxury and refined living.",
    },
  });

  const allPerms = await prisma.permission.findMany();
  const adminEmail = "admin@valeriostreet.com";
  const adminPass = await bcrypt.hash("ValerioAdmin2026!", 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "SUPER_ADMIN",
      permissions: { set: allPerms.map((p) => ({ id: p.id })) },
    },
    create: {
      email: adminEmail,
      name: "Valerio Atelier",
      passwordHash: adminPass,
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
      permissions: { connect: allPerms.map((p) => ({ id: p.id })) },
    },
  });

  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  for (const p of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { slug: p.category } });
    if (!category) continue;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        story: (p as any).story ?? null,
        materials: p.materials,
        stylingNotes: p.stylingNotes,
        price: p.price,
        compareAtPrice: (p as any).compareAtPrice ?? null,
        images: p.images,
        categoryId: category.id,
        isFeatured: !!(p as any).isFeatured,
        status: ProductStatus.ACTIVE,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        story: (p as any).story ?? null,
        materials: p.materials,
        stylingNotes: p.stylingNotes,
        price: p.price,
        compareAtPrice: (p as any).compareAtPrice ?? null,
        images: p.images,
        categoryId: category.id,
        isFeatured: !!(p as any).isFeatured,
        status: ProductStatus.ACTIVE,
      },
    });

    const sizes = ["S", "M", "L", "XL"];
    for (const size of sizes) {
      await prisma.productVariant.upsert({
        where: { sku: `${product.slug}-${size}` },
        update: { stock: 25 },
        create: { productId: product.id, size, sku: `${product.slug}-${size}`, stock: 25 },
      });
    }
  }

  await prisma.coupon.upsert({
    where: { code: "VALERIO10" },
    update: {},
    create: {
      code: "VALERIO10",
      type: "PERCENT",
      value: 10,
      description: "10% off your first order",
      isActive: true,
    },
  });

  console.log("✓ Seeded Valerio Street");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
