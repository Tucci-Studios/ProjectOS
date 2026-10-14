import { Mail } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "./form";

export const metadata = { title: "Contact — Project OS" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader crumbs={[{ label: "Contact" }]} title="Contact" Icon={Mail} />
      <ContactForm />
    </div>
  );
}
