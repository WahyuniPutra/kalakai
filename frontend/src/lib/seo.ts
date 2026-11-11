import type { Metadata } from "next";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kalakai.site").origin;
export const siteDescription = "Buat undangan digital personal, kelola RSVP dan daftar tamu, serta siapkan check-in QR acara bersama Kalakai.";

export function publicMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, siteUrl).toString();
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Kalakai", locale: "id_ID", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Kalakai — Undangan digital dan ruang acara" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
