import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { JOBS } from "@/lib/jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Runs a scheduled job.
 *
 * Two ways in: an admin session, for pressing it by hand, or a CRON_SECRET
 * bearer token, which is how Cloudflare's scheduled worker calls it. Without
 * the secret set, only an admin can trigger anything.
 */
export async function POST(request: Request, { params }: { params: Promise<{ job: string }> }) {
  const { job } = await params;
  const run = JOBS[job];
  if (!run) return NextResponse.json({ error: `No job called ${job}.` }, { status: 404 });

  const { env } = getCloudflareContext();
  const secret = (env as { CRON_SECRET?: string }).CRON_SECRET;
  const auth = request.headers.get("authorization");
  const viaSecret = !!secret && auth === `Bearer ${secret}`;

  if (!viaSecret) {
    const user = await getSessionUser();
    if (user?.role !== "admin") return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const started = Date.now();
  try {
    const result = await run();
    return NextResponse.json({ ...result, ms: Date.now() - started });
  } catch (e) {
    return NextResponse.json(
      { job, ok: false, detail: e instanceof Error ? e.message : "failed", ms: Date.now() - started },
      { status: 500 },
    );
  }
}
