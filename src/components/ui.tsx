import Link from "next/link";

// Shared button primitives. Every clickable looks clickable: real borders or
// fills, cursor-pointer, 44px min height, visible focus ring, 200ms hover.

const BASE =
  "inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg px-4 font-mono text-sm font-semibold transition duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161d18] disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS = {
  primary: "bg-emerald-400 text-black hover:bg-emerald-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.35)]",
  outline:
    "border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400 hover:shadow-[0_0_16px_rgba(52,211,153,0.2)]",
  ghost: "border border-neutral-600 text-neutral-200 hover:border-neutral-400 hover:bg-neutral-800",
  subtle: "border border-transparent text-neutral-400 hover:bg-neutral-800 hover:text-white",
} as const;

type Variant = keyof typeof VARIANTS;

export function ButtonLink({
  href,
  variant = "outline",
  className = "",
  children,
  external = false,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  if (href.startsWith("/api/")) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "outline",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...props} className={`${BASE} ${VARIANTS[variant]} ${className}`} />;
}
