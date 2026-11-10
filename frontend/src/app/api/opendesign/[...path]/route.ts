import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendApiUrl, sessionCookie } from "@/lib/auth-proxy";
import { collectFields, fillPages } from "../../../../../opendesign/src/server/fields";

type Page = { id: string; design_id: string; title: string; canvas_json: string; sort_order: number; created_at: string };
type TemplatePage = { title: string; canvas_json: string };
type Design = { id: string; name: string; canvas_json: string; width: number; height: number; thumbnail_url: string | null; created_at: string; updated_at: string; pages: Page[] };
type OpenState = { design: Design; brand_kits: Record<string, unknown>[]; fonts: Record<string, string>[] };
type EventData = {
  id: number;
  title?: string;
  slug?: string;
  event_type?: string;
  groom_name?: string | null;
  bride_name?: string | null;
  event_date?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  map_url?: string | null;
  spotify_track_id?: string | null;
  package_code?: "free" | "bahagia" | "resepsi";
  theme_config?: Record<string, unknown> | null;
};
type Ctx = { params: Promise<{ path?: string[] }> };
type EventResult = { response: NextResponse } | { data: EventData };
type StateResult = { response: NextResponse } | { data: EventData; theme: Record<string, unknown>; state: OpenState };

const stamp = () => new Date().toISOString();
type InvitationTemplate = { id: string; name: string; category: string; background: string; accent: string; motif: string; photo?: boolean; style?: "geometric" | "floral" | "minimal" };
const templateStyles: InvitationTemplate[] = [
  { id: "luxury-onyx", name: "Onyx & Gold", category: "Luxury", background: "#171717", accent: "#d6b66e", motif: "✦" },
  { id: "luxury-ivory", name: "Ivory Pearl", category: "Luxury", background: "#f4eee3", accent: "#8b7048", motif: "❦" },
  { id: "luxury-burgundy", name: "Burgundy Soirée", category: "Luxury", background: "#351b25", accent: "#e2c99b", motif: "✧" },
  { id: "luxury-midnight", name: "Midnight Garden", category: "Luxury", background: "#18232a", accent: "#c5ae7d", motif: "❧" },
  { id: "luxury-champagne", name: "Champagne Serif", category: "Luxury", background: "#efe5d2", accent: "#9b7749", motif: "❖" },
  { id: "floral-garden", name: "Garden Bloom", category: "Floral", background: "#26362d", accent: "#c6d2b5", motif: "❧", photo: true, style: "floral" },
  { id: "floral-sakura", name: "Sakura Haze", category: "Floral", background: "#f4e7e8", accent: "#b77988", motif: "✿", photo: true, style: "floral" },
  { id: "floral-rose", name: "Rose Atelier", category: "Floral", background: "#eddfdc", accent: "#a45e69", motif: "❀", photo: true, style: "floral" },
  { id: "floral-wildflower", name: "Wildflower", category: "Floral", background: "#e9eadc", accent: "#71805a", motif: "❋", photo: true, style: "floral" },
  { id: "floral-botanical", name: "Botanical Frame", category: "Floral", background: "#e7ebe5", accent: "#667a67", motif: "❦", photo: true, style: "floral" },
  { id: "nusantara-kalimantan", name: "Kalimantan Geometri", category: "Nusantara", background: "#182b25", accent: "#dfa84e", motif: "✦", style: "geometric" },
  { id: "nusantara-batik", name: "Batik Senja", category: "Nusantara", background: "#f0dfc8", accent: "#9b5e3d", motif: "❖", style: "geometric" },
  { id: "nusantara-tenun", name: "Tenun Borneo", category: "Nusantara", background: "#382b33", accent: "#e8bd73", motif: "◇", style: "geometric" },
  { id: "nusantara-songket", name: "Songket Purnama", category: "Nusantara", background: "#f2eedf", accent: "#8b743e", motif: "✧", style: "geometric" },
  { id: "nusantara-arunika", name: "Arunika", category: "Nusantara", background: "#d98259", accent: "#fff0d7", motif: "☼", style: "geometric" },
  { id: "minimal-linen", name: "White Linen", category: "Minimalist", background: "#faf9f5", accent: "#728078", motif: "—", photo: true, style: "minimal" },
  { id: "minimal-mono", name: "Monochrome", category: "Minimalist", background: "#eeedeb", accent: "#4d4b48", motif: "•", photo: true, style: "minimal" },
  { id: "minimal-sage", name: "Sage Minimal", category: "Minimalist", background: "#e9eee8", accent: "#617669", motif: "⌁", photo: true, style: "minimal" },
  { id: "minimal-modern", name: "Modern Frame", category: "Minimalist", background: "#f1f1ed", accent: "#4c5960", motif: "╱", photo: true, style: "minimal" },
  { id: "minimal-sans", name: "Sans Grace", category: "Minimalist", background: "#fffefa", accent: "#34424f", motif: "·", photo: true, style: "minimal" },
  { id: "no-photo-lily", name: "White Lily", category: "Tanpa Foto", background: "#f5f1e7", accent: "#69784e", motif: "❀", style: "floral" },
  { id: "no-photo-lavender", name: "Purple Lavender", category: "Tanpa Foto", background: "#eee9f2", accent: "#807091", motif: "✿", style: "floral" },
  { id: "no-photo-moonlight", name: "Moonlight Type", category: "Tanpa Foto", background: "#1c1d2a", accent: "#b7a6c8", motif: "☾" },
  { id: "no-photo-terracotta", name: "Terracotta Type", category: "Tanpa Foto", background: "#f0e2d7", accent: "#9f634f", motif: "❋" },
  { id: "no-photo-golden", name: "Golden Script", category: "Tanpa Foto", background: "#faf5e9", accent: "#9d7a44", motif: "❦" },
];

