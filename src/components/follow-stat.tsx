"use client";

import { useState } from "react";
import { GitFork, Users, Download, ChevronUp, Star } from "lucide-react";
import { FollowButton } from "./follow-button";

const compact = (n: number) => (n >= 10000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : n.toLocaleString());

/**
 * The numbers, on their own row with their names written out.
 *
 * These used to be bare icons and digits crammed into the byline — you had to
 * hover to learn what any of them meant, which is no help at all on a phone.
 * The label is the explanation now; the tooltip just adds detail.
 */
export function ProjectStats({
  projectId,
  initialFollowing,
  initialFollowers,
  forkCount,
  voteCount,
  downloads,
  stars,
  signedIn,
}: {
  projectId: string;
  initialFollowing: boolean;
  initialFollowers: number;
  forkCount: number;
  voteCount: number;
  downloads: number | null;
  stars?: number | null;
  signedIn: boolean;
}) {
  const [followers, setFollowers] = useState(initialFollowers);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2.5">
      <Stat
        Icon={GitFork}
        value={forkCount}
        label={forkCount === 1 ? "fork" : "forks"}
        explain={
          forkCount === 0
            ? "Nobody has made their own version of this yet."
            : `${forkCount} ${forkCount === 1 ? "person has" : "people have"} made their own version of this.`
        }
        highlight
      />
      <Stat
        Icon={ChevronUp}
        value={voteCount}
        label={Math.abs(voteCount) === 1 ? "vote" : "votes"}
        explain="Upvotes minus downvotes from the community."
      />
      <Stat
        Icon={Users}
        value={followers}
        label={followers === 1 ? "follower" : "followers"}
        explain="People who get told when this posts an update or someone forks it."
      />
      {stars ? (
        <Stat
          Icon={Star}
          value={stars}
          label={stars === 1 ? "star" : "stars"}
          explain="Stars on GitHub. Not a Project OS number — it's how the wider world rates it."
          tone="text-amber-300/70"
        />
      ) : null}
      {downloads ? (
        <Stat
          Icon={Download}
          value={downloads}
          label="downloads"
          explain="Times this was downloaded from its GitHub releases."
        />
      ) : null}

      {signedIn && (
        <span className="ml-auto">
          <FollowButton projectId={projectId} initialFollowing={initialFollowing} onCount={setFollowers} size="sm" />
        </span>
      )}
    </div>
  );
}

function Stat({
  Icon,
  value,
  label,
  explain,
  highlight = false,
  tone,
}: {
  Icon: typeof Users;
  value: number;
  label: string;
  explain: string;
  highlight?: boolean;
  /** Overrides the highlight colour — stars are gold, not emerald. */
  tone?: string;
}) {
  return (
    <span className="group/chip relative inline-flex items-baseline gap-1.5">
      <Icon
        size={13}
        aria-hidden
        className={`self-center ${tone ?? (highlight ? "text-emerald-400" : "text-neutral-500")} ${tone ? "fill-current" : ""}`}
      />
      <span className={`font-mono text-[15px] font-bold ${tone ?? (highlight ? "text-emerald-400" : "text-neutral-200")}`}>
        {compact(value)}
      </span>
      <span className="cursor-help font-mono text-[12px] text-neutral-500 underline decoration-dotted underline-offset-4">
        {label}
      </span>

      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-[calc(100%+9px)] z-40 w-56 translate-y-1 rounded-lg border border-neutral-700 bg-[#1a221d] px-3 py-2 text-left opacity-0 shadow-xl transition-all duration-150 group-hover/chip:translate-y-0 group-hover/chip:opacity-100"
      >
        <span className="block text-[11px] leading-snug text-neutral-300">{explain}</span>
      </span>
    </span>
  );
}
