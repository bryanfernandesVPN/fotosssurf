import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatBRL } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [albumCount, photoCount, paidOrders, revenue] = await Promise.all([
    prisma.album.count(),
    prisma.photo.count(),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.order.aggregate({
      where: { status: "paid" },
      _sum: { totalCents: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-5xl text-foam">Painel</h1>
      <p className="mt-2 text-muted">Olá, {session.user.name ?? session.user.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Álbuns", value: String(albumCount) },
          { label: "Fotos", value: String(photoCount) },
          { label: "Pedidos pagos", value: String(paidOrders) },
          {
            label: "Receita",
            value: formatBRL(revenue._sum.totalCents ?? 0),
          },
        ].map((stat) => (
          <div key={stat.label} className="border border-border bg-card p-4">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="font-display text-3xl text-cyan-bright">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/albuns/novo" className="btn btn-primary">
          Novo álbum
        </Link>
        <Link href="/admin/albuns" className="btn btn-ghost">
          Gerenciar álbuns
        </Link>
        <Link href="/admin/pedidos" className="btn btn-ghost">
          Ver pedidos
        </Link>
      </div>
    </div>
  );
}
