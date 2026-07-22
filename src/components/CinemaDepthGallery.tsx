"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const SHOTS = [
  {
    src: "/cinematic/barrel.png",
    alt: "Surfista no tubo",
    depth: 70,
    rotate: -8,
    x: "2%",
    y: "4%",
    w: "28%",
    h: "72%",
  },
  {
    src: "/cinematic/action.png",
    alt: "Manobra na crista",
    depth: 110,
    rotate: 6,
    x: "34%",
    y: "0%",
    w: "30%",
    h: "78%",
  },
  {
    src: "/cinematic/boat.png",
    alt: "Barco e ilha",
    depth: 45,
    rotate: -4,
    x: "68%",
    y: "6%",
    w: "28%",
    h: "58%",
  },
  {
    src: "/cinematic/palms.png",
    alt: "Palmeiras na costa",
    depth: 85,
    rotate: 5,
    x: "18%",
    y: "52%",
    w: "26%",
    h: "48%",
  },
  {
    src: "/cinematic/mood.png",
    alt: "Onda e palmeiras",
    depth: 55,
    rotate: -6,
    x: "52%",
    y: "48%",
    w: "26%",
    h: "50%",
  },
] as const;

export function CinemaDepthGallery() {
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el!.style.setProperty("--rx", `${py * -12}deg`);
      el!.style.setProperty("--ry", `${px * 16}deg`);
    }

    function onLeave() {
      el!.style.setProperty("--rx", "0deg");
      el!.style.setProperty("--ry", "0deg");
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#050d18] pb-16 pt-20 sm:pb-20 sm:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(94,200,242,0.10),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan">No tubo</p>
          <h2 className="font-display mt-2 text-5xl text-white sm:text-6xl">
            Olhar cinematográfico
          </h2>
          <p className="mt-3 text-foam/85">
            Álbuns diários e download em alta resolução.
          </p>
        </div>

        <div
          ref={scene}
          className="cinema-depth-scene relative mt-12 h-[520px] overflow-hidden rounded-sm bg-[#050d18] sm:h-[640px]"
          style={{ perspective: "1200px" }}
        >
          <div
            className="cinema-depth-world absolute inset-0 bg-[#050d18]"
            style={{
              transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
              transformStyle: "preserve-3d",
              transition: "transform 0.4s ease-out",
            }}
          >
            {SHOTS.map((shot, i) => (
              <div
                key={shot.src}
                className="cinema-plane absolute overflow-hidden bg-[#0a1628] shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
                style={{
                  left: shot.x,
                  top: shot.y,
                  width: shot.w,
                  height: shot.h,
                  transform: `translateZ(${shot.depth}px) rotateZ(${shot.rotate}deg)`,
                  animationDelay: `${i * 0.35}s`,
                  backfaceVisibility: "hidden",
                }}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(max-width: 768px) 45vw, 28vw"
                  className="bg-[#0a1628] object-cover"
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/albuns" className="btn btn-primary">
            Entrar nos álbuns
          </Link>
          <a
            href="https://www.instagram.com/fotosssurf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            Seguir no Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
