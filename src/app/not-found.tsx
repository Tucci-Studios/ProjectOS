import Link from "next/link";
import { BrandMark } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#161d18] px-5 text-neutral-200">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <BrandMark size={52} />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">404 — dead fork</p>
        <h1 className="mt-3 font-mono text-2xl font-bold tracking-tight text-white">
          Nothing grew here
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-400">
          This page doesn&apos;t exist, or the project moved. Not every fork survives.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-emerald-400 px-5 font-mono text-sm font-bold text-black transition hover:bg-emerald-300"
          >
            Back to the feed
          </Link>
          <Link
            href="/popular"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-neutral-600 px-5 font-mono text-sm text-neutral-200 transition hover:border-neutral-400"
          >
            Explore projects
          </Link>
        </div>
      </div>
    </div>
  );
}
