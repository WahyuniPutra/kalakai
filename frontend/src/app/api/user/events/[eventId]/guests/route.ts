import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { eventId } = await context.params;
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return NextResponse.json({ message: "Silakan masuk kembali." }, { status: 401 });

  try {
    const res = await fetch(`${backendApiUrl}/api/user/events/${eventId}/guests`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ message: "Gagal terhubung ke backend Kalakai." }, { status: 502 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { eventId } = await context.params;
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return NextResponse.json({ message: "Silakan masuk kembali." }, { status: 401 });

  try {
    const body = await request.text();
    const res = await fetch(`${backendApiUrl}/api/user/events/${eventId}/guests`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ message: "Gagal terhubung ke backend Kalakai." }, { status: 502 });
  }
}
