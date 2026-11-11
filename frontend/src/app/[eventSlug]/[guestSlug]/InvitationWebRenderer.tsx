"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, EyeOff, GripVertical, ImagePlus, Trash2 } from "lucide-react";
import { contrastRatio, mixColor, readableColor } from "@/lib/template-colors";
import {
  fontStack, googleFonts, googleFontsHref, invitationSectionLabels, elementLabels, isDarkColor,
  type BurstEffect, type ElementAction, type InvitationElement, type InvitationElementType, type InvitationSectionType,
  type InvitationWebDesign, type InvitationWebSection, type RuleAction, type SectionReveal,
} from "../../invitation-web-types";

// ─── Public types ────────────────────────────────────────────────────────────

export type RendererEvent = {
  title: string;
  event_type?: string;
  groom_name: string | null;
  bride_name: string | null;
  event_date: string | null;
  location_name: string | null;
  location_address: string | null;
  map_url: string | null;
  spotify_track_id: string | null;
  theme_config: { quote?: string; quote_source?: string; hero_image_url?: string; love_story?: Array<{ year: string; title: string; desc: string }> } | null;
};

export type DropPayload = { kind: "new"; type: string } | { kind: "move"; id: string; from?: string };
export type SectionCommand = "up" | "down" | "duplicate" | "delete";

export type EditorBindings = {
  /** Preview mode: clicks run actions and rules like a guest would see. */
  interactive: boolean;
  selectedSection: string | null;
  selectedElement: string | null;
  playKey: number;
  onSelectSection: (id: string) => void;
  onSelectElement: (sectionId: string, elementId: string) => void;
  onDropSection: (index: number, payload: DropPayload) => void;
  onDropElement: (sectionId: string, index: number, payload: DropPayload) => void;
  onSectionCommand: (id: string, command: SectionCommand) => void;
  onElementCommand: (sectionId: string, elementId: string, command: SectionCommand) => void;
  onUpdateElementText?: (sectionId: string, elementId: string, text: string) => void;
  onUpdateSectionText?: (sectionId: string, field: "eyebrow" | "heading" | "description", text: string) => void;
  onUpdateEventText?: (field: "groom_name" | "bride_name" | "title" | "location_name" | "location_address" | "quote", text: string) => void;
};

type Props = {
  design: InvitationWebDesign;
  event: RendererEvent;
  guestName?: string;
  primary?: string;
  accent?: string;
  slots?: Partial<Record<"gifts" | "rsvp" | "ticket", ReactNode>>;
  onMusic?: (action: "play" | "pause" | "toggle") => void;
  edit?: EditorBindings;
  loadAllFonts?: boolean;
};

export const DND = {
  newSection: "application/x-kalakai-new-section",
  moveSection: "application/x-kalakai-move-section",
  newElement: "application/x-kalakai-new-element",
  moveElement: "application/x-kalakai-move-element",
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const transitionToReveal: Record<InvitationWebDesign["transition"], SectionReveal> = { fade: "fade", slide: "slide-up", flip: "flip", zoom: "zoom" };
const speedMs = { slow: 1400, normal: 850, fast: 500 } as const;
const easings = { smooth: "cubic-bezier(.22,.61,.36,1)", bounce: "cubic-bezier(.34,1.56,.64,1)", sharp: "cubic-bezier(.7,0,.3,1)" } as const;
const dateText = (date: string | null) => date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date(date)) : "Tanggal acara menyusul";
const seeded = (index: number, salt: number) => ((index * 9301 + salt * 49297) % 233280) / 233280;

function useCountdown(date: string | null) {
  const [left, setLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!date) return;
    const target = new Date(date).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setLeft({ days: Math.floor(diff / 86_400_000), hours: Math.floor(diff % 86_400_000 / 3_600_000), minutes: Math.floor(diff % 3_600_000 / 60_000), seconds: Math.floor(diff % 60_000 / 1000) });
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [date]);
  return left;
}

