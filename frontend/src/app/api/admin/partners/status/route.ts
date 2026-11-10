import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";

export async function PATCH(request: Request) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return NextResponse.json({ message: "Sesi masuk tidak ditemukan." }, { status: 401 });

  try {
    const { id, status } = await request.json();
    if (!Number.isInteger(id) || id < 1 || !["active", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Permintaan verifikasi tidak valid." }, { status: 422 });
    }

    const response = await fetch(`${backendApiUrl}/api/admin/partners/${id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Belum dapat menghubungi server Kalakai." }, { status: 502 });
  }
}
