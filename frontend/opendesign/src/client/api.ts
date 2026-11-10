export function apiUrl(path: string): string {
  const url = new URL(path, window.location.origin);
  url.pathname = url.pathname.replace(/^\/api\//, "/api/opendesign/");
  const eventId = new URLSearchParams(window.location.search).get("eventId");
  if (eventId) url.searchParams.set("eventId", eventId);
  return `${url.pathname}${url.search}`;
}

export async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = { method, headers: {} };
  if (body) {
    (opts.headers as Record<string, string>)["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const eventId = new URLSearchParams(window.location.search).get("eventId");
  const r = await fetch(apiUrl(path), opts);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed");
  if (eventId && method !== "GET" && /\/api\/(designs|pages|brand-kits|fonts)/.test(path)) {
    const designId = `event-${eventId}`;
    window.clearTimeout((window as Window & { __kalakaiDesignSync?: number }).__kalakaiDesignSync);
    (window as Window & { __kalakaiDesignSync?: number }).__kalakaiDesignSync = window.setTimeout(async () => {
      try {
        const snapshot = await fetch(apiUrl(`/api/designs/${encodeURIComponent(designId)}`), { cache: "no-store" });
        if (snapshot.ok && window.parent !== window) window.parent.postMessage({ type: "kalakai:opendesign:update", eventId, design: await snapshot.json() }, window.location.origin);
      } catch { /* Kalakai's save button remains available if live sync is unavailable. */ }
    }, 350);
  }
  return data as T;
}
