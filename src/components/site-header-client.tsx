"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, Bell, Bookmark } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { ButtonLink } from "./ui";
import { BrandMark } from "./brand";
import { UpdateSplash, type SplashUpdate } from "./update-splash";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

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
      <div className="flex h-[60px] w-full items-center gap-2 px-4 md:grid md:grid-cols-[1fr_minmax(0,520px)_1fr] md:gap-6">
        {/* Left: brand */}
        <span className="flex min-w-0 shrink select-none items-center gap-2 justify-self-start md:gap-2.5">
          <MobileNav />
          <BrandMark size={34} />
          <span className="hidden min-w-0 flex-col leading-none sm:flex">
            <span className="truncate font-mono text-[17px] font-bold tracking-[0.16em] text-white">
              PROJECT<span className="text-emerald-400">_</span>OS
            </span>
            <button
              onClick={() => setSplashTrigger((t) => t + 1)}
              title="What is Project OS?"
              className="mt-[3px] hidden w-fit cursor-pointer rounded py-1.5 font-mono text-[8.5px] font-medium uppercase tracking-[0.42em] text-neutral-400 outline-none transition-colors duration-200 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 sm:block"
            >
              open source
            </button>
          </span>
        </span>

        {/* Center: the two places you go */}
        <form action="/search" method="get" className="relative hidden w-full md:block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden />
          <input
            name="q"
            placeholder="Search projects, posts, people"
            aria-label="Search"
            className="h-10 w-full rounded-full border border-neutral-700 bg-neutral-800/60 pl-10 pr-4 font-mono text-[13px] text-white placeholder-neutral-500 outline-none transition-colors duration-200 focus:border-emerald-400/60 focus:bg-neutral-800"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-0.5 md:ml-0 md:gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 outline-none transition hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 md:hidden"
          >
            <Search size={18} aria-hidden />
          </Link>
          <ButtonLink href="/submit" variant="primary" aria-label="Publish a project" className="!min-h-[40px] !rounded-full !px-3.5 !text-[13px]">
            <Plus size={15} aria-hidden /> <span className="hidden sm:inline">Publish</span>
          </ButtonLink>

          {user && (
            <Link
              href="/saves"
              aria-label="My saves"
              title="My saves"
              className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 outline-none transition hover:bg-neutral-800 hover:text-sky-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Bookmark size={17} aria-hidden />
            </Link>
          )}

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
            <div className="border-l border-neutral-800 pl-1.5 md:pl-3">
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
