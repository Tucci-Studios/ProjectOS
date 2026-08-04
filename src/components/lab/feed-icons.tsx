"use client";

import {
  Rss,
  House,
  Newspaper,
  Rows3,
  Inbox,
  ScrollText,
  Activity,
  BookOpen,
  LayoutList,
  Radio,
  Waves,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import { Flame, Compass, Megaphone, Bookmark, Lightbulb, FlaskConical } from "lucide-react";

/**
 * Candidates for the Feed mark.
 *
 * The shipped one is the RSS symbol, which nobody under thirty reads as "feed"
 * — it reads as wifi. Shown in the sidebar rather than alone, because the only
 * question that matters is whether it's distinguishable from the five icons
 * stacked underneath it.
 */
const CANDIDATES: { Icon: LucideIcon; name: string; note: string }[] = [
  { Icon: Rss, name: "Rss", note: "What's shipped. It's the standard feed symbol and it looks exactly like wifi." },
  { Icon: House, name: "House", note: "This is the landing page, so home is literally true. Universally understood, slightly plain." },
  { Icon: Newspaper, name: "Newspaper", note: "Things published, in order. Says 'feed' without the wifi problem — busy at 16px though." },
  { Icon: Rows3, name: "Rows3", note: "Just stacked rows: the shape of the thing itself. Calm and abstract, easy to overlook." },
  { Icon: LayoutList, name: "LayoutList", note: "A list with detail. Same idea as Rows3 with more texture." },
  { Icon: Inbox, name: "Inbox", note: "Things arriving for you specifically, which is what a follow feed is." },
  { Icon: ScrollText, name: "ScrollText", note: "A running list you scroll. Distinct from everything else in the rail." },
  { Icon: Activity, name: "Activity", note: "A pulse — what's happening now. Reads as analytics elsewhere." },
  { Icon: BookOpen, name: "BookOpen", note: "Something to read through. Warm, but suggests documentation." },
  { Icon: Radio, name: "Radio", note: "Broadcast, tuned in. Has the same round-waves problem as RSS." },
  { Icon: Waves, name: "Waves", note: "A stream flowing past. Abstract, quiet, no collision." },
  { Icon: CalendarClock, name: "CalendarClock", note: "Ordered by time. Accurate and rather literal." },
];

const REST = [
  { Icon: Compass, label: "Explore" },
  { Icon: Megaphone, label: "News" },
  { Icon: Bookmark, label: "Saves" },
  { Icon: Lightbulb, label: "Ideas" },
  { Icon: FlaskConical, label: "Lab" },
];

export function FeedIcons() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {CANDIDATES.map(({ Icon, name, note }, i) => (
        <div key={name} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
          <p className="font-mono text-[14px] font-bold text-white">
            <span className="mr-2 text-neutral-600">{String(i + 1).padStart(2, "0")}</span>
            {name}
          </p>
          <p className="mt-1 min-h-[36px] text-[13px] leading-relaxed text-neutral-400">{note}</p>

          {/* in the rail, which is the only place it has to work */}
          <div className="mt-3 w-[190px] rounded-lg border border-neutral-800 bg-[#141a16] p-2">
            <span className="flex min-h-[38px] items-center gap-2.5 rounded-lg bg-emerald-400/10 px-3 font-mono text-sm font-bold text-emerald-300">
              <Icon size={16} aria-hidden /> Feed
            </span>
            {REST.map((r) => (
              <span
                key={r.label}
                className="flex min-h-[38px] items-center gap-2.5 rounded-lg px-3 font-mono text-sm text-neutral-300"
              >
                <r.Icon size={16} aria-hidden /> {r.label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
