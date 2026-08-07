import { TUTORIAL_SPEC } from "@/lib/tutorial-guide";

/** Served as a plain file so it can be downloaded, curl'd, or dropped into a
 *  repo for an agent to pick up without anyone copying and pasting it. */
export function GET() {
  return new Response(TUTORIAL_SPEC, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'inline; filename="tutorial-template.md"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
