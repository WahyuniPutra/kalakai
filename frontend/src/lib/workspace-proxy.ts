import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendApiUrl, sessionCookie } from "./auth-proxy";

export async function workspaceMutation(request: Request, path: string) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return NextResponse.json({ message: "Silakan masuk kembali." }, { status: 401 });
  try {
    const response = await fetch(backendApiUrl + path, {
      method: request.method,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Perubahan belum dapat disimpan. Coba lagi." }, { status: 502 });
  }
}
