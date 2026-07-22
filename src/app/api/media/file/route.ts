import { NextRequest, NextResponse } from "next/server";
import {
  getObjectBuffer,
  localFileExists,
  r2Configured,
} from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "Chave inválida" }, { status: 400 });
  }

  // Absolute Blob/R2 public URLs: redirect
  if (key.startsWith("http://") || key.startsWith("https://")) {
    if (key.includes("/originals/")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
    return NextResponse.redirect(key);
  }

  if (key.startsWith("/") || key.includes("\\")) {
    return NextResponse.json({ error: "Chave inválida" }, { status: 400 });
  }

  if (key.startsWith("originals/")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    if (!r2Configured() && !localFileExists(key)) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    const buf = await getObjectBuffer(key);
    const contentType = key.endsWith(".png") ? "image/png" : "image/jpeg";
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao ler arquivo" }, { status: 500 });
  }
}
