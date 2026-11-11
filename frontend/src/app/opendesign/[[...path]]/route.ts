import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const html = await readFile(path.join(process.cwd(), "public", "opendesign", "index.html"), "utf8");
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  } catch {
    return new Response("OpenDesign bundle belum dibuat. Jalankan npm run build:opendesign.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
