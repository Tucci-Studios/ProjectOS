"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmitForm({ needsTos }: { needsTos: boolean }) {
  const router = useRouter();
  const [repo, setRepo] = useState("");
  const [acceptTos, setAcceptTos] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, acceptTos }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; errors?: string[] };
      if (data.ok && data.id) {
        router.push(`/p/${data.id}`);
        return;
      }
      setErrors(data.errors?.[0] === "TOS_REQUIRED" ? ["Please accept the terms below first."] : (data.errors ?? ["Something went wrong."]));
    } catch {
      setErrors(["Network error — try again."]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <p>
        <label>
          GitHub repo:{" "}
          <input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="owner/repo"
            size={40}
            required
          />
        </label>
      </p>
      {needsTos && (
        <p style={{ border: "1px solid #999", padding: 12 }}>
          <label>
            <input type="checkbox" checked={acceptTos} onChange={(e) => setAcceptTos(e.target.checked)} /> I agree to
            the <a href="/terms" target="_blank">Project OS terms</a>: my project is open source, it will never be
            sold or paywalled, forks stay open, and no malware — ever.
          </label>
        </p>
      )}
      <p>
        <button type="submit" disabled={busy}>
          {busy ? "Checking repo..." : "Publish"}
        </button>
      </p>
      {errors.length > 0 && (
        <ul style={{ color: "red" }}>
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </form>
  );
}
