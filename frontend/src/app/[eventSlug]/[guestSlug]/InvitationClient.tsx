"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import dynamic from "next/dynamic";
import InvitationWebRenderer from "./InvitationWebRenderer";
import { createDefaultInvitationWebDesign, normalizeInvitationWebDesign } from "../../invitation-web-types";
import { 
  Heart, Calendar, MapPin, Music, VolumeX, Volume2, 
  Copy, Check, Send, QrCode, Clock, Sparkles, Navigation 
} from "lucide-react";

const OpenDesignInvitationPages = dynamic(() => import("./OpenDesignInvitationPages"), { ssr: false });

interface EventData {
  id: number;
  title: string;
  event_type: string;
  slug: string;
  package_code?: "free" | "bahagia" | "resepsi";
  groom_name: string | null;
  bride_name: string | null;
  event_date: string | null;
  location_name: string;
  location_address: string;
  map_url: string;
  spotify_track_id: string | null;
  theme_config: {
    template_id?: string;
    page_transition?: string;
    web_design?: unknown;
    primary_color?: string;
    accent_color?: string;
    font_family?: string;
    hero_image_url?: string;
    quote?: string;
    quote_source?: string;
    audio_title?: string;
    audio_preview_url?: string;
    sections?: Record<string, boolean>;
    canvas_elements?: Array<{ id: string; page?: "cover" | "names" | "story" | "details" | "gifts" | "guestbook"; type: "text" | "ornament" | "photo" | "rect" | "circle" | "line"; text: string; image_url: string; x: number; y: number; width: number; height?: number; font_size: number; font_family?: "serif" | "sans"; font_style?: "normal" | "bold" | "italic" | "bold italic"; opacity?: number; color: string; rotation: number; effect: "none" | "shadow" | "glow" | "outline"; frame: "none" | "round" | "oval" | "ornate" }>;
    open_design?: { design?: { width: number; height: number; pages?: Array<{ id: string; title: string; canvas_json: string; sort_order: number }> } };
    love_story?: Array<{ year: string; title: string; desc: string }>;
  } | null;
  gift_accounts?: Array<{
    id: number;
    bank_name: string;
    account_number: string;
    account_holder: string;
    qris_image_url?: string;
  }>;
  wishes?: Array<{
    id: number;
    guest_name: string;
    attendance: string;
    message: string;
    created_at: string;
  }>;
}

interface GuestData {
  id?: number;
  name: string;
  slug: string;
  category: string;
  pax: number;
  qr_code: string;
  status: string;
}

