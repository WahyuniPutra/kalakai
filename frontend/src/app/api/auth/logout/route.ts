import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;

  if (token) {
    try {
      await fetch(`${backendApiUrl}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      });
    } catch {
      // Clear the browser session even if the API is unavailable.
    }
  }

  const response = NextResponse.json({ message: "Anda berhasil keluar." });
  response.cookies.delete(sessionCookie);
  return response;
}
