import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getObjectBuffer, r2Configured, blobConfigured, getSignedDownloadUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const photoId = req.nextUrl.searchParams.get("photoId");

  if (!token || !photoId) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { downloadToken: token },
    include: { items: true },
  });

  if (!order || order.status !== "paid") {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 403 });
  }

  if (order.tokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Link expirado" }, { status: 403 });
  }

  const item = order.items.find((i) => i.photoId === photoId);
  if (!item) {
    return NextResponse.json({ error: "Foto não está neste pedido" }, { status: 403 });
  }

  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) {
    return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
  }

  if (r2Configured() || blobConfigured() || photo.originalKey.startsWith("http")) {
    const url = await getSignedDownloadUrl(
      photo.originalKey,
      600,
      photo.filename || "foto.jpg",
    );
    return NextResponse.redirect(url);
  }

  const buf = await getObjectBuffer(photo.originalKey);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${(photo.filename || "foto").replace(/"/g, "")}.jpg"`,
      "Cache-Control": "private, no-store",
    },
  });
}