function calendarUrl(event: RendererEvent) {
  if (!event.event_date) return "";
  const start = new Date(event.event_date);
  const end = new Date(start.getTime() + 3 * 3_600_000);
  const format = (value: Date) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({ action: "TEMPLATE", text: event.title, dates: `${format(start)}/${format(end)}`, location: [event.location_name, event.location_address].filter(Boolean).join(", ") });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// ─── Effects ─────────────────────────────────────────────────────────────────

type Burst = { id: number; type: BurstEffect; x: number; y: number };

function BurstLayer({ bursts, accent }: { bursts: Burst[]; accent: string }) {
  const palette = [accent, "#f4c95d", "#ffffff", "#e7a3ad", "#9cc5a1"];
  return <div className="iw-burst-layer" aria-hidden="true">{bursts.map((burst) => <div key={burst.id} className={`iw-burst iw-burst-${burst.type}`} style={{ left: burst.x, top: burst.y }}>
    {Array.from({ length: 34 }, (_, index) => {
      const angle = seeded(index + burst.id, 3) * Math.PI * 2;
      const distance = 90 + seeded(index, burst.id % 7 + 1) * 190;
      return <i key={index} style={{ "--x": `${Math.cos(angle) * distance}px`, "--y": `${Math.sin(angle) * distance - 60}px`, "--r": `${seeded(index, 11) * 720 - 360}deg`, "--c": palette[index % palette.length], "--d": `${seeded(index, 5) * 160}ms` } as CSSProperties}>{burst.type === "hearts" ? "♥" : burst.type === "sparkle" ? "✦" : ""}</i>;
    })}
  </div>)}</div>;
}

function BackgroundFx({ type }: { type: InvitationWebSection["effect"] }) {
  if (type === "none") return null;
  return <div className={`iw-fx iw-fx-${type}`} aria-hidden="true">{Array.from({ length: 16 }, (_, index) => <i key={index} style={{
    left: `${seeded(index, 2) * 100}%`,
    animationDelay: `${-seeded(index, 4) * 12}s`,
    animationDuration: `${8 + seeded(index, 6) * 8}s`,
    fontSize: `${10 + seeded(index, 8) * 14}px`,
    ["--s" as string]: `${0.6 + seeded(index, 9) * 0.8}`,
  }}>{type === "hearts" ? "♥" : type === "sparkle" ? "✦" : ""}</i>)}</div>;
}

function TypeText({ text, active, speed }: { text: string; active: boolean; speed: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let current = 0;
    const timer = window.setInterval(() => { current += 1; setCount(current); if (current >= text.length) window.clearInterval(timer); }, speed);
    return () => window.clearInterval(timer);
  }, [active, text, speed]);
  return <>{text.slice(0, count)}<span className="iw-caret" aria-hidden="true">{count < text.length ? "|" : ""}</span><span className="iw-sr-only">{text}</span></>;
}

// ─── Renderer ────────────────────────────────────────────────────────────────

