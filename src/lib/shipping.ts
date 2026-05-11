import { prisma } from "@/lib/prisma";

/** Default flat shipping (paise) — ₹499 */
export const DEFAULT_SHIPPING_FLAT_PAISE = 49900;
/** Default free-shipping threshold (paise) — ₹15,000 */
export const DEFAULT_FREE_SHIPPING_MIN_PAISE = 1_500_000;

export type ShippingSettings = {
  shippingFlatFee: number;
  freeShippingMin: number;
};

export async function getShippingSettings(): Promise<ShippingSettings> {
  const row = await prisma.settings.findUnique({
    where: { id: "singleton" },
    select: { shippingFlatFee: true, freeShippingMin: true },
  });
  return {
    shippingFlatFee: row?.shippingFlatFee ?? DEFAULT_SHIPPING_FLAT_PAISE,
    freeShippingMin: row?.freeShippingMin ?? DEFAULT_FREE_SHIPPING_MIN_PAISE,
  };
}

/** `subtotalAfterDiscount` = cart/order subtotal minus coupon discount (same currency, paise). */
export function shippingFeeFromSettings(
  subtotalAfterDiscount: number,
  settings: ShippingSettings,
): number {
  const { shippingFlatFee, freeShippingMin } = settings;
  if (freeShippingMin > 0 && subtotalAfterDiscount >= freeShippingMin) return 0;
  return Math.max(0, shippingFlatFee);
}
