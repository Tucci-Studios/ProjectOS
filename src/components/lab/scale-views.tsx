"use client";

import { useEffect, useRef } from "react";

const ACCENT = "#34d399";

/**
 * Scale as position: every ring out is ten times the last.
 *
 * A linear picture can't hold both 12 and 30,000 — one of them is invisible.
 * Powers of ten can hold any project on the site at the same size, and the
 * distance out IS the story: two rings is a nice project, four is a phenomenon.
 */
export function LogRings({ count, height = 420 }: { count: number; height?: number }) {
  const decades = 6; // 1 → 1,000,000
  const reach = Math.max(0, Math.log10(Math.max(1, count)));
  const R = 190 / decades;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox="-215 -215 430 430" className="h-full w-full">
        {Array.from({ length: decades }, (_, i) => {
          const value = Math.pow(10, i + 1);
          const reached = reach >= i + 1;
          return (
            <g key={i}>
              <circle
                r={(i + 1) * R}
                fill="none"
                stroke={reached ? ACCENT : "#243029"}
                strokeOpacity={reached ? 0.5 : 1}
                strokeWidth={reached ? 1 : 0.5}
                strokeDasharray={reached ? undefined : "2 4"}
              />
              <text
                x={4}
                y={-(i + 1) * R - 4}
                fill={reached ? ACCENT : "#3f3f46"}
                fontSize={9}
                fontFamily="ui-monospace, monospace"
              >
                {value >= 1000 ? `${value / 1000}k` : value}
              </text>
            </g>
          );
        })}

        {/* Where this project actually lands. */}
        <circle r={reach * R} fill="none" stroke="#fff" strokeWidth={2}>
          <animate attributeName="opacity" values="1;0.45;1" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle r={5} fill={ACCENT} />
      </svg>

      <p className="pointer-events-none absolute bottom-2 left-3 right-3 font-mono text-[11px] text-neutral-500">
        Every ring is ten times the one inside it — the white ring is this project.
      </p>
    </div>
  );
}

/**
 * Scale as area: one tile per fork, packed into a block.
 *
 * The dullest of the three and the easiest to judge against — you can see a
 * block is four times another block in a way you cannot see one circle is four
 * times another. Canvas, because thirty thousand elements is not a DOM job.
 */
export function Tiles({ count, height = 420 }: { count: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const drawn = Math.min(count, 40000);
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const start = performance.now();

    const frame = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      // Pick a tile size that fills the box without overflowing it.
      const pad = 16;
      const usableW = w - pad * 2;
      const usableH = h - pad * 2 - 22;
      let tile = Math.sqrt((usableW * usableH) / Math.max(1, drawn));
      tile = Math.max(1.1, Math.min(tile, 14));
      const cols = Math.max(1, Math.floor(usableW / tile));
      const gap = tile > 3 ? tile * 0.18 : 0;

      // Tiles arrive in a wave rather than all at once, so the size lands.
      const revealed = reduced ? drawn : Math.min(drawn, Math.floor(drawn * Math.min(1, t / 1.6)));

      ctx.beginPath();
      for (let i = 0; i < revealed; i++) {
        const x = pad + (i % cols) * tile;
        const y = pad + Math.floor(i / cols) * tile;
        if (y > h - pad) break;
        ctx.rect(x, y, Math.max(1, tile - gap), Math.max(1, tile - gap));
      }
      ctx.fillStyle = "rgba(52,211,153,0.55)";
      ctx.fill();

      if (revealed < drawn) raf = requestAnimationFrame(frame);
      else if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <p className="pointer-events-none absolute bottom-2 left-3 right-3 font-mono text-[11px] text-neutral-500">
        One tile per fork{count > 40000 && <span className="text-neutral-600"> · capped at 40,000 drawn</span>}
      </p>
    </div>
  );
}

/**
 * The number itself, counting up.
 *
 * No picture at all — just how long it takes to get there. Cheap, works at any
 * magnitude, and the only one of these that survives being 40px tall.
 */
export function Counter({ count, height = 420 }: { count: number; height?: number }) {
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = count.toLocaleString();
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      // Fast then settling, so the last digits land rather than snap.
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.floor(count * eased).toLocaleString();
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count]);

  return (
    <div className="flex w-full flex-col items-center justify-center" style={{ height }}>
      <p ref={ref} className="font-mono text-[76px] font-bold leading-none tabular-nums text-white">
        0
      </p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">forks</p>
    </div>
  );
}
