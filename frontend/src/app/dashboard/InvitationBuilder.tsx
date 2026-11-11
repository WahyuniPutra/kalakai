"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Copy, Eye, Music2, Save, Sparkles } from "lucide-react";
import DashboardShell, { type DashboardUser } from "./DashboardShell";
import type { CanvasElement } from "./InvitationCanvasTypes";
import InvitationHTMLBuilder from "./InvitationHTMLBuilder";
import { createDefaultInvitationWebDesign, normalizeInvitationWebDesign, type InvitationWebDesign } from "../invitation-web-types";

type OpenDesignData = { id: string; name: string; canvas_json: string; width: number; height: number; thumbnail_url?: string | null; pages?: { id: string; title: string; canvas_json: string; sort_order: number }[]; brand_kits?: unknown[]; fonts?: unknown[] };

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
  package_code?: "free" | "bahagia" | "resepsi";
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
  open_design: OpenDesignData | null;
  page_transition: "fade" | "slide" | "flip" | "zoom";
  web_design: InvitationWebDesign;
};

const blankDraft: Draft = {
  title: "Undangan acara baru", slug: "undangan-acara-baru", event_type: "wedding", groom_name: "", bride_name: "", event_date: "",
  location_name: "", location_address: "", map_url: "", quote: "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu.",
  quote_source: "QS. Ar-Rum: 21", template_id: "classic", primary_color: "#b85c68", accent_color: "#dc9a9a", font_family: "serif",
  hero_image_url: "", spotify_input: "", audio_title: "", audio_preview_url: "", love_story_text: "",
  sections: { names: true, story: true, details: true, gifts: true, guestbook: true, spotify: true },
  canvas_elements: [],
  open_design: null,
  page_transition: "fade",
  web_design: createDefaultInvitationWebDesign(),
};


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

function applyTemplateToWebDesign(design: OpenDesignData, current: Draft): Partial<Draft> {
  const source = design.pages?.[0]?.canvas_json || design.canvas_json;
  let background = current.primary_color;
  let accent = current.accent_color;
  try {
    const json = JSON.parse(source) as { objects?: Array<{ type?: string; fill?: unknown; width?: number; height?: number }> };
    const objects = json.objects ?? [];
    const color = (value: unknown) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : null;
    const fullCanvas = objects.find((item) => item.type === "rect" && (item.width ?? 0) >= design.width * .85 && (item.height ?? 0) >= design.height * .85);
    background = color(fullCanvas?.fill) ?? background;
    const candidates = objects.map((item) => color(item.fill)).filter((item): item is string => Boolean(item));
    accent = candidates.find((item) => item.toLowerCase() !== background.toLowerCase() && !["#ffffff", "#000000", "#f8f5ef"].includes(item.toLowerCase())) ?? accent;
  } catch { /* Keep the existing palette if the selected template data is unavailable. */ }
  const web_design = normalizeInvitationWebDesign(current.web_design);
  return {
    primary_color: background,
    accent_color: accent,
    web_design: { ...web_design, sections: web_design.sections.map((section) => section.type === "hero" ? { ...section, background } : section) },
  };
}

