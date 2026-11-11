import { NextResponse, type NextRequest } from "next/server";

// Demo subdomains and the live site share a registrable domain. SameSite
// alone doesn't prevent a browser on a demo from posting to the live API.
export function proxy(request: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return NextResponse.next();

  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  const host = request.headers.get("host");
  const scheme = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.slice(0, -1);
  if ((origin && origin !== `${scheme}://${host}`) || site === "cross-site" || site === "same-site") {
    return NextResponse.json({ message: "Asal permintaan tidak diizinkan." }, { status: 403 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
