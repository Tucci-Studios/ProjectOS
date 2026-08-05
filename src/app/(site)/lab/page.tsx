import type { Metadata } from "next";
import { getProjectFeed } from "@/lib/queries";
import { LabClient } from "@/components/lab/lab-client";

export const metadata: Metadata = {
  title: "Lab — Project OS",
  description: "Test area: experiments that aren't part of the site yet.",
};

export const dynamic = "force-dynamic";

export default async function LabPage() {
  // Real cards, so the switch is judged on the thing that actually ships.
  const { results } = await getProjectFeed(undefined, "top", { limit: 5 });
  return <LabClient cards={results} />;
}
