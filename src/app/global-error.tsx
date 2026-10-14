"use client";

import { useEffect } from "react";

/**
 * The last resort — the root layout itself failed.
 *
 * Reports what happened before offering the reload, because the whole reason
 * this page exists is that we'd otherwise never find out it appeared.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    fetch("/api/oops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        path: typeof window !== "undefined" ? window.location.pathname : null,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#161d18", color: "#e5e5e5", fontFamily: "ui-monospace, monospace", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>That page broke.</h1>
          <p style={{ marginTop: 12, lineHeight: 1.6, color: "#a3a3a3", fontSize: 14 }}>
            Not your fault — something on our end fell over, and we&apos;ve been told about it automatically.
          </p>
          {error.digest && (
            <p style={{ marginTop: 12, fontSize: 12, color: "#737373" }}>Reference: {error.digest}</p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: 20, padding: "10px 18px", borderRadius: 8, cursor: "pointer",
              background: "#34d399", color: "#000", border: "none", fontWeight: 700, fontSize: 13,
              fontFamily: "inherit",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
