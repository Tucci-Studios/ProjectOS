"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Tells the server which page was opened, and nothing else.
 *
 * No cookie, no id, no fingerprint — the request carries a path and that's the
 * entire payload. Failures are swallowed: a missed count is not worth a console
 * error, let alone a broken page.
 */
export function ViewCounter() {
  const path = usePathname();

  useEffect(() => {
    if (!path) return;
    const body = JSON.stringify({ path });
    // keepalive so it still lands if the page is being navigated away from.
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [path]);

  return null;
}
