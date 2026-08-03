"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyLine({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-stretch gap-2">
      <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-neutral-700 bg-[#0d120f] px-3 py-2.5 font-mono text-xs text-emerald-300">
        {code}
      </code>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        aria-label="Copy command"
        title="Copy command"
        className="flex min-h-[42px] w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 outline-none transition hover:border-emerald-400/60 hover:bg-neutral-800 hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
      </button>
    </div>
  );
}
