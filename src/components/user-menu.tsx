"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, Settings, LogOut, Lightbulb, ChevronDown } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

// Sign-out lives behind a deliberate open-then-click, so it can't be hit by
// accident from the corner of the screen.
export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "flex min-h-[40px] w-full items-center gap-2.5 rounded-lg px-3 font-mono text-[13px] text-neutral-300 outline-none transition-colors duration-150 hover:bg-neutral-800 hover:text-white focus-visible:bg-neutral-800";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex cursor-pointer items-center gap-1 rounded-full border border-transparent p-0.5 pr-1.5 outline-none transition hover:border-neutral-600 hover:bg-neutral-800/60 focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full border border-neutral-600" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-600 font-mono text-xs text-neutral-300">
            {user.github_login.slice(0, 2)}
          </span>
        )}
        <ChevronDown
          size={13}
          aria-hidden
          className={`text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          style={{ transformOrigin: "top right" }}
          className="animate-rise absolute right-0 top-[46px] z-30 w-56 overflow-hidden rounded-xl border border-neutral-700 bg-[#1a221d] p-1.5 shadow-2xl shadow-black/60"
        >
          <div className="border-b border-neutral-800 px-3 pb-2.5 pt-1.5">
            <p className="font-mono text-sm font-bold text-white">@{user.github_login}</p>
            <p className="font-mono text-[11px] text-neutral-500">{user.role === "admin" ? "admin" : "member"}</p>
          </div>

          <div className="mt-1.5 space-y-0.5">
            <Link href="/me" role="menuitem" onClick={() => setOpen(false)} className={item}>
              <User size={15} aria-hidden /> Your page
            </Link>
            <Link href="/ideas" role="menuitem" onClick={() => setOpen(false)} className={item}>
              <Lightbulb size={15} aria-hidden /> Ideas &amp; voting
            </Link>
            <Link href="/settings" role="menuitem" onClick={() => setOpen(false)} className={item}>
              <Settings size={15} aria-hidden /> Settings
            </Link>
          </div>

          <div className="mt-1.5 border-t border-neutral-800 pt-1.5">
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                role="menuitem"
                className={`${item} cursor-pointer text-rose-300 hover:bg-rose-500/10 hover:text-rose-200`}
              >
                <LogOut size={15} aria-hidden /> Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
