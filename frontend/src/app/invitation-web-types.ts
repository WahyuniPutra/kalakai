/**
 * Kalakai HTML invitation document (web_design).
 *
 * The editor and the guest renderer share this module so that every option a
 * user can pick has exactly one definition: its label, its allowed values and
 * the package that unlocks it. "Logic" (what happens when a section appears or
 * an element is clicked) is stored as whitelisted presets, never as code, so a
 * published invitation can't carry arbitrary CSS/JS to other people's guests.
 */

export type PackageCode = "free" | "bahagia" | "resepsi";

export type InvitationSectionType = "hero" | "couple" | "quote" | "countdown" | "event" | "gallery" | "story" | "spotify" | "gifts" | "rsvp" | "ticket" | "custom";
export type InvitationTransition = "fade" | "slide" | "flip" | "zoom";
export type InvitationElementType = "heading" | "text" | "image" | "button" | "divider" | "ornament" | "spacer" | "countdown";

export type SectionReveal = "inherit" | "none" | "fade" | "slide-up" | "slide-left" | "slide-right" | "zoom" | "blur" | "flip" | "curtain";
export type ElementEntrance = "none" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-in" | "zoom-out" | "blur" | "rotate" | "bounce" | "flip" | "wipe" | "typewriter";
export type ElementLoop = "none" | "float" | "pulse" | "heartbeat" | "swing" | "shimmer" | "spin";
export type ElementHover = "none" | "lift" | "grow" | "glow" | "tilt";
export type MotionSpeed = "slow" | "normal" | "fast";
export type MotionEasing = "smooth" | "bounce" | "sharp";
export type BackgroundEffect = "none" | "petals" | "snow" | "sparkle" | "leaves" | "hearts" | "bubbles";
export type BurstEffect = "confetti" | "hearts" | "petals" | "sparkle";
export type RuleWhen = "first" | "enter" | "leave" | "click";
export type RuleAction = "burst" | "music-play" | "music-pause" | "toast" | "vibrate";
export type ElementActionType = "none" | "link" | "maps" | "section" | "music" | "rsvp" | "calendar" | "whatsapp" | "copy" | "burst";
export type ElementFrame = "none" | "rounded" | "circle" | "arch" | "polaroid" | "heart";
export type ElementShadow = "none" | "soft" | "float" | "sharp";
export type ImageFilter = "none" | "warm" | "bw" | "vintage" | "soft";
export type Align = "left" | "center" | "right";

export type ElementMotion = { entrance: ElementEntrance; loop: ElementLoop; hover: ElementHover; speed: MotionSpeed; delay: number; easing: MotionEasing };
export type ElementAction = { type: ElementActionType; value: string };

export type InvitationElement = {
  id: string;
  type: InvitationElementType;
  content: string;
  imageUrl: string;
  /** @deprecated kept for v1 documents, replaced by `action`. */
  linkUrl?: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 400 | 600 | 700;
  italic: boolean;
  letterSpacing: number;
  color: string;
  background: string;
  variant: string;
  align: Align;
  width: number;
  marginTop: number;
  frame: ElementFrame;
  shadow: ElementShadow;
  filter: ImageFilter;
  motion: ElementMotion;
  action: ElementAction;
};

export type SectionRule = { id: string; when: RuleWhen; action: RuleAction; value: string; delay: number };

export type InvitationWebSection = {
  id: string;
  type: InvitationSectionType;
  eyebrow: string;
  heading: string;
  description: string;
  showDefault: boolean;
  background: string;
  background2: string;
  gradientAngle: number;
  backgroundImage: string;
  overlay: number;
  textColor: string;
  layout: "center" | "split" | "cards" | "editorial";
  height: "auto" | "screen";
  spacing: "compact" | "normal" | "spacious";
  contentWidth: "narrow" | "normal" | "wide";
  reveal: SectionReveal;
  replay: boolean;
  effect: BackgroundEffect;
  rules: SectionRule[];
  visible: boolean;
  elements: InvitationElement[];
};

export type InvitationWebDesign = {
  version: 2;
  transition: InvitationTransition;
  mode: "scroll" | "pages";
  showNav: boolean;
  fontFamily: string;
  headingFont: string;
  sections: InvitationWebSection[];
};

// ─── Option catalogues (label + value) ──────────────────────────────────────

export const fontOptions = ["Georgia", "Playfair Display", "Cormorant Garamond", "Cinzel", "Lora", "Great Vibes", "Dancing Script", "Parisienne", "Montserrat", "Poppins", "Arial", "serif", "sans-serif"] as const;
export const googleFonts = ["Playfair Display", "Cormorant Garamond", "Cinzel", "Lora", "Great Vibes", "Dancing Script", "Parisienne", "Montserrat", "Poppins"];
const scriptFonts = ["Great Vibes", "Dancing Script", "Parisienne"];
const sansFonts = ["Montserrat", "Poppins", "Arial", "sans-serif"];

/** CSS font-family stack with a sensible fallback for each font. */
export function fontStack(name: string) {
  if (name === "serif" || name === "sans-serif") return name;
  const fallback = scriptFonts.includes(name) ? "cursive" : sansFonts.includes(name) ? "Arial, sans-serif" : "Georgia, serif";
  return `"${name}", ${fallback}`;
}

