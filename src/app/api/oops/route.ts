import { NextResponse } from "next/server";
import { logError } from "@/lib/errors";
import { checkRate, clientKey } from "@/lib/rate-limit";

/** Where the browser reports an error it just hit. Open, so rate-limited. */
export async function POST(request: Request) {
  const rate = await checkRate(clientKey(request), "oops");
  if (!rate.ok) return new NextResponse(null, { status: 204 });

  try {
    const b = (await request.json()) as { message?: string; path?: string; digest?: string; stack?: string };
    await logError({
      source: "client",
      message: String(b.message ?? "Unknown client error"),
      path: b.path ?? null,
      digest: b.digest ?? null,
      stack: b.stack ?? null,
    });
  } catch {
    /* a malformed report is not worth a response code */
  }
  return new NextResponse(null, { status: 204 });
}
