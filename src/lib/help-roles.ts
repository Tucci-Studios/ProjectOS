import { ListOrdered, Sparkles, ShieldCheck, MessageSquarePlus, type LucideIcon } from "lucide-react";

/**
 * What Project OS actually needs hands on.
 *
 * Kept short and honest. A help-wanted page that lists twelve vague roles reads
 * like a wishlist; four specific ones read like a job. Ranking is one role
 * rather than three because Explore, the feed and Wire are the same problem
 * wearing different clothes — whoever fixes one will end up in the other two.
 */
export type HelpRole = {
  key: string;
  title: string;
  need: string;
  detail: string;
  Icon: LucideIcon;
  tone: string;
};

export const HELP_ROLES: HelpRole[] = [
  {
    key: "ranking",
    title: "Ranking and feeds",
    need: "What people see first, and why",
    detail:
      "Explore, the home feed and Wire all answer the same question — out of hundreds of projects, which four go at the top? Right now that's stars divided by age, which rewards whatever was already popular. Wanted: someone who wants to make discovery feel edited rather than sorted.",
    Icon: ListOrdered,
    tone: "text-emerald-300",
  },
  {
    key: "ui",
    title: "Interface and motion",
    need: "Making it feel built, not assembled",
    detail:
      "The bones are here and the polish isn't. Transitions between pages, states that acknowledge you clicked them, a lineage tree that's a pleasure to look at. Wanted: someone with taste who can tell the difference between an animation and a delay.",
    Icon: Sparkles,
    tone: "text-violet-300",
  },
  {
    key: "mod",
    title: "Moderator",
    need: "Reading reports and making calls",
    detail:
      "Every project here links to code strangers will run. Moderators work the report queue, delist what breaks the rules — malware, resold work, anything closed-source — and leave the rest alone. Wanted: patience and good judgement more than technical depth.",
    Icon: ShieldCheck,
    tone: "text-rose-300",
  },
  {
    key: "other",
    title: "Something else",
    need: "The thing nobody's thought of",
    detail:
      "This list is what one person can see from inside the project, which is exactly the wrong vantage point. If you looked at Project OS and immediately knew what was missing, that's the pitch — tell us what you'd work on.",
    Icon: MessageSquarePlus,
    tone: "text-sky-300",
  },
];

export const roleByKey = (k: string) => HELP_ROLES.find((r) => r.key === k);
