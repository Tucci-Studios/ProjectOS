import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { NewPostForm } from "./new-post-form";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="max-w-xl rounded-lg border border-neutral-800 bg-neutral-950/60 p-8 text-center">
        <p className="font-mono text-sm text-neutral-300">
          <a href="/api/auth/login" className="text-cyan-400 hover:underline">
            Sign in with GitHub
          </a>{" "}
          to post on Uplink.
        </p>
      </div>
    );
  }

  const { env } = getCloudflareContext();
  const { results: projects } = await env.DB.prepare(
    `SELECT id, CASE WHEN variant_name IS NULL THEN base_name
                     ELSE base_name || ' // ' || variant_name END AS display
     FROM projects WHERE status = 'live' ORDER BY base_name`,
  ).all<{ id: string; display: string }>();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-mono text-2xl font-bold tracking-tight text-white">New post</h1>
      <p className="mb-6 font-mono text-xs text-neutral-500">
        Tip: reference projects with @Subwolf or @[Fridge MCP], posts with #post_id. Image URLs render inline.
      </p>
      <NewPostForm projects={projects} />
    </div>
  );
}
