import { getSessionUser } from "@/lib/auth";
import { Upload } from "lucide-react";
import { SubmitForm } from "./submit-form";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="max-w-xl rounded-lg border border-neutral-700 bg-neutral-900/60 p-8 text-center">
        <p className="font-mono text-sm text-neutral-300">
          <a href="/login" className="text-emerald-400 hover:underline">
            Sign in with GitHub
          </a>{" "}
          to publish a project.
        </p>
      </div>
    );
  }
  return (
    <div className="max-w-xl">
      <h1 className="mb-2 font-mono text-lg font-bold text-white">Publish a project</h1>
      <p className="mb-6 text-sm leading-relaxed text-neutral-400">
        Paste a repo you own and pick a section. Everything else — description, licence, language — comes off GitHub.
        If you want it to carry AI continuation instructions too, the{" "}
        <a href="/submit/wizard" className="text-emerald-400 hover:underline">
          manifest wizard
        </a>{" "}
        writes those, but it&apos;s optional and you can add it any time.
      </p>
      <SubmitForm needsTos={!user.tos_accepted_at} />
    </div>
  );
}
