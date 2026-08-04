"use client";

import { FlaskConical } from "lucide-react";
import { AiIcons } from "./ai-icons";

export function LabClient() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">A mark for AI</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Fifteen candidates, each in the tile at both sizes, and again beside Build and Play so you can see whether it
        belongs to the same family. The brain is what&apos;s shipped and it&apos;s first.
      </p>

      <div className="mt-6">
        <AiIcons />
      </div>
    </div>
  );
}
