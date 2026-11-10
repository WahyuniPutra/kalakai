"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, Copy, Eye, Heart, MapPin, Music2, Save, Sparkles } from "lucide-react";
import DashboardShell, { type DashboardNavItem, type DashboardUser } from "./DashboardShell";

type InvitationEvent = {
  id: number;
  title: string;
  slug: string;
  event_type: string;
  groom_name: string | null;
  bride_name: string | null;
  event_date: string | null;
  location_name: string | null;
  location_address: string | null;
  map_url: string | null;
  spotify_track_id: string | null;
  is_published: boolean;
  theme_config: Record<string, unknown> | null;
};

type Draft = {
  title: string;
  slug: string;
  event_type: string;
  groom_name: string;
  bride_name: string;
  event_date: string;
  location_name: string;
  location_address: string;
  map_url: string;
  quote: string;
  quote_source: string;
  template_id: "classic" | "garden" | "modern" | "blank";
  primary_color: string;
  accent_color: string;
  font_family: "serif" | "sans";
  hero_image_url: string;
  spotify_input: string;
  audio_title: string;
  audio_preview_url: string;
  love_story_text: string;
  sections: { names: boolean; story: boolean; details: boolean; gifts: boolean; guestbook: boolean; spotify: boolean };
  canvas_elements: CanvasElement[];
};

type CanvasElement = { id: string; type: "text" | "ornament" | "photo"; text: string; image_url: string; x: number; y: number; width: number; font_size: number; color: string; rotation: number; effect: "none" | "shadow" | "glow" | "outline"; frame: "none" | "round" | "oval" | "ornate" };

const blankDraft: Draft = {
  title: "Undangan acara baru", slug: "undangan-acara-baru", event_type: "wedding", groom_name: "", bride_name: "", event_date: "",
  location_name: "", location_address: "", map_url: "", quote: "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu.",
  quote_source: "QS. Ar-Rum: 21", template_id: "classic", primary_color: "#b85c68", accent_color: "#dc9a9a", font_family: "serif",
  hero_image_url: "", spotify_input: "", audio_title: "", audio_preview_url: "", love_story_text: "",
  sections: { names: true, story: true, details: true, gifts: true, guestbook: true, spotify: true },
  canvas_elements: [],
};

const templates: { id: Draft["template_id"]; name: string; detail: string; color: string; accent: string; font: Draft["font_family"] }[] = [
  { id: "classic", name: "Klasik", detail: "Romantis dan elegan", color: "#b85c68", accent: "#dc9a9a", font: "serif" },
  { id: "garden", name: "Garden", detail: "Lembut bernuansa alami", color: "#54745b", accent: "#9bb48b", font: "serif" },
  { id: "modern", name: "Modern", detail: "Bersih dan kontemporer", color: "#55768f", accent: "#9cb7c9", font: "sans" },
  { id: "blank", name: "Mulai kosong", detail: "Atur dari awal", color: "#775f8f", accent: "#b4a1c4", font: "sans" },
];

const builderNav: DashboardNavItem[] = [
  { label: "Ringkasan", href: "/dashboard", icon: Heart },
  { label: "Acara saya", href: "/dashboard#acara", icon: CalendarDays, active: true },
  { label: "Permintaan layanan", href: "/dashboard#layanan", icon: Music2 },
];

function toLocalDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function slugify(value: string) {
  return value.toLocaleLowerCase("id-ID").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function getSpotifyId(value: string) {
  const match = value.trim().match(/(?:track\/|spotify:track:)([A-Za-z0-9]+)/);
  return match?.[1] ?? ( /^[A-Za-z0-9]{22}$/.test(value.trim()) ? value.trim() : "" );
}

export default function InvitationBuilder({ eventId, user }: { eventId?: string; user: DashboardUser }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [isPublished, setIsPublished] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(eventId));
  const [loading, setLoading] = useState(Boolean(eventId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [guestName, setGuestName] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    fetch(`/api/user/events/${eventId}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Undangan tidak dapat dimuat.");
        if (!active) return;
        const theme = data.theme_config ?? {};
        setDraft({
          ...blankDraft,
          title: data.title,
          slug: data.slug,
          event_type: data.event_type ?? "wedding",
          groom_name: data.groom_name ?? "",
          bride_name: data.bride_name ?? "",
          event_date: toLocalDate(data.event_date),
          location_name: data.location_name ?? "",
          location_address: data.location_address ?? "",
          map_url: data.map_url ?? "",
          quote: String(theme.quote ?? ""),
          quote_source: String(theme.quote_source ?? ""),
          template_id: (theme.template_id as Draft["template_id"]) ?? "classic",
          primary_color: String(theme.primary_color ?? "#b85c68"),
          accent_color: String(theme.accent_color ?? "#dc9a9a"),
          font_family: (theme.font_family as Draft["font_family"]) ?? "serif",
          hero_image_url: String(theme.hero_image_url ?? ""),
          spotify_input: data.spotify_track_id ?? "",
          audio_title: String(theme.audio_title ?? ""),
          audio_preview_url: String(theme.audio_preview_url ?? ""),
          love_story_text: Array.isArray(theme.love_story) ? theme.love_story.map((item: { year?: string; title?: string; desc?: string }) => `${item.year ?? ""} | ${item.title ?? ""} | ${item.desc ?? ""}`).join("\n") : "",
          sections: { ...blankDraft.sections, ...(theme.sections as Partial<Draft["sections"]> | undefined) },
          canvas_elements: Array.isArray(theme.canvas_elements) ? theme.canvas_elements as CanvasElement[] : [],
        });
        setIsPublished(Boolean(data.is_published));
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Undangan tidak dapat dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [eventId]);

  const eventUrl = useMemo(() => `kalakai.com/${draft.slug || "nama-acara"}/[nama-tamu]`, [draft.slug]);
  const personalUrl = useMemo(() => `${typeof window === "undefined" ? "https://kalakai.com" : window.location.origin}/${draft.slug || "nama-acara"}/${slugify(guestName) || "nama-tamu"}`, [draft.slug, guestName]);
  const spotifyId = useMemo(() => getSpotifyId(draft.spotify_input), [draft.spotify_input]);

  function update<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !slugTouched) next.slug = slugify(String(value)) || "undangan-acara";
      return next;
    });
  }

  function selectTemplate(template: (typeof templates)[number]) {
    setDraft((current) => ({ ...current, template_id: template.id, primary_color: template.color, accent_color: template.accent, font_family: template.font, sections: template.id === "blank" ? { names: false, story: false, details: false, gifts: false, guestbook: false, spotify: false } : { names: true, story: true, details: true, gifts: true, guestbook: true, spotify: true } }));
  }

  async function saveInvitation(publish: boolean) {
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      title: draft.title,
      slug: draft.slug,
      event_type: draft.event_type,
      groom_name: draft.groom_name || null,
      bride_name: draft.bride_name || null,
      event_date: draft.event_date || null,
      location_name: draft.location_name || null,
      location_address: draft.location_address || null,
      map_url: draft.map_url || null,
      spotify_track_id: spotifyId || null,
      theme_config: {
        template_id: draft.template_id,
        primary_color: draft.primary_color,
        accent_color: draft.accent_color,
        font_family: draft.font_family,
        quote: draft.quote,
        quote_source: draft.quote_source,
        hero_image_url: draft.hero_image_url || null,
        audio_title: draft.audio_title || null,
        audio_preview_url: draft.audio_preview_url || null,
        love_story: draft.love_story_text.split("\n").map((line) => line.split("|").map((part) => part.trim())).filter((parts) => parts.some(Boolean)).slice(0, 8).map(([year, title, ...description]) => ({ year: year ?? "", title: title ?? "", desc: description.join(" | ") })),
        sections: draft.sections,
        canvas_elements: draft.canvas_elements,
      },
      is_published: publish || isPublished,
    };

    try {
      let response = await fetch(eventId ? `/api/user/events/${eventId}` : "/api/user/events", {
        method: eventId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      let data = await response.json();
      if (!response.ok) {
        const firstValidation = Object.values(data.errors ?? {}).flat()[0];
        throw new Error(typeof firstValidation === "string" ? firstValidation : data.message ?? "Periksa kembali data undangan.");
      }

      let savedId = data.id as number;
      if (publish && !eventId && !data.is_published) {
        response = await fetch(`/api/user/events/${savedId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...payload, is_published: true }),
        });
        data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Undangan tersimpan sebagai draf, tetapi belum dapat diterbitkan.");
      }

      setIsPublished(Boolean(data.is_published));
      setNotice(publish ? "Undangan berhasil diterbitkan dan siap dibagikan." : "Draf undangan berhasil disimpan.");
      if (!eventId) router.replace(`/dashboard/undangan/${savedId}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Undangan belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveInvitation(isPublished);
  }

  async function copyPersonalLink() {
    try {
      await navigator.clipboard.writeText(personalUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      setError("Tautan belum dapat disalin. Salin tautan yang tampil secara manual.");
    }
  }

  function addCanvasElement(type: CanvasElement["type"], text = "") {
    const id = `${type}-${Date.now()}`;
    const element: CanvasElement = { id, type, text: text || (type === "text" ? "Tulis teks di sini" : type === "ornament" ? "✦" : ""), image_url: "", x: 50, y: 50, width: type === "photo" ? 46 : 70, font_size: type === "ornament" ? 42 : 18, color: "#ffffff", rotation: 0, effect: "shadow", frame: type === "photo" ? "ornate" : "none" };
    setDraft((current) => ({ ...current, canvas_elements: [...current.canvas_elements, element] }));
    setSelectedElement(id);
  }

  function updateCanvasElement(id: string, patch: Partial<CanvasElement>) {
    setDraft((current) => ({ ...current, canvas_elements: current.canvas_elements.map((element) => element.id === id ? { ...element, ...patch } : element) }));
  }

  function moveCanvasElement(event: React.PointerEvent<HTMLDivElement>, id: string) {
    if (!draggingElement || draggingElement !== id) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(3, Math.min(97, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(3, Math.min(97, ((event.clientY - bounds.top) / bounds.height) * 100));
    updateCanvasElement(id, { x, y });
  }

  if (loading) return <div className="invite-builder-loading">Memuat undangan…</div>;

  return <DashboardShell user={user} nav={builderNav}>
    <div className="invite-builder-heading"><div><p className="eyebrow"><span className="eyebrow-dot" />PEMBUAT UNDANGAN</p><h1>{eventId ? "Kustomisasi undangan" : "Mulai undangan baru"}</h1><p>Pilih dasar desain, isi detail acara, lalu sesuaikan tampilannya.</p></div><span className="invite-builder-plan">PAKET KERABAT FREE</span></div>
    <div className="invite-builder-layout">
      <form className="invite-builder-form" onSubmit={handleSubmit}>
        <section className="invite-builder-section"><div className="invite-builder-section-title"><span>01</span><div><h2>Pilih titik awal</h2><p>Gunakan template atau mulai dengan kanvas kosong.</p></div></div>
          <div className="invite-template-grid">{templates.map((template) => <button type="button" key={template.id} className={`invite-template-option${draft.template_id === template.id ? " selected" : ""}`} onClick={() => selectTemplate(template)}><span className="invite-template-swatch" style={{ background: template.color }}><Heart size={17} fill="currentColor" /></span><strong>{template.name}</strong><small>{template.detail}</small>{draft.template_id === template.id && <Check size={16} />}</button>)}</div>
        </section>

        <section className="invite-builder-section"><div className="invite-builder-section-title"><span>02</span><div><h2>Cerita acaramu</h2><p>Informasi ini akan tampil pada halaman undangan.</p></div></div>
          <div className="invite-builder-fields">
            <label className="builder-field-full">Nama acara<input value={draft.title} onChange={(event) => update("title", event.target.value)} required maxLength={255} placeholder="Pernikahan Alya & Bima" /></label>
            <label>Jenis acara<select value={draft.event_type} onChange={(event) => update("event_type", event.target.value)}><option value="wedding">Pernikahan</option><option value="engagement">Pertunangan</option><option value="birthday">Ulang tahun</option><option value="other">Acara lainnya</option></select></label>
            <label>Tanggal &amp; waktu<input type="datetime-local" value={draft.event_date} onChange={(event) => update("event_date", event.target.value)} /></label>
            <label>{draft.event_type === "birthday" ? "Nama yang berulang tahun" : "Nama orang pertama"}<input value={draft.groom_name} onChange={(event) => update("groom_name", event.target.value)} placeholder="Nama lengkap" /></label>
            <label>{draft.event_type === "birthday" ? "Nama orang tua / keluarga" : "Nama orang kedua"}<input value={draft.bride_name} onChange={(event) => update("bride_name", event.target.value)} placeholder="Opsional" /></label>
            <label className="builder-field-full">Slug URL acara<div className="builder-slug-input"><span>kalakai.com/</span><input value={draft.slug} onChange={(event) => { setSlugTouched(true); update("slug", slugify(event.target.value)); }} required maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="nama-acara" /><span>/[nama-tamu]</span></div><small>Tautan personal untuk setiap tamu akan memakai slug nama tamu.</small></label>
            <label>Nama tempat<input value={draft.location_name} onChange={(event) => update("location_name", event.target.value)} placeholder="Nama gedung atau lokasi" /></label>
            <label>Tautan Google Maps<input type="url" value={draft.map_url} onChange={(event) => update("map_url", event.target.value)} placeholder="https://maps.google.com/..." /></label>
            <label className="builder-field-full">Alamat lengkap<textarea value={draft.location_address} onChange={(event) => update("location_address", event.target.value)} rows={2} placeholder="Alamat acara" /></label>
            <label className="builder-field-full">Kalimat pembuka<textarea value={draft.quote} onChange={(event) => update("quote", event.target.value)} rows={3} maxLength={1000} placeholder="Tuliskan doa atau kalimat pembuka" /></label>
            <label>Sumber kutipan<input value={draft.quote_source} onChange={(event) => update("quote_source", event.target.value)} placeholder="QS. Ar-Rum: 21" /></label>
            <label>Foto sampul (URL)<input type="url" value={draft.hero_image_url} onChange={(event) => update("hero_image_url", event.target.value)} placeholder="https://..." /></label>
            <label className="builder-field-full">Cerita perjalanan<textarea value={draft.love_story_text} onChange={(event) => update("love_story_text", event.target.value)} rows={4} placeholder={"2021 | Pertemuan pertama | Cerita singkat kalian\n2024 | Hari bahagia | Momen yang ingin dikenang"} /><small>Satu cerita per baris dengan format: Tahun | Judul | Cerita.</small></label>
          </div>
        </section>

        <section className="invite-builder-section"><div className="invite-builder-section-title"><span>03</span><div><h2>Atur tampilan</h2><p>Sesuaikan palet warna dan tipografi undangan.</p></div></div>
          <div className="invite-design-fields"><label>Warna utama<span className="builder-color-input"><input type="color" value={draft.primary_color} onChange={(event) => update("primary_color", event.target.value)} /><input value={draft.primary_color} onChange={(event) => update("primary_color", event.target.value)} pattern="#[0-9A-Fa-f]{6}" /></span></label><label>Warna aksen<span className="builder-color-input"><input type="color" value={draft.accent_color} onChange={(event) => update("accent_color", event.target.value)} /><input value={draft.accent_color} onChange={(event) => update("accent_color", event.target.value)} pattern="#[0-9A-Fa-f]{6}" /></span></label><label>Gaya huruf<select value={draft.font_family} onChange={(event) => update("font_family", event.target.value as Draft["font_family"])}><option value="serif">Serif — klasik</option><option value="sans">Sans serif — modern</option></select></label></div>
          <div className="builder-section-toggles"><strong>Bagian yang ditampilkan</strong><div>{([ ["names", "Nama dan keluarga"], ["story", "Cerita perjalanan"], ["details", "Tanggal dan lokasi"], ["gifts", "Amplop digital"], ["guestbook", "RSVP dan ucapan"], ["spotify", "Spotify"] ] as const).map(([key, label]) => <label key={key}><input type="checkbox" checked={draft.sections[key]} onChange={(event) => setDraft((current) => ({ ...current, sections: { ...current.sections, [key]: event.target.checked } }))} />{label}</label>)}</div></div>
        </section>

        <section className="invite-builder-section"><div className="invite-builder-section-title"><span>04</span><div><h2>Musik Spotify</h2><p>Tempel tautan lagu Spotify untuk pemutar musik di undangan.</p></div></div>
          <div className="invite-builder-fields"><label className="builder-field-full">Tautan atau ID track Spotify<input value={draft.spotify_input} onChange={(event) => update("spotify_input", event.target.value)} placeholder="https://open.spotify.com/track/..." />{draft.spotify_input && !spotifyId && <small className="builder-field-error">Masukkan URL track atau ID Spotify yang valid.</small>}</label><label>Judul lagu<input value={draft.audio_title} onChange={(event) => update("audio_title", event.target.value)} placeholder="Nama lagu — artis" /></label><label>Audio MP3 alternatif (URL)<input type="url" value={draft.audio_preview_url} onChange={(event) => update("audio_preview_url", event.target.value)} placeholder="https://.../audio.mp3" /></label></div>
          {spotifyId && <div className="spotify-preview"><Music2 size={17} /><span>Track Spotify siap disematkan</span><a href={`https://open.spotify.com/track/${spotifyId}`} target="_blank" rel="noreferrer">Lihat track <ArrowUpRight size={14} /></a></div>}
        </section>

        {error && <p className="invite-builder-error" role="alert">{error}</p>}
        {notice && <p className="invite-builder-notice" role="status"><Check size={16} />{notice}</p>}
        <div className="invite-builder-actions"><Link href="/dashboard"><ArrowLeft size={16} />Kembali</Link><div><button type="button" className="builder-save-button" disabled={saving} onClick={() => void saveInvitation(isPublished)}><Save size={16} />{saving ? "Menyimpan…" : isPublished ? "Simpan perubahan" : "Simpan draf"}</button><button type="button" className="builder-publish-button" disabled={saving} onClick={() => void saveInvitation(true)}><Sparkles size={16} />{saving ? "Memproses…" : isPublished ? "Simpan & perbarui" : "Terbitkan undangan"}</button></div></div>
      </form>

      <aside className="invite-builder-preview-column"><div className="invite-preview-label"><Eye size={16} />PRATINJAU KANVAS · PILIH ELEMEN UNTUK MENGATUR</div><div className={`builder-phone-preview template-${draft.template_id}`} onPointerMove={(event) => draggingElement && moveCanvasElement(event, draggingElement)} onPointerUp={() => setDraggingElement(null)} onPointerLeave={() => setDraggingElement(null)} style={{ "--builder-primary": draft.primary_color, "--builder-accent": draft.accent_color, backgroundImage: draft.hero_image_url ? `linear-gradient(#14221b75,#14221bd9),url("${draft.hero_image_url}")` : undefined } as React.CSSProperties}><div className="builder-phone-top"><span>UNDANGAN DIGITAL</span><Heart size={15} /></div><div className="builder-preview-main"><span className="builder-preview-kicker">{draft.event_type === "birthday" ? "THE CELEBRATION OF" : "THE WEDDING OF"}</span><h2>{draft.groom_name || "Nama Pertama"}<i>&amp;</i>{draft.bride_name || "Nama Kedua"}</h2><span className="builder-preview-line" /><p>{draft.quote || "Kalimat pembuka undangan Anda akan tampil di sini."}</p><div className="builder-preview-meta"><span><CalendarDays size={14} />{draft.event_date ? new Date(draft.event_date).toLocaleDateString("id-ID", { dateStyle: "long" }) : "Tanggal acara"}</span><span><MapPin size={14} />{draft.location_name || "Lokasi acara"}</span></div><button type="button" tabIndex={-1}>Buka Undangan <Heart size={13} /></button></div><div className="builder-phone-bottom">DENGAN PENUH SUKACITA · KALAKAI</div>{draft.canvas_elements.map((element) => <div key={element.id} onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setSelectedElement(element.id); setDraggingElement(element.id); }} onClick={() => setSelectedElement(element.id)} className={`builder-canvas-element ${element.type} effect-${element.effect} frame-${element.frame}${selectedElement === element.id ? " selected" : ""}`} style={{ left: `${element.x}%`, top: `${element.y}%`, width: `${element.width}%`, color: element.color, fontSize: `${element.font_size}px`, transform: `translate(-50%,-50%) rotate(${element.rotation}deg)` }}>{element.type === "photo" ? element.image_url ? <img src={element.image_url} alt="Elemen foto" /> : <span>＋ Foto</span> : element.text}</div>)}</div>
      <div className="builder-element-tools"><strong>Tambah elemen</strong><div><button type="button" onClick={() => addCanvasElement("text")}>＋ Teks</button><button type="button" onClick={() => addCanvasElement("ornament", "✦")}>✦ Kilau</button><button type="button" onClick={() => addCanvasElement("ornament", "❀")}>❀ Bunga</button><button type="button" onClick={() => addCanvasElement("ornament", "♡")}>♡ Hati</button><button type="button" onClick={() => addCanvasElement("ornament", "❧")}>❧ Daun</button><button type="button" onClick={() => addCanvasElement("photo")}>▧ Bingkai foto</button></div>{draft.canvas_elements.length > 0 && <button className="builder-delete-element" type="button" onClick={() => { setDraft((current) => ({ ...current, canvas_elements: current.canvas_elements.filter((item) => item.id !== selectedElement) })); setSelectedElement(null); }}>Hapus elemen terpilih</button>}</div>
      {draft.canvas_elements.find((element) => element.id === selectedElement) && (() => { const element = draft.canvas_elements.find((item) => item.id === selectedElement)!; return <div className="builder-element-tools"><strong>Atur elemen terpilih</strong>{element.type !== "ornament" && <label>{element.type === "photo" ? "URL foto" : "Isi teks"}<input value={element.type === "photo" ? element.image_url : element.text} onChange={(event) => updateCanvasElement(element.id, element.type === "photo" ? { image_url: event.target.value } : { text: event.target.value })} placeholder={element.type === "photo" ? "https://..." : "Tulis teks"} /></label>}<div className="builder-element-controls"><label>Ukuran<input type="range" min={element.type === "ornament" ? 20 : 12} max={element.type === "ornament" ? 80 : 48} value={element.type === "ornament" ? element.font_size : element.width} onChange={(event) => updateCanvasElement(element.id, element.type === "ornament" ? { font_size: Number(event.target.value) } : { width: Number(event.target.value) })} /></label><label>Putar<input type="range" min="-30" max="30" value={element.rotation} onChange={(event) => updateCanvasElement(element.id, { rotation: Number(event.target.value) })} /></label><label>Warna<input type="color" value={element.color} onChange={(event) => updateCanvasElement(element.id, { color: event.target.value })} /></label><label>Efek<select value={element.effect} onChange={(event) => updateCanvasElement(element.id, { effect: event.target.value as CanvasElement["effect"] })}><option value="none">Tanpa efek</option><option value="shadow">Bayangan</option><option value="glow">Cahaya</option><option value="outline">Garis tepi</option></select></label>{element.type === "photo" && <label>Bingkai<select value={element.frame} onChange={(event) => updateCanvasElement(element.id, { frame: event.target.value as CanvasElement["frame"] })}><option value="ornate">Ornamen</option><option value="round">Sudut bulat</option><option value="oval">Oval</option><option value="none">Tanpa bingkai</option></select></label>}</div></div>; })()}
      <div className="builder-url-card"><span>URL UNDANGAN</span><strong>{eventUrl}</strong><small>{isPublished ? "Tautan publik aktif" : "Tautan tersedia setelah diterbitkan"}</small><label>Pratinjau nama tamu<input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Contoh: Budi Santoso" /></label><code>{personalUrl.replace(/^https?:\/\//, "")}</code><button type="button" disabled={!isPublished} onClick={() => void copyPersonalLink()}><Copy size={15} />{copiedLink ? "Tautan disalin" : "Salin tautan personal"}</button></div></aside>
    </div>
  </DashboardShell>;
}
