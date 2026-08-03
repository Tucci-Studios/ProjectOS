import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { snapshotStars, historyDepth } from "@/lib/ranking";

/**
 * Records where every project's stars stand today.
 *
 * Momentum can't be backfilled — GitHub only reports current totals — so this
 * has to run daily for the weekly and monthly charts to ever mean anything.
 * Wire it to a Cloudflare cron trigger before launch; admin can also poke it.
 */
export async function POST() {
  const user = await getSessionUser();
  if (user?.role !== "admin") return NextResponse.json({ error: "Not found." }, { status: 404 });

  const rows = await snapshotStars();
  return NextResponse.json({ ok: true, rows, daysOfHistory: await historyDepth() });
}
