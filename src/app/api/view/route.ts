import { NextResponse } from "next/server";
import { countView } from "@/lib/counts";
import { checkRate, clientKey } from "@/lib/rate-limit";

/**
 * One page view. Records a path and nothing else.
 *
 * Client-side on purpose: it means a crawler that doesn't run JavaScript never
 * lands in the numbers, which is most of them. The IP is used only to keep one
 * person from inflating a count, and is never written next to the count.
 */
export async function POST(request: Request) {
  const rate = await checkRate(clientKey(request), "view");
  if (!rate.ok) return new NextResponse(null, { status: 204 });

  let body: { path?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  if (typeof body.path === "string") await countView(body.path);
  return new NextResponse(null, { status: 204 });
}
