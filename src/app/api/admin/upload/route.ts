import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { putObject } from "@/lib/storage";
import { processPhoto } from "@/lib/watermark";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const form = await req.formData();
  const albumId = String(form.get("albumId") ?? "");
  if (!albumId) {
    return NextResponse.json({ error: "albumId obrigatório" }, { status: 400 });
  }

  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) {
    return NextResponse.json({ error: "Álbum não encontrado" }, { status: 404 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Nenhum arquivo" }, { status: 400 });
  }

  const created = [];
  let sortBase = await prisma.photo.count({ where: { albumId } });

  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const processed = await processPhoto(bytes);
    const id = nanoid();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const originalKey = `originals/${albumId}/${id}-${safeName}.jpg`;
    const watermarkKey = `watermarks/${albumId}/${id}.jpg`;
    const thumbKey = `thumbs/${albumId}/${id}.jpg`;

    await putObject(originalKey, processed.original, "image/jpeg");
    await putObject(watermarkKey, processed.watermark, "image/jpeg");
    await putObject(thumbKey, processed.thumb, "image/jpeg");

    const photo = await prisma.photo.create({
      data: {
        albumId,
        filename: file.name,
        originalKey,
        watermarkKey,
        thumbKey,
        width: processed.width,
        height: processed.height,
        sortOrder: sortBase++,
      },
    });
    created.push(photo);
  }

  if (!album.coverPhotoId && created[0]) {
    await prisma.album.update({
      where: { id: albumId },
      data: { coverPhotoId: created[0].id },
    });
  }

  return NextResponse.json({ ok: true, count: created.length, photos: created });
}
