import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { publicMediaUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Álbuns",
};

export default async function AlbunsPage() {
  const albums = await prisma.album.findMany({
    where: { status: "published" },
    orderBy: { date: "desc" },
    include: {
      photos: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      _count: { select: { photos: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-5xl text-foam sm:text-6xl">Álbuns</h1>
      <p className="mt-2 max-w-xl text-muted">
        Sessões publicadas por data. Abra o álbum, encontre suas fotos e compre o download.
      </p>

      {albums.length === 0 ? (
        <div className="mt-16 rounded border border-border bg-card p-10 text-center">
          <p className="font-display text-3xl text-foam">Sem álbuns ainda</p>
          <p className="mt-2 text-muted">
            Em breve as sessões do dia aparecem aqui.
          </p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => {
            const cover = album.photos[0];
            return (
              <li key={album.id}>
                <Link
                  href={`/albuns/${album.slug}`}
                  className="album-3d group block overflow-hidden border border-border bg-card transition hover:border-cyan/50"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-navy-deep">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={publicMediaUrl(cover.thumbKey)}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted">
                        Sem fotos
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wider text-cyan">
                      {format(album.date, "d 'de' MMMM yyyy", { locale: ptBR })}
                    </p>
                    <h2 className="mt-1 font-display text-2xl text-foam">
                      {album.title}
                    </h2>
                    <p className="text-sm text-muted">
                      {album.spot} · {album._count.photos} fotos
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
