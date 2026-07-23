import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WaveTransitionProvider } from "@/components/WaveTransition";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "FOTOSSSURF — Fotos de surf",
    template: "%s · FOTOSSSURF",
  },
  description:
    "Álbuns diários de fotos de surf. Compre o download digital direto do fotógrafo.",
  icons: {
    icon: "/brand/fotossurf-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#050d18] antialiased">
        <WaveTransitionProvider>
          <SiteHeader />
          <main className="flex-1 bg-[#050d18]">{children}</main>
          <SiteFooter />
        </WaveTransitionProvider>
      </body>
    </html>
  );
}