function templateJson(template: InvitationTemplate, event: EventData) {
  const { background, accent, motif } = template;
  const theme = event.theme_config ?? {};
  const couple = [event.groom_name, event.bride_name].filter(Boolean).join(" & ") || "Nama & Pasangan";
  const date = event.event_date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(event.event_date)) : "Tanggal acara";
  const foreground = ["#f4eee3", "#efe5d2", "#f0dfc8", "#f2eedf", "#faf9f5", "#eeedeb", "#e9eee8", "#f1f1ed", "#fffefa", "#f5f1e7", "#eee9f2", "#f0e2d7", "#faf5e9"].includes(background) ? "#34312d" : "#fffaf0";
  const frame = template.style === "minimal" ? [] : [
    { type: "rect", left: 68, top: 68, width: 944, height: 1784, fill: "rgba(0,0,0,0)", stroke: accent, strokeWidth: 2 },
    { type: "rect", left: 82, top: 82, width: 916, height: 1756, fill: "rgba(0,0,0,0)", stroke: accent, strokeWidth: 1, opacity: 0.55 },
  ];
  const decor = template.style === "geometric" ? [
    ...Array.from({ length: 9 }, (_, index) => ({ type: "rect", left: 90 + index * 112, top: 126, width: 28, height: 28, angle: 45, fill: "rgba(0,0,0,0)", stroke: accent, strokeWidth: 2 })),
    ...Array.from({ length: 9 }, (_, index) => ({ type: "rect", left: 90 + index * 112, top: 1768, width: 28, height: 28, angle: 45, fill: "rgba(0,0,0,0)", stroke: accent, strokeWidth: 2 })),
  ] : template.style === "floral" ? [
    { type: "textbox", left: 72, top: 360, width: 120, text: "❧", fontSize: 90, fontFamily: "Lora", fill: accent, textAlign: "center", angle: -26 },
    { type: "textbox", left: 888, top: 360, width: 120, text: "❧", fontSize: 90, fontFamily: "Lora", fill: accent, textAlign: "center", angle: 26 },
    { type: "textbox", left: 72, top: 1390, width: 120, text: "❀", fontSize: 74, fontFamily: "Lora", fill: accent, textAlign: "center" },
    { type: "textbox", left: 888, top: 1390, width: 120, text: "❀", fontSize: 74, fontFamily: "Lora", fill: accent, textAlign: "center" },
  ] : [];
  const photo = template.photo ? (typeof theme.hero_image_url === "string" && theme.hero_image_url ? [
    { type: "image", left: 215, top: 880, width: 650, height: 270, src: theme.hero_image_url, fieldName: "hero_image_url", scaleX: 1, scaleY: 1 },
  ] : [
    { type: "rect", left: 235, top: 880, width: 610, height: 270, fill: `${accent}22`, stroke: accent, strokeWidth: 2, rx: 18, ry: 18 },
    { type: "textbox", left: 260, top: 975, width: 560, text: "FOTO PASANGAN", fontSize: 22, fontFamily: "Montserrat", fill: accent, textAlign: "center", charSpacing: 180 },
  ]) : [];
  return JSON.stringify({ version: "6.0.0", objects: [
    { type: "rect", left: 0, top: 0, width: 1080, height: 1920, fill: background, selectable: false, evented: false },
    ...frame,
    ...decor,
    ...(motif ? [{ type: "textbox", left: 100, top: 220, width: 880, text: motif, fontSize: 64, fontFamily: "Playfair Display", fill: accent, textAlign: "center" }] : []),
    { type: "textbox", left: 100, top: 390, width: 880, text: event.event_type === "birthday" ? "THE CELEBRATION" : event.event_type === "engagement" ? "THE ENGAGEMENT" : "THE WEDDING OF", fieldName: "event_type", fontSize: 22, fontFamily: "Montserrat", fontWeight: "600", charSpacing: 260, fill: accent, textAlign: "center" },
    { type: "textbox", left: 90, top: 510, width: 900, text: couple, fieldName: "couple_names", fontSize: 77, fontFamily: "Playfair Display", fill: foreground, textAlign: "center", lineHeight: 1.15 },
    ...photo,
    { type: "textbox", left: 120, top: template.photo ? 1210 : 950, width: 840, text: date, fieldName: "event_date", fontSize: 28, fontFamily: "Montserrat", fill: foreground, textAlign: "center", lineHeight: 1.6 },
    { type: "textbox", left: 140, top: template.photo ? 1330 : 1080, width: 800, text: "Dengan penuh syukur, kami mengundang Anda untuk merayakan hari istimewa bersama kami.", fontSize: 21, fontFamily: "Lora", fill: accent, textAlign: "center", lineHeight: 1.5 },
    { type: "textbox", left: 150, top: 1640, width: 780, text: "UNDANGAN DIGITAL · KALAKAI", fontSize: 15, fontFamily: "Montserrat", charSpacing: 180, fill: accent, textAlign: "center" },
  ] });
}

