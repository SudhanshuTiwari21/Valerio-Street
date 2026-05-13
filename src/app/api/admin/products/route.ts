import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productCreateSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const session = await requirePermission("MANAGE_PRODUCTS");
    const body = await req.json().catch(() => null);
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { variants, ...productData } = parsed.data;
    const inventoryOk = variants.some((v) => v.stock >= 1);
    if ((parsed.data.status === "ACTIVE" || parsed.data.isFeatured) && !inventoryOk) {
      return NextResponse.json(
        { error: "Product must have inventory before it can be Active or Featured." },
        { status: 409 },
      );
    }

    const skuList = variants.map((v) => v.sku.trim()).filter(Boolean);
    if (skuList.length !== new Set(skuList).size) {
      return NextResponse.json({ error: "Duplicate SKU values in variant list." }, { status: 400 });
    }

    const created = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data: productData });
      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            productId: product.id,
            size: v.size ?? null,
            color: v.color ?? null,
            sku: v.sku.trim(),
            stock: v.stock,
            priceDiff: v.priceDiff,
          })),
        });
      }
      await tx.adminActivityLog.create({
        data: {
          userId: session.user.id,
          action: "PRODUCT_CREATE",
          entity: "Product",
          entityId: product.id,
          metadata: { variantCount: variants.length },
        },
      });
      return product;
    });

    return NextResponse.json({ id: created.id });
  } catch (e: unknown) {
    if (e instanceof Response) return e;
    const code = typeof e === "object" && e !== null && "code" in e ? (e as { code: string }).code : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "SKU must be unique. Change the duplicate SKU." }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
