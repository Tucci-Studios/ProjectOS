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
      <Chip Icon={GitBranch} value={branchCount} label="branches" />
      <Chip Icon={ChevronUp} value={voteCount} label="votes" />
      <Chip Icon={Users} value={followers} label="followers" />
      {downloads ? <Chip Icon={Download} value={downloads} label="downloads" /> : null}
      {signedIn && (
        <FollowButton projectId={projectId} initialFollowing={initialFollowing} onCount={setFollowers} size="sm" />
      )}
    </span>
  );
}

function Chip({ Icon, value, label }: { Icon: typeof Users; value: number; label: string }) {
  return (
    <span title={`${value} ${label}`} className="inline-flex items-center gap-1 text-neutral-400">
      <Icon size={12} aria-hidden /> {value}
    </span>
  );
}