function templatePages(template: InvitationTemplate, event: EventData): TemplatePage[] {
  const cover = JSON.parse(templateJson(template, event)) as { objects: Record<string, unknown>[] };
  const contentStart = cover.objects.findIndex((object) => object.fieldName === "event_type");
  const shell = contentStart > 0 ? cover.objects.slice(0, contentStart) : cover.objects.slice(0, 1);
  const theme = event.theme_config ?? {};
  const couple = [event.groom_name, event.bride_name].filter(Boolean).join(" & ") || "Nama & Pasangan";
  const quote = String(theme.quote || "Tuliskan kalimat pembuka undangan Anda.");
  const quoteSource = String(theme.quote_source || "");
  const stories = Array.isArray(theme.love_story) && theme.love_story.length
    ? theme.love_story.map((story) => `${story.year ?? ""} · ${story.title ?? ""}\n${story.desc ?? ""}`).join("\n\n")
    : "Ceritakan perjalanan yang membawa kalian ke hari istimewa ini.";
  const date = event.event_date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(event.event_date)) : "Tanggal acara";
  const location = event.location_name || "Nama tempat";
  const address = event.location_address || "Alamat lengkap acara";
  const background = template.background;
  const foreground = ["#f4eee3", "#efe5d2", "#f0dfc8", "#f2eedf", "#faf9f5", "#eeedeb", "#e9eee8", "#f1f1ed", "#fffefa", "#f5f1e7", "#eee9f2", "#f0e2d7", "#faf5e9"].includes(background) ? "#34312d" : "#fffaf0";
  const page = (objects: Record<string, unknown>[]) => JSON.stringify({ version: "6.0.0", objects: [...shell, ...objects] });
  const heading = (text: string, top = 330) => ({ type: "textbox", left: 110, top, width: 860, text, fontSize: 58, fontFamily: "Playfair Display", fill: foreground, textAlign: "center" });
  const smallLabel = (text: string, top: number) => ({ type: "textbox", left: 120, top, width: 840, text, fontSize: 19, fontFamily: "Montserrat", charSpacing: 220, fill: template.accent, textAlign: "center" });
  const storiesContent = [
    smallLabel("CERITA KAMI", 340),
    heading("Dua hati, satu perjalanan", 410),
    { type: "textbox", left: 140, top: 610, width: 800, text: couple, fieldName: "couple_names", fontSize: 39, fontFamily: "Playfair Display", fill: template.accent, textAlign: "center" },
    { type: "textbox", left: 145, top: 790, width: 790, text: quote, fieldName: "quote", fontSize: 27, fontFamily: "Lora", fill: foreground, textAlign: "center", lineHeight: 1.45 },
    { type: "textbox", left: 145, top: 965, width: 790, text: quoteSource, fieldName: "quote_source", fontSize: 17, fontFamily: "Montserrat", fill: template.accent, textAlign: "center" },
    { type: "textbox", left: 155, top: 1150, width: 770, text: stories, fieldName: "love_story", fontSize: 22, fontFamily: "Lora", fill: foreground, textAlign: "center", lineHeight: 1.6 },
    { type: "textbox", left: 140, top: 1630, width: 800, text: "Dengan penuh syukur, kami mengundang Anda menjadi bagian dari hari bahagia kami.", fontSize: 20, fontFamily: "Lora", fill: template.accent, textAlign: "center", lineHeight: 1.45 },
  ];
  const detailContent = [
    smallLabel("HARI ISTIMEWA", 340),
    heading("Waktu & tempat", 410),
    { type: "textbox", left: 120, top: 650, width: 840, text: date, fieldName: "event_date", fontSize: 34, fontFamily: "Playfair Display", fill: foreground, textAlign: "center" },
    { type: "textbox", left: 145, top: 840, width: 790, text: location, fieldName: "location_name", fontSize: 32, fontFamily: "Montserrat", fontWeight: "600", fill: template.accent, textAlign: "center" },
    { type: "textbox", left: 145, top: 920, width: 790, text: address, fieldName: "location_address", fontSize: 22, fontFamily: "Montserrat", fill: foreground, textAlign: "center", lineHeight: 1.5 },
    { type: "rect", left: 280, top: 1120, width: 520, height: 104, fill: "rgba(0,0,0,0)", stroke: template.accent, strokeWidth: 2, rx: 20, ry: 20 },
    { type: "textbox", left: 300, top: 1150, width: 480, text: event.map_url ? "BUKA PETA LOKASI" : "TAUTAN PETA LOKASI", fontSize: 20, fontFamily: "Montserrat", fontWeight: "600", fill: template.accent, textAlign: "center" },
    { type: "textbox", left: 150, top: 1450, width: 780, text: "Kehadiran dan doa restu Anda merupakan kebahagiaan bagi kami.", fontSize: 22, fontFamily: "Lora", fill: foreground, textAlign: "center", lineHeight: 1.5 },
  ];
  const imageUrl = typeof theme.hero_image_url === "string" ? theme.hero_image_url : "";
  const galleryContent = [
    smallLabel(template.photo ? "MOMEN KAMI" : "DENGAN PENUH SUKACITA", 340),
    heading(template.photo ? "Galeri kenangan" : "Sampai berjumpa", 410),
    ...(template.photo && imageUrl ? [
      { type: "image", left: 190, top: 660, width: 700, height: 450, src: imageUrl, fieldName: "hero_image_url", scaleX: 1, scaleY: 1 },
      { type: "image", left: 190, top: 1150, width: 330, height: 300, src: imageUrl, fieldName: "hero_image_url", scaleX: 1, scaleY: 1 },
      { type: "image", left: 560, top: 1150, width: 330, height: 300, src: imageUrl, fieldName: "hero_image_url", scaleX: 1, scaleY: 1 },
    ] : template.photo ? [
      { type: "rect", left: 190, top: 660, width: 700, height: 450, fill: `${template.accent}20`, stroke: template.accent, strokeWidth: 2, rx: 20, ry: 20 },
      { type: "textbox", left: 220, top: 850, width: 640, text: "TAMBAHKAN FOTO KENANGAN", fontSize: 20, fontFamily: "Montserrat", fill: template.accent, textAlign: "center" },
      { type: "rect", left: 190, top: 1150, width: 330, height: 300, fill: `${template.accent}14`, stroke: template.accent, strokeWidth: 1, rx: 16, ry: 16 },
      { type: "rect", left: 560, top: 1150, width: 330, height: 300, fill: `${template.accent}14`, stroke: template.accent, strokeWidth: 1, rx: 16, ry: 16 },
    ] : [
      { type: "textbox", left: 160, top: 720, width: 760, text: quote, fieldName: "quote", fontSize: 28, fontFamily: "Lora", fill: foreground, textAlign: "center", lineHeight: 1.5 },
      { type: "textbox", left: 160, top: 980, width: 760, text: stories, fieldName: "love_story", fontSize: 22, fontFamily: "Lora", fill: foreground, textAlign: "center", lineHeight: 1.6 },
    ]),
    { type: "textbox", left: 140, top: 1570, width: 800, text: "Mohon konfirmasi kehadiran dan tinggalkan ucapan terbaik untuk kami.", fontSize: 20, fontFamily: "Lora", fill: template.accent, textAlign: "center", lineHeight: 1.5 },
    { type: "textbox", left: 140, top: 1690, width: 800, text: `${couple} · Terima kasih atas doa dan kasih Anda`, fieldName: "couple_names", fontSize: 18, fontFamily: "Montserrat", fill: foreground, textAlign: "center" },
  ];
  return [
    { title: "Sampul", canvas_json: templateJson(template, event) },
    { title: "Cerita Kami", canvas_json: page(storiesContent) },
    { title: "Detail Acara", canvas_json: page(detailContent) },
    { title: template.photo ? "Galeri & RSVP" : "Doa & Ucapan", canvas_json: page(galleryContent) },
  ];
}

