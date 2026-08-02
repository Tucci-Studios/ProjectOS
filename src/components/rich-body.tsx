import Link from "next/link";

// Safe-by-construction body renderer: NO raw HTML ever — React escapes all text.
// Supports: auto-linked URLs, inline images (image URLs on their own), and
// Reddit-style refs: @ProjectName, @[Name With Spaces], #post_id.

export type ProjectRef = { id: string; display: string; base_name: string };

const TOKEN_RE = /(https?:\/\/[^\s<>"')\]]+|@\[[^\]]+\]|@[A-Za-z0-9_.-]{2,}|#[A-Za-z0-9_-]{2,})/g;
const IMG_RE = /\.(png|jpe?g|gif|webp)(\?\S*)?$/i;

function findProject(name: string, projects: ProjectRef[]): ProjectRef | undefined {
  const q = name.toLowerCase();
  return (
    projects.find((p) => p.display.toLowerCase() === q) ??
    projects.find((p) => p.base_name.toLowerCase() === q)
  );
}

export function RichBody({ text, projects }: { text: string; projects: ProjectRef[] }) {
  const parts = text.split(TOKEN_RE);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^https?:\/\//.test(part)) {
          if (IMG_RE.test(part)) {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={part}
                alt=""
                loading="lazy"
                className="my-2 block max-h-96 max-w-full rounded-lg border border-neutral-700"
              />
            );
          }
          return (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className="text-emerald-400 hover:underline">
              {part}
            </a>
          );
        }
        if (part.startsWith("@")) {
          const name = part.startsWith("@[") ? part.slice(2, -1) : part.slice(1);
          const project = findProject(name, projects);
          if (project) {
            return (
              <Link key={i} href={`/p/${project.id}`} className="text-emerald-400 hover:underline">
                @{project.display}
              </Link>
            );
          }
          return part;
        }
        if (part.startsWith("#")) {
          const id = part.slice(1);
          if (id.startsWith("post_")) {
            return (
              <Link key={i} href={`/wire/${id}`} className="text-emerald-400 hover:underline">
                {part}
              </Link>
            );
          }
          return part;
        }
        return part;
      })}
    </span>
  );
}
