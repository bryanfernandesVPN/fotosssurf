import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminAlbunsPage() {
  const albums = await prisma.album.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { photos: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-5xl text-foam">Álbuns</h1>
        <Link href="/admin/albuns/novo" className="btn btn-primary">
          Novo álbum
        </Link>
      </div>

      {albums.length === 0 ? (
        <p className="mt-10 text-muted">Nenhum álbum criado.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border border border-border">
          {albums.map((album) => (
            <li
              key={album.id}
              className="flex flex-wrap items-center justify-between gap-3 bg-card px-4 py-3"
            >
              <div>
                <Link
                  href={`/admin/albuns/${album.id}`}
                  className="font-medium text-foam hover:text-cyan"
                >
                  {album.title}
                </Link>
                <p className="text-xs text-muted">
                  {format(album.date, "d MMM yyyy", { locale: ptBR })} · {album.spot} ·{" "}
                  {album._count.photos} fotos · {formatBRL(album.defaultPrice)} ·{" "}
                  <span className={album.status === "published" ? "text-cyan" : "text-sand"}>
                    {album.status === "published" ? "publicado" : "rascunho"}
                  </span>
                </p>
              </div>
              <Link href={`/admin/albuns/${album.id}`} className="btn btn-ghost py-2 text-sm">
                Editar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
