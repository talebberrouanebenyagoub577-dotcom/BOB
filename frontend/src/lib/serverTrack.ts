const SESSION_KEY = "nidha_trk_sid";

export type ServerTrackEvent =
  | "page_view"
  | "view_content"
  | "add_to_cart"
  | "initiate_checkout"
  | "cta_click";

export function getTrackingSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return `anon-${Date.now().toString(36)}`;
  }
}

export function trackServerEvent(
  event_type: ServerTrackEvent,
  meta?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  const session_id = getTrackingSessionId();
  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type,
      session_id,
      path: window.location.pathname,
      meta: meta ?? {},
    }),
  }).catch(() => {});
}
