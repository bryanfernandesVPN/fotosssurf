import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { publicMediaUrl } from "@/lib/storage";
import { formatBRL, photoPrice } from "@/lib/money";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const album = await prisma.album.findUnique({ where: { slug } });
  return { title: album?.title ?? "Álbum" };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = await prisma.album.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!album || album.status !== "published") notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/albuns" className="text-sm text-muted hover:text-cyan">
        ← Todos os álbuns
      </Link>
      <div className="mt-4">
        <p className="text-sm uppercase tracking-wider text-cyan">
          {format(album.date, "d 'de' MMMM yyyy", { locale: ptBR })} · {album.spot}
        </p>
        <h1 className="font-display text-5xl text-foam sm:text-6xl">{album.title}</h1>
        {album.description ? (
          <p className="mt-2 max-w-2xl text-muted">{album.description}</p>
        ) : null}
        <p className="mt-2 text-sm text-muted">
          A partir de {formatBRL(album.defaultPrice)} · prévias com marca d&apos;água
        </p>
      </div>

      {album.photos.length === 0 ? (
        <p className="mt-12 text-muted">Nenhuma foto neste álbum.</p>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {album.photos.map((photo) => (
            <li key={photo.id}>
              <Link
                href={`/foto/${photo.id}`}
                className="group block overflow-hidden border border-border bg-card"
              >
                <div className="aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={publicMediaUrl(photo.thumbKey)}
                    alt={photo.filename}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between px-2 py-2 text-xs text-muted">
                  <span className="truncate">{photo.filename}</span>
                  <span className="text-cyan">
                    {formatBRL(photoPrice(photo, album.defaultPrice))}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
