import { ImageResponse } from "next/og";

export const alt = "Kalakai — Undangan digital dan ruang acara";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#eef3e9", padding: 70, color: "#163d33", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", fontSize: 48, fontWeight: 700 }}>kalakai.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", fontSize: 70, maxWidth: 950, lineHeight: 1.1 }}>Momen istimewa, terasa dekat dari awal.</div>
        <div style={{ display: "flex", fontSize: 26, color: "#476653" }}>Undangan digital · RSVP · Buku tamu QR</div>
      </div>
      <div style={{ display: "flex", fontSize: 24 }}>kalakai.site</div>
    </div>,
    size,
  );
}
