import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return NextResponse.json({ message: "Silakan masuk kembali." }, { status: 401 });

  try {
    const { eventId } = await params;
    const response = await fetch(`${backendApiUrl}/api/user/events/${eventId}/assets`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: await request.formData(),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json(data, { status: response.status });
    return NextResponse.json({ url: `/api/assets/${data.path}` }, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Foto belum dapat diunggah. Coba lagi." }, { status: 502 });
  }
}
