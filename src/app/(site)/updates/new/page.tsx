import { notFound } from "next/navigation";
import { Megaphone } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { UpdateComposer } from "./composer";

export const dynamic = "force-dynamic";

export default async function NewUpdatePage() {
  const user = await getSessionUser();
  if (user?.role !== "admin") notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        crumbs={[{ label: "Updates", href: "/updates" }, { label: "Post" }]}
        title="Post an update"
        purpose="This is the site talking. It shows on the Updates page and, if it's the newest, in the banner everyone sees once."
        Icon={Megaphone}
      />
      <UpdateComposer />
    </div>
  );
}
