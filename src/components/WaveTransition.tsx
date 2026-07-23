"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type WaveOptions = {
  href: string;
  external?: boolean;
  kind?: "wave" | "flick";
};

type WaveContextValue = {
  triggerWave: (options: WaveOptions) => void;
};

type Spray = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
};

const WaveContext = createContext<WaveContextValue | null>(null);

const WAVE_MS = 1400;
const WAVE_ACTION_AT = 0.48;
const FLICK_MS = 980;
const FLICK_ACTION_AT = 0.52;

const FLICK_SHOTS = [
  "/cinematic/action.png",
  "/cinematic/barrel.png",
  "/cinematic/mood.png",
  "/cinematic/boat.png",
] as const;

function crestX(
  frontX: number,
  y: number,
  h: number,
  t: number,
  opts?: { full?: boolean; foam?: boolean; inset?: number },
) {
  const full = opts?.full !== false;
  const n1 = Math.sin(y * 0.012 + t * 3.1) * 28;
  const n2 = Math.sin(y * 0.028 - t * 4.4) * 14;
  const n3 = full ? Math.sin(y * 0.055 + t * 5.6) * 7 : 0;
  const curl = Math.sin((y / h) * Math.PI) * 36;
  const foam = opts?.foam
    ? Math.sin(y * 0.08 + t * 9) * 6 + Math.sin(y * 0.15 - t * 7) * 4
    : 0;
  return frontX + n1 + n2 + n3 + curl + foam - (opts?.inset ?? 0);
}

export function useWaveTransition() {
  const ctx = useContext(WaveContext);
  if (!ctx) {
    throw new Error("useWaveTransition must be used within WaveTransitionProvider");
  }
  return ctx;
}

export function WaveButton({
  href,
  external = false,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { triggerWave } = useWaveTransition();

  return (
    <a
      href={href}
      className={className}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        e.preventDefault();
        triggerWave({ href, external });
      }}
    >
      {children}
    </a>
  );
}

