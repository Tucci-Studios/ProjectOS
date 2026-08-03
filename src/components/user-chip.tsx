import { VerifiedMark } from "./verified-mark";
import Link from "next/link";
import { UserBadges, type Badges } from "./user-badges";

/** One way a person appears anywhere on the site: picture, name, badges. */
export function UserChip({
  login,
  avatarUrl,
  badges,
  verified,
  size = "sm",
  className = "",
}: {
  login: string;
  avatarUrl?: string | null;
  badges?: Badges;
  verified?: boolean;
  size?: "xs" | "sm";
  className?: string;
}) {
  const px = size === "xs" ? "h-4 w-4 text-[7px]" : "h-5 w-5 text-[8px]";

  return (
    <Link
      href={`/u/${login}`}
      className={`relative z-[2] inline-flex items-center gap-1.5 text-neutral-400 transition hover:text-white ${className}`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className={`${px} rounded-full border border-neutral-700 object-cover`} />
      ) : (
        <span
          className={`${px} flex items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 font-mono uppercase text-neutral-400`}
        >
          {login.slice(0, 2)}
        </span>
      )}
      <span className="font-mono">@{login}</span>
      {verified && <VerifiedMark size={size === "xs" ? 10 : 11} />}
      {badges && <UserBadges badges={badges} />}
    </Link>
  );
}
