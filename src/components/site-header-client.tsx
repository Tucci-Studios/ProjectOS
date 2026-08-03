"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, Bell } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { ButtonLink } from "./ui";
import { BrandMark } from "./brand";
import { UpdateSplash, type SplashUpdate } from "./update-splash";
import { UserMenu } from "./user-menu";

export function SiteHeaderClient({
  user,
  latestUpdate,
  unseenUpdate,
  firstTime,
  unreadCount = 0,
}: {
  user: SessionUser | null;
  latestUpdate?: SplashUpdate | null;
  unseenUpdate?: boolean;
  firstTime?: boolean;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const [splashTrigger, setSplashTrigger] = useState(0);

  return (
    <>
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-[#141a16]/95 backdrop-blur">
      <div className="flex h-[60px] w-full items-center pl-4 pr-4">
        {/* Left: brand */}
        <span className="flex select-none items-center gap-2.5">
          <BrandMark size={34} />
          <span className="flex flex-col leading-none">
            <span className="font-mono text-[17px] font-bold tracking-[0.16em] text-white">
              PROJECT<span className="text-emerald-400">_</span>OS
            </span>
            <button
              onClick={() => setSplashTrigger((t) => t + 1)}
              title="What's new"
              className="mt-[3px] w-fit cursor-pointer rounded font-mono text-[8.5px] font-medium uppercase tracking-[0.42em] text-neutral-500 outline-none transition-colors duration-200 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              open source
            </button>
          </span>
        </span>

        {/* Center: the two places you go */}
        <form action="/search" method="get" className="relative ml-8 hidden w-full max-w-[560px] md:block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden />
          <input
            name="q"
            placeholder="Search projects, posts, people"
            aria-label="Search"
            className="h-10 w-full rounded-full border border-neutral-700 bg-neutral-800/60 pl-10 pr-4 font-mono text-[13px] text-white placeholder-neutral-500 outline-none transition-colors duration-200 focus:border-emerald-400/60 focus:bg-neutral-800"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 border-l border-neutral-800 pl-4">
          <ButtonLink href="/submit" variant="primary" className="!min-h-[34px] !rounded-full !px-3 !text-[13px]">
            <Plus size={14} aria-hidden /> <span className="hidden sm:inline">Publish</span>
          </ButtonLink>

          {user && (
            <Link
              href="/notifications"
              aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
              title="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 outline-none transition hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Bell size={17} aria-hidden />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-400 px-1 font-mono text-[9px] font-bold text-black">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="border-l border-neutral-800 pl-3">
              <UserMenu user={user} />
            </div>
          ) : (
            <ButtonLink href="/api/auth/login" variant="ghost" className="!min-h-[38px] !rounded-full !px-4">
              Sign in
            </ButtonLink>
          )}
        </div>
      </div>
    </header>
    {latestUpdate && <UpdateSplash update={latestUpdate} unseen={!!unseenUpdate} firstTime={!!firstTime} trigger={splashTrigger} />}
    </>
  );
}
