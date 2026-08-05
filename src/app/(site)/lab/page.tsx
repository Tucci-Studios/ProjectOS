import type { Metadata } from "next";
import { LabClient } from "@/components/lab/lab-client";

export const metadata: Metadata = {
  title: "Lab — Project OS",
  description: "Test area: experiments that aren't part of the site yet.",
};

export default function LabPage() {
  return <LabClient />;
}
