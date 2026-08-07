import type { Metadata } from "next";
import { LabClient } from "@/components/lab/lab-client";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Lab — Project Open Source" };

export default function LabPage() {
  // Absolute, because the whole point is pasting it somewhere else.
  return <LabClient specUrl={`${siteUrl()}/tutorial-template.md`} />;
}
