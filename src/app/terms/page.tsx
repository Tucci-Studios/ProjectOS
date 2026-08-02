// Bare ToS page (v0 draft — see docs/legal/TERMS.md for the full annotated version).

export default function TermsPage() {
  return (
    <main style={{ padding: 24, fontFamily: "monospace", maxWidth: 720 }}>
      <h1>Project OS — Terms (v0 draft)</h1>
      <p>By publishing a project on Project OS you agree:</p>
      <ol>
        <li><strong>It&apos;s open source.</strong> Your repo carries a valid open-source license and your project.json matches it.</li>
        <li><strong>The no-sell rule.</strong> Projects published here may not be sold, paywalled, or gated behind payment. Forks in a lineage stay free and open. Donations and sponsor links are allowed; mandatory payment is not.</li>
        <li><strong>No malware, ever.</strong> Malicious, deceptive, or privacy-violating code means instant delisting and a ban.</li>
        <li><strong>You have the rights.</strong> You own or are licensed to publish everything in the repo; forks respect the parent&apos;s license.</li>
        <li><strong>Lineage is public and permanent.</strong> Fork relationships and attribution stay visible even if you delist.</li>
      </ol>
      <p>
        We can delist projects and remove content at any time (including on valid DMCA complaints). Code lives on
        GitHub under GitHub&apos;s own terms — delisting here never touches your repo. Read before you run: projects
        are community-submitted code; scan badges are signals, not guarantees.
      </p>
    </main>
  );
}
