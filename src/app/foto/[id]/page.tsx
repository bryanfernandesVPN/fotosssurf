import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { publicMediaUrl } from "@/lib/storage";
import { formatBRL, photoPrice } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { album: true },
  });
  return { title: photo ? `${photo.album.title} — foto` : "Foto" };
}

export default async function FotoPage({ params }: Props) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { album: true },
  });

  if (!photo || photo.album.status !== "published") notFound();

  const price = photoPrice(photo, photo.album.defaultPrice);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href={`/albuns/${photo.album.slug}`}
        className="text-sm text-muted hover:text-cyan"
      >
        ← Voltar ao álbum
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden border border-border bg-navy-deep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicMediaUrl(photo.watermarkKey)}
            alt={photo.filename}
            className="w-full object-contain"
          />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wider text-cyan">
            {photo.album.spot}
          </p>
          <h1 className="mt-1 font-display text-4xl text-foam">
            {photo.album.title}
          </h1>
          <p className="mt-2 text-muted">{photo.filename}</p>
          <p className="mt-6 font-display text-4xl text-cyan-bright">
            {formatBRL(price)}
          </p>
          <p className="mt-2 text-sm text-muted">
            Download digital em alta resolução após o pagamento. A prévia exibida
            possui marca d&apos;água.
          </p>
          <div className="mt-8">
            <AddToCartButton photoId={photo.id} />
          </div>
          <Link href="/carrinho" className="btn btn-ghost mt-3 w-full">
            Ver carrinho
          </Link>
        </div>
      </div>
    </div>
  );
}
