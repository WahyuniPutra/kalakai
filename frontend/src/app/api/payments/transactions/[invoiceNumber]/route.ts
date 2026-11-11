import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";

type RouteContext = { params: Promise<{ invoiceNumber: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { invoiceNumber } = await context.params;
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });

  try {
    const res = await fetch(`${backendApiUrl}/api/payments/transactions/${invoiceNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ message: "Gagal terhubung ke layanan pembayaran Kalakai." }, { status: 502 });
  }
}
