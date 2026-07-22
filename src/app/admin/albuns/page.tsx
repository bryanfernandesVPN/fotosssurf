import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatBRL } from "@/lib/money";
import { DeleteAlbumButton } from "@/components/DeleteAlbumButton";

export const dynamic = "force-dynamic";

async function deleteAlbum(albumId: string) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const photos = await prisma.photo.findMany({
    where: { albumId },
    select: { id: true },
  });
  const photoIds = photos.map((p) => p.id);

  if (photoIds.length > 0) {
    const sold = await prisma.orderItem.count({
      where: { photoId: { in: photoIds } },
    });
    if (sold > 0) {
      throw new Error(
        "Não é possível apagar: este álbum tem fotos já vendidas em pedidos.",
      );
    }

    await prisma.cartItem.deleteMany({
      where: { photoId: { in: photoIds } },
    });
  }

  await prisma.album.delete({ where: { id: albumId } });

  revalidatePath("/admin/albuns");
  revalidatePath("/albuns");
  redirect("/admin/albuns");
}

export default async function AdminAlbunsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

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
          {albums.map((album) => {
            const remove = deleteAlbum.bind(null, album.id);
            return (
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
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/albuns/${album.id}`} className="btn btn-ghost py-2 text-sm">
                    Editar
                  </Link>
                  <DeleteAlbumButton action={remove} label="Apagar" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
