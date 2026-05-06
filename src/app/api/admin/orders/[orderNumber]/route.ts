import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { sendMail } from "@/lib/mailer";
import { orderStatusUpdatedEmail } from "@/lib/email-templates";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  trackingNumber: z.string().nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ orderNumber: string }> }) {
  try {
    const session = await requirePermission("MANAGE_ORDERS");
    const { orderNumber } = await ctx.params;
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

    const updated = await prisma.order.update({
      where: { orderNumber },
      data: parsed.data,
    });
    await prisma.adminActivityLog.create({
      data: {
        userId: session.user.id,
        action: "ORDER_UPDATE",
        entity: "Order",
        entityId: updated.id,
        metadata: parsed.data as any,
      },
    });

    // Transactional email: status/tracking updates.
    try {
      const tpl = orderStatusUpdatedEmail({
        orderNumber: updated.orderNumber,
        status: updated.status,
        trackingNumber: updated.trackingNumber,
      });
      await sendMail({ to: updated.email, subject: tpl.subject, html: tpl.html });
    } catch (e) {
      console.error("[mail] order status update failed", e);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
