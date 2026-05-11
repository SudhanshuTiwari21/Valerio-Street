import { NextResponse } from "next/server";

import { getShippingSettings } from "@/lib/shipping";

/** Public storefront settings (no secrets). */
export async function GET() {
  const shipping = await getShippingSettings();
  return NextResponse.json({
    shippingFlatFee: shipping.shippingFlatFee,
    freeShippingMin: shipping.freeShippingMin,
  });
}
