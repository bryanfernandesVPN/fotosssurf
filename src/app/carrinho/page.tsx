import Link from "next/link";
import { getCartWithItems } from "@/lib/cart";
import { publicMediaUrl } from "@/lib/storage";
import { formatBRL, photoPrice } from "@/lib/money";
import { RemoveFromCartButton } from "@/components/RemoveFromCartButton";
import { CheckoutForm } from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Carrinho" };

export default async function CarrinhoPage() {
  const cart = await getCartWithItems();
  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + photoPrice(item.photo, item.photo.album.defaultPrice),
    0,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-5xl text-foam">Carrinho</h1>

      {items.length === 0 ? (
        <div className="mt-12 border border-border bg-card p-10 text-center">
          <p className="text-muted">Seu carrinho está vazio.</p>
          <Link href="/albuns" className="btn btn-primary mt-6">
            Ver álbuns
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 border border-border bg-card p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicMediaUrl(item.photo.thumbKey)}
                  alt=""
                  className="h-20 w-20 object-cover"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/foto/${item.photo.id}`}
                      className="font-medium text-foam hover:text-cyan"
                    >
                      {item.photo.album.title}
                    </Link>
                    <p className="text-xs text-muted">{item.photo.filename}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan">
                      {formatBRL(photoPrice(item.photo, item.photo.album.defaultPrice))}
                    </span>
                    <RemoveFromCartButton photoId={item.photoId} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted">Total</span>
              <span className="font-display text-3xl text-foam">
                {formatBRL(total)}
              </span>
            </div>
            <div className="mt-6">
              <CheckoutForm />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
