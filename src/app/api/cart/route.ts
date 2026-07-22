import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart";

export async function GET() {
  const cart = await getOrCreateCart();
  return NextResponse.json(cart);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const photoId = String(body.photoId ?? "");
  if (!photoId) {
    return NextResponse.json({ error: "photoId obrigatório" }, { status: 400 });
  }

  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: { album: true },
  });
  if (!photo || photo.album.status !== "published") {
    return NextResponse.json({ error: "Foto indisponível" }, { status: 404 });
  }

  const cart = await getOrCreateCart();
  await prisma.cartItem.upsert({
    where: {
      cartId_photoId: { cartId: cart.id, photoId },
    },
    create: { cartId: cart.id, photoId },
    update: {},
  });

  const updated = await getOrCreateCart();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const photoId = req.nextUrl.searchParams.get("photoId");
  if (!photoId) {
    return NextResponse.json({ error: "photoId obrigatório" }, { status: 400 });
  }

  const cart = await getOrCreateCart();
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, photoId },
  });

  const updated = await getOrCreateCart();
  return NextResponse.json(updated);
}