export default function InvitationBuilder({ eventId, user }: { eventId?: string; user: DashboardUser }) {
  const router = useRouter();
  const [siteOrigin, setSiteOrigin] = useState(process.env.NEXT_PUBLIC_SITE_URL || "https://kalakai.site");
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [isPublished, setIsPublished] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(eventId));
  const [loading, setLoading] = useState(Boolean(eventId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [guestName, setGuestName] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [packageCode, setPackageCode] = useState<"free" | "bahagia" | "resepsi">("free");

  useEffect(() => {
    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) setSiteOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    fetch(`/api/user/events/${eventId}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Undangan tidak dapat dimuat.");
        if (!active) return;
        const theme = data.theme_config ?? {};
        setPackageCode(data.package_code === "bahagia" || data.package_code === "resepsi" ? data.package_code : "free");
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
          canvas_elements: Array.isArray(theme.canvas_elements) ? (theme.canvas_elements as Partial<CanvasElement>[]).map((element, index) => ({ id: element.id ?? `element-${index}`, page: element.page ?? "cover", type: element.type ?? "text", text: element.text ?? "", image_url: element.image_url ?? "", x: element.x ?? 50, y: element.y ?? 50, width: element.width ?? 55, height: element.height ?? (element.type === "photo" ? 24 : 12), font_size: element.font_size ?? 20, color: element.color ?? String(theme.accent_color ?? "#dc9a9a"), rotation: element.rotation ?? 0, effect: element.effect ?? "none", frame: element.frame ?? "none", font_family: element.font_family ?? "serif", font_style: element.font_style ?? "normal", opacity: element.opacity ?? 1 })) : [],
          open_design: (theme.open_design as { design?: OpenDesignData; brand_kits?: unknown[]; fonts?: unknown[] } | undefined)?.design ? { ...(theme.open_design as { design: OpenDesignData }).design, brand_kits: (theme.open_design as { brand_kits?: unknown[] }).brand_kits ?? [], fonts: (theme.open_design as { fonts?: unknown[] }).fonts ?? [] } : null,
          page_transition: (theme.page_transition as Draft["page_transition"]) ?? "fade",
          web_design: normalizeInvitationWebDesign(theme.web_design),
        });
        setIsPublished(Boolean(data.is_published));
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Undangan tidak dapat dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [eventId]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !event.data || typeof event.data !== "object") return;
      if (event.data.type === "kalakai:opendesign:navigate") {
        if (typeof event.data.path === "string" && event.data.path.startsWith("/design/")) {
          const id = decodeURIComponent(event.data.path.slice("/design/".length));
          setDraft((current) => ({ ...current, open_design: current.open_design ?? { id, name: "Undangan Kalakai", canvas_json: "{}", width: 1080, height: 1920 } }));
          setActiveTab(3);
        }
      }
      if (event.data.type === "kalakai:opendesign:created" && String(event.data.eventId) === String(eventId) && event.data.design) {
        setDraft((current) => ({ ...current, open_design: event.data.design as OpenDesignData, ...applyTemplateToWebDesign(event.data.design as OpenDesignData, current) }));
        setActiveTab(3);
      }
      if (event.data.type === "kalakai:opendesign:update" && String(event.data.eventId) === String(eventId) && event.data.design) {
        setDraft((current) => ({ ...current, open_design: event.data.design as OpenDesignData, ...applyTemplateToWebDesign(event.data.design as OpenDesignData, current) }));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [eventId]);

  const siteHost = useMemo(() => new URL(siteOrigin).host, [siteOrigin]);
  const eventUrl = useMemo(() => `${siteHost}/${draft.slug || "nama-acara"}/[nama-tamu]`, [siteHost, draft.slug]);
  const personalUrl = useMemo(() => `${siteOrigin}/${draft.slug || "nama-acara"}/${slugify(guestName) || "nama-tamu"}`, [siteOrigin, draft.slug, guestName]);
  const spotifyId = useMemo(() => getSpotifyId(draft.spotify_input), [draft.spotify_input]);

  function update<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !slugTouched) next.slug = slugify(String(value)) || "undangan-acara";
      return next;
    });
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
        page_transition: draft.page_transition,
        web_design: draft.web_design,
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

  async function uploadAssetFile(file: File): Promise<string> {
    if (!eventId) throw new Error("Simpan draf acara terlebih dahulu sebelum mengunggah foto.");
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`/api/user/events/${eventId}/assets`, { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Gagal mengunggah foto.");
    return data.url as string;
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

  if (loading) return <div className="invite-builder-loading">Memuat undangan…</div>;

  return <DashboardShell user={user} section="events">
    <div className="invite-builder-heading"><div><p className="eyebrow"><span className="eyebrow-dot" />PEMBUAT UNDANGAN</p><h1>{eventId ? "Kustomisasi undangan" : "Mulai undangan baru"}</h1><p>Pilih dasar desain, isi detail acara, lalu sesuaikan tampilannya.</p></div><span className="invite-builder-plan">PAKET {packageCode === "free" ? "KERABAT FREE" : packageCode === "bahagia" ? "BAHAGIA" : "RESEPSI"}</span></div>
    <nav className="invite-builder-tabs" role="tablist" aria-label="Langkah pembuatan undangan">
      {[
        [1, "Informasi acara", "Identitas & tautan"],
        [2, "Detail acara", "Lokasi, cerita & musik"],
        [3, "Editor desain", "Tata letak & tampilan"],
      ].map(([step, label, hint]) => (
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === step}
          className={activeTab === step ? "active" : ""}
          key={step}
          onClick={() => setActiveTab(Number(step))}
        >
          <span>{String(step).padStart(2, "0")}</span>
          <strong>{label}</strong>
          <small>{hint}</small>
        </button>
      ))}
    </nav>
    <div className={`invite-builder-layout${activeTab === 3 ? " is-editor-tab" : ""}`}>
      <form className="invite-builder-form" data-active-tab={activeTab} onSubmit={handleSubmit}>
        <section className="invite-builder-section" data-builder-section="1">
          <div className="invite-builder-section-title">
            <span>01</span>
            <div>
              <h2>Informasi acara</h2>
              <p>Tentukan nama acara, jenis acara, tanggal pelaksanaan, dan tautan unik undangan.</p>
            </div>
          </div>
          <div className="invite-builder-fields">
            <label className="builder-field-full">
              Nama acara
              <input value={draft.title} onChange={(event) => update("title", event.target.value)} required maxLength={255} placeholder="Pernikahan Alya & Bima" />
            </label>
            <label className="builder-field-full">
              Slug URL acara
              <div className="builder-slug-input">
                <span>{siteHost}/</span>
                <input value={draft.slug} onChange={(event) => { setSlugTouched(true); update("slug", slugify(event.target.value)); }} required maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="nama-acara" />
                <span>/[nama-tamu]</span>
              </div>
              <small>Tautan personal untuk setiap tamu akan memakai slug nama tamu secara otomatis.</small>
            </label>
            <label>
              Jenis acara
              <select value={draft.event_type} onChange={(event) => update("event_type", event.target.value)}>
                <option value="wedding">Pernikahan</option>
                <option value="engagement">Pertunangan</option>
                <option value="birthday">Ulang tahun</option>
                <option value="other">Acara lainnya</option>
              </select>
            </label>
            <label>
              Tanggal &amp; waktu
              <input type="datetime-local" value={draft.event_date} onChange={(event) => update("event_date", event.target.value)} />
            </label>
            <label>
              {draft.event_type === "birthday" ? "Nama yang berulang tahun" : "Nama orang pertama (Mempelai Pria)"}
              <input value={draft.groom_name} onChange={(event) => update("groom_name", event.target.value)} placeholder="Nama lengkap" />
            </label>
            <label>
              {draft.event_type === "birthday" ? "Nama orang tua / keluarga" : "Nama orang kedua (Mempelai Wanita)"}
              <input value={draft.bride_name} onChange={(event) => update("bride_name", event.target.value)} placeholder="Opsional" />
            </label>
          </div>
        </section>

        <section className="invite-builder-section" data-builder-section="2">
          <div className="invite-builder-section-title">
            <span>02</span>
            <div>
              <h2>Detail acara &amp; cerita</h2>
              <p>Isi detail lokasi tempat acara, doa atau kutipan pembuka, cerita perjalanan, dan musik pengiring.</p>
            </div>
          </div>
          <div className="invite-builder-fields">
            <label>
              Nama tempat / gedung
              <input value={draft.location_name} onChange={(event) => update("location_name", event.target.value)} placeholder="Nama gedung atau lokasi" />
            </label>
            <label>
              Tautan Google Maps
              <input type="url" value={draft.map_url} onChange={(event) => update("map_url", event.target.value)} placeholder="https://maps.google.com/..." />
            </label>
            <label className="builder-field-full">
              Alamat lengkap
              <textarea value={draft.location_address} onChange={(event) => update("location_address", event.target.value)} rows={2} placeholder="Alamat lengkap acara" />
            </label>
            <label className="builder-field-full">
              Kalimat pembuka / Doa
              <textarea value={draft.quote} onChange={(event) => update("quote", event.target.value)} rows={3} maxLength={1000} placeholder="Tuliskan doa atau kalimat pembuka" />
            </label>
            <label>
              Sumber kutipan / Surat
              <input value={draft.quote_source} onChange={(event) => update("quote_source", event.target.value)} placeholder="QS. Ar-Rum: 21" />
            </label>
            <label>
              Foto sampul utama (URL)
              <input type="url" value={draft.hero_image_url} onChange={(event) => update("hero_image_url", event.target.value)} placeholder="https://..." />
            </label>
            <label className="builder-field-full">
              Cerita perjalanan (Love Story)
              <textarea value={draft.love_story_text} onChange={(event) => update("love_story_text", event.target.value)} rows={4} placeholder={"2021 | Pertemuan pertama | Cerita singkat kalian\n2024 | Hari bahagia | Momen yang ingin dikenang"} />
              <small>Satu cerita per baris dengan format: Tahun | Judul | Cerita.</small>
            </label>
            <label className="builder-field-full">
              Tautan atau ID track Spotify
              <input value={draft.spotify_input} onChange={(event) => update("spotify_input", event.target.value)} placeholder="https://open.spotify.com/track/..." />
              {draft.spotify_input && !spotifyId && <small className="builder-field-error">Masukkan URL track atau ID Spotify yang valid.</small>}
            </label>
            <label>
              Judul lagu Spotify
              <input value={draft.audio_title} onChange={(event) => update("audio_title", event.target.value)} placeholder="Nama lagu — artis" />
            </label>
            <label>
              Audio MP3 alternatif (URL)
              <input type="url" value={draft.audio_preview_url} onChange={(event) => update("audio_preview_url", event.target.value)} placeholder="https://.../audio.mp3" />
            </label>
          </div>
          {spotifyId && (
            <div className="spotify-preview" style={{ marginTop: 14 }}>
              <Music2 size={17} />
              <span>Track Spotify siap disematkan</span>
              <a href={`https://open.spotify.com/track/${spotifyId}`} target="_blank" rel="noreferrer">
                Lihat track <ArrowUpRight size={14} />
              </a>
            </div>
          )}
        </section>

        <section className="invite-builder-section invite-canvas-section" data-builder-section="3">
          <div className="invite-builder-section-title">
            <span>03</span>
            <div>
              <h2>Editor desain &amp; tampilan HTML</h2>
              <p>Atur warna, font, animasi, serta susun section dan elemen undangan. Anda dapat langsung mengedit teks atau menyeret elemen pada kanvas undangan.</p>
            </div>
          </div>
          <InvitationHTMLBuilder
            value={draft.web_design}
            onChange={(web_design) => update("web_design", web_design)}
            title={draft.title}
            groom={draft.groom_name}
            bride={draft.bride_name}
            date={draft.event_date}
            location={draft.location_name}
            quote={draft.quote}
            photo={draft.hero_image_url}
            primary={draft.primary_color}
            accent={draft.accent_color}
            plan={packageCode}
            eventId={eventId}
            onUploadImage={eventId ? uploadAssetFile : undefined}
            onUpdateEventData={(field, val) => update(field as keyof Draft, val as any)}
            onUpdatePrimaryColor={(c) => update("primary_color", c)}
            onUpdateAccentColor={(c) => update("accent_color", c)}
          />
        </section>

        {error && <p className="invite-builder-error" role="alert">{error}</p>}
        {notice && <p className="invite-builder-notice" role="status"><Check size={16} />{notice}</p>}
        <div className="invite-builder-actions"><Link href="/dashboard"><ArrowLeft size={16} />Kembali</Link><div><button type="button" className="builder-save-button" disabled={saving} onClick={() => void saveInvitation(isPublished)}><Save size={16} />{saving ? "Menyimpan…" : isPublished ? "Simpan perubahan" : "Simpan draf"}</button><button type="button" className="builder-publish-button" disabled={saving} onClick={() => void saveInvitation(true)}><Sparkles size={16} />{saving ? "Memproses…" : isPublished ? "Simpan & perbarui" : "Terbitkan undangan"}</button></div></div>
      </form>

      <aside className="invite-builder-preview-column"><div className="invite-preview-label"><Eye size={16} />TAUTAN UNDANGAN</div><div className="builder-url-card"><span>URL UNDANGAN</span><strong>{eventUrl}</strong><small>{isPublished ? "Tautan publik aktif" : "Tautan tersedia setelah diterbitkan"}</small><label>Pratinjau nama tamu<input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Contoh: Budi Santoso" /></label><code>{personalUrl.replace(/^https?:\/\//, "")}</code><button type="button" disabled={!isPublished} onClick={() => void copyPersonalLink()}><Copy size={15} />{copiedLink ? "Tautan disalin" : "Salin tautan personal"}</button></div></aside>
    </div>
  </DashboardShell>;
}
