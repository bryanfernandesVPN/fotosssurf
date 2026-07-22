import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPayment, mpConfigured } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  if (!mpConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body = await req.json().catch(() => ({}));
  const topic = body.topic || body.type || req.nextUrl.searchParams.get("topic");
  const id =
    body.data?.id ||
    body.id ||
    req.nextUrl.searchParams.get("id") ||
    req.nextUrl.searchParams.get("data.id");

  if (topic === "payment" || body.action?.includes("payment") || id) {
    if (!id) {
      return NextResponse.json({ ok: true });
    }

    try {
      const payment = await getPayment(String(id));
      const status = payment.status;
      const externalRef = payment.external_reference;

      if (externalRef && status === "approved") {
        await prisma.order.updateMany({
          where: { id: externalRef, status: { not: "paid" } },
          data: {
            status: "paid",
            mpPaymentId: String(payment.id ?? id),
          },
        });
      } else if (externalRef && (status === "cancelled" || status === "rejected")) {
        await prisma.order.updateMany({
          where: { id: externalRef, status: "pending" },
          data: { status: "cancelled" },
        });
      }
    } catch (err) {
      console.error("Webhook MP error", err);
      return NextResponse.json({ error: "fail" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  // MP sometimes pings with GET
  return POST(req);
}
