"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function BioSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !sectionRef.current ||
      !frameRef.current ||
      !glowRef.current ||
      !imgWrapRef.current ||
      !copyRef.current
    ) {
      return;
    }

    const sectionEl = sectionRef.current;
    const frameEl = frameRef.current;
    const glowEl = glowRef.current;
    const imgWrapEl = imgWrapRef.current;
    const copyEl = copyRef.current;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function apply(p: number) {
      const inv = 1 - p;
      frameEl.style.opacity = String(0.35 + p * 0.65);
      // Blur only while entering; clear fully once mostly revealed
      frameEl.style.filter = p >= 0.92 ? "none" : `blur(${inv * 6}px)`;
      frameEl.style.transform = `translate3d(0, ${inv * 48}px, 0) rotateY(${inv * -18}deg) rotateZ(${inv * 4}deg) scale(${0.88 + p * 0.12})`;
      frameEl.style.boxShadow = `0 22px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(94,200,242,${0.15 + p * 0.35}), 0 0 28px rgba(94,200,242,${p * 0.35})`;

      glowEl.style.opacity = String(0.1 + p * 0.75);
      glowEl.style.transform = `scale(${0.55 + p * 0.55})`;

      imgWrapEl.style.transform = "none";

      copyEl.style.opacity = String(Math.min(1, p * 1.15));
      copyEl.style.transform = `translate3d(0, ${inv * 28}px, 0)`;
    }

    if (reduce) {
      apply(1);
      return;
    }

    let raf = 0;

    function update() {
      const rect = sectionEl.getBoundingClientRect();
      const view = window.innerHeight || 1;
      // Finish early so the portrait is sharp while the section is on screen
      const range = view * 0.45;
      const raw = Math.min(1, Math.max(0, (view - rect.top) / range));
      // Also force complete when section is well into the viewport
      const inView = rect.top < view * 0.55 && rect.bottom > view * 0.2;
      const p = inView ? Math.max(raw, 0.96) : raw;
      apply(1 - (1 - Math.min(1, p)) ** 1.4);
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }

    apply(0);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="sobre"
      className="relative bg-[#050d18] px-4 py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(94,200,242,0.07),transparent_55%)]" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10">
        <div className="relative shrink-0" style={{ perspective: "1000px" }}>
          <div
            ref={glowRef}
            className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(94,200,242,0.55),transparent_68%)] blur-[18px]"
            style={{ opacity: 0.1, transform: "scale(0.55)" }}
            aria-hidden
          />
          <div
            ref={frameRef}
            className="relative aspect-[3/4] w-28 overflow-hidden bg-[#0a1628] sm:w-32"
            style={{
              opacity: 0.35,
              filter: "blur(6px)",
              transform:
                "translate3d(0, 48px, 0) rotateY(-18deg) rotateZ(4deg) scale(0.88)",
              willChange: "transform, opacity, filter",
            }}
          >
            <div
              ref={imgWrapRef}
              className="absolute inset-0"
            >
              <Image
                src="/brand/joao-pedro-nogueira.png"
                alt="João Pedro Nogueira, fotógrafo da FOTOSSSURF"
                fill
                sizes="(max-width: 640px) 112px, 128px"
                quality={90}
                className="object-cover object-[center_18%]"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-cyan/40" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050d18]/25 via-transparent to-transparent" />
          </div>
        </div>

        <div
          ref={copyRef}
          className="max-w-md text-center sm:text-left"
          style={{
            opacity: 0,
            transform: "translate3d(0, 40px, 0)",
            willChange: "transform, opacity",
          }}
        >
          <p className="text-sm uppercase tracking-[0.2em] text-cyan">
            O fotógrafo
          </p>
          <h2 className="font-display mt-2 text-4xl text-white sm:text-5xl">
            João Pedro Nogueira
          </h2>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-foam/70">
            25 anos · 3 anos atrás das lentes
          </p>
          <p className="mt-4 text-sm leading-relaxed text-foam/85 sm:text-base">
            Fotógrafo com experiência em diversos tipos de eventos, João Pedro
            está focado em desenvolver a FOTOSSSURF — sua marca de fotografia em
            esportes aquáticos e radicais. Apaixonado pelo o que faz, busca a
            cada dia melhorar e crescer nesse mundo.
          </p>
          <a
            href="https://www.instagram.com/fotosssurf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost mt-6"
          >
            Seguir no Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
