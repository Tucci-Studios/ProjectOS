"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Nav has an order. Moving to a page further down slides content up from below;
// moving back up slides it down. Direction carries meaning, so the site feels
// like one surface instead of a stack of unrelated screens.
const ORDER = ["/", "/popular", "/explore", "/news", "/projects", "/s/", "/p/", "/ideas", "/me", "/notifications", "/settings"];

function rank(path: string) {
  const i = ORDER.findIndex((p) => (p === "/" ? path === "/" : path.startsWith(p)));
  return i === -1 ? ORDER.length : i;
}

export function RouteMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prev = useRef(pathname);
  const [dir, setDir] = useState<"up" | "down">("up");

  useEffect(() => {
    setDir(rank(pathname) >= rank(prev.current) ? "up" : "down");
    prev.current = pathname;
  }, [pathname]);

  return (
    <div key={pathname} className={dir === "up" ? "route-in-up" : "route-in-down"}>
      {children}
    </div>
  );
}
