import { Pencil } from "lucide-react";
import { REPO_IS_PUBLIC, SOURCE_REPO } from "@/lib/site";

/**
 * The "fix this" link.
 *
 * Points at GitHub's web editor for the exact file behind the page, so a reader
 * who spots something wrong can propose the fix without cloning anything.
 */
export function EditOnGitHub({ file, verified }: { file: string; verified?: string }) {
  if (!REPO_IS_PUBLIC) return null;
  return (
    <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-neutral-800 pt-4 font-mono text-[11.5px] text-neutral-400">
      {verified && <span>Checked {verified}.</span>}
      <a
        href={`https://github.com/${SOURCE_REPO}/edit/main/${file}`}
        className="inline-flex min-h-[32px] items-center gap-1.5 text-emerald-300 underline-offset-4 hover:underline"
      >
        <Pencil size={11} aria-hidden /> Something wrong? Fix this page
      </a>
      <span className="text-neutral-600">It opens as a pull request. No account here needed.</span>
    </p>
  );
}
