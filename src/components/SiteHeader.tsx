import Link from "next/link";
import Image from "next/image";
import { getCartSessionId } from "@/lib/cart";
import { prisma } from "@/lib/db";

async function cartCount() {
  try {
    const sessionId = await getCartSessionId();
    if (!sessionId) return 0;
    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { _count: { select: { items: true } } },
    });
    return cart?._count.items ?? 0;
  } catch {
    return 0;
  }
}

export async function SiteHeader() {
  const count = await cartCount();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-[#06101f]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/fotossurf-logo.png"
            alt="FOTOSSSURF"
            width={48}
            height={48}
            className="h-11 w-11 rounded-full"
            priority
          />
          <span className="font-display text-2xl tracking-wide text-foam sm:text-3xl">
            FOTOSSSURF
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-foam/90 sm:gap-6">
          <Link href="/albuns" className="hover:text-cyan-bright transition-colors">
            Álbuns
          </Link>
          <Link href="/#sobre" className="hover:text-cyan-bright transition-colors">
            Sobre
          </Link>
          <Link href="/#pacotes" className="hover:text-cyan-bright transition-colors">
            Pacotes
          </Link>
          <a
            href="https://www.instagram.com/fotosssurf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden hover:text-cyan-bright transition-colors sm:inline"
          >
            Instagram
          </a>
          <Link href="/carrinho" className="relative hover:text-cyan-bright transition-colors">
            Carrinho
            {count > 0 ? (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan px-1 text-xs font-bold text-navy-deep">
                {count}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
