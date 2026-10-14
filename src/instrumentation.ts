import type { Instrumentation } from "next";
import { logError } from "@/lib/errors";

/**
 * Server-side errors, caught where they happen.
 *
 * The error boundaries only see what reaches the browser; this catches the
 * ones that never render, including failures inside route handlers.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request) => {
  const e = err as { message?: string; stack?: string; digest?: string };
  await logError({
    source: "server",
    message: e?.message ?? String(err),
    stack: e?.stack ?? null,
    digest: e?.digest ?? null,
    path: request?.path ?? null,
  });
};
