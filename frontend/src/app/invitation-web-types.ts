export type InvitationSectionType = "hero" | "couple" | "quote" | "countdown" | "event" | "gallery" | "story" | "spotify" | "gifts" | "rsvp";
export type InvitationTransition = "fade" | "slide" | "flip" | "zoom";
export type InvitationElementType = "text" | "image" | "divider" | "ornament" | "button";
export type InvitationElement = { id: string; type: InvitationElementType; content: string; imageUrl?: string; linkUrl?: string; fontFamily: string; fontSize: number; color: string; align: "left" | "center" | "right"; width: number; frame: "none" | "rounded" | "circle" | "polaroid"; shadow: boolean };

export type InvitationWebSection = {
  id: string;
  type: InvitationSectionType;
  eyebrow: string;
  heading: string;
  description: string;
  background: string;
  layout: "center" | "split" | "cards" | "editorial";
  visible: boolean;
  elements: InvitationElement[];
};

export type InvitationWebDesign = {
  version: 1;
  transition: InvitationTransition;
  sections: InvitationWebSection[];
  fontFamily: string;
};

const defaults: Array<Omit<InvitationWebSection, "id" | "elements">> = [
  { type: "hero", eyebrow: "THE WEDDING CELEBRATION", heading: "Hari istimewa kami", description: "Dengan penuh sukacita, kami mengundang Anda untuk merayakan momen ini bersama.", background: "#183b32", layout: "center", visible: true },
  { type: "couple", eyebrow: "DENGAN PENUH SUKACITA", heading: "Mempelai", description: "Dua cerita, satu perjalanan.", background: "#fbfaf6", layout: "cards", visible: true },
  { type: "quote", eyebrow: "KALIMAT PEMBUKA", heading: "Dengan kasih dan doa", description: "", background: "#f1f3ed", layout: "center", visible: true },
  { type: "countdown", eyebrow: "MENUJU HARI BAHAGIA", heading: "Catat tanggalnya", description: "Kami menantikan hari untuk merayakannya bersama Anda.", background: "#183b32", layout: "center", visible: true },
  { type: "event", eyebrow: "WAKTU & TEMPAT", heading: "Detail acara", description: "Simpan informasi acara dan lokasi di halaman ini.", background: "#fbfaf6", layout: "split", visible: true },
  { type: "gallery", eyebrow: "MOMEN KAMI", heading: "Disimpan dalam kenangan", description: "", background: "#f1f3ed", layout: "editorial", visible: true },
  { type: "story", eyebrow: "PERJALANAN KAMI", heading: "Satu cerita, banyak kenangan", description: "Hari ini menjadi satu bab baru dalam perjalanan kami.", background: "#fbfaf6", layout: "editorial", visible: true },
  { type: "spotify", eyebrow: "LAGU PILIHAN", heading: "Sebuah lagu untuk hari ini", description: "", background: "#183b32", layout: "center", visible: true },
  { type: "gifts", eyebrow: "TANDA KASIH", heading: "Amplop digital", description: "Doa restu Anda adalah hadiah terbaik bagi kami.", background: "#f1f3ed", layout: "cards", visible: true },
  { type: "rsvp", eyebrow: "DOA & UCAPAN", heading: "Konfirmasi kehadiran", description: "Kami akan senang menerima kabar dan doa terbaik dari Anda.", background: "#fbfaf6", layout: "center", visible: true },
];

export const invitationSectionLabels: Record<InvitationSectionType, string> = {
  hero: "Sampul undangan", couple: "Mempelai", quote: "Kutipan & doa", countdown: "Hitung mundur", event: "Detail acara", gallery: "Galeri foto", story: "Cerita perjalanan", spotify: "Musik Spotify", gifts: "Amplop digital", rsvp: "RSVP & ucapan",
};

export function createDefaultInvitationWebDesign(): InvitationWebDesign {
  return { version: 1, transition: "fade", fontFamily: "Georgia", sections: defaults.map((section, index) => ({ ...section, id: `section-${section.type}-${index + 1}`, elements: [] })) };
}

export function normalizeInvitationWebDesign(input: unknown): InvitationWebDesign {
  const fallback = createDefaultInvitationWebDesign();
  if (!input || typeof input !== "object") return fallback;
  const value = input as Partial<InvitationWebDesign>;
  if (!Array.isArray(value.sections)) return fallback;
  const allowed = new Set(Object.keys(invitationSectionLabels));
  const sections = value.sections.slice(0, 20).flatMap((section, index) => {
    if (!section || !allowed.has(section.type)) return [];
    const defaultSection = fallback.sections.find((item) => item.type === section.type) ?? fallback.sections[0]!;
    return [{
      ...defaultSection,
      ...section,
      id: typeof section.id === "string" ? section.id.slice(0, 80) : `section-${index + 1}`,
      eyebrow: typeof section.eyebrow === "string" ? section.eyebrow.slice(0, 100) : defaultSection.eyebrow,
      heading: typeof section.heading === "string" ? section.heading.slice(0, 180) : defaultSection.heading,
      description: typeof section.description === "string" ? section.description.slice(0, 1200) : defaultSection.description,
      background: typeof section.background === "string" && /^#[0-9a-f]{6}$/i.test(section.background) ? section.background : defaultSection.background,
      layout: ["center", "split", "cards", "editorial"].includes(section.layout) ? section.layout : defaultSection.layout,
      visible: section.visible !== false,
      elements: Array.isArray(section.elements) ? section.elements.slice(0, 30).flatMap((element, elementIndex) => {
        if (!element || !["text", "image", "divider", "ornament", "button"].includes(element.type)) return [];
        return [{
          id: typeof element.id === "string" ? element.id.slice(0, 80) : `element-${index}-${elementIndex}`,
          type: element.type,
          content: typeof element.content === "string" ? element.content.slice(0, 1500) : "",
          imageUrl: typeof element.imageUrl === "string" ? element.imageUrl.slice(0, 2000) : "",
          linkUrl: typeof element.linkUrl === "string" ? element.linkUrl.slice(0, 2000) : "",
          frame: ["none", "rounded", "circle", "polaroid"].includes(element.frame) ? element.frame : "rounded",
          shadow: element.shadow === true,
          fontFamily: ["Georgia", "Playfair Display", "Lora", "Montserrat", "Arial", "serif", "sans-serif"].includes(element.fontFamily ?? "") ? element.fontFamily! : "Georgia",
          fontSize: Number.isFinite(element.fontSize) ? Math.min(96, Math.max(10, Number(element.fontSize))) : 20,
          color: typeof element.color === "string" && /^#[0-9a-f]{6}$/i.test(element.color) ? element.color : "#243b31",
          align: ["left", "center", "right"].includes(element.align) ? element.align : "center",
          width: Number.isFinite(element.width) ? Math.min(100, Math.max(20, Number(element.width))) : 100,
        }];
      }) : [],
    }];
  });
  return {
    version: 1,
    transition: ["fade", "slide", "flip", "zoom"].includes(value.transition ?? "") ? value.transition! : "fade",
    fontFamily: ["Georgia", "Playfair Display", "Lora", "Montserrat", "Arial", "serif", "sans-serif"].includes(value.fontFamily ?? "") ? value.fontFamily! : "Georgia",
    sections: sections.length ? sections : fallback.sections,
  };
}
