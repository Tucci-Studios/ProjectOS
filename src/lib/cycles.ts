// Voting runs in fixed cycles. Whatever is top-voted when a cycle closes gets
// reviewed and merged. Cycle 1 starts at the site epoch; each lasts 14 days.

const EPOCH = 1785974400; // 2026-08-02
const CYCLE_DAYS = 14;
const CYCLE_S = CYCLE_DAYS * 86400;

export function currentCycle(now = Math.floor(Date.now() / 1000)) {
  const n = Math.max(1, Math.floor((now - EPOCH) / CYCLE_S) + 1);
  const startsAt = EPOCH + (n - 1) * CYCLE_S;
  const endsAt = startsAt + CYCLE_S;
  const secondsLeft = Math.max(0, endsAt - now);
  const daysLeft = Math.ceil(secondsLeft / 86400);
  return { n, startsAt, endsAt, secondsLeft, daysLeft };
}

export function closesInWords(daysLeft: number) {
  if (daysLeft <= 0) return "closing now";
  if (daysLeft === 1) return "closes tomorrow";
  return `closes in ${daysLeft} days`;
}
