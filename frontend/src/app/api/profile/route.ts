import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";

async function profile(request: Request) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return NextResponse.json({ message: "Silakan masuk kembali." }, { status: 401 });
  try {
    const response = await fetch(`${backendApiUrl}/api/profile`, {
      method: request.method,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
      ...(request.method === "PATCH" ? { body: await request.text() } : {}),
      cache: "no-store",
    });
    const data = await response.json();
    if (response.ok && request.method === "PATCH" && data.partner_profile?.id) {
      revalidatePath("/");
      revalidatePath("/mitra");
      revalidatePath(`/mitra/${data.partner_profile.id}`);
    }
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Profil belum dapat diakses. Coba lagi." }, { status: 502 });
  }
}

export const GET = profile;
export const PATCH = profile;
