import { getSessionUser } from "@/lib/auth";
import { SubmitForm } from "./submit-form";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="max-w-xl rounded-lg border border-neutral-800 bg-neutral-950/60 p-8 text-center">
        <p className="font-mono text-sm text-neutral-300">
          <a href="/api/auth/login" className="text-cyan-400 hover:underline">
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
      <p className="mb-6 text-sm text-neutral-400">
        Your repo needs <code className="text-cyan-400">project.json</code> +{" "}
        <code className="text-cyan-400">AGENTS.md</code> in its root —{" "}
        <a href="/submit/wizard" className="text-cyan-400 hover:underline">
          use the wizard
        </a>{" "}
        to generate both in ~2 minutes.
      </p>
      <SubmitForm needsTos={!user.tos_accepted_at} />
    </div>
  );
}
