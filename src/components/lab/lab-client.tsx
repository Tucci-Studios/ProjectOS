"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { TutorialView } from "@/components/tutorial-view";
import { OwnerControls, type OwnerMark } from "@/components/owner-mark";
import type { Guide } from "@/lib/tutorial-guide";

/**
 * Every state a tutorial can be in, side by side.
 *
 * The owner-mark rules are easy to describe and hard to picture, and the one
 * that matters most — a disputed guide staying readable rather than being
 * buried — is exactly the one you can't judge from a description. So: the real
 * component, the real banners, one tab per case.
 */
type Case = {
  key: string;
  label: string;
  note: string;
  owner?: { mark: OwnerMark; writtenByOwner: boolean; viewerIsOwner: boolean };
  controls?: OwnerMark;
  edited?: string;
};

const CASES: Case[] = [
  {
    key: "plain",
    label: "Not about a project",
    note: "A standalone guide. No project attached, so no owner exists and no banner is possible.",
  },
  {
    key: "silent",
    label: "Attached, owner silent",
    note: "Attached to a project whose owner hasn't looked at it. The common case, and it should look completely ordinary.",
    owner: { mark: null, writtenByOwner: false, viewerIsOwner: false },
  },
  {
    key: "byowner",
    label: "Written by the owner",
    note: "The maintainer wrote it. No approval needed — authorship is checked against the project, so it can't be claimed falsely. Sorts first on the project page.",
    owner: { mark: null, writtenByOwner: true, viewerIsOwner: false },
  },
  {
    key: "approved",
    label: "Approved by the owner",
    note: "Someone else wrote it and the maintainer vouched for it, with their name on the vouch. Sorts second.",
    owner: {
      mark: { kind: "approved", note: null, by: "n8n-io" },
      writtenByOwner: false,
      viewerIsOwner: false,
    },
  },
  {
    key: "disputed",
    label: "Disputed by the owner",
    note: "The correction sits above the steps, not at the bottom — before step one, not after. The guide stays readable: the owner objects, they don't delete.",
    owner: {
      mark: {
        kind: "disputed",
        note: "Step 4 is out of date. The Inspector CLI changed its flags in v2, so that command fails now. Everything before it is fine.",
        by: "n8n-io",
      },
      writtenByOwner: false,
      viewerIsOwner: false,
    },
  },
  {
    key: "edited",
    label: "Edited since posting",
    note: "The byline says so. A reader following a guide should know it isn't the version that was published.",
    owner: { mark: null, writtenByOwner: false, viewerIsOwner: false },
    edited: "20m ago",
  },
  {
    key: "stale-approve",
    label: "Approved, then edited",
    note: "The important one. The approval goes grey rather than green, because it's vouching for text nobody re-read. The owner said it once; the site shouldn't keep saying it on their behalf.",
    owner: {
      mark: { kind: "approved", note: null, by: "n8n-io", stale: true },
      writtenByOwner: false,
      viewerIsOwner: false,
    },
    edited: "5m ago",
  },
  {
    key: "stale-dispute",
    label: "Disputed, then edited",
    note: "The correction stays — it was a real objection — but it now says the author has edited since, so it may already be fixed. Fair to both.",
    owner: {
      mark: {
        kind: "disputed",
        note: "Step 4 is out of date. The Inspector CLI changed its flags in v2.",
        by: "n8n-io",
        stale: true,
      },
      writtenByOwner: false,
      viewerIsOwner: false,
    },
    edited: "just now",
  },
  {
    key: "controls",
    label: "What the owner sees",
    note: "Only the project's owner gets these. Try them — they're live here but write nothing.",
    owner: { mark: null, writtenByOwner: false, viewerIsOwner: false },
    controls: null,
  },
  {
    key: "controls-disputed",
    label: "Owner, after disputing",
    note: "Their verdict is in place and they can edit it or take it back. Nothing is permanent.",
    owner: {
      mark: {
        kind: "disputed",
        note: "Step 4 is out of date. The Inspector CLI changed its flags in v2.",
        by: "you",
      },
      writtenByOwner: false,
      viewerIsOwner: false,
    },
    controls: { kind: "disputed", note: "Step 4 is out of date. The Inspector CLI changed its flags in v2.", by: "you" },
  },
];

export function LabClient({ guide }: { guide: Guide }) {
  const [pick, setPick] = useState(CASES[0].key);
  const c = CASES.find((x) => x.key === pick)!;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Lab</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Where things get tried before they earn a place on the site.
      </p>

      <section className="mt-8">
        <h2 className="font-mono text-[15px] font-bold text-white">Owner verdicts, every case</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
          The same tutorial in each state a project owner can put it in. Real component, real banners — the only thing
          faked is which project it belongs to and who you are.
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {CASES.map((x) => (
            <button
              key={x.key}
              onClick={() => setPick(x.key)}
              aria-pressed={pick === x.key}
              className={`min-h-[32px] cursor-pointer rounded-full border px-3 font-mono text-[11.5px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                pick === x.key
                  ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                  : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>

        <p className="mt-3 max-w-2xl rounded-lg border border-neutral-800 bg-neutral-900/40 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-neutral-300">
          {c.note}
        </p>

        {c.controls !== undefined && (
          <div className="mt-4">
            <OwnerControls postId="demo" mark={c.controls} demo />
          </div>
        )}

        <div className="mt-4">
          <TutorialView
            key={c.key}
            t={guide}
            post={{
              id: "demo",
              author: "Tucci-Studios",
              when: "2h ago",
              likes: 12,
              liked: false,
              saved: false,
              canReact: false,
              editedWhen: c.edited ?? null,
            }}
            owner={c.owner}
          />
        </div>
      </section>
    </div>
  );
}
