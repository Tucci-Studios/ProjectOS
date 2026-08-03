"use client";

import { useState } from "react";
import { GitBranch, Users, Download, ChevronUp } from "lucide-react";
import { FollowButton } from "./follow-button";

// Follow control and follower count live in one client component so the number
// moves the moment you click, without a page refresh.
export function ProjectStats({
  projectId,
  initialFollowing,
  initialFollowers,
  branchCount,
  voteCount,
  downloads,
  signedIn,
}: {
  projectId: string;
  initialFollowing: boolean;
  initialFollowers: number;
  branchCount: number;
  voteCount: number;
  downloads: number | null;
  signedIn: boolean;
}) {
  const [followers, setFollowers] = useState(initialFollowers);

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <Chip
        Icon={GitBranch}
        value={branchCount}
        label="branches"
        explain={
          branchCount === 0
            ? "Nobody has made their own version of this yet"
            : `${branchCount} ${branchCount === 1 ? "person has" : "people have"} made their own version of this`
        }
        highlight={branchCount > 0}
      />
      <Chip
        Icon={ChevronUp}
        value={voteCount}
        label="votes"
        explain="Net votes — upvotes minus downvotes from the community"
      />
      <Chip
        Icon={Users}
        value={followers}
        label="followers"
        explain="People who get told when this grows a new branch"
      />
      {downloads ? (
        <Chip
          Icon={Download}
          value={downloads}
          label="downloads"
          explain="Times this was downloaded from its GitHub releases"
        />
      ) : null}
      {signedIn && (
        <FollowButton projectId={projectId} initialFollowing={initialFollowing} onCount={setFollowers} size="sm" />
      )}
    </span>
  );
}

function Chip({
  Icon,
  value,
  label,
  explain,
  highlight = false,
}: {
  Icon: typeof Users;
  value: number;
  label: string;
  explain: string;
  highlight?: boolean;
}) {
  return (
    <span className="group/chip relative inline-flex">
      <span
        className={`inline-flex cursor-help items-center gap-1 ${highlight ? "font-bold text-emerald-400" : "text-neutral-400"}`}
      >
        <Icon size={12} aria-hidden /> {value}
      </span>

      {/* Say what the number means — the icon alone teaches nobody. */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+7px)] z-40 w-52 -translate-x-1/2 translate-y-1 rounded-lg border border-neutral-700 bg-[#1a221d] px-3 py-2 text-left opacity-0 shadow-xl transition-all duration-150 group-hover/chip:translate-y-0 group-hover/chip:opacity-100"
      >
        <span className="block font-mono text-[11px] font-bold text-white">
          {value} {label}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-neutral-400">{explain}</span>
      </span>
    </span>
  );
}
