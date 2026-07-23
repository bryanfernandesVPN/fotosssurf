import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#050d18]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/fotossurf-logo.png"
              alt=""
              width={36}
              height={36}
              className="rounded-full opacity-90"
            />
            <div>
              <p className="font-display text-xl text-foam">FOTOSSSURF</p>
              <p className="text-xs text-muted">Fotos de surf · download digital</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm text-muted">
            <a
              href="https://www.instagram.com/fotosssurf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan"
            >
              Instagram
            </a>
            <Link href="/#sobre" className="hover:text-cyan">
              Sobre
            </Link>
            <Link href="/#pacotes" className="hover:text-cyan">
              Pacotes
            </Link>
            <Link href="/albuns" className="hover:text-cyan">
              Álbuns
            </Link>
            <Link href="/admin" className="hover:text-cyan">
              Admin
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-muted sm:text-left">
          © {year} Bryan Fernandes. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
