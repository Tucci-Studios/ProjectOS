import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

// Front page gets the full width — no sections sidebar (newspaper layout).
export default function FrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0f0b] text-neutral-200">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-8">{children}</div>
    </div>
  );
}
