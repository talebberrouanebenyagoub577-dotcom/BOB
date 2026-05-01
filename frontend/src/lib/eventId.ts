/** Generates a unique idempotency/deduplication key for CAPI + web pixel */
export function generateEventId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `ev_${ts}_${rand}`;
}
