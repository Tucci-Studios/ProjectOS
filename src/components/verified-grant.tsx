"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClaimStep } from "./claim-step";

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
  // The mark is the ceremony; claiming is the reason for it. Second screen, so
  // neither has to share space with the other.
  const [step, setStep] = useState<"mark" | "claim">("mark");

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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-6 backdrop-blur-sm"
      onClick={step === "mark" ? dismiss : undefined}
    >
      <div
        className={`flex w-full flex-col items-center text-center ${step === "mark" ? "max-w-md" : "max-w-xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {step === "claim" ? (
          <ClaimStep onDone={dismiss} />
        ) : (
        <>
        <svg width="132" height="132" viewBox="0 0 16 16" fill="none" className="drop-shadow-[0_0_28px_rgba(52,211,153,0.35)]">
          {/* the rim draws itself, then the disc fills in behind the prompt */}
          <circle
            cx="8"
            cy="8"
            r="7.4"
            stroke="#34d399"
            strokeWidth="0.75"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={stage >= 1 ? 0 : 100}
            transform="rotate(-90 8 8)"
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}
          />
          <circle
            cx="8"
            cy="8"
            r="7.4"
            fill="#34d399"
            style={{
              opacity: stage >= 2 ? 1 : 0,
              transition: "opacity 520ms ease-out",
            }}
          />
          <g
            style={{
              opacity: stage >= 2 ? 1 : 0,
              transform: stage >= 2 ? "scale(1)" : "scale(0.55)",
              transformOrigin: "center",
              transition: "opacity 420ms ease-out 120ms, transform 620ms cubic-bezier(0.22, 1, 0.36, 1) 120ms",
            }}
          >
            <path
              d="M4.4 5.7 L7 8 L4.4 10.3"
              stroke="#0f1411"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="8.6" y="9.3" width="3.6" height="1.5" rx="0.45" fill="#0f1411" />
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
            onClick={() => setStep("claim")}
            className="mt-6 min-h-[44px] cursor-pointer rounded-lg bg-emerald-400 px-6 font-mono text-sm font-bold text-black outline-none transition hover:bg-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Next
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
