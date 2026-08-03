import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getStream } from "@/lib/stream";
import { getUserVotes } from "@/lib/queries";

export async function GET(request: Request) {
  const before = Number(new URL(request.url).searchParams.get("before")) || undefined;
  const user = await getSessionUser();
  const [{ items, nextCursor }, votes] = await Promise.all([getStream(before), getUserVotes(user?.id)]);
  return NextResponse.json({
    items,
    nextCursor,
    votes: Object.fromEntries(votes),
  });
}
