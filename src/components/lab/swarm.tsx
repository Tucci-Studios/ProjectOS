"use client";

import { useEffect, useRef } from "react";

const ACCENT = [52, 211, 153] as const;

/**
 * Every fork, as its own point of light.
 *
 * Fifty dots cannot express thirty thousand. Nothing abstract can — a bar, a
 * ring, a number all flatten the difference between big and enormous. So this
 * draws one particle per fork, all of them, and lets the mass speak.
 *
 * Canvas rather than SVG: thirty thousand DOM nodes would never paint, but
 * thirty thousand fills in one 2D context is comfortable at sixty frames.
 *
 * Honest about what it knows: we hold details for the few forks GitHub gave us
 * by name, and the rest are anonymous. They're real in COUNT, not identity, and
 * the caption says so.
 */
export function Swarm({
  count,
  known = 0,
  height = 420,
}: {
  /** How many forks exist. Every one of them gets a particle. */
  count: number;
  /** How many we hold names for — drawn brighter. */
  known?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Past this it's a solid disc and more particles add nothing but heat.
    const drawn = Math.min(count, 40000);

    // Flat typed arrays, not objects — at this size allocation is the cost.
    const angle = new Float32Array(drawn);
    const radius = new Float32Array(drawn);
    const speed = new Float32Array(drawn);
    const wobble = new Float32Array(drawn);
    const phase = new Float32Array(drawn);
    const bright = new Float32Array(drawn);

    // Deterministic, so the same project always looks like itself.
    let seed = 1013904223 ^ count;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };

    for (let i = 0; i < drawn; i++) {
      angle[i] = rnd() * Math.PI * 2;
      // sqrt keeps the disc evenly filled instead of piling up in the middle.
      radius[i] = 0.16 + Math.sqrt(rnd()) * 0.84;
      speed[i] = (0.06 + rnd() * 0.1) / (0.35 + radius[i]);
      wobble[i] = 0.004 + rnd() * 0.012;
      phase[i] = rnd() * Math.PI * 2;
      bright[i] = i < known ? 0.85 + rnd() * 0.15 : 0.16 + rnd() * 0.3;
    }

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.46;

      ctx.clearRect(0, 0, w, h);

      // The original at the centre, breathing.
      const pulse = 1 + Math.sin(t * 1.4) * 0.12;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.5);
      glow.addColorStop(0, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0.16)`);
      glow.addColorStop(1, "rgba(52,211,153,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Everything in one path per brightness band — switching fillStyle 30,000
      // times is what would actually make this slow.
      for (let band = 0; band < 3; band++) {
        ctx.beginPath();
        const lo = band / 3;
        const hi = (band + 1) / 3;
        for (let i = 0; i < drawn; i++) {
          if (bright[i] < lo || bright[i] >= hi) continue;
          const a = angle[i] + (reduced ? 0 : t * speed[i]);
          const r = (radius[i] + (reduced ? 0 : Math.sin(t * 0.7 + phase[i]) * wobble[i])) * scale;
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a) * 0.62; // squashed, so it reads as a disc in space
          const size = band === 2 ? 1.5 : 0.85;
          ctx.moveTo(x + size, y);
          ctx.arc(x, y, size, 0, Math.PI * 2);
        }
        ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${0.16 + band * 0.3})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 4.5 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "#7bf3c0";
      ctx.fill();

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count, known]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <p className="pointer-events-none absolute bottom-2 left-3 right-3 font-mono text-[11px] text-neutral-500">
        One dot per fork
        {count > 40000 && <span className="text-neutral-600"> · capped at 40,000 drawn</span>}
        {known > 0 && <span className="text-neutral-600"> · the {known} we hold names for are brighter</span>}
      </p>
    </div>
  );
}
