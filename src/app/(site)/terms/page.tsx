// ToS page (v0 draft — see docs/legal/TERMS.md for the full annotated version).

export default function TermsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 font-mono text-lg font-bold text-white">
        Project OS — Terms <span className="text-neutral-600">(v0 draft)</span>
      </h1>
      <p className="mb-3 text-sm text-neutral-400">By publishing a project on Project OS you agree:</p>
      <ol className="list-decimal space-y-3 pl-5 text-sm text-neutral-300">
        <li>
          <strong className="text-white">It&apos;s open source.</strong> Your repo carries a valid open-source license
          and your project.json matches it.
        </li>
        <li>
          <strong className="text-white">The no-sell rule.</strong> Projects published here may not be sold,
          paywalled, or gated behind payment. Forks in a lineage stay free and open. Donations and sponsor links are
          allowed; mandatory payment is not.
        </li>
        <li>
          <strong className="text-white">No malware, ever.</strong> Malicious, deceptive, or privacy-violating code
          means instant delisting and a ban.
        </li>
        <li>
          <strong className="text-white">You have the rights.</strong> You own or are licensed to publish everything
          in the repo; forks respect the parent&apos;s license.
        </li>
        <li>
          <strong className="text-white">Lineage is public and permanent.</strong> Fork relationships and attribution
          stay visible even if you delist.
        </li>
      </ol>
      <p className="mt-4 text-sm text-neutral-500">
        We can delist projects and remove content at any time (including on valid DMCA complaints). Code lives on
        GitHub under GitHub&apos;s own terms — delisting here never touches your repo. Read before you run: projects
        are community-submitted code; scan badges are signals, not guarantees.
      </p>
    </div>
  );
}
