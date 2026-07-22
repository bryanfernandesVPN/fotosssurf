import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { getCartWithItems } from "@/lib/cart";
import { photoPrice } from "@/lib/money";
import {
  createCheckoutPreference,
  mpConfigured,
} from "@/lib/mercadopago";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  const cart = await getCartWithItems();
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
  }

  const items = cart.items.map((item) => {
    const price = photoPrice(item.photo, item.photo.album.defaultPrice);
    return {
      photoId: item.photoId,
      priceCents: price,
      title: `${item.photo.album.title} — ${item.photo.filename}`,
    };
  });

  const totalCents = items.reduce((sum, i) => sum + i.priceCents, 0);
  const downloadToken = nanoid(32);
  const tokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  const order = await prisma.order.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      status: "pending",
      totalCents,
      downloadToken,
      tokenExpiresAt,
      items: {
        create: items.map((i) => ({
          photoId: i.photoId,
          priceCents: i.priceCents,
        })),
      },
    },
  });

  // Clear cart
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  if (!mpConfigured()) {
    // Dev mode: mark as paid immediately so downloads can be tested
    if (process.env.NODE_ENV === "development") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "paid", mpPaymentId: "dev-mock" },
      });
      return NextResponse.json({
        orderId: order.id,
        checkoutUrl: `/pedido/${order.id}?token=${downloadToken}`,
        mockPaid: true,
      });
    }
    return NextResponse.json(
      { error: "Mercado Pago não configurado" },
      { status: 503 },
    );
  }

  const preference = await createCheckoutPreference({
    orderId: order.id,
    email: parsed.data.email,
    items: items.map((i) => ({
      id: i.photoId,
      title: i.title,
      quantity: 1,
      unit_price: i.priceCents / 100,
    })),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { mpPreferenceId: preference.id },
  });

  return NextResponse.json({
    orderId: order.id,
    checkoutUrl: preference.initPoint,
  });
}
