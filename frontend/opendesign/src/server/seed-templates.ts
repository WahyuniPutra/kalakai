// Kalakai invitation starter designs for the vendored OpenDesign editor (MIT).
export interface SeedTemplate {
  id: string;
  name: string;
  category: string;
  canvas_json: string;
  width: number;
  height: number;
  sort_order: number;
}

const canvas = (background: string, accent: string, title: string, motif: string) => JSON.stringify({
  version: "6.0.0",
  objects: [
    { type: "rect", left: 0, top: 0, width: 1080, height: 1920, fill: background, selectable: false, evented: false },
    { type: "rect", left: 50, top: 50, width: 980, height: 1820, fill: "rgba(0,0,0,0)", stroke: accent, strokeWidth: 3, rx: 28, ry: 28 },
    { type: "textbox", left: 100, top: 250, width: 880, text: motif, fontSize: 68, fontFamily: "Playfair Display", fill: accent, textAlign: "center" },
    { type: "textbox", left: 100, top: 520, width: 880, text: "THE WEDDING OF", fontSize: 24, fontFamily: "Montserrat", fontWeight: "600", charSpacing: 260, fill: accent, textAlign: "center" },
    { type: "textbox", left: 100, top: 700, width: 880, text: "Nama\n&\nPasangan", fontSize: 82, fontFamily: "Playfair Display", fill: "#ffffff", textAlign: "center", lineHeight: 1.15 },
    { type: "textbox", left: 120, top: 1220, width: 840, text: "SABTU, 20 DESEMBER 2026\nPukul 09.00 WIB\n\nNama Gedung · Kota", fontSize: 30, fontFamily: "Montserrat", fill: "#ffffff", textAlign: "center", lineHeight: 1.6 },
    { type: "textbox", left: 140, top: 1650, width: 800, text: "Dengan penuh sukacita, kami mengundang Anda", fontSize: 24, fontFamily: "Lora", fill: accent, textAlign: "center" },
  ],
});

export const SEED_TEMPLATES: SeedTemplate[] = [
  { id: "kalakai-classic", name: "Klasik Abadi", category: "wedding", canvas_json: canvas("#17251f", "#d2b58b", "❦", "❦"), width: 1080, height: 1920, sort_order: 1 },
  { id: "kalakai-garden", name: "Garden Bloom", category: "wedding", canvas_json: canvas("#26362d", "#c6d2b5", "✿", "❧"), width: 1080, height: 1920, sort_order: 2 },
  { id: "kalakai-editorial", name: "Editorial Ivory", category: "wedding", canvas_json: canvas("#eee8dc", "#80674f", "✦", "✦"), width: 1080, height: 1920, sort_order: 3 },
  { id: "kalakai-terracotta", name: "Terracotta", category: "wedding", canvas_json: canvas("#8c5140", "#f0c7a4", "❋", "❋"), width: 1080, height: 1920, sort_order: 4 },
  { id: "kalakai-midnight", name: "Midnight Blue", category: "wedding", canvas_json: canvas("#1b2638", "#d7c48d", "✧", "✧"), width: 1080, height: 1920, sort_order: 5 },
  { id: "kalakai-minimal", name: "Mulai dari Kanvas Kosong", category: "blank", canvas_json: JSON.stringify({ version: "6.0.0", objects: [{ type: "rect", left: 0, top: 0, width: 1080, height: 1920, fill: "#f8f5ef" }] }), width: 1080, height: 1920, sort_order: 6 },
];
