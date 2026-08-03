"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * The moment someone's mark is granted.
 *
 * Fires once, on the sign-in that turns a shadow author into a real one. The
 * ring draws itself, the trunk grows out of the middle, and anything of theirs
 * we'd already indexed is named on the way past. Respects reduced-motion by
 * skipping straight to the finished state.
 */
export function VerifiedGrant() {
  const router = useRouter();
  const params = useSearchParams();
  const claimed = Number(params.get("claimed") ?? 0);
  const isNew = params.get("verified") === "1" || claimed > 0;

  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!isNew) return;
    setOpen(true);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStage(3);
      return;
    }
    const timers = [
      setTimeout(() => setStage(1), 250), // ring
      setTimeout(() => setStage(2), 900), // trunk
      setTimeout(() => setStage(3), 1500), // words
    ];
    return () => timers.forEach(clearTimeout);
  }, [isNew]);

  function dismiss() {
    setOpen(false);
    // Drop the query params so a refresh doesn't replay it.
    router.replace("/me");
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="You're verified on Project OS"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="flex max-w-md flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="132" height="132" viewBox="0 0 16 16" fill="none" className="drop-shadow-[0_0_28px_rgba(52,211,153,0.35)]">
          {/* the ring draws itself */}
          <circle
            cx="8"
            cy="8"
            r="7.1"
            stroke="#34d399"
            strokeWidth="0.75"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={stage >= 1 ? 0 : 100}
            transform="rotate(-90 8 8)"
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}
          />
          <g
            transform="translate(8 8.6) scale(0.62) translate(-8 -10)"
            style={{
              opacity: stage >= 2 ? 1 : 0,
              transform:
                stage >= 2
                  ? "translate(8px, 8.6px) scale(0.62) translate(-8px, -10px)"
                  : "translate(8px, 8.6px) scale(0.2) translate(-8px, -10px)",
              transformOrigin: "center",
              transition: "opacity 420ms ease-out, transform 620ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <path d="M8 15V9.5" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M8 10 L4.2 6.6 M8 10 L11.8 6.6" stroke="#34d399" strokeWidth="1.45" strokeLinecap="round" />
            <circle cx="8" cy="10" r="1.45" fill="#34d399" />
            <circle cx="4" cy="5.4" r="1.6" fill="none" stroke="#34d399" strokeWidth="1.35" />
            <circle cx="12" cy="5.4" r="1.6" fill="none" stroke="#34d399" strokeWidth="1.35" />
          </g>
        </svg>

        <div
          style={{
            opacity: stage >= 3 ? 1 : 0,
            transform: stage >= 3 ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 400ms ease-out, transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.35em] text-emerald-400">Verified</p>
          <h2 className="mt-2 font-mono text-2xl font-bold text-white">You&apos;re on Project OS</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-neutral-400">
            {claimed > 0 ? (
              <>
                Your mark now shows next to your name — and{" "}
                <span className="font-bold text-emerald-300">
                  {claimed} project{claimed === 1 ? "" : "s"}
                </span>{" "}
                we&apos;d already indexed {claimed === 1 ? "is" : "are"} yours to edit.
              </>
            ) : (
              <>
                Your mark now shows next to your name, so people can tell you&apos;re actually here rather than just
                listed.
              </>
            )}
          </p>

          <button
            onClick={dismiss}
            className="mt-6 min-h-[44px] cursor-pointer rounded-lg bg-emerald-400 px-6 font-mono text-sm font-bold text-black outline-none transition hover:bg-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {claimed > 0 ? "See my projects" : "Have a look around"}
          </button>
        </div>
      </div>
    </div>
  );
}
