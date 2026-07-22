import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { CinematicHero } from "@/components/CinematicHero";
import { CinemaDepthGallery } from "@/components/CinemaDepthGallery";
import { PackagesSection } from "@/components/PackagesSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const todayAlbum = await prisma.album.findFirst({
    where: { status: "published" },
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <CinematicHero
        latestAlbumHref={todayAlbum ? `/albuns/${todayAlbum.slug}` : null}
        latestAlbumLabel={
          todayAlbum
            ? `${format(todayAlbum.date, "d MMM", { locale: ptBR })} · ${todayAlbum.spot}`
            : null
        }
      />
      <CinemaDepthGallery />
      <PackagesSection />
    </div>
  );
}
