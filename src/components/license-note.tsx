import { Scale, AlertTriangle, Archive } from "lucide-react";

/**
 * What you're actually allowed to do with this, and whether anyone still works on it.
 *
 * The site invites people to take anything, and 129 of the projects listed here
 * carry no licence at all — which in copyright terms means nobody may reuse
 * them. That gap is the reason this component exists. A licence line at the
 * bottom of the page in grey wasn't enough; if a project can't legally be used,
 * that belongs where somebody will read it.
 *
 * Deliberately factual rather than advisory. It says what the licence is and
 * what it commonly permits; it isn't legal advice and doesn't pretend to be.
 */

const KNOWN: Record<string, { label: string; note: string }> = {
  MIT: { label: "MIT", note: "Use it for anything, including commercially. Keep the copyright notice." },
  "Apache-2.0": { label: "Apache 2.0", note: "Like MIT, with an explicit patent grant. Note your changes." },
  "BSD-3-Clause": { label: "BSD 3-Clause", note: "Use it for anything. Don't use the author's name to endorse yours." },
  "BSD-2-Clause": { label: "BSD 2-Clause", note: "Use it for anything. Keep the copyright notice." },
  "GPL-3.0": { label: "GPL 3.0", note: "Anything you build on it has to be open source too." },
  "AGPL-3.0": { label: "AGPL 3.0", note: "Open source too — and that applies even if you only run it as a service." },
  "LGPL-3.0": { label: "LGPL 3.0", note: "Link to it freely; changes to the library itself stay open." },
  "MPL-2.0": { label: "Mozilla 2.0", note: "Changed files stay open. The rest of your project doesn't have to." },
  "CC0-1.0": { label: "CC0", note: "Public domain. No conditions at all." },
  Unlicense: { label: "Unlicense", note: "Public domain. No conditions at all." },
  "ISC": { label: "ISC", note: "Use it for anything. Keep the copyright notice." },
};

export function LicenseNote({ license, archived }: { license: string | null; archived?: boolean }) {
  const spdx = (license ?? "").trim();
  const known = KNOWN[spdx];
  const none = !spdx || spdx === "NOASSERTION";

  return (
    <div className="mt-8 space-y-2">
      {none ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-400/30 bg-amber-400/[0.05] px-3.5 py-2.5">
          <AlertTriangle size={14} className="mt-[2px] shrink-0 text-amber-400" aria-hidden />
          <p className="text-[12.5px] leading-relaxed text-amber-100/85">
            <span className="font-bold">No licence.</span> The author hasn&apos;t said what anyone may do with this,
            and without a licence the default is that nobody may copy, change or redistribute it. Read it, learn from
            it — but ask before you build on it.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 px-1">
          <Scale size={13} className="mt-[3px] shrink-0 text-neutral-400" aria-hidden />
          <p className="text-[12.5px] leading-relaxed text-neutral-400">
            <span className="font-mono font-bold text-neutral-200">{known?.label ?? spdx}</span>
            {known && <> — {known.note}</>}
          </p>
        </div>
      )}

      {archived && (
        <div className="flex items-start gap-2.5 px-1">
          <Archive size={13} className="mt-[3px] shrink-0 text-neutral-400" aria-hidden />
          <p className="text-[12.5px] leading-relaxed text-neutral-400">
            <span className="font-bold text-neutral-200">Archived on GitHub.</span> The author has marked it
            read-only — no more commits or issues. It may still work perfectly; nobody is maintaining it.
          </p>
        </div>
      )}
    </div>
  );
}