export default function InvitationWebRenderer({ design, event, guestName, primary = "#183b32", accent = "#b85c68", slots, onMusic, edit, loadAllFonts }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState<Record<string, boolean>>({});
  const [seen, setSeen] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<string | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [toast, setToast] = useState("");
  const [dropHint, setDropHint] = useState<{ section: string; index: number } | { between: number } | null>(null);
  const timeLeft = useCountdown(event.event_date);
  const editing = Boolean(edit);
  const live = !edit || edit.interactive;
  const theme = event.theme_config ?? {};
  const names = [event.groom_name, event.bride_name].filter(Boolean).join(" & ") || event.title;
  const sections = useMemo(() => editing ? design.sections : design.sections.filter((section) => section.visible), [design.sections, editing]);

  const fill = useCallback((value: string) => value
    .replaceAll("{nama_tamu}", guestName || "Tamu Undangan")
    .replaceAll("{pasangan}", names)
    .replaceAll("{tanggal}", event.event_date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(event.event_date)) : "Tanggal acara")
    .replaceAll("{lokasi}", event.location_name || "Lokasi acara")
    .replaceAll("{acara}", event.title), [guestName, names, event.event_date, event.location_name, event.title]);

  const fontsHref = useMemo(() => googleFontsHref(loadAllFonts ? googleFonts : [design.fontFamily, design.headingFont, ...design.sections.flatMap((section) => section.elements.map((element) => element.fontFamily))]), [design, loadAllFonts]);

  const burst = useCallback((type: BurstEffect, x?: number, y?: number) => {
    const id = Date.now() + Math.random();
    setBursts((current) => [...current.slice(-3), { id, type, x: x ?? window.innerWidth / 2, y: y ?? window.innerHeight * 0.35 }]);
    window.setTimeout(() => setBursts((current) => current.filter((item) => item.id !== id)), 2600);
  }, []);
  const showToast = useCallback((message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2800); }, []);

  const runRule = useCallback((action: RuleAction, value: string, delay: number) => {
    window.setTimeout(() => {
      if (action === "burst") burst((["confetti", "hearts", "petals", "sparkle"].includes(value) ? value : "confetti") as BurstEffect);
      if (action === "music-play") onMusic?.("play");
      if (action === "music-pause") onMusic?.("pause");
      if (action === "toast" && value) showToast(fill(value));
      if (action === "vibrate") navigator.vibrate?.(180);
    }, delay);
  }, [burst, fill, onMusic, showToast]);

  const scrollToSection = useCallback((id: string) => {
    rootRef.current?.querySelector<HTMLElement>(`[data-section-id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const runAction = useCallback((action: ElementAction, point: { x: number; y: number }) => {
    const value = action.value.trim();
    switch (action.type) {
      case "link": if (/^https?:\/\//i.test(value)) window.open(value, "_blank", "noopener,noreferrer"); break;
      case "maps": window.open(event.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([event.location_name, event.location_address].filter(Boolean).join(" ") || event.title)}`, "_blank", "noopener,noreferrer"); break;
      case "section": if (value) scrollToSection(value); break;
      case "rsvp": { const target = sections.find((section) => section.type === "rsvp"); if (target) scrollToSection(target.id); break; }
      case "calendar": { const url = calendarUrl(event); if (url) window.open(url, "_blank", "noopener,noreferrer"); else showToast("Tanggal acara belum ditentukan."); break; }
      case "music": onMusic?.("toggle"); break;
      case "whatsapp": { const digits = value.replace(/\D/g, "").replace(/^0/, "62"); if (digits) window.open(`https://wa.me/${digits}?text=${encodeURIComponent(fill("Halo, saya {nama_tamu}. Terima kasih atas undangan {acara}."))}`, "_blank", "noopener,noreferrer"); break; }
      case "copy": if (value) void navigator.clipboard?.writeText(value).then(() => showToast("Tersalin ke papan klip")); break;
      case "burst": burst((["confetti", "hearts", "petals", "sparkle"].includes(value) ? value : "confetti") as BurstEffect, point.x, point.y); break;
    }
  }, [burst, event, fill, onMusic, scrollToSection, sections, showToast]);

  // Observe sections: drives reveal classes, nav dots and rules.
  const visibilityRef = useRef<Record<string, boolean>>({});
  const firedRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    visibilityRef.current = {};
    firedRef.current = {};
    setInView({}); setSeen({});
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).dataset.sectionId;
        if (!id) return;
        const now = entry.isIntersecting;
        const before = visibilityRef.current[id] ?? false;
        if (now === before) return;
        visibilityRef.current[id] = now;
        setInView((current) => ({ ...current, [id]: now }));
        if (now) { setSeen((current) => ({ ...current, [id]: true })); setActive(id); }
        const section = sections.find((item) => item.id === id);
        if (!section || !live || reduce) return;
        section.rules.forEach((rule) => {
          if (rule.when === "enter" && now) runRule(rule.action, rule.value, rule.delay);
          if (rule.when === "leave" && !now) runRule(rule.action, rule.value, rule.delay);
          if (rule.when === "first" && now && !firedRef.current[rule.id]) { firedRef.current[rule.id] = true; runRule(rule.action, rule.value, rule.delay); }
        });
      });
    }, { threshold: 0.22 });
    root.querySelectorAll<HTMLElement>("[data-section-id]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
    // Re-observe when the section list or the replay key changes.
  }, [sections.map((section) => section.id).join("|"), edit?.playKey, live]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag & drop (editor only) ──
  const acceptsSection = (event: DragEvent) => event.dataTransfer.types.includes(DND.newSection) || event.dataTransfer.types.includes(DND.moveSection);
  const acceptsElement = (event: DragEvent) => event.dataTransfer.types.includes(DND.newElement) || event.dataTransfer.types.includes(DND.moveElement);
  const sectionDropIndex = (event: DragEvent<HTMLElement>, index: number) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2 ? index : index + 1;
  };
  const elementDropIndex = (event: DragEvent<HTMLElement>, count: number) => {
    const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(":scope .iw-el[data-el-index]"));
    for (const node of nodes) {
      const rect = node.getBoundingClientRect();
      if (event.clientY < rect.top + rect.height / 2) return Number(node.dataset.elIndex);
    }
    return count;
  };
  const payloadFrom = (event: DragEvent, newType: string, moveType: string): DropPayload | null => {
    const created = event.dataTransfer.getData(newType);
    if (created) return { kind: "new", type: created };
    const moved = event.dataTransfer.getData(moveType);
    if (!moved) return null;
    const [first, second] = moved.split("|");
    return second ? { kind: "move", from: first, id: second } : { kind: "move", id: first ?? "" };
  };

  const resolvedReveal = (section: InvitationWebSection) => section.reveal === "inherit" ? transitionToReveal[design.transition] : section.reveal;

  function sectionPalette(section: InvitationWebSection) {
    let backgrounds = [section.background, section.background2 || section.background];
    let scrim = false;
    if (section.backgroundImage) {
      // A dark overlay bounds the lightest possible image behind the text.
      backgrounds = ["#000000", mixColor("#ffffff", "#000000", Math.max(0.6, section.overlay / 100))];
    } else {
      const text = readableColor(section.textColor || "#fffaf2", backgrounds);
      scrim = backgrounds.some((background) => contrastRatio(text, background) < 4.5);
      if (scrim) backgrounds = backgrounds.map((background) => mixColor(background, "#000000", 0.6));
    }
    const dark = isDarkColor(backgrounds[0]);
    if (section.layout === "cards") backgrounds = backgrounds.map((background) => mixColor(background, "#ffffff", dark ? 0.08 : 0.72));
    const text = readableColor(section.textColor || (dark ? "#fffaf2" : "#243b31"), backgrounds);
    const sectionAccent = readableColor(accent, backgrounds);
    return { backgrounds, scrim, dark, text, accent: sectionAccent, buttonText: readableColor("#ffffff", [sectionAccent]) };
  }

  function sectionStyle(section: InvitationWebSection): CSSProperties {
    const palette = sectionPalette(section);
    const layers: string[] = [];
    if (section.backgroundImage) {
      const shade = Math.max(0.6, section.overlay / 100);
      layers.push(`linear-gradient(rgba(0,0,0,${shade}), rgba(0,0,0,${shade}))`, `url("${section.backgroundImage}")`);
    }
    if (palette.scrim) layers.push("linear-gradient(#00000099, #00000099)");
    if (section.background2) layers.push(`linear-gradient(${section.gradientAngle}deg, ${section.background}, ${section.background2})`);
    return {
      backgroundColor: section.background,
      backgroundImage: layers.length ? layers.join(", ") : undefined,
      ["--iw-text" as string]: palette.text,
      ["--iw-muted" as string]: palette.text,
      ["--iw-accent" as string]: palette.accent,
      ["--iw-button-text" as string]: palette.buttonText,
      ["--iw-card" as string]: palette.dark ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.72)",
      ["--iw-line" as string]: palette.dark ? "rgba(255,255,255,.2)" : "rgba(36,59,49,.14)",
    };
  }

  function renderDefault(section: InvitationWebSection) {
    const isDirectEditable = editing && !live;
    const heading = section.heading ? (
      <h2
        className="iw-heading"
        contentEditable={isDirectEditable}
        suppressContentEditableWarning
        onMouseDown={(e) => { if (isDirectEditable) e.stopPropagation(); }}
        onBlur={(e) => edit?.onUpdateSectionText?.(section.id, "heading", e.currentTarget.textContent || "")}
        onClick={(e) => { if (isDirectEditable) e.stopPropagation(); }}
        title={isDirectEditable ? "Klik langsung untuk mengubah teks judul" : undefined}
      >
        {fill(section.heading)}
      </h2>
    ) : null;
    const description = section.description ? (
      <p
        className="iw-desc"
        contentEditable={isDirectEditable}
        suppressContentEditableWarning
        onMouseDown={(e) => { if (isDirectEditable) e.stopPropagation(); }}
        onBlur={(e) => edit?.onUpdateSectionText?.(section.id, "description", e.currentTarget.textContent || "")}
        onClick={(e) => { if (isDirectEditable) e.stopPropagation(); }}
        title={isDirectEditable ? "Klik langsung untuk mengubah teks deskripsi" : undefined}
      >
        {fill(section.description)}
      </p>
    ) : null;
    const placeholder = (label: string) => <div className="iw-slot-placeholder">{label}</div>;
    switch (section.type) {
      case "hero": return <>
        {theme.hero_image_url && <img className="iw-hero-photo" src={theme.hero_image_url} alt="Foto pasangan" />}
        <h1
          className="iw-heading iw-display"
          contentEditable={isDirectEditable}
          suppressContentEditableWarning
          onMouseDown={(e) => { if (isDirectEditable) e.stopPropagation(); }}
          onBlur={(e) => edit?.onUpdateEventText?.("title", e.currentTarget.textContent || "")}
          onClick={(e) => { if (isDirectEditable) e.stopPropagation(); }}
          title={isDirectEditable ? "Klik langsung untuk mengubah nama pasangan" : undefined}
        >
          {names}
        </h1>
        {description}
        <p className="iw-guest">Kepada Yth. <b>{guestName || "Tamu Undangan"}</b></p>
      </>;
      case "couple": return <>{heading}{description}<div className={`iw-couple iw-couple-${section.layout}`}>
        <article>
          <span>{event.event_type === "birthday" ? "YANG BERBAHAGIA" : "MEMPELAI"}</span>
          <h3
            className="iw-display"
            contentEditable={isDirectEditable}
            suppressContentEditableWarning
            onMouseDown={(e) => { if (isDirectEditable) e.stopPropagation(); }}
            onBlur={(e) => edit?.onUpdateEventText?.("groom_name", e.currentTarget.textContent || "")}
            onClick={(e) => { if (isDirectEditable) e.stopPropagation(); }}
            title={isDirectEditable ? "Ketik nama langsung di sini" : undefined}
          >
            {event.groom_name || event.title}
          </h3>
          <p>Bersama keluarga tercinta</p>
        </article>
        {event.bride_name && <>
          <i className="iw-display">&amp;</i>
          <article>
            <span>MEMPELAI</span>
            <h3
              className="iw-display"
              contentEditable={isDirectEditable}
              suppressContentEditableWarning
              onMouseDown={(e) => { if (isDirectEditable) e.stopPropagation(); }}
              onBlur={(e) => edit?.onUpdateEventText?.("bride_name", e.currentTarget.textContent || "")}
              onClick={(e) => { if (isDirectEditable) e.stopPropagation(); }}
              title={isDirectEditable ? "Ketik nama langsung di sini" : undefined}
            >
              {event.bride_name}
            </h3>
            <p>Bersama keluarga tercinta</p>
          </article>
        </>}
      </div></>;
      case "quote": return <>{heading}<blockquote
        className="iw-quote"
        contentEditable={isDirectEditable}
        suppressContentEditableWarning
        onMouseDown={(e) => { if (isDirectEditable) e.stopPropagation(); }}
        onBlur={(e) => edit?.onUpdateEventText?.("quote", e.currentTarget.textContent || "")}
        onClick={(e) => { if (isDirectEditable) e.stopPropagation(); }}
        title={isDirectEditable ? "Ketik kalimat pembuka atau doa langsung di sini" : undefined}
      >
        {fill(theme.quote || section.description || "")}
        {theme.quote_source && <cite>{theme.quote_source}</cite>}
      </blockquote></>;
      case "countdown": return <>{heading}{description}<Countdown left={timeLeft} /></>;
      case "event": return <>{heading}{description}<div className="iw-event">
        <article><span>WAKTU</span><h3>{dateText(event.event_date)}</h3></article>
        <article>
          <span>TEMPAT</span>
          <h3
            contentEditable={isDirectEditable}
            suppressContentEditableWarning
            onMouseDown={(e) => { if (isDirectEditable) e.stopPropagation(); }}
            onBlur={(e) => edit?.onUpdateEventText?.("location_name", e.currentTarget.textContent || "")}
            onClick={(e) => { if (isDirectEditable) e.stopPropagation(); }}
            title={isDirectEditable ? "Ketik nama lokasi langsung di sini" : undefined}
          >
            {event.location_name || "Lokasi acara"}
          </h3>
          {event.location_address && (
            <p
              contentEditable={isDirectEditable}
              suppressContentEditableWarning
              onMouseDown={(e) => { if (isDirectEditable) e.stopPropagation(); }}
              onBlur={(e) => edit?.onUpdateEventText?.("location_address", e.currentTarget.textContent || "")}
              onClick={(e) => { if (isDirectEditable) e.stopPropagation(); }}
              title={isDirectEditable ? "Ketik alamat lokasi langsung di sini" : undefined}
            >
              {event.location_address}
            </p>
          )}
          <div className="iw-event-actions">
            {event.map_url && <a className="iw-event-btn" href={event.map_url} target="_blank" rel="noreferrer" onClick={(click) => editing && !live && click.preventDefault()}>Buka Google Maps ↗</a>}
            {event.event_date && <a className="iw-event-btn secondary" href={calendarUrl(event) || "#"} target="_blank" rel="noreferrer" onClick={(click) => { if (editing && !live) click.preventDefault(); }}>+ Simpan ke Kalender</a>}
          </div>
        </article>
      </div></>;
      case "gallery": return <>{heading}{description}{theme.hero_image_url ? <img className="iw-gallery-photo" src={theme.hero_image_url} alt="Galeri momen" /> : editing && placeholder("Tambahkan elemen Foto untuk mengisi galeri")}</>;
      case "story": return <>{heading}{description}{(theme.love_story ?? []).length ? <div className="iw-story">{(theme.love_story ?? []).map((story, index) => <article key={`${story.year}-${index}`}><span>{story.year}</span><div><h3>{story.title}</h3><p>{story.desc}</p></div></article>)}</div> : editing && placeholder("Isi cerita perjalanan di tab Detail acara")}</>;
      case "spotify": return <>{heading}{description}{event.spotify_track_id ? <iframe className="iw-spotify" src={`https://open.spotify.com/embed/track/${encodeURIComponent(event.spotify_track_id)}?utm_source=generator`} width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Musik undangan" /> : editing && placeholder("Tempel tautan Spotify di tab Audio")}</>;
      case "gifts": return <>{heading}{description}{slots?.gifts ?? placeholder("Kartu rekening & tombol salin tampil di sini")}</>;
      case "rsvp": return <>{heading}{description}{slots?.rsvp ?? placeholder("Form konfirmasi kehadiran & daftar ucapan tampil di sini")}</>;
      case "ticket": return <>{heading}{description}{slots?.ticket ?? placeholder("QR check-in pribadi setiap tamu tampil di sini")}</>;
      case "custom": return <>{heading}{description}</>;
    }
  }

  function renderElementBody(element: InvitationElement, section: InvitationWebSection, sectionActive: boolean) {
    const isDirectEditable = editing && !live;
    const palette = sectionPalette(section);
    const color = readableColor(element.color || palette.text, palette.backgrounds);
    const textStyle: CSSProperties = { color, fontFamily: fontStack(element.fontFamily), fontSize: `clamp(${Math.min(element.fontSize, 15)}px, ${element.fontSize / 12}cqi, ${element.fontSize}px)`, fontWeight: element.fontWeight, fontStyle: element.italic ? "italic" : undefined, letterSpacing: element.letterSpacing ? `${element.letterSpacing / 10}em` : undefined, textAlign: element.align };
    const content = fill(element.content);
    const typed = element.motion.entrance === "typewriter" && (element.type === "text" || element.type === "heading");
    const body = typed ? <TypeText key={`${sectionActive}-${content}`} text={content} active={sectionActive} speed={element.motion.speed === "slow" ? 70 : element.motion.speed === "fast" ? 22 : 40} /> : content;
    switch (element.type) {
      case "heading": return (
        <h3
          className="iw-el-heading"
          style={textStyle}
          contentEditable={isDirectEditable}
          suppressContentEditableWarning
          onMouseDown={(e) => { if (isDirectEditable) e.stopPropagation(); }}
          onBlur={(e) => edit?.onUpdateElementText?.(section.id, element.id, e.currentTarget.textContent || "")}
          onClick={(e) => { if (isDirectEditable) e.stopPropagation(); }}
          title={isDirectEditable ? "Ketik langsung di teks judul ini" : undefined}
        >
          {body}
        </h3>
      );
      case "text": return (
        <p
          className="iw-el-text"
          style={textStyle}
          contentEditable={isDirectEditable}
          suppressContentEditableWarning
          onMouseDown={(e) => { if (isDirectEditable) e.stopPropagation(); }}
          onBlur={(e) => edit?.onUpdateElementText?.(section.id, element.id, e.currentTarget.textContent || "")}
          onClick={(e) => { if (isDirectEditable) e.stopPropagation(); }}
          title={isDirectEditable ? "Ketik langsung di paragraf ini" : undefined}
        >
          {body}
        </p>
      );
      case "image": return element.imageUrl
        ? <img className={`iw-img iw-frame-${element.frame} iw-filter-${element.filter} iw-shadow-${element.shadow}`} src={element.imageUrl} alt={element.content || "Foto undangan"} loading="lazy" draggable={false} />
        : editing ? <div className="iw-img-empty"><ImagePlus size={22} /><span>Pilih foto di panel kanan</span></div> : null;
      case "button": return (
        <span
          className={`iw-btn iw-btn-${element.variant || "solid"} iw-shadow-${element.shadow}`}
          role="button"
          style={{ ...textStyle, ["--iw-btn-bg" as string]: element.variant === "outline" ? readableColor(element.background || accent, palette.backgrounds) : element.background || accent, ["--iw-btn-fg" as string]: readableColor(element.color || "#ffffff", [element.background || accent]), color: undefined }}
          contentEditable={isDirectEditable}
          suppressContentEditableWarning
          onMouseDown={(e) => { if (isDirectEditable) e.stopPropagation(); }}
          onBlur={(e) => edit?.onUpdateElementText?.(section.id, element.id, e.currentTarget.textContent || "")}
          onClick={(e) => { if (isDirectEditable) e.stopPropagation(); }}
          title={isDirectEditable ? "Ketik teks tombol langsung" : undefined}
        >
          {content || "Tombol"}
        </span>
      );
      case "divider": return <div className={`iw-divider iw-divider-${element.variant || "line"}`} style={{ color: color ?? accent }}>{element.variant === "ornament" && <span>{element.content || "✦"}</span>}</div>;
      case "ornament": return <div className="iw-ornament" style={{ ...textStyle, color: color ?? accent, lineHeight: 1 }}>{element.content || "❦"}</div>;
      case "spacer": return <div className={editing ? "iw-spacer is-editing" : "iw-spacer"} style={{ height: element.fontSize }} />;
      case "countdown": return <div style={{ color: color ?? undefined, fontFamily: fontStack(element.fontFamily) }}><Countdown left={timeLeft} compact size={element.fontSize} /></div>;
    }
  }

  function renderElement(section: InvitationWebSection, element: InvitationElement, index: number, sectionActive: boolean) {
    const motion = element.motion;
    const selected = edit?.selectedElement === element.id;
    const clickable = element.action.type !== "none";
    const style: CSSProperties = {
      width: `${element.width}%`,
      marginTop: element.marginTop,
      marginLeft: element.align === "left" ? 0 : "auto",
      marginRight: element.align === "right" ? 0 : "auto",
      ["--iw-dur" as string]: `${speedMs[motion.speed]}ms`,
      ["--iw-delay" as string]: `${motion.delay + Math.min(index * 80, 640)}ms`,
      ["--iw-ease" as string]: easings[motion.easing],
    };
    const onClick = (click: ReactMouseEvent) => {
      if (edit && !edit.interactive) { click.stopPropagation(); edit.onSelectElement(section.id, element.id); return; }
      if (clickable) { click.stopPropagation(); runAction(element.action, { x: click.clientX, y: click.clientY }); }
    };
    return <div key={element.id} className={`iw-el iw-el-${element.type}`} data-el-index={index} data-in={motion.entrance} data-selected={selected || undefined} style={style}
      draggable={Boolean(edit && !edit.interactive)}
      onDragStart={(drag) => { drag.stopPropagation(); drag.dataTransfer.setData(DND.moveElement, `${section.id}|${element.id}`); drag.dataTransfer.effectAllowed = "move"; }}
      onClick={onClick}>
      {edit && !edit.interactive && <div className={`iw-edit-tools ${selected ? "is-selected" : "on-hover"}`} onClick={(click) => click.stopPropagation()}>
        <div className="iw-el-handle" title="Tahan dan seret untuk memindahkan posisi elemen" draggable
          onDragStart={(drag) => { drag.stopPropagation(); drag.dataTransfer.setData(DND.moveElement, `${section.id}|${element.id}`); drag.dataTransfer.effectAllowed = "move"; }}>
          <GripVertical size={12} />
          <span>{elementLabels[element.type]}</span>
        </div>
        <button type="button" title="Pindah ke atas" onClick={() => edit.onElementCommand(section.id, element.id, "up")}><ArrowUp size={13} /></button>
        <button type="button" title="Pindah ke bawah" onClick={() => edit.onElementCommand(section.id, element.id, "down")}><ArrowDown size={13} /></button>
        <button type="button" title="Duplikat elemen" onClick={() => edit.onElementCommand(section.id, element.id, "duplicate")}><Copy size={13} /></button>
        <button type="button" title="Hapus elemen" onClick={() => edit.onElementCommand(section.id, element.id, "delete")}><Trash2 size={13} /></button>
      </div>}
      <div className="iw-loop" data-loop={motion.loop}>
        <div className={`iw-hover${clickable && live ? " is-clickable" : ""}`} data-hover={motion.hover}>{renderElementBody(element, section, sectionActive)}</div>
      </div>
    </div>;
  }

  const mode = design.mode;
  return <div className={`iw-root${editing ? " iw-editing" : ""}${edit?.interactive ? " iw-interactive" : ""}`} data-mode={mode} style={{ ["--iw-accent" as string]: accent, ["--iw-primary" as string]: primary, ["--iw-font" as string]: fontStack(design.fontFamily), ["--iw-heading-font" as string]: fontStack(design.headingFont) }}>
    {fontsHref && <link rel="stylesheet" href={fontsHref} precedence="default" />}
    <main ref={rootRef} className="iw-page" data-mode={mode}>
      {sections.map((section, index) => {
        const reveal = resolvedReveal(section);
        const isIn = section.replay ? Boolean(inView[section.id]) : Boolean(seen[section.id]);
        const selected = edit?.selectedSection === section.id && !edit.selectedElement;
        const hint = dropHint && "between" in dropHint ? dropHint.between : null;
        const elementHint = dropHint && "section" in dropHint && dropHint.section === section.id ? dropHint.index : null;
        return <section key={section.id} id={section.type === "rsvp" ? "rsvp" : section.type === "gifts" ? "gifts" : undefined} data-section-id={section.id}
          className={[`iw-section iw-type-${section.type} iw-layout-${section.layout} iw-h-${section.height} iw-sp-${section.spacing} iw-w-${section.contentWidth} iw-reveal-${reveal}`, isIn ? "is-in" : "", !section.visible ? "is-hidden" : "", hint === index ? "drop-before" : "", hint === index + 1 && index === sections.length - 1 ? "drop-after" : ""].filter(Boolean).join(" ")}
          data-selected={selected || undefined} style={sectionStyle(section)}
          onClick={() => {
            if (edit && !edit.interactive) { edit.onSelectSection(section.id); return; }
            if (live) section.rules.filter((rule) => rule.when === "click").forEach((rule) => runRule(rule.action, rule.value, rule.delay));
          }}
          onDragOver={edit && !edit.interactive ? (drag) => {
            if (acceptsElement(drag)) { drag.preventDefault(); drag.stopPropagation(); setDropHint({ section: section.id, index: elementDropIndex(drag, section.elements.length) }); }
            else if (acceptsSection(drag)) { drag.preventDefault(); setDropHint({ between: sectionDropIndex(drag, index) }); }
          } : undefined}
          onDragLeave={edit ? (drag) => { if (!drag.currentTarget.contains(drag.relatedTarget as Node)) setDropHint(null); } : undefined}
          onDrop={edit && !edit.interactive ? (drag) => {
            drag.preventDefault(); drag.stopPropagation(); setDropHint(null);
            const elementPayload = payloadFrom(drag, DND.newElement, DND.moveElement);
            if (elementPayload) { edit.onDropElement(section.id, elementDropIndex(drag, section.elements.length), elementPayload); return; }
            const sectionPayload = payloadFrom(drag, DND.newSection, DND.moveSection);
            if (sectionPayload) edit.onDropSection(sectionDropIndex(drag, index), sectionPayload);
          } : undefined}>
          <BackgroundFx type={section.effect} />
          {editing && !edit?.interactive && <div className="iw-section-label">{invitationSectionLabels[section.type]}{!section.visible && <><EyeOff size={11} /> disembunyikan</>}</div>}
          {selected && edit && !edit.interactive && <div className="iw-edit-tools iw-section-tools" onClick={(click) => click.stopPropagation()}>
            <button type="button" title="Pindah ke atas" onClick={() => edit.onSectionCommand(section.id, "up")}><ArrowUp size={14} /></button>
            <button type="button" title="Pindah ke bawah" onClick={() => edit.onSectionCommand(section.id, "down")}><ArrowDown size={14} /></button>
            <button type="button" title="Duplikat section" onClick={() => edit.onSectionCommand(section.id, "duplicate")}><Copy size={14} /></button>
            <button type="button" title="Hapus section" onClick={() => edit.onSectionCommand(section.id, "delete")}><Trash2 size={14} /></button>
          </div>}
          <div className="iw-content">
            {section.eyebrow && (
              <p
                className="iw-eyebrow"
                contentEditable={editing && !live}
                suppressContentEditableWarning
                onMouseDown={(e) => { if (editing && !live) e.stopPropagation(); }}
                onBlur={(e) => edit?.onUpdateSectionText?.(section.id, "eyebrow", e.currentTarget.textContent || "")}
                onClick={(e) => { if (editing && !live) e.stopPropagation(); }}
                title={editing && !live ? "Ketik teks label langsung di sini" : undefined}
              >
                {fill(section.eyebrow)}
              </p>
            )}
            {section.showDefault ? renderDefault(section) : section.heading && section.type !== "custom" ? (
              <h2
                className="iw-heading"
                contentEditable={editing && !live}
                suppressContentEditableWarning
                onMouseDown={(e) => { if (editing && !live) e.stopPropagation(); }}
                onBlur={(e) => edit?.onUpdateSectionText?.(section.id, "heading", e.currentTarget.textContent || "")}
                onClick={(e) => { if (editing && !live) e.stopPropagation(); }}
                title={editing && !live ? "Ketik teks judul langsung di sini" : undefined}
              >
                {fill(section.heading)}
              </h2>
            ) : null}
            {section.elements.map((element, elementIndex) => (
              <div
                key={element.id}
                className={`iw-el-slot${elementHint === elementIndex ? " is-drop-target" : ""}`}
                onDragOver={edit && !edit.interactive ? (e) => {
                  if (acceptsElement(e)) {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropHint({ section: section.id, index: elementIndex });
                  }
                } : undefined}
                onDrop={edit && !edit.interactive ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropHint(null);
                  const elementPayload = payloadFrom(e, DND.newElement, DND.moveElement);
                  if (elementPayload) edit.onDropElement(section.id, elementIndex, elementPayload);
                } : undefined}
              >
                {elementHint === elementIndex && <div className="iw-drop-line" />}
                {renderElement(section, element, elementIndex, isIn)}
              </div>
            ))}
            <div
              className={`iw-el-drop-end${elementHint === section.elements.length ? " is-drop-target" : ""}`}
              onDragOver={edit && !edit.interactive ? (e) => {
                if (acceptsElement(e)) {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropHint({ section: section.id, index: section.elements.length });
                }
              } : undefined}
              onDrop={edit && !edit.interactive ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                setDropHint(null);
                const elementPayload = payloadFrom(e, DND.newElement, DND.moveElement);
                if (elementPayload) edit.onDropElement(section.id, section.elements.length, elementPayload);
              } : undefined}
            >
              {elementHint === section.elements.length && <div className="iw-drop-line" />}
            </div>
            {editing && !edit?.interactive && section.elements.length === 0 && !section.showDefault && <div className="iw-empty-section">Seret elemen dari panel kiri ke sini</div>}
          </div>
          {mode === "pages" && index === 0 && !editing && <ChevronDown className="iw-scroll-hint" size={26} aria-hidden="true" />}
        </section>;
      })}
      {editing && !edit?.interactive && <div className={`iw-drop-tail${dropHint && "between" in dropHint && dropHint.between === sections.length ? " is-active" : ""}`}
        onDragOver={(drag) => { if (acceptsSection(drag)) { drag.preventDefault(); setDropHint({ between: sections.length }); } }}
        onDrop={(drag) => { drag.preventDefault(); setDropHint(null); const payload = payloadFrom(drag, DND.newSection, DND.moveSection); if (payload) edit?.onDropSection(sections.length, payload); }}>
        Seret section ke sini untuk menambahkannya di akhir
      </div>}
      {!editing && <footer className="iw-footer">Dengan penuh sukacita · Kalakai</footer>}
    </main>
    {mode === "pages" && design.showNav && <nav className="iw-dots" aria-label="Navigasi halaman">{sections.filter((section) => section.visible).map((section) => <button key={section.id} type="button" aria-label={invitationSectionLabels[section.type]} aria-current={active === section.id || undefined} onClick={(click) => { click.stopPropagation(); scrollToSection(section.id); }} />)}</nav>}
    <BurstLayer bursts={bursts} accent={accent} />
    {toast && <div className="iw-toast" role="status">{toast}</div>}
  </div>;
}

function Countdown({ left, compact, size }: { left: { days: number; hours: number; minutes: number; seconds: number }; compact?: boolean; size?: number }) {
  return <div className={`iw-countdown${compact ? " is-compact" : ""}`} style={size ? { ["--iw-count-size" as string]: `${size}px` } : undefined}>
    {([[left.days, "Hari"], [left.hours, "Jam"], [left.minutes, "Menit"], [left.seconds, "Detik"]] as const).map(([value, label]) => <div key={label}><b>{String(value).padStart(2, "0")}</b><span>{label}</span></div>)}
  </div>;
}

export type { InvitationSectionType, InvitationElementType };
