import { backendApiUrl } from "@/lib/auth-proxy";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (!path?.length || path[0] !== "undangan-assets" || path.some((segment) => !segment || segment === "." || segment === "..")) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const resource = path.map(encodeURIComponent).join("/");
    const response = await fetch(`${backendApiUrl}/api/public-assets/${resource}`, { cache: "force-cache" });
    if (!response.ok || !response.body) return new Response("Not found", { status: response.status || 404 });
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Asset service unavailable", { status: 502 });
  }
}
