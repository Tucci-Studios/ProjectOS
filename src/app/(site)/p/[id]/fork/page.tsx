import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SubmitForm } from "../../../submit/submit-form";

export const dynamic = "force-dynamic";

export default async function ForkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const { env } = getCloudflareContext();
  const p = await env.DB.prepare(
    `SELECT p.id, p.base_name, p.variant_name, p.github_repo FROM projects p WHERE p.id = ?1 AND p.status = 'live'`,
  )
    .bind(id)
    .first<{ id: string; base_name: string; variant_name: string | null; github_repo: string }>();
  if (!p) notFound();

  const display = p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name;

  return (
    <div className="max-w-2xl">
      <p className="mb-3 font-mono text-sm">
        <Link href={`/p/${p.id}`} className="text-neutral-500 transition hover:text-neutral-300">
          &larr; {display}
        </Link>
      </p>
      <h1 className="mb-2 font-mono text-2xl font-bold tracking-tight text-white">
        Fork <span className="text-emerald-400">{display}</span>
      </h1>
      <p className="mb-6 text-[15px] leading-relaxed text-neutral-400">
        Your fork joins the lineage as{" "}
        <span className="font-mono text-neutral-200">
          {p.base_name}
          <span className="text-emerald-400"> // </span>YourVariant
        </span>
        . The base name stays down the whole lineage — the variant name is yours.
      </p>

      <ol className="mb-8 space-y-4 text-sm text-neutral-300">
        <li className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4">
          <span className="font-mono text-xs text-emerald-400">STEP 1</span>
          <p className="mt-1">
            Fork the repo on GitHub:{" "}
            <a
              href={`https://github.com/${p.github_repo}/fork`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline"
            >
              github.com/{p.github_repo}/fork ↗
            </a>
          </p>
        </li>
        <li className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4">
          <span className="font-mono text-xs text-emerald-400">STEP 2</span>
          <p className="mt-1">
            In your fork, edit <code className="text-emerald-400">project.json</code>: add your{" "}
            <code className="text-emerald-400">variant</code> name and a{" "}
            <code className="text-emerald-400">lineage</code> block pointing at{" "}
            <code className="text-neutral-200">{p.github_repo}</code> with a one-line change summary. (The{" "}
            <Link href="/submit/wizard" className="text-emerald-400 hover:underline">
              wizard
            </Link>{" "}
            generates it.) Make your changes.
          </p>
        </li>
        <li className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4">
          <span className="font-mono text-xs text-emerald-400">STEP 3</span>
          <p className="mt-1">Register your fork below — we verify the fork relationship with GitHub and add you to the tree.</p>
        </li>
      </ol>

      {user ? (
        <SubmitForm needsTos={!user.tos_accepted_at} />
      ) : (
        <p className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-6 text-center font-mono text-sm text-neutral-300">
          <a href="/api/auth/login" className="text-emerald-400 hover:underline">
            Sign in with GitHub
          </a>{" "}
          to register your fork.
        </p>
      )}
    </div>
  );
}
