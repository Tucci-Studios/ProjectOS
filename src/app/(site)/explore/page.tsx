import Link from "next/link";
import { Sparkles, Plus } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getUserVotes } from "@/lib/queries";
import { getStream } from "@/lib/stream";
import { ButtonLink } from "@/components/ui";
import { StreamList, type StreamItem } from "./stream-list";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const user = await getSessionUser();
  const [{ items, nextCursor }, votes] = await Promise.all([getStream(), getUserVotes(user?.id)]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="flex items-center gap-2.5 font-mono text-2xl font-bold tracking-tight text-white">
            <Sparkles size={22} className="text-emerald-400" aria-hidden /> New
          </h1>
          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
            Everything as it lands — new projects, branches, posts, and questions. Keeps going as long as you scroll.{" "}
            <Link href="/popular" className="text-emerald-300 transition hover:underline">
              See what&apos;s popular
            </Link>
            .
          </p>
        </div>
        <ButtonLink href={user ? "/wire/new" : "/api/auth/login"} variant="ghost" className="!min-h-[40px]">
          <Plus size={15} aria-hidden /> Post
        </ButtonLink>
      </header>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-500">
          Nothing here yet. Publish a project or post something.
        </p>
      ) : (
        <StreamList
          initialItems={items as StreamItem[]}
          initialCursor={nextCursor}
          initialVotes={Object.fromEntries(votes)}
        />
      )}
    </div>
  );
}
