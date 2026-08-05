import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { NewPostForm } from "./new-post-form";

export const dynamic = "force-dynamic";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; category?: string }>;
}) {
  const { kind, category } = await searchParams;
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="max-w-xl rounded-lg border border-neutral-700 bg-neutral-900/60 p-8 text-center">
        <p className="font-mono text-sm text-neutral-300">
          <a href="/login" className="text-emerald-400 hover:underline">
            Sign in with GitHub
          </a>{" "}
          to post on The Wire.
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

  const initialKind = kind === "tutorial" ? "tutorial" : kind === "request" ? "request" : "post";

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-mono text-2xl font-bold tracking-tight text-white">
        {initialKind === "tutorial" ? "New tutorial" : initialKind === "request" ? "Request a tutorial" : "New post"}
      </h1>
      <p className="mb-6 font-mono text-xs text-neutral-400">
        Reference projects with @Subwolf or @[Fridge MCP], posts with #post_id. Image URLs render inline.
      </p>
      <NewPostForm projects={projects} initialKind={initialKind} initialCategory={category ?? ""} />
    </div>
  );
}
