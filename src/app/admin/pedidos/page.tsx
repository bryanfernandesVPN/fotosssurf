import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-5xl text-foam">Pedidos</h1>
      {orders.length === 0 ? (
        <p className="mt-10 text-muted">Nenhum pedido ainda.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border border border-border">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 bg-card px-4 py-3"
            >
              <div>
                <p className="text-foam">{order.email}</p>
                <p className="text-xs text-muted">
                  {format(order.createdAt, "d MMM yyyy HH:mm", { locale: ptBR })} ·{" "}
                  {order._count.items} fotos · {formatBRL(order.totalCents)} ·{" "}
                  <span
                    className={
                      order.status === "paid"
                        ? "text-cyan"
                        : order.status === "cancelled"
                          ? "text-danger"
                          : "text-sand"
                    }
                  >
                    {order.status}
                  </span>
                </p>
              </div>
              {order.status === "paid" ? (
                <Link
                  href={`/pedido/${order.id}?token=${order.downloadToken}`}
                  className="btn btn-ghost py-2 text-sm"
                >
                  Downloads
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
