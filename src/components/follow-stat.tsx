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
    <>
      {signedIn && (
        <div className="mt-4">
          <FollowButton projectId={projectId} initialFollowing={initialFollowing} onCount={setFollowers} />
        </div>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Branches" value={branchCount} Icon={GitBranch} />
        <Stat label="Votes" value={voteCount} Icon={ChevronUp} />
        <Stat label="Followers" value={followers} Icon={Users} />
        {downloads ? <Stat label="Downloads" value={downloads} Icon={Download} /> : null}
      </dl>
    </>
  );
}

function Stat({ label, value, Icon }: { label: string; value: number; Icon: typeof Users }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
        <Icon size={11} aria-hidden /> {label}
      </dt>
      <dd className="mt-0.5 font-mono text-lg font-bold tabular-nums text-white">{value}</dd>
    </div>
  );
}
