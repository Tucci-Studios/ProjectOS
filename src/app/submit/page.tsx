import { getSessionUser } from "@/lib/auth";
import { SubmitForm } from "./submit-form";

// L3: unstyled (shapes-first). Styling lands at L7.

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <main style={{ padding: 24, fontFamily: "monospace" }}>
        <p>
          <a href="/api/auth/login">Sign in with GitHub</a> to publish a project.
        </p>
      </main>
    );
  }
  return (
    <main style={{ padding: 24, fontFamily: "monospace", maxWidth: 640 }}>
      <h1>Publish a project</h1>
      <p>
        Your repo needs <code>project.json</code> + <code>AGENTS.md</code> in its root —{" "}
        <a href="/submit/wizard">use the wizard</a> to generate both in ~2 minutes.
      </p>
      <SubmitForm needsTos={!user.tos_accepted_at} />
    </main>
  );
}
