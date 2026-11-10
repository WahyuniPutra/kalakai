import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";

async function proxy(request: Request, method: "GET" | "POST") {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return NextResponse.json({ message: "Silakan masuk kembali." }, { status: 401 });
  try {
    const response = await fetch(`${backendApiUrl}/api/user/events`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", ...(method === "POST" ? { "Content-Type": "application/json" } : {}) },
      ...(method === "POST" ? { body: await request.text() } : {}),
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Belum dapat menghubungi server Kalakai." }, { status: 502 });
  }
}

export async function GET(request: Request) { return proxy(request, "GET"); }
export async function POST(request: Request) { return proxy(request, "POST"); }
