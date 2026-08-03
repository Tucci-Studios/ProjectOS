import { Lightbulb } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";
import { NewIdeaForm } from "./new-idea-form";

export const dynamic = "force-dynamic";

export default async function NewIdeaPage() {
  const user = await getSessionUser();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        crumbs={[{ label: "Ideas", href: "/ideas" }, { label: "New idea" }]}
        title="Suggest a change"
        purpose="What should Project OS do differently? Be specific about the problem — the best ideas describe the pain, not just the fix."
        Icon={Lightbulb}
      />
      {user ? (
        <NewIdeaForm />
      ) : (
        <div className="rounded-xl border border-neutral-700 bg-neutral-900/50 p-8 text-center">
          <p className="text-sm text-neutral-400">Sign in to post an idea.</p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href="/api/auth/login" variant="primary">
              Sign in with GitHub
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
