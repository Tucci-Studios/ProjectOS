"use client";

import { FlaskConical } from "lucide-react";
import { FeedIcons } from "./feed-icons";

export function LabClient() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">A mark for Feed</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        The shipped one is the RSS symbol, which reads as wifi to anyone who never used a feed reader. Twelve
        candidates, each shown in the actual rail — the only question is whether it holds its own against the five
        icons under it.
      </p>

      <div className="mt-6">
        <FeedIcons />
      </div>
    </div>
  );
}