export default function InvitationClient({ eventSlug, guestSlug }: { eventSlug: string; guestSlug?: string }) {
  

  const [event, setEvent] = useState<EventData | null>(null);
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  // RSVP Form State
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("hadir");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // Fetch Event & Guest Data
  useEffect(() => {
    async function fetchData() {
      try {
        const url = guestSlug 
          ? `${backendUrl}/api/events/${eventSlug}/guest/${guestSlug}`
          : `${backendUrl}/api/events/${eventSlug}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal memuat data undangan");
        const json = await res.json();
        
        if (json.data.event) {
          setEvent(json.data.event);
          setGuest(json.data.guest);
          setRsvpName(json.data.guest.name || "");
        } else {
          setEvent(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (eventSlug) {
      fetchData();
    }
  }, [eventSlug, guestSlug, backendUrl]);

  // Countdown Timer
  useEffect(() => {
    if (!event?.event_date) return;
    const target = new Date(event.event_date).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [event?.event_date]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleCopyAccount = (bank: string, number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleSubmitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName || !rsvpMessage) return;

    setSubmittingRsvp(true);
    try {
      const res = await fetch(`${backendUrl}/api/events/${eventSlug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: rsvpName,
          attendance: rsvpStatus,
          message: rsvpMessage,
          guest_id: guest?.id,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengirim RSVP");
      const json = await res.json();
      
      // Update local wishes
      if (event && json.data) {
        setEvent({
          ...event,
          wishes: [json.data, ...(event.wishes || [])],
        });
      }
      setRsvpSuccess(true);
      setRsvpMessage("");
    } catch (err) {
      console.error(err);
      alert("Terjadi kendala saat mengirim konfirmasi kehadiran.");
    } finally {
      setSubmittingRsvp(false);
    }
  };

  const theme = event?.theme_config ?? {};
  const displayNames = [event?.groom_name, event?.bride_name].filter((name): name is string => Boolean(name));
  const invitationTitle = displayNames.length ? displayNames.join(" & ") : event?.title ?? "Undangan";
  const designedPages = useMemo(() => (theme.open_design?.design?.pages ?? []).filter((page) => page.canvas_json && page.canvas_json !== "{}"), [theme.open_design?.design?.pages]);
  const designedWidth = theme.open_design?.design?.width ?? 1080;
  const designedHeight = theme.open_design?.design?.height ?? 1920;
  const webDesign = theme.web_design ? normalizeInvitationWebDesign(theme.web_design) : designedPages.length > 0 ? createDefaultInvitationWebDesign() : null;
  const invitationFields = useMemo(() => {
    const eventDateText = event?.event_date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(event.event_date)) : "";
    const names = displayNames.join(" & ");
    return {
      event_title: event?.title ?? "",
      event_type: event?.event_type === "birthday" ? "MOMEN ULANG TAHUN" : event?.event_type === "engagement" ? "MOMEN PERTUNANGAN" : "WALIMATUL 'URSY",
      groom_name: event?.groom_name ?? "",
      bride_name: event?.bride_name ?? "",
      couple_names: names || event?.title || "",
      event_date: eventDateText,
      location_name: event?.location_name || "",
      location_address: event?.location_address || "",
      map_url: event?.map_url || "",
      quote: theme.quote || "",
      quote_source: theme.quote_source || "",
      hero_image_url: theme.hero_image_url || "",
      love_story: theme.love_story?.map((story) => `${story.year} · ${story.title}\n${story.desc}`).join("\n\n") || "",
      guest_name: guest?.name ?? "",
    };
  }, [event?.title, event?.event_type, event?.groom_name, event?.bride_name, event?.event_date, event?.location_name, event?.location_address, event?.map_url, theme.quote, theme.quote_source, theme.hero_image_url, theme.love_story, guest?.name]);


  if (loading) {
    return (
      <div className="min-h-screen bg-rose-950 flex flex-col items-center justify-center text-rose-100 font-serif">
        <Heart className="h-10 w-10 animate-bounce text-rose-400 mb-4" />
        <p className="text-lg tracking-widest uppercase text-xs">Memuat Undangan...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Undangan Tidak Ditemukan</h1>
        <p className="text-slate-400 text-sm">Pastikan alamat tautan yang Anda masukkan sudah benar.</p>
      </div>
    );
  }

  const sections = theme.sections as Record<string, boolean> | undefined;
  const showSection = (name: string) => sections?.[name] ?? true;
  const hasCanvasPage = (page: string) => Boolean(theme.canvas_elements?.some((element) => (element.page ?? "cover") === page));
  const renderCanvasElements = (page: "cover" | "names" | "story" | "details" | "gifts" | "guestbook") => <div className="invitation-canvas-elements" aria-label={`Elemen desain ${page}`}>{theme.canvas_elements?.filter((element) => (element.page ?? "cover") === page).map((element) => <div key={element.id} className={`invitation-canvas-element ${element.type} effect-${element.effect} frame-${element.frame}`} style={{ left: `${element.x}%`, top: `${element.y}%`, width: `${element.width}%`, height: `${element.height ?? 12}%`, color: element.color, backgroundColor: element.type === "rect" || element.type === "circle" ? element.color : undefined, fontSize: `clamp(12px, ${(element.font_size / 640) * 100}vh, 80px)`, fontFamily: element.font_family === "sans" ? "Arial, sans-serif" : "Georgia, serif", fontWeight: element.font_style?.includes("bold") ? 700 : undefined, fontStyle: element.font_style?.includes("italic") ? "italic" : undefined, opacity: element.opacity ?? 1, transform: `translate(-50%,-50%) rotate(${element.rotation}deg)` }}>{element.type === "photo" ? element.image_url ? <img src={element.image_url} alt="Foto pada undangan" /> : null : element.type === "rect" || element.type === "circle" || element.type === "line" ? null : element.text}</div>)}</div>;
  const cssTheme = {
    "--invite-primary": theme.primary_color || "#e11d48",
    "--invite-accent": theme.accent_color || "#fb7185",
    "--invite-font": theme.font_family === "sans" ? "Arial, Helvetica, sans-serif" : "Georgia, 'Times New Roman', serif",
  } as React.CSSProperties;

  return (
    <div className="kalakai-invitation min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-rose-500 selection:text-white relative overflow-x-hidden" data-template={theme.template_id ?? "classic"} style={cssTheme}>
      {/* Background Audio */}
      <audio 
        ref={audioRef} 
        src={theme.audio_preview_url || undefined}
        loop 
      />

      {/* Floating Music Toggle */}
      {isOpen && theme.audio_preview_url && (
        <button
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-rose-600/90 text-white shadow-xl backdrop-blur-md hover:bg-rose-500 transition-all border border-rose-400/40 cursor-pointer"
          aria-label="Toggle Music"
        >
          {isPlaying ? (
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 animate-pulse" />
              <span className="text-[10px] font-medium pr-1 hidden sm:inline">Playing</span>
            </div>
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </button>
      )}

      {/* 1. Opening Cover Modal */}
      {!isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-stone-950 via-rose-950 to-stone-950 p-6 text-center">
          <div className="max-w-md w-full border border-rose-800/40 bg-stone-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="flex justify-center">
              <span className="p-3 bg-rose-500/10 rounded-full border border-rose-500/30 text-rose-400">
                <Sparkles className="h-6 w-6" />
              </span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-rose-300 font-mono">{event.event_type === "birthday" ? "The Celebration" : event.event_type === "engagement" ? "The Engagement" : "The Wedding Invitation"}</p>
              <h1 className="text-3xl sm:text-4xl font-serif text-white mt-2 font-bold tracking-tight">
                {displayNames.length ? displayNames.map((name) => name?.split(" ")[0]).join(" & ") : event.title}
              </h1>
            </div>

            {guest && (
              <div className="bg-stone-950/70 border border-stone-800/80 p-4 rounded-2xl">
                <p className="text-xs text-stone-400">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
                <h3 className="text-lg font-bold text-rose-300 mt-1">{guest.name}</h3>
                <span className="inline-block mt-2 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {guest.category || "Tamu Terhormat"}
                </span>
              </div>
            )}

            <button
              onClick={handleOpenInvitation}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium shadow-lg hover:from-rose-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Heart className="h-4 w-4 fill-current group-hover:scale-125 transition-transform" />
              Buka Undangan
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Invitation Content */}
      <div className={`transition-opacity duration-1000 ${isOpen ? "opacity-100" : "opacity-0"}`}>
        {webDesign && isOpen && (
          <InvitationWebRenderer
            design={webDesign}
            event={event}
            guestName={guest?.name}
            primary={theme.primary_color}
            accent={theme.accent_color}
            onMusic={(action) => {
              if (!audioRef.current) return;
              if (action === "play") audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
              else if (action === "pause") { audioRef.current.pause(); setIsPlaying(false); }
              else toggleMusic();
            }}
            slots={{
              ticket: guest ? (
                <div className="border border-rose-700/50 bg-gradient-to-b from-rose-950/40 to-stone-900/80 p-8 rounded-3xl shadow-xl space-y-4 max-w-md mx-auto text-center">
                  <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-wider">
                    <QrCode className="h-4 w-4" /> Tiket Masuk &amp; Check-In Tamu
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white">{guest.name}</h3>
                  <p className="text-xs text-stone-400">
                    Tunjukkan QR Code ini kepada penerima tamu di meja resepsi untuk pencatatan kehadiran cepat:
                  </p>
                  <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(guest.qr_code)}`}
                      alt={`QR Code ${guest.name}`}
                      className="w-40 h-40 object-contain mx-auto"
                    />
                  </div>
                  <div className="flex justify-center items-center gap-4 text-xs font-mono">
                    <span className="bg-stone-950 px-3 py-1 rounded-full border border-stone-800 text-stone-300">
                      Kode: {guest.qr_code}
                    </span>
                    <span className="bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30 text-rose-300">
                      Kuota: {guest.pax} Orang
                    </span>
                  </div>
                </div>
              ) : null,
              gifts: ((event.gift_accounts?.length ?? 0) > 0) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                  {event.gift_accounts?.map((acc) => (
                    <div key={acc.id} className="bg-stone-900 border border-stone-800 p-6 rounded-2xl text-left flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          {acc.bank_name}
                        </span>
                        <div className="mt-3 text-xl font-mono font-bold text-white tracking-wider">
                          {acc.account_number}
                        </div>
                        <div className="text-xs text-stone-400 mt-1">a.n. {acc.account_holder}</div>
                      </div>
                      <button
                        onClick={() => handleCopyAccount(acc.bank_name, acc.account_number)}
                        className="w-full py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedBank === acc.bank_name ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" /> Tersalin!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Salin Nomor Rekening
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : null,
              rsvp: (
                <div className="max-w-2xl mx-auto space-y-6 text-left">
                  <form onSubmit={handleSubmitRsvp} className="bg-stone-900 p-6 rounded-3xl border border-stone-800 space-y-4">
                    {rsvpSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                        <Check className="h-4 w-4" /> Terima kasih! Doa dan konfirmasi kehadiran Anda berhasil terkirim.
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        required
                        placeholder="Masukkan nama Anda..."
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Konfirmasi Kehadiran</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "hadir", label: "Akan Hadir" },
                          { id: "tidak_hadir", label: "Tidak Hadir" },
                          { id: "ragu", label: "Masih Ragu" },
                        ].map((opt) => (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setRsvpStatus(opt.id)}
                            className={`py-2 text-xs font-medium rounded-xl border transition ${
                              rsvpStatus === opt.id
                                ? "bg-rose-600 text-white border-rose-500"
                                : "bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">Ucapan &amp; Doa Restu</label>
                      <textarea
                        rows={3}
                        value={rsvpMessage}
                        onChange={(e) => setRsvpMessage(e.target.value)}
                        required
                        placeholder="Tuliskan ucapan dan doa terbaik Anda..."
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-rose-500"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingRsvp}
                      className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {submittingRsvp ? "Mengirim..." : "Kirim Ucapan"}
                    </button>
                  </form>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-stone-300">
                      Ucapan Doa ({event.wishes?.length || 0})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {event.wishes && event.wishes.length > 0 ? (
                        event.wishes.map((w) => (
                          <div key={w.id} className="bg-stone-900/60 p-4 rounded-2xl border border-stone-800/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-white">{w.guest_name}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                w.attendance === "hadir" 
                                  ? "bg-emerald-500/20 text-emerald-400" 
                                  : w.attendance === "tidak_hadir" 
                                  ? "bg-rose-500/20 text-rose-400" 
                                  : "bg-amber-500/20 text-amber-400"
                              }`}>
                                {w.attendance === "hadir" ? "Hadir" : w.attendance === "tidak_hadir" ? "Tidak Hadir" : "Ragu"}
                              </span>
                            </div>
                            <p className="text-xs text-stone-300 leading-relaxed">{w.message}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-stone-500 text-center py-6">Belum ada ucapan. Jadilah yang pertama mengirimkan doa!</p>
                      )}
                    </div>
                  </div>
                </div>
              ),
            }}
          />
        )}
        {!webDesign && designedPages.length > 0 && isOpen && <OpenDesignInvitationPages pages={designedPages} width={designedWidth} height={designedHeight} names={displayNames.join(" & ")} guestName={guest?.name ?? ""} eventDate={event.event_date ?? ""} location={event.location_name || event.location_address || ""} fields={invitationFields} packageCode={event.package_code ?? "free"} pageTransition={theme.page_transition ?? "fade"} isActive={isOpen} />}
        {!webDesign && designedPages.length === 0 && <>
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-stone-950 via-rose-950/60 to-stone-950 relative" style={theme.hero_image_url ? { backgroundImage: `linear-gradient(#11181499,#111814d9),url("${theme.hero_image_url}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
          {renderCanvasElements("cover")}
          <div className="max-w-2xl mx-auto space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-rose-300 font-mono">{event.event_type === "birthday" ? "MOMEN ULANG TAHUN" : event.event_type === "engagement" ? "MOMEN PERTUNANGAN" : "WALIMATUL &apos;URSY"}</span>
            <h1 className="text-5xl sm:text-7xl font-serif text-rose-100 font-bold tracking-tight">
              {displayNames.length ? <>{displayNames[0]?.split(" ")[0]} {displayNames[1] && <><span className="text-rose-500 font-light">&amp;</span> {displayNames[1]?.split(" ")[0]}</>}</> : event.title}
            </h1>
            <p className="text-stone-300 text-sm max-w-lg mx-auto italic font-serif">
              &quot;{theme.quote || "Dengan penuh rasa syukur, kami mengundang Anda untuk merayakan momen istimewa bersama."}&quot;
            </p>
            {theme.quote_source && <p className="text-xs text-rose-400 font-medium">({theme.quote_source})</p>}

            {/* Countdown */}
            <div className="pt-6 grid grid-cols-4 gap-3 max-w-sm mx-auto">
              {[
                { label: "Hari", val: timeLeft.days },
                { label: "Jam", val: timeLeft.hours },
                { label: "Menit", val: timeLeft.minutes },
                { label: "Detik", val: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="bg-stone-900/80 border border-rose-900/40 p-3 rounded-2xl">
                  <div className="text-2xl font-bold font-mono text-white">{item.val}</div>
                  <div className="text-[10px] uppercase text-stone-400 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {showSection("spotify") && event.spotify_track_id && <section className="spotify-invitation-section"><div><Music className="h-5 w-5" /><span>{theme.audio_title || "Lagu pilihan untuk hari istimewa"}</span></div><iframe title={`Spotify: ${theme.audio_title || invitationTitle}`} src={`https://open.spotify.com/embed/track/${event.spotify_track_id}?utm_source=generator&theme=0`} width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" /></section>}

        {/* Groom & Bride Section */}
        {showSection("names") && <section className="relative py-20 px-6 max-w-4xl mx-auto text-center space-y-12">
          {renderCanvasElements("names")}
          <div className="space-y-3">
            <h2 className="text-3xl font-serif font-bold text-white">{event.event_type === "birthday" ? "Yang Berbahagia" : event.event_type === "engagement" ? "Pasangan yang Berbahagia" : "Mempelai Bahagia"}</h2>
            <p className="text-stone-400 text-sm">{event.event_type === "birthday" ? "Dengan penuh syukur, kami mengundang Anda untuk merayakan hari istimewa bersama." : "Dengan penuh rasa syukur, kami mengundang Anda untuk merayakan momen istimewa bersama:"}</p>
          </div>

          <div className={`grid grid-cols-1 ${event.bride_name ? "md:grid-cols-2" : "max-w-xl mx-auto"} gap-8`}>
            {displayNames.map((name, index) => <div key={`${name}-${index}`} className="bg-stone-900/60 border border-stone-800 p-8 rounded-3xl space-y-3"><h3 className="text-2xl font-serif font-bold text-rose-300">{name}</h3><p className="text-xs text-stone-400">{event.event_type === "birthday" ? "Dengan hangat mengundang Anda" : index === 0 ? "Dengan penuh rasa syukur" : "Bersama keluarga tercinta"}</p></div>)}
          </div>
        </section>}

        {showSection("story") && (!!theme.love_story?.length || hasCanvasPage("story")) && <section className="relative py-20 px-6 max-w-3xl mx-auto">{renderCanvasElements("story")}<div className="text-center mb-10"><p className="text-xs uppercase tracking-[0.25em] text-rose-300">CERITA KAMI</p><h2 className="mt-3 text-3xl font-serif text-white">Perjalanan menuju hari ini</h2></div><div className="space-y-4">{theme.love_story?.map((story, index) => <article key={`${story.year}-${index}`} className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6"><span className="text-sm font-semibold" style={{ color: theme.accent_color || theme.primary_color || "#fb7185" }}>{story.year}</span><h3 className="mt-2 text-xl font-serif text-white">{story.title}</h3><p className="mt-2 text-sm leading-relaxed text-stone-300">{story.desc}</p></article>)}</div></section>}

        {/* Schedule & Location Section */}
        {showSection("details") && <section className="relative py-20 px-6 bg-stone-900/40 border-y border-stone-900">{renderCanvasElements("details")}
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-serif font-bold text-white">Detail Acara</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-3"><div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase"><Clock className="h-4 w-4" />Tanggal &amp; waktu</div><div className="text-lg font-bold text-white">{event.event_date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date(event.event_date)) : "Segera diumumkan"}</div><p className="text-xs text-stone-400">Waktu lokal acara</p></div>
              <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-3"><div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase"><MapPin className="h-4 w-4" />Lokasi</div><div className="text-lg font-bold text-white">{event.location_name || "Lokasi menyusul"}</div><p className="text-xs text-stone-400">{event.location_address}</p></div>
            </div>

            <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 text-center space-y-3">
              <MapPin className="h-6 w-6 text-rose-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">{event.location_name}</h3>
              <p className="text-sm text-stone-400 max-w-md mx-auto">{event.location_address}</p>
              {event.map_url && (
                <a
                  href={event.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition"
                >
                  <Navigation className="h-4 w-4" /> Buka Google Maps
                </a>
              )}
            </div>
          </div>
        </section>}
        </>}

        {/* 3. Legacy / Fallback Guest Reception QR Code Pass, Gifts & RSVP */}
        {!webDesign && <>
        {showSection("guestbook") && guest && (
          <section className="py-20 px-6 max-w-xl mx-auto text-center space-y-6">
            <div className="border border-rose-700/50 bg-gradient-to-b from-rose-950/40 to-stone-900/80 p-8 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-wider">
                <QrCode className="h-4 w-4" /> Tiket Masuk &amp; Check-In Tamu
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">{guest.name}</h3>
              <p className="text-xs text-stone-400">
                Tunjukkan QR Code ini kepada penerima tamu di meja resepsi untuk pencatatan kehadiran cepat:
              </p>

              {/* QR Image */}
              <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(guest.qr_code)}`}
                  alt={`QR Code ${guest.name}`}
                  className="w-40 h-40 object-contain mx-auto"
                />
              </div>

              <div className="flex justify-center items-center gap-4 text-xs font-mono">
                <span className="bg-stone-950 px-3 py-1 rounded-full border border-stone-800 text-stone-300">
                  Kode: {guest.qr_code}
                </span>
                <span className="bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30 text-rose-300">
                  Kuota: {guest.pax} Orang
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 4. Digital Envelope */}
        {showSection("gifts") && ((event.gift_accounts?.length ?? 0) > 0 || hasCanvasPage("gifts")) && (
          <section className="relative py-20 px-6 max-w-3xl mx-auto text-center space-y-8">{renderCanvasElements("gifts")}
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-bold text-white">Tanda Kasih (Amplop Digital)</h2>
              <p className="text-stone-400 text-sm">Doa restu Anda merupakan karunia terindah bagi kami. Jika ingin memberikan tanda kasih secara digital, Anda dapat melalui:</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.gift_accounts?.map((acc) => (
                <div key={acc.id} className="bg-stone-900 border border-stone-800 p-6 rounded-2xl text-left flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      {acc.bank_name}
                    </span>
                    <div className="mt-3 text-xl font-mono font-bold text-white tracking-wider">
                      {acc.account_number}
                    </div>
                    <div className="text-xs text-stone-400 mt-1">a.n. {acc.account_holder}</div>
                  </div>

                  <button
                    onClick={() => handleCopyAccount(acc.bank_name, acc.account_number)}
                    className="w-full py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedBank === acc.bank_name ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" /> Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Salin Nomor Rekening
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. RSVP & Wishes Feed */}
        {showSection("guestbook") && <section id="rsvp" className="relative py-20 px-6 bg-stone-900/30 border-t border-stone-900">{renderCanvasElements("guestbook")}
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif font-bold text-white">Konfirmasi Kehadiran &amp; Ucapan</h2>
              <p className="text-stone-400 text-sm">Kirimkan doa dan konfirmasi kehadiran Anda kepada kedua mempelai:</p>
            </div>

            {/* RSVP Form */}
            <form onSubmit={handleSubmitRsvp} className="bg-stone-900 p-6 rounded-3xl border border-stone-800 space-y-4">
              {rsvpSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4" /> Terima kasih! Doa dan konfirmasi kehadiran Anda berhasil terkirim.
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  required
                  placeholder="Masukkan nama Anda..."
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Konfirmasi Kehadiran</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "hadir", label: "Akan Hadir" },
                    { id: "tidak_hadir", label: "Tidak Hadir" },
                    { id: "ragu", label: "Masih Ragu" },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setRsvpStatus(opt.id)}
                      className={`py-2 text-xs font-medium rounded-xl border transition ${
                        rsvpStatus === opt.id
                          ? "bg-rose-600 text-white border-rose-500"
                          : "bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Ucapan &amp; Doa Restu</label>
                <textarea
                  rows={3}
                  value={rsvpMessage}
                  onChange={(e) => setRsvpMessage(e.target.value)}
                  required
                  placeholder="Tuliskan ucapan dan doa terbaik Anda..."
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingRsvp}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {submittingRsvp ? "Mengirim..." : "Kirim Ucapan"}
              </button>
            </form>

            {/* Wishes Feed */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-300">
                Ucapan Doa ({event.wishes?.length || 0})
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {event.wishes && event.wishes.length > 0 ? (
                  event.wishes.map((w) => (
                    <div key={w.id} className="bg-stone-900/60 p-4 rounded-2xl border border-stone-800/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{w.guest_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          w.attendance === "hadir" 
                            ? "bg-emerald-500/20 text-emerald-400" 
                            : w.attendance === "tidak_hadir" 
                            ? "bg-rose-500/20 text-rose-400" 
                            : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {w.attendance === "hadir" ? "Hadir" : w.attendance === "tidak_hadir" ? "Tidak Hadir" : "Ragu"}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed">{w.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 text-center py-6">Belum ada ucapan. Jadilah yang pertama mengirimkan doa!</p>
                )}
              </div>
            </div>
          </div>
        </section>}
        </>}

        {/* Footer */}
        {designedPages.length > 0 ? <footer className="opendesign-site-footer"><p>Terima kasih telah menjadi bagian dari cerita kami.</p><span>Dirancang bersama Kalakai · Ruang Acara Digital</span></footer> : <footer className="py-12 text-center text-xs text-stone-500 border-t border-stone-900 space-y-2"><p>Digital Wedding Invitation oleh <span className="text-rose-400 font-semibold">Kerabat Kalakai</span></p><p className="text-[10px]">Platform Digitalisasi Undangan &amp; Buku Tamu Modern</p></footer>}
      </div>
    </div>
  );
}
