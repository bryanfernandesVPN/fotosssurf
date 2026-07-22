import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell min-h-[70vh]">
      <div className="border-b border-white/15 bg-[#050d18]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
          <Link href="/admin" className="font-display text-xl text-[#8adfff]">
            Admin
          </Link>
          <Link href="/admin/albuns" className="text-[#d7e6f2] hover:text-white">
            Álbuns
          </Link>
          <Link href="/admin/pedidos" className="text-[#d7e6f2] hover:text-white">
            Pedidos
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/" className="text-[#d7e6f2] hover:text-white">
              Ver site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
