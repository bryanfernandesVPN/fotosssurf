import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { publicMediaUrl } from "@/lib/storage";
import { formatBRL } from "@/lib/money";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; status?: string }>;
};

export const metadata = { title: "Pedido" };

export default async function PedidoPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token, status } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          photo: { include: { album: true } },
        },
      },
    },
  });

  if (!order) notFound();

  const canDownload =
    order.status === "paid" &&
    (!token || token === order.downloadToken) &&
    order.tokenExpiresAt > new Date();

  // Allow access with matching token or after redirect from MP
  const authorized =
    order.status !== "paid" ||
    !token ||
    token === order.downloadToken ||
    Boolean(status);

  if (order.status === "paid" && token && token !== order.downloadToken && !status) {
    // still show limited info
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl text-foam">Pedido</h1>
      <p className="mt-2 text-muted">#{order.id.slice(0, 8)} · {order.email}</p>

      <div className="mt-6 border border-border bg-card p-5">
        <p className="text-sm text-muted">Status</p>
        <p className="font-display text-3xl text-cyan-bright">
          {order.status === "paid"
            ? "Pago"
            : order.status === "cancelled"
              ? "Cancelado"
              : "Aguardando pagamento"}
        </p>
        <p className="mt-2 text-foam">Total: {formatBRL(order.totalCents)}</p>
        {order.status === "pending" ? (
          <p className="mt-3 text-sm text-muted">
            Se você já pagou, aguarde alguns segundos e atualize a página. A
            confirmação chega pelo webhook do Mercado Pago.
          </p>
        ) : null}
      </div>

      {canDownload || (order.status === "paid" && authorized) ? (
        <div className="mt-8">
          <h2 className="font-display text-3xl text-foam">Downloads</h2>
          <p className="mt-1 text-sm text-muted">
            Links válidos até{" "}
            {order.tokenExpiresAt.toLocaleDateString("pt-BR")}. Guarde esta
            página ou o e-mail com o token.
          </p>
          <ul className="mt-6 space-y-3">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 border border-border bg-card p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicMediaUrl(item.photo.thumbKey)}
                  alt=""
                  className="h-16 w-16 object-cover"
                />
                <div className="flex-1">
                  <p className="text-foam">{item.photo.album.title}</p>
                  <p className="text-xs text-muted">{item.photo.filename}</p>
                </div>
                <a
                  className="btn btn-primary py-2 text-sm"
                  href={`/api/download?token=${encodeURIComponent(order.downloadToken)}&photoId=${encodeURIComponent(item.photoId)}`}
                >
                  Baixar
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link href="/albuns" className="btn btn-ghost mt-10">
        Voltar aos álbuns
      </Link>
    </div>
  );
}
