import { redirect } from "next/navigation";

/** News is Updates now. Kept because the link is out in the world already. */
export default function NewsPage() {
  redirect("/updates");
}
