import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { albumSlug } from "@/lib/slug";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function createAlbum(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const title = String(formData.get("title") ?? "").trim();
  const spot = String(formData.get("spot") ?? "").trim();
  const dateStr = String(formData.get("date") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;
  const defaultPrice = Math.round(Number(formData.get("defaultPrice") ?? 25) * 100);
  const status = String(formData.get("status") ?? "draft");

  if (!title || !spot || !dateStr) throw new Error("Campos obrigatórios");

  const date = new Date(`${dateStr}T12:00:00`);
  let slug = albumSlug(title, date, spot);
  const exists = await prisma.album.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  const album = await prisma.album.create({
    data: {
      title,
      spot,
      date,
      description,
      defaultPrice,
      status: status === "published" ? "published" : "draft",
      slug,
    },
  });

  revalidatePath("/admin/albuns");
  revalidatePath("/albuns");
  redirect(`/admin/albuns/${album.id}`);
}

export default async function NovoAlbumPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="admin-panel max-w-xl">
      <h1 className="admin-title">Novo álbum</h1>
      <p className="admin-subtitle">
        Preencha os dados da sessão e salve para depois enviar as fotos.
      </p>
      <form action={createAlbum} className="admin-form mt-6 space-y-5">
        <div>
          <label className="admin-label" htmlFor="title">
            Título
          </label>
          <input
            id="title"
            name="title"
            className="admin-input"
            required
            placeholder="Manhã em Maresias"
          />
        </div>
        <div>
          <label className="admin-label" htmlFor="spot">
            Praia / spot
          </label>
          <input
            id="spot"
            name="spot"
            className="admin-input"
            required
            placeholder="Maresias"
          />
        </div>
        <div>
          <label className="admin-label" htmlFor="date">
            Data da sessão
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className="admin-input"
            required
            defaultValue={today}
          />
        </div>
        <div>
          <label className="admin-label" htmlFor="defaultPrice">
            Preço padrão (R$)
          </label>
          <input
            id="defaultPrice"
            name="defaultPrice"
            type="number"
            step="0.01"
            min="1"
            className="admin-input"
            defaultValue={25}
            required
          />
        </div>
        <div>
          <label className="admin-label" htmlFor="description">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            className="admin-input min-h-28"
            placeholder="Opcional"
          />
        </div>
        <div>
          <label className="admin-label" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" className="admin-input" defaultValue="draft">
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Criar álbum
        </button>
      </form>
    </div>
  );
}
