import { NextResponse } from "next/server";

const secureSession = process.env.NODE_ENV === "production";
export const sessionCookie = secureSession ? "__Host-kalakai_session" : "kalakai_session";
export const sessionCookieOptions = {
  httpOnly: true,
  secure: secureSession,
  sameSite: "lax",
  path: "/",
} as const;
export const backendApiUrl = (process.env.KALAKAI_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export async function authenticate(request: Request, endpoint: "login" | "register") {
  try {
    const upstream = await fetch(`${backendApiUrl}/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });
    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    if (data.pending_review) {
      return NextResponse.json(data, { status: upstream.status });
    }

    const response = NextResponse.json({ user: data.user }, { status: upstream.status });
    response.cookies.set(sessionCookie, data.token, {
      ...sessionCookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return NextResponse.json(
      { message: "Tidak dapat terhubung ke server Kalakai. Coba lagi sebentar." },
      { status: 502 },
    );
  }
}