/** Google Fonts stylesheet for the fonts actually in use (empty when none). */
export function googleFontsHref(names: Iterable<string>) {
  const used = [...new Set(names)].filter((name) => googleFonts.includes(name));
  if (!used.length) return "";
  const families = used.map((name) => `family=${name.replace(/ /g, "+")}${scriptFonts.includes(name) ? "" : ":ital,wght@0,400;0,600;0,700;1,400"}`);
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

export const invitationSectionLabels: Record<InvitationSectionType, string> = {
  hero: "Sampul undangan", couple: "Mempelai", quote: "Kutipan & doa", countdown: "Hitung mundur", event: "Detail acara", gallery: "Galeri foto", story: "Cerita perjalanan", spotify: "Musik Spotify", gifts: "Amplop digital", rsvp: "RSVP & ucapan", ticket: "Tiket QR tamu", custom: "Section kosong",
};

export const sectionDescriptions: Record<InvitationSectionType, string> = {
  hero: "Halaman pembuka dengan nama dan tamu", couple: "Kartu nama kedua mempelai", quote: "Ayat atau kalimat pembuka", countdown: "Waktu mundur ke hari-H", event: "Tanggal, tempat & peta", gallery: "Foto momen kalian", story: "Linimasa perjalanan", spotify: "Pemutar lagu Spotify", gifts: "Rekening untuk tanda kasih", rsvp: "Form kehadiran & doa", ticket: "QR check-in di meja tamu", custom: "Kanvas bebas, isi sendiri",
};

export const elementLabels: Record<InvitationElementType, string> = {
  heading: "Judul", text: "Teks", image: "Foto", button: "Tombol", divider: "Pemisah", ornament: "Ornamen", spacer: "Ruang kosong", countdown: "Hitung mundur",
};

export const revealOptions: Array<[SectionReveal, string]> = [["inherit", "Ikuti pengaturan halaman"], ["none", "Tanpa transisi"], ["fade", "Muncul perlahan"], ["slide-up", "Naik dari bawah"], ["slide-left", "Geser dari kanan"], ["slide-right", "Geser dari kiri"], ["zoom", "Membesar"], ["blur", "Buram ke jelas"], ["flip", "Balik 3D"], ["curtain", "Tirai terbuka"]];
export const entranceOptions: Array<[ElementEntrance, string]> = [["none", "Tanpa animasi"], ["fade", "Muncul perlahan"], ["slide-up", "Naik"], ["slide-down", "Turun"], ["slide-left", "Dari kanan"], ["slide-right", "Dari kiri"], ["zoom-in", "Membesar"], ["zoom-out", "Mengecil"], ["blur", "Buram ke jelas"], ["rotate", "Berputar masuk"], ["bounce", "Memantul"], ["flip", "Balik 3D"], ["wipe", "Terungkap dari kiri"], ["typewriter", "Mengetik (teks)"]];
export const loopOptions: Array<[ElementLoop, string]> = [["none", "Diam"], ["float", "Mengambang"], ["pulse", "Berdenyut"], ["heartbeat", "Detak jantung"], ["swing", "Bergoyang"], ["shimmer", "Berkilau"], ["spin", "Berputar pelan"]];
export const hoverOptions: Array<[ElementHover, string]> = [["none", "Tidak ada"], ["lift", "Terangkat"], ["grow", "Membesar"], ["glow", "Bercahaya"], ["tilt", "Miring"]];
export const effectOptions: Array<[BackgroundEffect, string]> = [["none", "Tanpa efek"], ["petals", "Kelopak bunga jatuh"], ["snow", "Salju turun"], ["sparkle", "Kilau bintang"], ["leaves", "Daun berguguran"], ["hearts", "Hati melayang"], ["bubbles", "Gelembung naik"]];
export const burstOptions: Array<[BurstEffect, string]> = [["confetti", "Hujan konfeti"], ["hearts", "Ledakan hati"], ["petals", "Tabur kelopak"], ["sparkle", "Percikan kilau"]];
export const ruleWhenOptions: Array<[RuleWhen, string]> = [["first", "Pertama kali section ini tampil"], ["enter", "Setiap kali section ini tampil"], ["leave", "Saat tamu meninggalkan section"], ["click", "Saat section ini diketuk"]];
export const ruleActionOptions: Array<[RuleAction, string]> = [["burst", "Tampilkan efek perayaan"], ["music-play", "Putar musik"], ["music-pause", "Jeda musik"], ["toast", "Tampilkan pesan singkat"], ["vibrate", "Getarkan ponsel"]];
export const actionOptions: Array<[ElementActionType, string]> = [["none", "Tidak melakukan apa-apa"], ["maps", "Buka Google Maps acara"], ["section", "Pindah ke section…"], ["rsvp", "Buka form RSVP"], ["calendar", "Simpan ke kalender"], ["music", "Putar / jeda musik"], ["link", "Buka tautan"], ["whatsapp", "Kirim WhatsApp ke…"], ["copy", "Salin teks (no. rekening)"], ["burst", "Tampilkan efek perayaan"]];
export const frameOptions: Array<[ElementFrame, string]> = [["none", "Tanpa bingkai"], ["rounded", "Sudut membulat"], ["circle", "Lingkaran"], ["arch", "Lengkung"], ["polaroid", "Polaroid"], ["heart", "Hati"]];
export const shadowOptions: Array<[ElementShadow, string]> = [["none", "Tanpa bayangan"], ["soft", "Lembut"], ["float", "Melayang"], ["sharp", "Tegas"]];
export const filterOptions: Array<[ImageFilter, string]> = [["none", "Asli"], ["warm", "Hangat"], ["bw", "Hitam putih"], ["vintage", "Vintage"], ["soft", "Lembut"]];
export const buttonVariants: Array<[string, string]> = [["solid", "Penuh"], ["outline", "Garis tepi"], ["soft", "Lembut"], ["link", "Tautan teks"]];
export const dividerVariants: Array<[string, string]> = [["line", "Garis"], ["dotted", "Titik-titik"], ["double", "Garis ganda"], ["ornament", "Garis + ornamen"]];
export const ornamentChoices = ["✿", "❀", "❦", "❧", "✦", "✧", "❖", "♥", "∞", "☾", "❋", "✽"];

/** Personalisation tokens users can drop into any text. */
export const textTokens: Array<[string, string]> = [["{nama_tamu}", "Nama tamu"], ["{pasangan}", "Nama pasangan"], ["{tanggal}", "Tanggal acara"], ["{lokasi}", "Lokasi"], ["{acara}", "Nama acara"]];

// ─── Package entitlements ───────────────────────────────────────────────────

const freeEntrances: ElementEntrance[] = ["none", "fade", "slide-up"];
const freeReveals: SectionReveal[] = ["inherit", "none", "fade", "slide-up"];
const premiumActions: ElementActionType[] = ["copy", "burst"];

export type LockKind = "entrance" | "reveal" | "loop" | "hover" | "effect" | "rules" | "mode" | "action" | "transition";

/** Whether a value is locked for the package. Used for 🔒 badges and enforcement. */
export function isLocked(plan: PackageCode, kind: LockKind, value: string): boolean {
  if (plan !== "free") return false;
  switch (kind) {
    case "entrance": return !freeEntrances.includes(value as ElementEntrance);
    case "reveal": return !freeReveals.includes(value as SectionReveal);
    case "loop": case "hover": case "effect": return value !== "none";
    case "mode": return value !== "scroll";
    case "transition": return value !== "fade";
    case "action": return premiumActions.includes(value as ElementActionType);
    case "rules": return true;
  }
}

export const maxSectionsFor = (plan: PackageCode) => plan === "free" ? 10 : 20;
export const MAX_ELEMENTS = 30;
export const MAX_RULES = 6;

/** Strips anything the package doesn't include. The renderer always applies this. */
export function limitDesignForPlan(design: InvitationWebDesign, plan: PackageCode): InvitationWebDesign {
  if (plan !== "free") return design;
  return {
    ...design,
    transition: "fade",
    mode: "scroll",
    sections: design.sections.slice(0, maxSectionsFor(plan)).map((section) => ({
      ...section,
      reveal: isLocked(plan, "reveal", section.reveal) ? "fade" : section.reveal,
      effect: "none",
      rules: [],
      elements: section.elements.map((element) => ({
        ...element,
        motion: { ...element.motion, entrance: isLocked(plan, "entrance", element.motion.entrance) ? "fade" : element.motion.entrance, loop: "none", hover: "none" },
        action: isLocked(plan, "action", element.action.type) ? { type: "none", value: "" } : element.action,
      })),
    })),
  };
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const sectionBase = { showDefault: true, background2: "", gradientAngle: 180, backgroundImage: "", overlay: 0, textColor: "", height: "auto", spacing: "normal", contentWidth: "normal", reveal: "inherit", replay: false, effect: "none", rules: [] as SectionRule[], visible: true } as const;

type SectionPreset = Omit<InvitationWebSection, "id" | "elements">;
const preset = (type: InvitationSectionType, eyebrow: string, heading: string, description: string, background: string, layout: InvitationWebSection["layout"], extra: Partial<SectionPreset> = {}): SectionPreset => ({ ...sectionBase, type, eyebrow, heading, description, background, layout, ...extra });

export const sectionPresets: Record<InvitationSectionType, SectionPreset> = {
  hero: preset("hero", "THE WEDDING CELEBRATION", "Hari istimewa kami", "Dengan penuh sukacita, kami mengundang Anda untuk merayakan momen ini bersama.", "#183b32", "center", { height: "screen" }),
  couple: preset("couple", "DENGAN PENUH SUKACITA", "Mempelai", "Dua cerita, satu perjalanan.", "#fbfaf6", "cards"),
  quote: preset("quote", "KALIMAT PEMBUKA", "Dengan kasih dan doa", "", "#f1f3ed", "center"),
  countdown: preset("countdown", "MENUJU HARI BAHAGIA", "Catat tanggalnya", "Kami menantikan hari untuk merayakannya bersama Anda.", "#183b32", "center"),
  event: preset("event", "WAKTU & TEMPAT", "Detail acara", "Simpan informasi acara dan lokasi di halaman ini.", "#fbfaf6", "split"),
  gallery: preset("gallery", "MOMEN KAMI", "Disimpan dalam kenangan", "", "#f1f3ed", "editorial"),
  story: preset("story", "PERJALANAN KAMI", "Satu cerita, banyak kenangan", "Hari ini menjadi satu bab baru dalam perjalanan kami.", "#fbfaf6", "editorial"),
  spotify: preset("spotify", "LAGU PILIHAN", "Sebuah lagu untuk hari ini", "", "#183b32", "center"),
  gifts: preset("gifts", "TANDA KASIH", "Amplop digital", "Doa restu Anda adalah hadiah terbaik bagi kami.", "#f1f3ed", "cards"),
  rsvp: preset("rsvp", "DOA & UCAPAN", "Konfirmasi kehadiran", "Kami akan senang menerima kabar dan doa terbaik dari Anda.", "#fbfaf6", "center"),
  ticket: preset("ticket", "TIKET MASUK", "Check-in tamu", "Tunjukkan QR ini kepada penerima tamu di meja resepsi.", "#f1f3ed", "center"),
  custom: preset("custom", "", "Section baru", "", "#ffffff", "center", { showDefault: false }),
};

const defaultOrder: InvitationSectionType[] = ["hero", "couple", "quote", "countdown", "event", "gallery", "story", "spotify", "gifts", "rsvp"];

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function createSection(type: InvitationSectionType, id = uid(`section-${type}`)): InvitationWebSection {
  return { ...sectionPresets[type], rules: [], id, elements: [] };
}

export function createElement(type: InvitationElementType, accent = "#b85c68", fontFamily = "Georgia"): InvitationElement {
  const base: InvitationElement = {
    id: uid("element"), type, content: "", imageUrl: "", fontFamily, fontSize: 18, fontWeight: 400, italic: false, letterSpacing: 0,
    color: "", background: "", variant: "", align: "center", width: 100, marginTop: 16, frame: "rounded", shadow: "none", filter: "none",
    motion: { entrance: "fade", loop: "none", hover: "none", speed: "normal", delay: 0, easing: "smooth" },
    action: { type: "none", value: "" },
  };
  switch (type) {
    case "heading": return { ...base, content: "Judul baru", fontSize: 40 };
    case "text": return { ...base, content: "Tuliskan teks di sini. Ketik {nama_tamu} untuk menyapa tamu dengan namanya." };
    case "image": return { ...base, content: "Foto undangan", width: 70, shadow: "soft" };
    case "button": return { ...base, content: "Buka lokasi", variant: "solid", background: accent, color: "#ffffff", fontSize: 15, fontWeight: 600, width: 40, action: { type: "maps", value: "" }, motion: { ...base.motion, hover: "lift" } };
    case "divider": return { ...base, variant: "ornament", content: "✦", color: accent, width: 50 };
    case "ornament": return { ...base, content: "❦", fontSize: 44, color: accent, motion: { ...base.motion, loop: "float" } };
    case "spacer": return { ...base, fontSize: 40, motion: { ...base.motion, entrance: "none" } };
    case "countdown": return { ...base, fontSize: 32, color: accent };
  }
}

export function createDefaultInvitationWebDesign(): InvitationWebDesign {
  return { version: 2, transition: "fade", mode: "scroll", showNav: true, fontFamily: "Georgia", headingFont: "Playfair Display", sections: defaultOrder.map((type, index) => createSection(type, `section-${type}-${index + 1}`)) };
}

// ─── Theme presets ("Tema cepat") ────────────────────────────────────────────

export type ThemePreset = { id: string; name: string; dark: string; light: string; soft: string; accent: string; headingFont: string; fontFamily: string; effect: BackgroundEffect };
export const themePresets: ThemePreset[] = [
  { id: "emerald", name: "Royal Emerald & Gold", dark: "#0f281e", light: "#f8f9f6", soft: "#e5ece6", accent: "#d4af37", headingFont: "Cormorant Garamond", fontFamily: "Lora", effect: "sparkle" },
  { id: "terracotta", name: "Terracotta Boho Rustic", dark: "#3a1d13", light: "#fbf6f0", soft: "#f2e4d8", accent: "#c86d51", headingFont: "Playfair Display", fontFamily: "Poppins", effect: "leaves" },
  { id: "blush", name: "Romantic Blush Blossom", dark: "#481c26", light: "#fff8f9", soft: "#fbebee", accent: "#d87082", headingFont: "Great Vibes", fontFamily: "Cormorant Garamond", effect: "petals" },
  { id: "navy", name: "Classic Navy & Champagne", dark: "#0f172a", light: "#f8fafc", soft: "#e2e8f0", accent: "#e2b86b", headingFont: "Cinzel", fontFamily: "Lora", effect: "sparkle" },
  { id: "nusantara", name: "Nusantara Dayak Heritage", dark: "#2c1507", light: "#fdf8f0", soft: "#f5e8d3", accent: "#d49a37", headingFont: "Playfair Display", fontFamily: "Lora", effect: "sparkle" },
  { id: "editorial", name: "Modern Editorial Monochrome", dark: "#18181b", light: "#ffffff", soft: "#f4f4f5", accent: "#71717a", headingFont: "Montserrat", fontFamily: "Poppins", effect: "none" },
];

export function applyThemePreset(design: InvitationWebDesign, theme: ThemePreset): InvitationWebDesign {
  const darkTypes: InvitationSectionType[] = ["hero", "countdown", "spotify"];
  return {
    ...design, headingFont: theme.headingFont, fontFamily: theme.fontFamily,
    sections: design.sections.map((section, index) => ({
      ...section,
      background: darkTypes.includes(section.type) ? theme.dark : index % 2 ? theme.soft : theme.light,
      background2: "", textColor: "",
      effect: section.type === "hero" ? theme.effect : section.effect,
      elements: section.elements.map((element) => element.type === "button" ? { ...element, background: theme.accent } : ["ornament", "divider", "countdown"].includes(element.type) ? { ...element, color: theme.accent } : element),
    })),
  };
}

// ─── Ready-to-Use Complete Templates ─────────────────────────────────────────

export type ReadyTemplate = {
  id: string;
  name: string;
  badge: string;
  description: string;
  primary: string;
  accent: string;
  soft: string;
  headingFont: string;
  fontFamily: string;
  effect: BackgroundEffect;
  thumbnailGradient: string;
  build: (eventInfo?: { title?: string; groom?: string; bride?: string; date?: string; location?: string; quote?: string }) => InvitationWebDesign;
};

export const readyTemplates: ReadyTemplate[] = [
  {
    id: "emerald-gold",
    name: "Royal Emerald & Gold",
    badge: "Mewah & Klasik",
    description: "Nuansa hijau zamrud berpadu emas megah, bingkai lengkung agung, terinspirasi dari gaya Gentia & Bornok dan Shifa & Affan.",
    primary: "#0f281e",
    accent: "#d4af37",
    soft: "#e5ece6",
    headingFont: "Cormorant Garamond",
    fontFamily: "Lora",
    effect: "sparkle",
    thumbnailGradient: "linear-gradient(135deg, #0f281e 0%, #1e4d3b 55%, #d4af37 100%)",
    build: (info) => {
      const groom = info?.groom || "Mempelai Pria";
      const bride = info?.bride || "Mempelai Wanita";
      return {
        version: 2,
        transition: "fade",
        mode: "scroll",
        showNav: true,
        headingFont: "Cormorant Garamond",
        fontFamily: "Lora",
        sections: [
          {
            ...createSection("hero", uid("sec-hero")),
            eyebrow: "THE WEDDING CELEBRATION OF",
            heading: `${groom} & ${bride}`,
            description: "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan syukuran pernikahan kami.",
            background: "#0f281e",
            effect: "sparkle",
            height: "screen",
            elements: [
              { ...createElement("ornament", "#d4af37", "Cormorant Garamond"), content: "❦", fontSize: 48, motion: { entrance: "zoom-in", loop: "float", hover: "glow", speed: "normal", delay: 100, easing: "smooth" } },
              { ...createElement("button", "#d4af37", "Lora"), content: "Buka Undangan", action: { type: "section", value: "sec-quote" }, motion: { entrance: "slide-up", loop: "pulse", hover: "lift", speed: "normal", delay: 300, easing: "smooth" } },
            ],
          },
          {
            ...createSection("quote", uid("sec-quote")),
            eyebrow: "SURAT AR-RUM AYAT 21",
            heading: "Ikatan Suci Sepenuh Kasih",
            description: info?.quote || "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
            background: "#f8f9f6",
            elements: [
              { ...createElement("divider", "#d4af37", "Lora"), variant: "ornament", content: "✦" },
            ],
          },
          {
            ...createSection("couple", uid("sec-couple")),
            eyebrow: "DENGAN PENUH RASA SYUKUR",
            heading: "Mempelai Bahagia",
            description: "Maha Suci Allah yang telah mempertemukan kami dalam suatu ikatan suci pernikahan.",
            background: "#e5ece6",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("event", uid("sec-event")),
            eyebrow: "WAKTU & TEMPAT",
            heading: "Rangkaian Acara",
            description: "Kehadiran dan doa restu Bapak/Ibu/Saudara/i sekalian merupakan kehormatan dan kebahagiaan yang tak terhingga bagi kami.",
            background: "#f8f9f6",
            layout: "split",
            elements: [],
          },
          {
            ...createSection("countdown", uid("sec-countdown")),
            eyebrow: "MENGHITUNG HARI",
            heading: "Menuju Hari Bahagia",
            description: "Setiap detik yang berharga mendekatkan kami menuju janji suci seumur hidup.",
            background: "#0f281e",
            effect: "sparkle",
            elements: [
              { ...createElement("countdown", "#d4af37", "Cormorant Garamond"), fontSize: 34 },
            ],
          },
          {
            ...createSection("story", uid("sec-story")),
            eyebrow: "OUR LOVE STORY",
            heading: "Perjalanan Cinta Kami",
            description: "Kisah pertemuan singkat yang bertumbuh menjadi komitmen abadi.",
            background: "#e5ece6",
            elements: [],
          },
          {
            ...createSection("gallery", uid("sec-gallery")),
            eyebrow: "MOMEN INDAH",
            heading: "Galeri Foto Prewedding",
            description: "Setiap potret menyimpan tawa, cerita, dan doa yang kami panjatkan bersama.",
            background: "#f8f9f6",
            elements: [],
          },
          {
            ...createSection("gifts", uid("sec-gifts")),
            eyebrow: "TANDA KASIH",
            heading: "Amplop Digital & Kado",
            description: "Doa restu Anda adalah karunia terindah. Bagi yang ingin mengirimkan tanda kasih, dapat melalui rekening berikut.",
            background: "#e5ece6",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("rsvp", uid("sec-rsvp")),
            eyebrow: "BUKU TAMU & UCAPAN",
            heading: "Konfirmasi Kehadiran",
            description: "Merupakan suatu kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.",
            background: "#f8f9f6",
            elements: [],
          },
        ],
      };
    },
  },
  {
    id: "terracotta-rustic",
    name: "Terracotta Boho Rustic",
    badge: "Rustic & Hangat",
    description: "Palet tanah liat hangat berpadu sentuhan pampas kering, estetik dan romantis seperti gaya Dita & Adit serta Neni & Angga.",
    primary: "#3a1d13",
    accent: "#c86d51",
    soft: "#f2e4d8",
    headingFont: "Playfair Display",
    fontFamily: "Poppins",
    effect: "leaves",
    thumbnailGradient: "linear-gradient(135deg, #3a1d13 0%, #6b3320 55%, #c86d51 100%)",
    build: (info) => {
      const groom = info?.groom || "Mempelai Pria";
      const bride = info?.bride || "Mempelai Wanita";
      return {
        version: 2,
        transition: "slide",
        mode: "scroll",
        showNav: true,
        headingFont: "Playfair Display",
        fontFamily: "Poppins",
        sections: [
          {
            ...createSection("hero", uid("sec-hero")),
            eyebrow: "WEDDING INVITATION",
            heading: `${groom} & ${bride}`,
            description: "Dua hati yang menyatu, mengundang Anda untuk menjadi saksi hari bahagia kami.",
            background: "#3a1d13",
            effect: "leaves",
            height: "screen",
            elements: [
              { ...createElement("ornament", "#c86d51", "Playfair Display"), content: "✦", fontSize: 32 },
              { ...createElement("button", "#c86d51", "Poppins"), content: "Buka Undangan", action: { type: "section", value: "sec-quote" }, motion: { entrance: "slide-up", loop: "pulse", hover: "lift", speed: "normal", delay: 200, easing: "smooth" } },
            ],
          },
          {
            ...createSection("quote", uid("sec-quote")),
            eyebrow: "UNTUK SELAMANYA",
            heading: "Kasih yang Menumbuhkan",
            description: info?.quote || "Cinta bukan tentang mencari orang yang sempurna, melainkan belajar mencintai orang yang tak sempurna dengan cara yang sempurna.",
            background: "#fbf6f0",
            elements: [],
          },
          {
            ...createSection("couple", uid("sec-couple")),
            eyebrow: "THE HAPPY COUPLE",
            heading: "Kedua Mempelai",
            description: "Dua jiwa yang saling menemukan di bawah semesta yang sama.",
            background: "#f2e4d8",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("event", uid("sec-event")),
            eyebrow: "SAVE THE DATE",
            heading: "Hari Bahagia Kami",
            description: "Temukan lokasi dan simpan jadwal acara ke kalender Anda.",
            background: "#fbf6f0",
            layout: "split",
            elements: [],
          },
          {
            ...createSection("countdown", uid("sec-countdown")),
            eyebrow: "MENUJU HARI-H",
            heading: "Hitung Mundur",
            description: "Waktu bergulir menanti perayaan kebersamaan.",
            background: "#3a1d13",
            effect: "leaves",
            elements: [
              { ...createElement("countdown", "#c86d51", "Playfair Display"), fontSize: 32 },
            ],
          },
          {
            ...createSection("story", uid("sec-story")),
            eyebrow: "OUR CHAPTERS",
            heading: "Linimasa Kisah Kami",
            description: "Setiap langkah kecil yang membawa kami hingga ke titik ini.",
            background: "#f2e4d8",
            elements: [],
          },
          {
            ...createSection("gifts", uid("sec-gifts")),
            eyebrow: "KADO PERNIKAHAN",
            heading: "Amplop Digital",
            description: "Kehadiran Anda adalah hadiah terbaik, namun jika ingin berbagi tanda kasih, terima kasih banyak atas kebaikan Anda.",
            background: "#fbf6f0",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("rsvp", uid("sec-rsvp")),
            eyebrow: "RSVP & WISHES",
            heading: "Kirim Ucapan & Doa",
            description: "Tuliskan doa dan konfirmasi kehadiran Anda untuk menyempurnakan hari bahagia kami.",
            background: "#f2e4d8",
            elements: [],
          },
        ],
      };
    },
  },
  {
    id: "blush-blossom",
    name: "Romantic Blush Blossom",
    badge: "Bunga & Romantis",
    description: "Merah muda lembut berpadu hujan kelopak bunga, anggun dan manis seperti gaya Sari & Ripan dan Peny & Andika.",
    primary: "#481c26",
    accent: "#d87082",
    soft: "#fbebee",
    headingFont: "Great Vibes",
    fontFamily: "Cormorant Garamond",
    effect: "petals",
    thumbnailGradient: "linear-gradient(135deg, #481c26 0%, #873849 55%, #d87082 100%)",
    build: (info) => {
      const groom = info?.groom || "Mempelai Pria";
      const bride = info?.bride || "Mempelai Wanita";
      return {
        version: 2,
        transition: "fade",
        mode: "scroll",
        showNav: true,
        headingFont: "Great Vibes",
        fontFamily: "Cormorant Garamond",
        sections: [
          {
            ...createSection("hero", uid("sec-hero")),
            eyebrow: "WALIMATUL 'URSY",
            heading: `${groom} & ${bride}`,
            description: "Dengan penuh rasa syukur kami mengundang Anda merayakan momen terindah ini bersama kami.",
            background: "#481c26",
            effect: "petals",
            height: "screen",
            elements: [
              { ...createElement("ornament", "#d87082", "Great Vibes"), content: "♥", fontSize: 40, motion: { entrance: "bounce", loop: "heartbeat", hover: "grow", speed: "normal", delay: 100, easing: "bounce" } },
              { ...createElement("button", "#d87082", "Cormorant Garamond"), content: "Buka Undangan", action: { type: "section", value: "sec-quote" }, motion: { entrance: "slide-up", loop: "pulse", hover: "lift", speed: "normal", delay: 250, easing: "smooth" } },
            ],
          },
          {
            ...createSection("quote", uid("sec-quote")),
            eyebrow: "DOA KAMI",
            heading: "Cinta Dalam Doa",
            description: info?.quote || "Ya Tuhan kami, anugerahkanlah kepada kami pasangan dan keturunan kami sebagai penyejuk hati kami, dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa.",
            background: "#fff8f9",
            elements: [],
          },
          {
            ...createSection("couple", uid("sec-couple")),
            eyebrow: "MEMPELAI",
            heading: "Kedua Mempelai",
            description: "Bersama keluarga tercinta kami melangkah ke gerbang rumah tangga yang sakinah.",
            background: "#fbebee",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("event", uid("sec-event")),
            eyebrow: "WAKTU & LOKASI",
            heading: "Agenda Acara",
            description: "Doa dan kehadiran Anda adalah berkah bagi langkah awal kami.",
            background: "#fff8f9",
            layout: "split",
            elements: [],
          },
          {
            ...createSection("countdown", uid("sec-countdown")),
            eyebrow: "MENUJU HARI H",
            heading: "Menghitung Hari Bahagia",
            description: "Detik-detik menuju hari terindah dalam hidup kami.",
            background: "#481c26",
            effect: "petals",
            elements: [
              { ...createElement("countdown", "#d87082", "Great Vibes"), fontSize: 36 },
            ],
          },
          {
            ...createSection("story", uid("sec-story")),
            eyebrow: "CERITA KITA",
            heading: "Kisah Kasih",
            description: "Sebuah perjalanan indah yang kami ukir bersama.",
            background: "#fbebee",
            elements: [],
          },
          {
            ...createSection("gifts", uid("sec-gifts")),
            eyebrow: "TANDA KASIH",
            heading: "Amplop Digital",
            description: "Tanda kasih dan doa restu Anda sangat berarti bagi kami.",
            background: "#fff8f9",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("rsvp", uid("sec-rsvp")),
            eyebrow: "KONFIRMASI",
            heading: "Buku Tamu & Ucapan",
            description: "Kirimkan doa terbaik Anda untuk kami berdua.",
            background: "#fbebee",
            elements: [],
          },
        ],
      };
    },
  },
  {
    id: "navy-champagne",
    name: "Classic Navy & Champagne",
    badge: "Ballroom & Katedral",
    description: "Biru dongker pekat berpadu emas sampanye megah, berkelas untuk pernikahan katedral atau ballroom seperti gaya Defitri & Alexander.",
    primary: "#0b1325",
    accent: "#e2b86b",
    soft: "#e2e8f0",
    headingFont: "Cinzel",
    fontFamily: "Lora",
    effect: "sparkle",
    thumbnailGradient: "linear-gradient(135deg, #0b1325 0%, #1e293b 55%, #e2b86b 100%)",
    build: (info) => {
      const groom = info?.groom || "Mempelai Pria";
      const bride = info?.bride || "Mempelai Wanita";
      return {
        version: 2,
        transition: "zoom",
        mode: "scroll",
        showNav: true,
        headingFont: "Cinzel",
        fontFamily: "Lora",
        sections: [
          {
            ...createSection("hero", uid("sec-hero")),
            eyebrow: "THE HOLY MATRIMONY OF",
            heading: `${groom} & ${bride}`,
            description: "Together with our families, we joyfully invite you to celebrate our marriage.",
            background: "#0b1325",
            effect: "sparkle",
            height: "screen",
            elements: [
              { ...createElement("ornament", "#e2b86b", "Cinzel"), content: "✦", fontSize: 36, motion: { entrance: "zoom-in", loop: "shimmer", hover: "glow", speed: "normal", delay: 100, easing: "smooth" } },
              { ...createElement("button", "#e2b86b", "Lora"), content: "Buka Undangan", action: { type: "section", value: "sec-quote" }, motion: { entrance: "slide-up", loop: "pulse", hover: "lift", speed: "normal", delay: 250, easing: "smooth" } },
            ],
          },
          {
            ...createSection("quote", uid("sec-quote")),
            eyebrow: "KOLOSE 3:14",
            heading: "Janji Suci Dalam Kasih",
            description: info?.quote || "Dan di atas semuanya itu: kenakanlah kasih, sebagai pengikat yang mempersatukan dan menyempurnakan.",
            background: "#f8fafc",
            elements: [],
          },
          {
            ...createSection("couple", uid("sec-couple")),
            eyebrow: "THE BRIDE & GROOM",
            heading: "Kedua Mempelai",
            description: "Dipersatukan oleh kasih Tuhan untuk mengarungi bahtera kehidupan bersama.",
            background: "#e2e8f0",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("event", uid("sec-event")),
            eyebrow: "PEMBERKATAN & RESEPSI",
            heading: "Rangkaian Ibadah & Acara",
            description: "Kami sangat mengharapkan kehadiran Anda dalam doa dan perayaan ini.",
            background: "#f8fafc",
            layout: "split",
            elements: [],
          },
          {
            ...createSection("countdown", uid("sec-countdown")),
            eyebrow: "COUNTDOWN",
            heading: "Menghitung Hari Pemberkatan",
            description: "Menuju hari di mana kami mengikat janji kudus di hadapan Tuhan dan jemaat.",
            background: "#0b1325",
            effect: "sparkle",
            elements: [
              { ...createElement("countdown", "#e2b86b", "Cinzel"), fontSize: 32 },
            ],
          },
          {
            ...createSection("gifts", uid("sec-gifts")),
            eyebrow: "WEDDING GIFT",
            heading: "Amplop Digital",
            description: "Terima kasih atas tanda kasih dan dukungan yang Anda berikan bagi awal perjalanan kami.",
            background: "#e2e8f0",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("rsvp", uid("sec-rsvp")),
            eyebrow: "GUESTBOOK",
            heading: "Konfirmasi Kehadiran",
            description: "Konfirmasikan kehadiran Anda demi kenyamanan pelaksanaan acara bersama.",
            background: "#f8fafc",
            elements: [],
          },
        ],
      };
    },
  },
  {
    id: "nusantara-dayak",
    name: "Nusantara Dayak Heritage",
    badge: "Adat & Budaya",
    description: "Keagungan adat Dayak dan Nusantara dengan sentuhan keemasan sakral, mencerminkan kearifan lokal Palangka Raya.",
    primary: "#2c1507",
    accent: "#d49a37",
    soft: "#f5e8d3",
    headingFont: "Playfair Display",
    fontFamily: "Lora",
    effect: "sparkle",
    thumbnailGradient: "linear-gradient(135deg, #2c1507 0%, #54270d 55%, #d49a37 100%)",
    build: (info) => {
      const groom = info?.groom || "Mempelai Pria";
      const bride = info?.bride || "Mempelai Wanita";
      return {
        version: 2,
        transition: "fade",
        mode: "scroll",
        showNav: true,
        headingFont: "Playfair Display",
        fontFamily: "Lora",
        sections: [
          {
            ...createSection("hero", uid("sec-hero")),
            eyebrow: "TABE SALAMAT, PERAYAAN PERNIKAHAN",
            heading: `${groom} & ${bride}`,
            description: "Dengan menjunjung tinggi adat istiadat dan rasa syukur, kami mengundang sanak saudara dan kerabat tercinta.",
            background: "#2c1507",
            effect: "sparkle",
            height: "screen",
            elements: [
              { ...createElement("ornament", "#d49a37", "Playfair Display"), content: "❦", fontSize: 44 },
              { ...createElement("button", "#d49a37", "Lora"), content: "Buka Undangan", action: { type: "section", value: "sec-quote" }, motion: { entrance: "slide-up", loop: "pulse", hover: "lift", speed: "normal", delay: 200, easing: "smooth" } },
            ],
          },
          {
            ...createSection("quote", uid("sec-quote")),
            eyebrow: "PETUAH & DOA RESTU",
            heading: "Menjaga Janji Adat & Hati",
            description: info?.quote || "Mengikat janji dalam kerukunan, saling menghormati dan berjalan beriringan membangun keluarga yang sejahtera.",
            background: "#fdf8f0",
            elements: [],
          },
          {
            ...createSection("couple", uid("sec-couple")),
            eyebrow: "MEMPELAI & KELUARGA BESAR",
            heading: "Kedua Mempelai",
            description: "Penyatuan dua keluarga besar dalam ikatan kekeluargaan yang erat dan penuh berkah.",
            background: "#f5e8d3",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("event", uid("sec-event")),
            eyebrow: "ACARA PERNIKAHAN",
            heading: "Jadwal & Tempat",
            description: "Kehadiran dan doa restu kerabat adalah kehormatan bagi kami sekeluarga.",
            background: "#fdf8f0",
            layout: "split",
            elements: [],
          },
          {
            ...createSection("countdown", uid("sec-countdown")),
            eyebrow: "MENUJU HARI BAHAGIA",
            heading: "Hitung Mundur Acara",
            description: "Menghitung hari menuju perayaan sakral adat dan kebersamaan.",
            background: "#2c1507",
            effect: "sparkle",
            elements: [
              { ...createElement("countdown", "#d49a37", "Playfair Display"), fontSize: 32 },
            ],
          },
          {
            ...createSection("gifts", uid("sec-gifts")),
            eyebrow: "TANDA KASIH",
            heading: "Amplop Digital",
            description: "Doa restu sanak keluarga adalah hadiah terbaik bagi kedua mempelai.",
            background: "#f5e8d3",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("rsvp", uid("sec-rsvp")),
            eyebrow: "BUKU TAMU",
            heading: "Doa Restu Kerabat",
            description: "Sampaikan kabar kehadiran dan untaian doa Anda.",
            background: "#fdf8f0",
            elements: [],
          },
        ],
      };
    },
  },
  {
    id: "editorial-monochrome",
    name: "Modern Editorial Monochrome",
    badge: "Minimalis & Modern",
    description: "Desain majalah kontemporer hitam putih bersih, tegas, dan modern seperti gaya Sanah & Ufiq.",
    primary: "#121214",
    accent: "#71717a",
    soft: "#f4f4f5",
    headingFont: "Montserrat",
    fontFamily: "Poppins",
    effect: "none",
    thumbnailGradient: "linear-gradient(135deg, #121214 0%, #27272a 55%, #71717a 100%)",
    build: (info) => {
      const groom = info?.groom || "Mempelai Pria";
      const bride = info?.bride || "Mempelai Wanita";
      return {
        version: 2,
        transition: "slide",
        mode: "scroll",
        showNav: true,
        headingFont: "Montserrat",
        fontFamily: "Poppins",
        sections: [
          {
            ...createSection("hero", uid("sec-hero")),
            eyebrow: "ISSUE NO. 01 / WEDDING EDITION",
            heading: `${groom.toUpperCase()} & ${bride.toUpperCase()}`,
            description: "A celebration of modern love. You are warmly invited to witness our story begin.",
            background: "#121214",
            effect: "none",
            height: "screen",
            elements: [
              { ...createElement("divider", "#71717a", "Montserrat"), variant: "line" },
              { ...createElement("button", "#71717a", "Poppins"), content: "VIEW INVITATION", action: { type: "section", value: "sec-quote" }, motion: { entrance: "fade", loop: "none", hover: "lift", speed: "normal", delay: 200, easing: "sharp" } },
            ],
          },
          {
            ...createSection("quote", uid("sec-quote")),
            eyebrow: "THE WORDS",
            heading: "Simplicity in Love",
            description: info?.quote || "Two individuals, once separate stories, now writing one lifetime together.",
            background: "#ffffff",
            elements: [],
          },
          {
            ...createSection("couple", uid("sec-couple")),
            eyebrow: "THE COUPLE",
            heading: "Meet the Bride & Groom",
            description: "Surrounded by our loved ones, stepping into a new adventure.",
            background: "#f4f4f5",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("event", uid("sec-event")),
            eyebrow: "THE DETAILS",
            heading: "Date & Location",
            description: "Join us for the ceremony and reception.",
            background: "#ffffff",
            layout: "split",
            elements: [],
          },
          {
            ...createSection("countdown", uid("sec-countdown")),
            eyebrow: "COUNTDOWN",
            heading: "Counting Down the Days",
            description: "Every minute brings us closer.",
            background: "#121214",
            elements: [
              { ...createElement("countdown", "#ffffff", "Montserrat"), fontSize: 30 },
            ],
          },
          {
            ...createSection("story", uid("sec-story")),
            eyebrow: "TIMELINE",
            heading: "How It Started",
            description: "Key milestones of our journey.",
            background: "#f4f4f5",
            elements: [],
          },
          {
            ...createSection("gifts", uid("sec-gifts")),
            eyebrow: "DIGITAL ENVELOPE",
            heading: "Wedding Gift",
            description: "Your presence is our greatest gift. For cashless well-wishing:",
            background: "#ffffff",
            layout: "cards",
            elements: [],
          },
          {
            ...createSection("rsvp", uid("sec-rsvp")),
            eyebrow: "CONFIRMATION",
            heading: "RSVP Online",
            description: "Please let us know if you can make it.",
            background: "#f4f4f5",
            elements: [],
          },
        ],
      };
    },
  },
];

// ─── Colour helpers ──────────────────────────────────────────────────────────

export function isDarkColor(hex: string) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return false;
  const value = parseInt(match[1] ?? "0", 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

// ─── Normalisation (accepts v1 and v2, drops anything unknown) ──────────────

const pick = <T extends string>(value: unknown, options: readonly T[], fallback: T): T => options.includes(value as T) ? value as T : fallback;
const pickOpt = <T extends string>(value: unknown, options: Array<[T, string]>, fallback: T): T => pick(value, options.map(([key]) => key), fallback);
const hex = (value: unknown, fallback: string) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
const optionalHex = (value: unknown) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : "";
const text = (value: unknown, max: number, fallback = "") => typeof value === "string" ? value.slice(0, max) : fallback;
const num = (value: unknown, min: number, max: number, fallback: number) => Number.isFinite(Number(value)) && value !== "" && value !== null ? Math.min(max, Math.max(min, Number(value))) : fallback;

/** Only http(s) URLs or uploaded Kalakai assets may be used as images. */
export function safeAssetUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const url = value.trim().slice(0, 2000);
  if (/^https?:\/\/[^\s"'()<>\\]+$/i.test(url)) return url;
  if (/^\/api\/assets\/undangan-assets\/[A-Za-z0-9._\/-]+$/.test(url) && !url.includes("..")) return url;
  return "";
}

const sectionTypes = Object.keys(invitationSectionLabels) as InvitationSectionType[];
const elementTypes = Object.keys(elementLabels) as InvitationElementType[];

function normalizeElement(input: Record<string, unknown>, index: string, fontFamily: string): InvitationElement | null {
  const legacyType = input.type === "text" || input.type === "image" || input.type === "divider" || input.type === "ornament" || input.type === "button";
  if (!elementTypes.includes(input.type as InvitationElementType) && !legacyType) return null;
  const type = input.type as InvitationElementType;
  const defaults = createElement(type, "#b85c68", fontFamily);
  const motion = (input.motion && typeof input.motion === "object" ? input.motion : {}) as Record<string, unknown>;
  const action = (input.action && typeof input.action === "object" ? input.action : null) as Record<string, unknown> | null;
  // v1 buttons stored a raw linkUrl; translate it into the matching action.
  const legacyLink = text(input.linkUrl, 2000);
  const legacyAction: ElementAction = type === "button" && legacyLink ? (legacyLink.startsWith("#") ? { type: legacyLink === "#rsvp" ? "rsvp" : "section", value: legacyLink.slice(1) } : { type: "link", value: legacyLink }) : defaults.action;
  return {
    id: text(input.id, 80) || `element-${index}`,
    type,
    content: text(input.content, 1500, defaults.content),
    imageUrl: safeAssetUrl(input.imageUrl),
    fontFamily: pick(input.fontFamily, fontOptions, fontFamily),
    fontSize: num(input.fontSize, 10, 120, defaults.fontSize),
    fontWeight: ([400, 600, 700] as const).includes(Number(input.fontWeight) as 400) ? Number(input.fontWeight) as 400 | 600 | 700 : defaults.fontWeight,
    italic: input.italic === true,
    letterSpacing: num(input.letterSpacing, 0, 20, 0),
    color: optionalHex(input.color),
    background: optionalHex(input.background) || defaults.background,
    variant: text(input.variant, 20, defaults.variant),
    align: pick(input.align, ["left", "center", "right"] as const, "center"),
    width: num(input.width, 10, 100, defaults.width),
    marginTop: num(input.marginTop, 0, 160, defaults.marginTop),
    frame: pickOpt(input.frame, frameOptions, "rounded"),
    shadow: input.shadow === true ? "soft" : input.shadow === false ? "none" : pickOpt(input.shadow, shadowOptions, defaults.shadow),
    filter: pickOpt(input.filter, filterOptions, "none"),
    motion: {
      entrance: pickOpt(motion.entrance, entranceOptions, input.motion ? "none" : defaults.motion.entrance),
      loop: pickOpt(motion.loop, loopOptions, input.motion ? "none" : defaults.motion.loop),
      hover: pickOpt(motion.hover, hoverOptions, input.motion ? "none" : defaults.motion.hover),
      speed: pick(motion.speed, ["slow", "normal", "fast"] as const, "normal"),
      delay: num(motion.delay, 0, 5000, 0),
      easing: pick(motion.easing, ["smooth", "bounce", "sharp"] as const, "smooth"),
    },
    action: action ? { type: pickOpt(action.type, actionOptions, "none"), value: text(action.value, 500) } : legacyAction,
  };
}

function normalizeRule(input: unknown, index: number): SectionRule | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  return { id: text(value.id, 80) || `rule-${index}`, when: pickOpt(value.when, ruleWhenOptions, "first"), action: pickOpt(value.action, ruleActionOptions, "burst"), value: text(value.value, 200), delay: num(value.delay, 0, 10000, 0) };
}

export function normalizeInvitationWebDesign(input: unknown): InvitationWebDesign {
  const fallback = createDefaultInvitationWebDesign();
  if (!input || typeof input !== "object") return fallback;
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.sections)) return fallback;
  const fontFamily = pick(value.fontFamily, fontOptions, "Georgia");
  const sections = value.sections.slice(0, 20).flatMap((raw, index): InvitationWebSection[] => {
    if (!raw || typeof raw !== "object") return [];
    const section = raw as Record<string, unknown>;
    if (!sectionTypes.includes(section.type as InvitationSectionType)) return [];
    const type = section.type as InvitationSectionType;
    const base = sectionPresets[type];
    return [{
      id: text(section.id, 80) || `section-${index + 1}`,
      type,
      eyebrow: text(section.eyebrow, 100, base.eyebrow),
      heading: text(section.heading, 180, base.heading),
      description: text(section.description, 1200, base.description),
      showDefault: section.showDefault === undefined ? base.showDefault : section.showDefault !== false,
      background: hex(section.background, base.background),
      background2: optionalHex(section.background2),
      gradientAngle: num(section.gradientAngle, 0, 360, 180),
      backgroundImage: safeAssetUrl(section.backgroundImage),
      overlay: num(section.overlay, 0, 90, 0),
      textColor: optionalHex(section.textColor),
      layout: pick(section.layout, ["center", "split", "cards", "editorial"] as const, base.layout),
      height: pick(section.height, ["auto", "screen"] as const, base.height),
      spacing: pick(section.spacing, ["compact", "normal", "spacious"] as const, "normal"),
      contentWidth: pick(section.contentWidth, ["narrow", "normal", "wide"] as const, "normal"),
      reveal: pickOpt(section.reveal, revealOptions, "inherit"),
      replay: section.replay === true,
      effect: pickOpt(section.effect, effectOptions, "none"),
      rules: Array.isArray(section.rules) ? section.rules.slice(0, MAX_RULES).flatMap((rule, ruleIndex) => normalizeRule(rule, ruleIndex) ?? []) : [],
      visible: section.visible !== false,
      elements: Array.isArray(section.elements) ? section.elements.slice(0, MAX_ELEMENTS).flatMap((element, elementIndex) => element && typeof element === "object" ? normalizeElement(element as Record<string, unknown>, `${index}-${elementIndex}`, fontFamily) ?? [] : []) : [],
    }];
  });
  return {
    version: 2,
    transition: pick(value.transition, ["fade", "slide", "flip", "zoom"] as const, "fade"),
    mode: pick(value.mode, ["scroll", "pages"] as const, "scroll"),
    showNav: value.showNav !== false,
    fontFamily,
    headingFont: pick(value.headingFont, fontOptions, value.version === 2 ? fontFamily : "Georgia"),
    sections: sections.length ? sections : fallback.sections,
  };
}
