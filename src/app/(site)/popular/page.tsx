import { redirect } from "next/navigation";

/**
 * Popular was Explore sorted differently, so it's a sort option there now.
 * Kept as a redirect because the link is out in the world already.
 */
export default function PopularPage() {
  redirect("/explore");
}
