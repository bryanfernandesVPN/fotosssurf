import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { publicMediaUrl } from "@/lib/storage";
import { formatBRL, photoPrice } from "@/lib/money";
import { UploadForm } from "@/components/UploadForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function updateAlbum(albumId: string, formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const title = String(formData.get("title") ?? "").trim();
  const spot = String(formData.get("spot") ?? "").trim();
  const dateStr = String(formData.get("date") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;
  const defaultPrice = Math.round(Number(formData.get("defaultPrice") ?? 25) * 100);
  const status = String(formData.get("status") ?? "draft");

  await prisma.album.update({
    where: { id: albumId },
    data: {
      title,
      spot,
      date: new Date(`${dateStr}T12:00:00`),
      description,
      defaultPrice,
      status: status === "published" ? "published" : "draft",
    },
  });

  revalidatePath("/admin/albuns");
  revalidatePath("/albuns");
  revalidatePath(`/admin/albuns/${albumId}`);
}

async function updatePhotoPrice(photoId: string, albumId: string, formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const raw = String(formData.get("price") ?? "").trim();
  const priceCents = raw === "" ? null : Math.round(Number(raw) * 100);

  await prisma.photo.update({
    where: { id: photoId },
    data: { priceCents },
  });

  revalidatePath(`/admin/albuns/${albumId}`);
}

async function deletePhoto(photoId: string, albumId: string) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
  await prisma.photo.delete({ where: { id: photoId } });
  revalidatePath(`/admin/albuns/${albumId}`);
  revalidatePath("/albuns");
}

export default async function AdminAlbumDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const album = await prisma.album.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!album) notFound();

  const update = updateAlbum.bind(null, album.id);

  return (
    <div>
      <Link href="/admin/albuns" className="text-sm text-muted hover:text-cyan">
        ← Álbuns
      </Link>
      <h1 className="mt-2 font-display text-5xl text-foam">{album.title}</h1>
      {album.status === "published" ? (
        <Link href={`/albuns/${album.slug}`} className="text-sm text-cyan hover:underline">
          Ver página pública
        </Link>
      ) : null}

      <form action={update} className="mt-8 grid max-w-2xl gap-4 rounded border border-border bg-[#0a1628] p-6 shadow-lg shadow-black/30">
        <div>
          <label className="label" htmlFor="title">
            Título
          </label>
          <input id="title" name="title" className="input" defaultValue={album.title} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="spot">
              Praia
            </label>
            <input id="spot" name="spot" className="input" defaultValue={album.spot} required />
          </div>
          <div>
            <label className="label" htmlFor="date">
              Data
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="input"
              defaultValue={format(album.date, "yyyy-MM-dd")}
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="defaultPrice">
            Preço padrão (R$)
          </label>
          <input
            id="defaultPrice"
            name="defaultPrice"
            type="number"
            step="0.01"
            className="input"
            defaultValue={(album.defaultPrice / 100).toFixed(2)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="description">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            className="input min-h-24"
            defaultValue={album.description ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" className="input" defaultValue={album.status}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-fit">
          Salvar
        </button>
      </form>

      <div className="mt-10">
        <UploadForm albumId={album.id} />
      </div>

      <h2 className="mt-10 font-display text-3xl text-foam">
        Fotos ({album.photos.length})
      </h2>
      {album.photos.length === 0 ? (
        <p className="mt-4 text-muted">Envie as fotos do dia acima.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {album.photos.map((photo) => {
            const updatePrice = updatePhotoPrice.bind(null, photo.id, album.id);
            const remove = deletePhoto.bind(null, photo.id, album.id);
            return (
              <li key={photo.id} className="border border-border bg-card p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicMediaUrl(photo.thumbKey)}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <p className="mt-2 truncate text-xs text-muted">{photo.filename}</p>
                <p className="text-sm text-cyan">
                  {formatBRL(photoPrice(photo, album.defaultPrice))}
                </p>
                <form action={updatePrice} className="mt-2 flex gap-2">
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Preço R$"
                    className="input py-1 text-sm"
                    defaultValue={
                      photo.priceCents != null
                        ? (photo.priceCents / 100).toFixed(2)
                        : ""
                    }
                  />
                  <button type="submit" className="btn btn-ghost py-1 text-xs">
                    OK
                  </button>
                </form>
                <form action={remove} className="mt-2">
                  <button type="submit" className="text-xs text-danger hover:underline">
                    Excluir
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
