import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";

type RouteContext = { params: Promise<{ eventId: string }> };

async function proxy(eventId: string, method: "GET" | "PATCH", request?: Request) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return NextResponse.json({ message: "Silakan masuk kembali." }, { status: 401 });
  if (!/^\d+$/.test(eventId)) return NextResponse.json({ message: "Acara tidak valid." }, { status: 400 });
  try {
    const response = await fetch(`${backendApiUrl}/api/user/events/${eventId}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", ...(method === "PATCH" ? { "Content-Type": "application/json" } : {}) },
      ...(method === "PATCH" && request ? { body: await request.text() } : {}),
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Belum dapat menghubungi server Kalakai." }, { status: 502 });
  }
}

export async function GET(_request: Request, context: RouteContext) { const { eventId } = await context.params; return proxy(eventId, "GET"); }
export async function PATCH(request: Request, context: RouteContext) { const { eventId } = await context.params; return proxy(eventId, "PATCH", request); }
