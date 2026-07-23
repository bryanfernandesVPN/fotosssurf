import { WaveButton } from "@/components/WaveTransition";

const PACKAGES = [
  {
    id: "fora-da-agua",
    title: "Fora da água",
    description:
      "Cobertura na praia e no lineup, com lente longa e ação em alta resolução.",
    image: "/packages/fora-da-agua.png",
    message:
      "Oi! Quero o pacote *Fora da água* do FOTOSSSURF. Pode me passar valores e disponibilidade?",
  },
  {
    id: "dentro-da-agua",
    title: "Dentro da água",
    description:
      "Fotos dentro da água, no tubo e no impacto — perspectiva imersiva.",
    image: "/packages/dentro-da-agua.png",
    message:
      "Oi! Quero o pacote *Dentro da água* do FOTOSSSURF. Pode me passar valores e disponibilidade?",
  },
  {
    id: "aereo",
    title: "Aéreo",
    description:
      "Drone e ângulos de cima para mapear o pico, o swell e a sessão.",
    image: "/packages/aereo.png",
    message:
      "Oi! Quero o pacote *Aéreo* do FOTOSSSURF. Pode me passar valores e disponibilidade?",
  },
  {
    id: "personalizado",
    title: "Personalizado",
    description:
      "Trip, editorial ou cobertura sob medida — montamos o pacote com você.",
    image: "/packages/personalizado.png",
    message:
      "Oi! Quero um pacote *Personalizado* do FOTOSSSURF. Vamos combinar o briefing?",
  },
] as const;

function whatsappUrl(message: string): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5500000000000";
  const phone = raw.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function PackagesSection() {
  return (
    <section
      id="pacotes"
      className="relative overflow-hidden bg-[#050d18] px-4 py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(94,200,242,0.08),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan">Contato</p>
          <h2 className="font-display mt-2 text-5xl text-white sm:text-6xl">
            Pacotes personalizados
          </h2>
          <p className="mt-3 text-foam/85">
            Contrate cobertura sob medida. Escolha o pacote e fale direto no
            WhatsApp.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {PACKAGES.map((pkg) => (
            <li key={pkg.id} className="group overflow-hidden border border-white/12 bg-[#0a1628]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#0a1628]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050d18]/90 via-transparent to-transparent" />
              </div>
              <div className="space-y-3 p-5">
                <h3 className="font-display text-3xl text-white">{pkg.title}</h3>
                <p className="text-sm leading-relaxed text-[#c5d6e6]">
                  {pkg.description}
                </p>
                <WaveButton
                  href={whatsappUrl(pkg.message)}
                  external
                  className="btn btn-primary w-full sm:w-auto"
                >
                  Agendar
                </WaveButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
