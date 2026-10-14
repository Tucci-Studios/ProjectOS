"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** One page failed. The shell is fine, so keep the user inside the site. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const path = usePathname();

  useEffect(() => {
    fetch("/api/oops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error.message, digest: error.digest, stack: error.stack, path }),
      keepalive: true,
    }).catch(() => {});
  }, [error, path]);

  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="font-mono text-xl font-bold text-white">That didn&apos;t load.</h1>
      <p className="mt-2.5 text-[14px] leading-relaxed text-neutral-400">
        Something on our end fell over. It&apos;s been logged automatically — you don&apos;t need to report it.
      </p>
      {error.digest && <p className="mt-2 font-mono text-[11.5px] text-neutral-400">Reference: {error.digest}</p>}
      <div className="mt-5 flex flex-wrap gap-2.5">
        <button
          onClick={reset}
          className="min-h-[40px] cursor-pointer rounded-lg bg-emerald-400 px-4 font-mono text-[13px] font-bold text-black outline-none transition hover:bg-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          Try again
        </button>
        <Link
          href="/explore"
          className="inline-flex min-h-[40px] items-center rounded-lg border border-neutral-700 px-4 font-mono text-[13px] text-neutral-300 outline-none transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          Back to Explore
        </Link>
      </div>
    </div>
  );
}
