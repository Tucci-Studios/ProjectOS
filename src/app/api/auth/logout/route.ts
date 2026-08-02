import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const res = NextResponse.redirect(`${new URL(request.url).origin}/projects`, 303);
  res.cookies.delete(sessionCookieName);
  return res;
}
