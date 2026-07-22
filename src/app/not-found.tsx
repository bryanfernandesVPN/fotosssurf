import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="font-display text-6xl text-foam">404</h1>
      <p className="mt-3 text-muted">Página não encontrada.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Voltar ao início
      </Link>
    </div>
  );
}
