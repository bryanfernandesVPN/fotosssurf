"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  latestAlbumHref?: string | null;
  latestAlbumLabel?: string | null;
};

export function CinematicHero({ latestAlbumHref, latestAlbumLabel }: Props) {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      videoRef.current?.pause();
      return;
    }

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: py * -6, y: px * 8 });
    }

    function onLeave() {
      setTilt({ x: 0, y: 0 });
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      // Autoplay may be blocked; poster remains visible
    });
  }, []);

  return (
    <section
      ref={ref}
      className="cinema-hero relative min-h-[calc(100vh-4.5rem)] overflow-hidden"
      style={{ perspective: "1400px" }}
    >
      <div
        className="cinema-stage absolute inset-0"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.06)`,
          transition: "transform 0.35s ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-[-4%]">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/cinematic/barrel.png"
            aria-label="Vídeo de surf FOTOSSSURF"
          >
            <source src="/cinematic/hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div
          className="absolute inset-0"
          style={{
            transform: "translateZ(40px)",
            background:
              "linear-gradient(to top, rgba(2,8,18,0.92) 0%, rgba(4,12,24,0.45) 40%, rgba(4,12,24,0.25) 100%)",
          }}
          aria-hidden
        />
      </div>

      <div className="cinema-grain" aria-hidden />
      <div className="cinema-vignette" aria-hidden />
      <div className="cinema-scan" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-6xl flex-col justify-end px-4 pb-20 pt-24 sm:pb-28">
        <div
          className="cinema-copy max-w-2xl"
          style={{
            transform: `translateZ(80px) translateY(${tilt.x * -0.4}px)`,
            transition: "transform 0.35s ease-out",
          }}
        >
          <Image
            src="/brand/fotossurf-logo.png"
            alt="FOTOSSSURF"
            width={128}
            height={128}
            className="mb-5 h-24 w-24 animate-drift rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:h-28 sm:w-28"
            priority
          />
          <h1 className="font-display text-6xl leading-none text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.75)] sm:text-8xl">
            FOTOSSSURF
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/90 drop-shadow-md sm:text-xl">
            Álbuns de surf em clima de cinema. Escolha suas fotos e baixe em alta
            resolução.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/albuns" className="btn btn-primary">
              Ver álbuns
            </Link>
            {latestAlbumHref && latestAlbumLabel ? (
              <Link href={latestAlbumHref} className="btn btn-ghost">
                {latestAlbumLabel}
              </Link>
            ) : (
              <a
                href="https://www.instagram.com/fotosssurf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
