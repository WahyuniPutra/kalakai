import { readableColor } from "./template-colors";

export const INVITATION_COLLECTION = [
  { id: "paviliun-emas", name: "Paviliun Emas", category: "Luxury", layout: "pavilion", background: "#142720", accent: "#E5BE78", surface: "#20372D", description: "Nama pasangan di dalam lengkung ganda berwarna emas." },
  { id: "kebun-kamelia", name: "Kebun Kamelia", category: "Floral", layout: "botanical", background: "#F7EFE5", accent: "#75414E", surface: "#FFFAF2", photo: true, description: "Ilustrasi bunga di sudut dan ruang untuk foto pasangan." },
  { id: "jalin-rimba", name: "Jalin Rimba", category: "Nusantara", layout: "woven", background: "#392320", accent: "#F3CA86", surface: "#4C302A", description: "Pita geometris bersusun membingkai undangan bernuansa hangat." },
  { id: "folio-gading", name: "Folio Gading", category: "Minimalist", layout: "folio", background: "#F7F4EA", accent: "#47563D", surface: "#FFFCF4", photo: true, description: "Tipografi rata kiri, garis tipis, dan foto seperti halaman majalah." },
  { id: "sajak-senja", name: "Sajak Senja", category: "Tanpa Foto", layout: "letter", background: "#EDE2EF", accent: "#65466C", surface: "#F9F0F8", free: true, description: "Sampul seperti surat dengan monogram pasangan dan palet ungu lembut." },
] as const satisfies readonly {
  id: string; name: string; category: string; layout: string; background: string;
  accent: string; surface: string; description: string; photo?: boolean; free?: boolean;
}[];

export type CollectionDesign = (typeof INVITATION_COLLECTION)[number];
export type CollectionLayout = CollectionDesign["layout"];
export type CollectionCoverFields = {
  couple: string; date: string; eyebrow: string; photoUrl?: string;
};

export function collectionCover(design: CollectionDesign, fields: CollectionCoverFields) {
  const { layout, background, accent, surface } = design;
  const foreground = readableColor("#27221E", [background, surface]);
  const objects: Record<string, unknown>[] = [];
  function rect(left: number, top: number, width: number, height: number, fill: string, extra = {}) {
    objects.push({ type: "rect", left, top, width, height, fill, ...extra });
  }
  function text(value: string, left: number, top: number, width: number, fontSize: number, extra = {}) {
    objects.push({ type: "textbox", left, top, width, text: value, fontSize,
      fontFamily: "Playfair Display", fill: foreground, textAlign: "center", lineHeight: 1.1, ...extra });
  }
  function oval(left: number, top: number, rx: number, ry: number, fill: string, angle = 0) {
    objects.push({ type: "ellipse", left, top, width: rx * 2, height: ry * 2, rx, ry, fill, angle });
  }
  const ink = { fill: accent, fontFamily: "Montserrat", charSpacing: 155 };
  const transparent = "rgba(0,0,0,0)";
  rect(0, 0, 1080, 1920, background, { selectable: false, evented: false });

  if (layout === "pavilion") {
    rect(80, 215, 920, 1400, surface, { rx: 460, ry: 460, stroke: accent, strokeWidth: 3 });
    rect(105, 240, 870, 1350, transparent, { rx: 435, ry: 435, stroke: accent, strokeWidth: 1 });
    text("✦", 100, 445, 880, 90, { fill: accent });
    rect(430, 1160, 220, 2, accent);
  } else if (layout === "botanical") {
    rect(85, 120, 910, 1680, surface, { stroke: accent, strokeWidth: 2 });
    for (const [x, y] of [[135, 230], [827, 1450]]) {
      oval(x, y + 95, 25, 80, "#607048", -35);
      oval(x + 50, y + 85, 25, 80, "#607048", 45);
      for (const [dx, dy] of [[0, 50], [46, 15], [94, 50], [46, 88]]) {
        oval(x + dx, y + dy, 42, 42, "#CA8991");
      }
      oval(x + 62, y + 67, 26, 26, "#9F6243");
    }
  } else if (layout === "woven") {
    for (const top of [220, 1520]) {
      rect(0, top, 1080, 175, surface);
      rect(0, top + 16, 1080, 2, accent);
      rect(0, top + 155, 1080, 2, accent);
      for (let index = 0; index < 11; index++) {
        const left = 60 + index * 96;
        rect(left, top + 47, 58, 58, transparent, { angle: 45, stroke: accent, strokeWidth: 3 });
        rect(left, top + 68, 26, 26, accent, { angle: 45 });
      }
    }
  } else if (layout === "folio") {
    rect(90, 115, 900, 2, accent);
    rect(90, 1720, 900, 2, accent);
    rect(90, 865, 8, 585, accent);
  } else {
    rect(105, 190, 870, 1480, surface, { stroke: accent, strokeWidth: 2 });
    oval(417, 380, 123, 123, background);
    const initials = collectionInitials(fields.couple);
    text(initials, 400, 463, 280, 59, { fill: accent });
    rect(420, 1170, 240, 2, accent);
  }

  const leftAligned = layout === "folio";
  const alignment = leftAligned ? "left" : "center";
  const hasPhoto = layout === "folio" || layout === "botanical";
  const x = leftAligned ? 125 : 145;
  const width = leftAligned ? 805 : 790;
  const labelTop = leftAligned ? 216 : layout === "botanical" ? 445 : 655;
  text(fields.eyebrow, x, labelTop, width, 23, { ...ink, textAlign: alignment, fieldName: "event_type" });
  const nameSize = Math.max(26, Math.min(86, Math.round(525 / Math.sqrt(Array.from(fields.couple).length || 1))));
  text(fields.couple, x, labelTop + 95, width, nameSize,
    { textAlign: alignment, fieldName: "couple_names" });
  if (hasPhoto) {
    const photoTop = layout === "folio" ? 865 : 1000;
    const photoHeight = layout === "folio" ? 550 : 320;
    if (fields.photoUrl) {
      objects.push({ type: "image", left: x, top: photoTop, width, height: photoHeight, src: fields.photoUrl,
        fieldName: "hero_image_url", scaleX: 1, scaleY: 1, crossOrigin: "anonymous" });
    } else {
      rect(x, photoTop, width, photoHeight, surface, { stroke: accent, strokeWidth: 2 });
      text("FOTO PASANGAN", x, photoTop + photoHeight / 2 - 20, width, 24, ink);
    }
  }
  text(fields.date, x, hasPhoto ? 1480 : 1290, width, 30, { ...ink, textAlign: alignment, fieldName: "event_date" });
  return JSON.stringify({ version: "6.0.0", objects });
}

export function collectionInitials(title: string) {
  return title.split(/&| dan /i).map((part) => Array.from(part.trim())[0])
    .filter(Boolean).slice(0, 2).join(" · ").toLocaleUpperCase("id-ID");
}
