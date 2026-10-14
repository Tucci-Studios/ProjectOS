/**
 * A damped spring, sampled into keyframes.
 *
 * CSS easing curves are fixed shapes — a bezier always takes the same path
 * whatever the distance, which is why a nav highlight eased that way feels
 * mechanical: a short hop and a long slide get the same personality. A spring
 * is a simulation instead, so distance changes the motion the way it does with
 * a real object. It also overshoots very slightly and settles, which is what
 * reads as "alive" rather than "moved".
 *
 * Sampled to keyframes rather than run per-frame so the browser can hand the
 * whole thing to the compositor and we never touch layout mid-flight.
 */

export type SpringOpts = {
  /** How hard it's pulled toward the target. Higher = snappier. */
  stiffness?: number;
  /** How much it resists. Lower = more overshoot. */
  damping?: number;
  mass?: number;
};

/**
 * Tuned for a nav highlight: quick, with one small pass beyond the mark.
 * Damping ratio here is ~0.62, which overshoots enough to feel sprung.
 */
const DEFAULTS: Required<SpringOpts> = { stiffness: 620, damping: 31, mass: 1 };

/**
 * How far past the target it may travel, in pixels.
 *
 * A spring's overshoot scales with distance, so an unclamped one flies ~25px
 * past on a long slide and barely 4px on a short hop — the same motion reads as
 * flamboyant in one place and flat in another.
 *
 * Clamping was the obvious fix and the wrong one: holding the value at the
 * ceiling flattened the peak, so it visibly stalled for ~45ms at the top of the
 * bounce. Compressing the overshoot instead keeps the curve's shape and only
 * scales the part beyond the target, so there's no flat spot anywhere.
 */
const MAX_OVERSHOOT_PX = 6;

export type Sampled = { positions: number[]; durationMs: number };

/**
 * Positions from `from` to `to`, one per frame at 60fps, ending settled.
 * Deterministic — same inputs always give the same curve, which is what makes
 * it testable.
 */
export function sampleSpring(from: number, to: number, opts: SpringOpts = {}): Sampled {
  const { stiffness, damping, mass } = { ...DEFAULTS, ...opts };
  const dt = 1 / 60;
  const distance = to - from;
  if (distance === 0) return { positions: [to], durationMs: 0 };

  // Simulate once in normalised space (0 -> 1). The shape of a spring doesn't
  // depend on how far it travels, so this is the same curve every time and the
  // distance is applied afterwards.
  const unit: number[] = [];
  let x = 0;
  let v = 0;
  const settle = 0.5 / Math.abs(distance);
  const settleV = 1.2 / Math.abs(distance);

  for (let i = 0; i < 120; i++) {
    unit.push(x);
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    if (Math.abs(x - 1) < settle && Math.abs(v) < settleV) break;
  }
  unit.push(1);

  // Scale down only the part past the target, so the peak stays a peak.
  const peak = Math.max(...unit);
  const overshoot = peak - 1;
  const allowed = MAX_OVERSHOOT_PX / Math.abs(distance);
  const squeeze = overshoot > 0 && overshoot > allowed ? allowed / overshoot : 1;

  const positions = unit.map((u) => {
    const shaped = u <= 1 ? u : 1 + (u - 1) * squeeze;
    return from + distance * shaped;
  });

  return { positions, durationMs: Math.round((positions.length - 1) * dt * 1000) };
}