function initialState(eventId: string): OpenState {
  const now = stamp();
  const id = `event-${eventId}`;
  const page: Page = { id: `page-${eventId}-1`, design_id: id, title: "Sampul", canvas_json: "{}", sort_order: 0, created_at: now };
  return { design: { id, name: "Undangan Kalakai", canvas_json: "{}", width: 1080, height: 1920, thumbnail_url: null, created_at: now, updated_at: now, pages: [page] }, brand_kits: [], fonts: [] };
}

async function requestEvent(eventId: string, method: "GET" | "PATCH", payload?: Record<string, unknown>): Promise<EventResult> {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return { response: NextResponse.json({ error: "Silakan masuk kembali." }, { status: 401 }) };
  if (!/^\d+$/.test(eventId)) return { response: NextResponse.json({ error: "Acara belum tersimpan. Simpan draf terlebih dahulu." }, { status: 400 }) };
  try {
    const response = await fetch(`${backendApiUrl}/api/user/events/${eventId}${method === "PATCH" ? "" : ""}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", ...(method === "PATCH" ? { "Content-Type": "application/json" } : {}) },
      ...(method === "PATCH" ? { body: JSON.stringify(payload) } : {}), cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return { response: NextResponse.json({ error: data.message ?? "Desain tidak dapat disimpan.", ...data }, { status: response.status }) };
    return { data: data as EventData };
  } catch { return { response: NextResponse.json({ error: "Belum dapat menghubungi server Kalakai." }, { status: 502 }) }; }
}

async function stateFor(eventId: string): Promise<StateResult> {
  const result = await requestEvent(eventId, "GET");
  if (!("data" in result)) return result;
  const theme = result.data.theme_config ?? {};
  const state = (theme.open_design as OpenState | undefined) ?? initialState(eventId);
  if (!state.design.pages?.length) state.design.pages = initialState(eventId).design.pages;
  return { data: result.data, theme, state };
}

async function persist(eventId: string, theme: Record<string, unknown>, state: OpenState, event: EventData) {
  const hasPremiumDesign = event.package_code === "bahagia" || event.package_code === "resepsi";
  if (!hasPremiumDesign) {
    state.design.pages = state.design.pages.map((page) => {
      try {
        const json = JSON.parse(page.canvas_json) as { objects?: Record<string, unknown>[] };
        if (Array.isArray(json.objects)) {
          json.objects = json.objects.map((object) => {
            const { kalakaiAnimation: _animation, ...basicObject } = object;
            return basicObject;
          });
          return { ...page, canvas_json: JSON.stringify(json) };
        }
      } catch { /* Keep malformed legacy pages intact; public rendering will skip them. */ }
      return page;
    });
    state.design.canvas_json = state.design.pages.find((page) => page.sort_order === 0)?.canvas_json ?? state.design.canvas_json;
  }
  const result = await requestEvent(eventId, "PATCH", {
    title: event.title,
    slug: event.slug,
    event_type: event.event_type,
    groom_name: event.groom_name,
    bride_name: event.bride_name,
    event_date: event.event_date,
    location_name: event.location_name,
    location_address: event.location_address,
    map_url: event.map_url,
    spotify_track_id: event.spotify_track_id,
    theme_config: { ...theme, open_design: state },
  });
  return "response" in result ? result.response : null;
}

function json(data: unknown, status = 200) { return NextResponse.json(data, { status }); }
function designResponse(state: OpenState) { const { pages, ...design } = state.design; return { ...design, pages }; }

async function handle(request: Request, context: Ctx) {
  const { path = [] } = await context.params;
  const url = new URL(request.url);
  const eventId = url.searchParams.get("eventId") ?? "";
  const method = request.method;
  if (!eventId) return json({ error: "Event Kalakai tidak ditemukan." }, 400);
  const p = path.join("/");
  const result = await stateFor(eventId);
  if (!("state" in result)) return result.response;
  const { data: event, theme, state } = result;
  if (p === "templates" && method === "GET") return json(templateStyles.filter((template) => event.package_code !== "free" || ["luxury-onyx", "floral-garden", "minimal-linen"].includes(template.id)).map((template, index) => ({ id: template.id, name: template.name, category: template.category, canvas_json: templateJson(template, result.data), pages: templatePages(template, result.data), width: 1080, height: 1920, thumbnail_url: null, sort_order: index + 1 })));
  if (p.startsWith("templates/") && method === "GET") {
    const id = p.slice("templates/".length);
    const template = templateStyles.find((item) => item.id === id);
    if (!template) return json({ error: "Not found" }, 404);
    if (event.package_code === "free" && !["luxury-onyx", "floral-garden", "minimal-linen"].includes(template.id)) return json({ error: "Template ini tersedia pada Paket Bahagia dan Resepsi." }, 403);
    return json({ id: template.id, name: template.name, category: template.category, canvas_json: templateJson(template, result.data), pages: templatePages(template, result.data), width: 1080, height: 1920, thumbnail_url: null, sort_order: templateStyles.indexOf(template) + 1 });
  }
  const getDesign = () => ({ ...state.design, pages: [...state.design.pages].sort((a, b) => a.sort_order - b.sort_order), brand_kits: state.brand_kits, fonts: state.fonts });

  if (p === "designs" && method === "GET") return json(state.design.canvas_json === "{}" && state.design.pages[0]?.canvas_json === "{}" ? [] : [((({ pages: _pages, ...d }) => d)(state.design))]);
  if (p === "designs" && method === "POST") {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    if (event.package_code === "free" && typeof body.template_id === "string" && !["luxury-onyx", "floral-garden", "minimal-linen"].includes(body.template_id)) return json({ error: "Template ini tersedia pada Paket Bahagia dan Resepsi." }, 403);
    const now = stamp();
    const inputPages = Array.isArray(body.pages) ? body.pages.slice(0, 20) as Record<string, unknown>[] : [];
    const pages: Page[] = inputPages.length
      ? inputPages.map((input, index) => ({
          id: `page-${eventId}-${crypto.randomUUID()}`,
          design_id: state.design.id,
          title: String(input.title ?? `Halaman ${index + 1}`).slice(0, 100),
          canvas_json: typeof input.canvas_json === "string" ? input.canvas_json : "{}",
          sort_order: index,
          created_at: now,
        }))
      : [{ ...state.design.pages[0], canvas_json: typeof body.canvas_json === "string" ? body.canvas_json : "{}", title: "Sampul", sort_order: 0, created_at: now }];
    const pageJson = pages[0].canvas_json;
    const width = Number(body.width) || 1080; const height = Number(body.height) || 1920;
    state.design = { ...state.design, name: String(body.name ?? "Undangan Kalakai"), canvas_json: pageJson, width, height, updated_at: now, pages };
    const fail = await persist(eventId, theme, state, event); return fail ?? json(designResponse(state));
  }
  if (p.startsWith("designs/")) {
    const [, id, action] = p.split("/");
    if (id !== `event-${eventId}`) return json({ error: "Not found" }, 404);
    if (action === "template" && method === "PUT") {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;
      if (event.package_code === "free" && typeof body.template_id === "string" && !["luxury-onyx", "floral-garden", "minimal-linen"].includes(body.template_id)) return json({ error: "Template ini tersedia pada Paket Bahagia dan Resepsi." }, 403);
      const requestedPages = Array.isArray(body.pages) ? body.pages.slice(0, 20) as Record<string, unknown>[] : [];
      const now = stamp();
      const pages: Page[] = (requestedPages.length ? requestedPages : [{ title: "Sampul", canvas_json: String(body.canvas_json ?? "{}") }]).map((input, index) => ({
        id: `page-${eventId}-${crypto.randomUUID()}`,
        design_id: id,
        title: String(input.title ?? `Halaman ${index + 1}`).slice(0, 100),
        canvas_json: typeof input.canvas_json === "string" ? input.canvas_json : "{}",
        sort_order: index,
        created_at: now,
      }));
      state.design = { ...state.design, name: String(body.name ?? state.design.name), canvas_json: pages[0].canvas_json, width: Number(body.width) || 1080, height: Number(body.height) || 1920, updated_at: now, pages };
      const fail = await persist(eventId, theme, state, event);
      return fail ?? json(designResponse(state));
    }
    if (action === "fields" && method === "GET") return json(collectFields(state.design.pages));
    if (action === "fill" && method === "POST") {
      const body = await request.json().catch(() => ({})) as { values?: Record<string, string | number>; save?: boolean; name?: string };
      const values = Object.fromEntries(Object.entries(body.values ?? {}).map(([key, value]) => [key, String(value)]));
      const filled = fillPages(state.design.pages, values);
      if (body.save !== false) {
        state.design.pages = filled.pages;
        state.design.canvas_json = filled.pages.find((page) => page.sort_order === 0)?.canvas_json ?? state.design.canvas_json;
        state.design.updated_at = stamp();
        const fail = await persist(eventId, theme, state, event);
        if (fail) return fail;
      }
      return json({ design: (({ pages: _pages, ...d }) => d)(state.design), ...filled });
    }
    if (action === "pages" && method === "POST") {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;
      const order = body.after_sort_order === undefined ? state.design.pages.length : Number(body.after_sort_order) + 1;
      const now = stamp();
      state.design.pages = state.design.pages.map((page) => page.sort_order >= order ? { ...page, sort_order: page.sort_order + 1 } : page);
      const page: Page = { id: `page-${eventId}-${crypto.randomUUID()}`, design_id: id, title: String(body.title ?? `Page ${state.design.pages.length + 1}`), canvas_json: String(body.canvas_json ?? "{}"), sort_order: order, created_at: now };
      state.design.pages.push(page);
      const fail = await persist(eventId, theme, state, event); return fail ?? json(page);
    }
    if (method === "GET" && !action) return json(getDesign());
    if (method === "PUT" && !action) {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;
      state.design = { ...state.design, name: typeof body.name === "string" ? body.name : state.design.name, canvas_json: typeof body.canvas_json === "string" ? body.canvas_json : state.design.canvas_json, width: Number(body.width) || state.design.width, height: Number(body.height) || state.design.height, thumbnail_url: typeof body.thumbnail_url === "string" ? body.thumbnail_url : state.design.thumbnail_url, updated_at: stamp() };
      if (typeof body.canvas_json === "string") {
        const first = state.design.pages.find((page) => page.sort_order === 0) ?? state.design.pages[0];
        if (first) first.canvas_json = body.canvas_json;
      }
      const fail = await persist(eventId, theme, state, event); return fail ?? json((({ pages: _pages, ...d }) => d)(state.design));
    }
    if (method === "DELETE") { state.design = initialState(eventId).design; const fail = await persist(eventId, theme, state, event); return fail ?? json({ ok: true }); }
  }
  if (p.startsWith("pages/")) {
    const [, pageId, action] = p.split("/");
    const page = state.design.pages.find((item) => item.id === pageId);
    if (action === "duplicate" && method === "POST") {
      if (!page) return json({ error: "Not found" }, 404);
      state.design.pages = state.design.pages.map((item) => item.sort_order > page.sort_order ? { ...item, sort_order: item.sort_order + 1 } : item);
      const copy = { ...page, id: `page-${eventId}-${crypto.randomUUID()}`, title: `${page.title} (copy)`, sort_order: page.sort_order + 1, created_at: stamp() };
      state.design.pages.push(copy); const fail = await persist(eventId, theme, state, event); return fail ?? json(copy);
    }
    if (!page) return json({ error: "Not found" }, 404);
    if (method === "PUT") {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;
      if (typeof body.title === "string") page.title = body.title;
      if (typeof body.canvas_json === "string") page.canvas_json = body.canvas_json;
      if (page.sort_order === 0) state.design.canvas_json = page.canvas_json;
      state.design.updated_at = stamp(); const fail = await persist(eventId, theme, state, event); return fail ?? json(page);
    }
    if (method === "DELETE") {
      if (state.design.pages.length <= 1) return json({ error: "Cannot delete the last page" }, 400);
      state.design.pages = state.design.pages.filter((item) => item.id !== pageId).sort((a, b) => a.sort_order - b.sort_order).map((item, index) => ({ ...item, sort_order: index }));
      const fail = await persist(eventId, theme, state, event); return fail ?? json({ ok: true });
    }
  }
  if (p === "brand-kits" && method === "GET") return json(state.brand_kits);
  if (p === "brand-kits" && method === "POST") {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const kit = { id: crypto.randomUUID(), name: body.name ?? "My Brand", colors: body.colors ?? [], heading_font: body.heading_font ?? "Montserrat", body_font: body.body_font ?? "Inter", logos: body.logos ?? [], created_at: stamp(), updated_at: stamp() };
    state.brand_kits.push(kit); const fail = await persist(eventId, theme, state, event); return fail ?? json(kit);
  }
  if (p.startsWith("brand-kits/")) {
    const id = p.slice("brand-kits/".length); const index = state.brand_kits.findIndex((kit) => kit.id === id);
    if (index < 0) return json({ error: "Not found" }, 404);
    if (method === "DELETE") { state.brand_kits.splice(index, 1); const fail = await persist(eventId, theme, state, event); return fail ?? json({ ok: true }); }
    if (method === "PUT") { const body = await request.json().catch(() => ({})) as Record<string, unknown>; state.brand_kits[index] = { ...state.brand_kits[index], ...body, updated_at: stamp() }; const fail = await persist(eventId, theme, state, event); return fail ?? json(state.brand_kits[index]); }
  }
  if (p === "uploads" && method === "POST") {
    const form = await request.formData(); const file = form.get("file");
    if (!(file instanceof File)) return json({ error: "No file provided" }, 400);
    const upload = new FormData(); upload.set("image", file, file.name);
    const token = (await cookies()).get(sessionCookie)?.value;
    const upstream = await fetch(`${backendApiUrl}/api/user/events/${eventId}/assets`, { method: "POST", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, body: upload, cache: "no-store" });
    const data = await upstream.json();
    return upstream.ok ? json({ url: `/api/assets/${data.path}` }) : json({ error: data.message ?? "Unggahan gagal." }, upstream.status);
  }
  if (p === "fonts" && method === "GET") return json(state.fonts);
  if (p === "fonts" && method === "POST") {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ error: "No font file provided" }, 400);
    const token = (await cookies()).get(sessionCookie)?.value;
    const upload = new FormData(); upload.set("file", file, file.name);
    const upstream = await fetch(`${backendApiUrl}/api/user/events/${eventId}/fonts`, { method: "POST", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, body: upload, cache: "no-store" });
    const data = await upstream.json();
    return upstream.ok ? json(data, upstream.status) : json({ error: data.message ?? "Font tidak dapat diunggah." }, upstream.status);
  }
  return json({ error: "Not found" }, 404);
}

export async function GET(request: Request, context: Ctx) { return handle(request, context); }
export async function POST(request: Request, context: Ctx) { return handle(request, context); }
export async function PUT(request: Request, context: Ctx) { return handle(request, context); }
export async function DELETE(request: Request, context: Ctx) { return handle(request, context); }