export function WaveTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "wave" | "flick">("idle");
  const playingRef = useRef(false);
  const pendingRef = useRef<WaveOptions | null>(null);
  const actedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const sprayRef = useRef<Spray[]>([]);
  const triggerWaveRef = useRef<(options: WaveOptions) => void>(() => {});

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const runAction = useCallback(
    (opts: WaveOptions) => {
      if (opts.external) {
        window.open(opts.href, "_blank", "noopener,noreferrer");
        return;
      }
      router.push(opts.href);
    },
    [router],
  );

  const stopCanvas = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const paintWave = useCallback((progress: number, now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Front travels L→R; crest thickness breathes
    const front = -0.18 + ease * 1.38;
    const frontX = front * w;
    const t = now * 0.001;
    const crestWidth = w * (0.16 + Math.sin(t * 2.2) * 0.02);

    // Depth body behind the front
    const body = ctx.createLinearGradient(frontX - w * 0.55, 0, frontX + crestWidth, 0);
    body.addColorStop(0, "#02060c");
    body.addColorStop(0.45, "#061526");
    body.addColorStop(0.78, "#0d3a5c");
    body.addColorStop(0.92, "#1a6f9a");
    body.addColorStop(1, "rgba(94,200,242,0.15)");

    const steps = Math.max(48, Math.floor(h / 10));

    ctx.beginPath();
    ctx.moveTo(-40, -40);
    for (let i = 0; i <= steps; i++) {
      const y = (i / steps) * (h + 80) - 40;
      ctx.lineTo(crestX(frontX, y, h, t), y);
    }
    ctx.lineTo(-40, h + 40);
    ctx.closePath();
    ctx.fillStyle = body;
    ctx.fill();

    // Secondary swell layer (parallax depth)
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(-40, -40);
    for (let i = 0; i <= steps; i++) {
      const y = (i / steps) * (h + 80) - 40;
      const n1 = Math.sin(y * 0.01 + t * 2.4 + 1.2) * 40;
      const n2 = Math.sin(y * 0.022 - t * 3.2) * 18;
      ctx.lineTo(frontX - crestWidth * 0.55 + n1 + n2, y);
    }
    ctx.lineTo(-40, h + 40);
    ctx.closePath();
    const swell = ctx.createLinearGradient(0, 0, frontX, 0);
    swell.addColorStop(0, "#041018");
    swell.addColorStop(1, "#155a82");
    ctx.fillStyle = swell;
    ctx.fill();
    ctx.restore();

    // Lit wave face / glass highlight
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const y = (i / steps) * h;
      const x = crestX(frontX, y, h, t, { full: false });
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = steps; i >= 0; i--) {
      const y = (i / steps) * h;
      ctx.lineTo(crestX(frontX, y, h, t, { full: false, inset: crestWidth * 0.42 }), y);
    }
    ctx.closePath();
    const face = ctx.createLinearGradient(frontX - crestWidth, 0, frontX + 20, 0);
    face.addColorStop(0, "rgba(30, 120, 170, 0)");
    face.addColorStop(0.45, "rgba(94, 200, 242, 0.28)");
    face.addColorStop(0.75, "rgba(232, 244, 252, 0.45)");
    face.addColorStop(1, "rgba(255, 255, 255, 0.15)");
    ctx.fillStyle = face;
    ctx.fill();
    ctx.restore();

    // Foam ribbon along crest
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const y = (i / steps) * h;
      const x = crestX(frontX, y, h, t, { foam: true });
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = steps; i >= 0; i--) {
      const y = (i / steps) * h;
      const thick = 10 + Math.abs(Math.sin(y * 0.04 + t * 6)) * 18;
      ctx.lineTo(crestX(frontX, y, h, t, { full: false, inset: thick }), y);
    }
    ctx.closePath();
    const foamGrad = ctx.createLinearGradient(frontX - 40, 0, frontX + 30, 0);
    foamGrad.addColorStop(0, "rgba(255,255,255,0.05)");
    foamGrad.addColorStop(0.4, "rgba(232,244,252,0.55)");
    foamGrad.addColorStop(0.75, "rgba(255,255,255,0.9)");
    foamGrad.addColorStop(1, "rgba(138,223,255,0.35)");
    ctx.fillStyle = foamGrad;
    ctx.fill();
    ctx.restore();

    // Caustic shimmer streaks inside water
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 7; i++) {
      const gy = ((i * 97 + t * 40) % (h + 120)) - 60;
      const gw = w * 0.35;
      const gx = frontX - gw * (0.4 + (i % 3) * 0.15);
      const g = ctx.createRadialGradient(gx, gy, 4, gx, gy, gw * 0.35);
      g.addColorStop(0, "rgba(138,223,255,0.9)");
      g.addColorStop(1, "rgba(138,223,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(gx, gy, gw * 0.28, 18 + (i % 3) * 8, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Spawn spray near crest while wave is moving
    if (progress > 0.08 && progress < 0.92 && sprayRef.current.length < 90) {
      for (let i = 0; i < 3; i++) {
        const y = Math.random() * h;
        const x = crestX(frontX, y, h, t, { full: false });
        sprayRef.current.push({
          x: x + Math.random() * 12,
          y: y + (Math.random() - 0.5) * 20,
          vx: 60 + Math.random() * 180,
          vy: -80 - Math.random() * 160,
          r: 1 + Math.random() * 3.2,
          life: 0,
          max: 0.35 + Math.random() * 0.45,
        });
      }
    }

    // Update + draw spray
    const dt = 1 / 60;
    const next: Spray[] = [];
    for (const p of sprayRef.current) {
      p.life += dt;
      if (p.life >= p.max) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 420 * dt;
      p.vx *= 0.99;
      const alpha = 1 - p.life / p.max;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${0.15 + alpha * 0.75})`;
      ctx.arc(p.x, p.y, p.r * (0.7 + alpha * 0.5), 0, Math.PI * 2);
      ctx.fill();
      if (p.r > 2) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(200,235,255,${alpha * 0.4})`;
        ctx.arc(p.x - p.r * 1.4, p.y + p.r, p.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      next.push(p);
    }
    sprayRef.current = next;

    // Soft vignette so edges feel wet / cinematic
    const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.85);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(2,6,12,0.28)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }, []);

  const triggerWave = useCallback(
    (options: WaveOptions) => {
      if (playingRef.current) return;

      const kind =
        options.kind ??
        (options.href.split("?")[0]?.split("#")[0] === "/carrinho"
          ? "flick"
          : "wave");
      const duration = kind === "flick" ? FLICK_MS : WAVE_MS;
      const actionAt = kind === "flick" ? FLICK_ACTION_AT : WAVE_ACTION_AT;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        runAction(options);
        return;
      }

      pendingRef.current = options;
      actedRef.current = false;
      sprayRef.current = [];
      clearTimers();
      playingRef.current = true;
      setMode(kind);
      startRef.current = performance.now();

      if (kind === "wave") {
        const tick = (now: number) => {
          const elapsed = now - startRef.current;
          const progress = Math.min(1, elapsed / WAVE_MS);
          paintWave(progress, now);
          if (progress < 1) {
            rafRef.current = requestAnimationFrame(tick);
          }
        };
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);
      }

      timersRef.current.push(
        window.setTimeout(() => {
          if (actedRef.current || !pendingRef.current) return;
          actedRef.current = true;
          runAction(pendingRef.current);
        }, duration * actionAt),
      );

      timersRef.current.push(
        window.setTimeout(() => {
          stopCanvas();
          playingRef.current = false;
          setMode("idle");
          pendingRef.current = null;
          actedRef.current = false;
          sprayRef.current = [];
        }, duration + 40),
      );
    },
    [runAction, clearTimers, paintWave, stopCanvas],
  );

  triggerWaveRef.current = triggerWave;

  useEffect(() => {
    function isModifiedClick(e: MouseEvent) {
      return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
    }

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || isModifiedClick(e)) return;

      const target = e.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.noWave != null) return;

      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr || hrefAttr.startsWith("mailto:") || hrefAttr.startsWith("tel:")) {
        return;
      }

      let url: URL;
      try {
        url = new URL(hrefAttr, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;

      const next = `${url.pathname}${url.search}${url.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (next === current) return;

      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      triggerWaveRef.current({
        href: next,
        kind: url.pathname === "/carrinho" ? "flick" : "wave",
      });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(
    () => () => {
      clearTimers();
      cancelAnimationFrame(rafRef.current);
    },
    [clearTimers],
  );

  return (
    <WaveContext.Provider value={{ triggerWave }}>
      {children}
      <div
        className={`wave-wipe ${mode === "wave" ? "wave-wipe--play" : ""}`}
        aria-hidden
      >
        <canvas ref={canvasRef} className="wave-wipe-canvas" />
      </div>
      <div
        className={`photo-flick ${mode === "flick" ? "photo-flick--play" : ""}`}
        aria-hidden
      >
        <div className="photo-flick-backdrop" />
        <div className="photo-flick-stack">
          {FLICK_SHOTS.map((src, i) => (
            <div
              key={src}
              className="photo-flick-card"
              style={{ ["--flick-i" as string]: i }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" draggable={false} />
              <span className="photo-flick-frame" />
            </div>
          ))}
        </div>
      </div>
    </WaveContext.Provider>
  );
}
