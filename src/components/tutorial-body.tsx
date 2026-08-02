import { RichBody, type ProjectRef } from "./rich-body";

// Renders the tutorial template: "## Step — title" sections become numbered
// neon step cards; text before the first "## " (GOAL/PREREQS) renders above.

export function TutorialBody({ text, projects }: { text: string; projects: ProjectRef[] }) {
  const lines = text.split("\n");
  const intro: string[] = [];
  const steps: { title: string; body: string[] }[] = [];
  let current: { title: string; body: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      current = { title: line.slice(3).trim(), body: [] };
      steps.push(current);
    } else if (current) {
      current.body.push(line);
    } else {
      intro.push(line);
    }
  }

  if (steps.length === 0) return <RichBody text={text} projects={projects} />;

  return (
    <div>
      {intro.join("\n").trim() && (
        <div className="mb-4">
          <RichBody text={intro.join("\n").trim()} projects={projects} />
        </div>
      )}
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="rounded-xl border border-neutral-700 bg-neutral-900/80 p-4">
            <p className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
              step {String(i + 1).padStart(2, "0")}
              <span className="ml-2 normal-case tracking-normal text-white">{step.title.replace(/^step\s*\d+\s*[—–-]\s*/i, "")}</span>
            </p>
            <div className="text-[15px] leading-relaxed text-neutral-300">
              <RichBody text={step.body.join("\n").trim()} projects={projects} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
