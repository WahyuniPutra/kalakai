"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Heart, Calendar, MapPin, Navigation, Clock, Copy, Check, 
  Volume2, VolumeX, Sparkles, QrCode, Crown, MessageCircle, 
  Send, ExternalLink, ShieldCheck, ChevronDown, Disc, Share2, 
  Gift, Map, Compass, Radio
} from "lucide-react";
import type { OpenPageConfig, OpenPageBlock } from "./schema";
import { INVITATION_COLLECTION } from "../invitation-collection";
import { readableColor } from "../template-colors";
import { CollectionCover } from "./collection-cover";
import { OPENPAGE_DECORATIVE_ELEMENTS } from "./elements";

const safeOrnaments = new Set(OPENPAGE_DECORATIVE_ELEMENTS.map((element) => element.svg));

interface OpenPageRendererProps {
  config: OpenPageConfig;
  event: any;
  guest?: any;
  isPreview?: boolean;
}

export default function OpenPageRenderer({
  config,
  event,
  guest,
  isPreview = false,
}: OpenPageRendererProps) {
  const [isOpen, setIsOpen] = useState(isPreview);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  // RSVP Form State
  const [guestName, setGuestName] = useState(guest?.name || "");
  const [attendance, setAttendance] = useState("hadir");
  const [message, setMessage] = useState("");
  const [wishes, setWishes] = useState<any[]>(event.wishes || []);
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [rsvpSent, setRsvpSent] = useState(false);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const theme = config.theme;
  const buttonText = readableColor("#ffffff", [theme.primaryColor]);
  const audio = config.audio;
  const layoutArchetype = config.layoutArchetype || "classic-vertical";

  // Countdown timer logic
  useEffect(() => {
    const target = new Date(event.event_date || "2026-12-25T09:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [event.event_date]);

  // Audio volume adjustment
  useEffect(() => {
    if (audioRef.current && typeof audio?.volume === "number") {
      audioRef.current.volume = audio.volume / 100;
    }
  }, [audio?.volume]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (audio.enabled && (audio.autoplay ?? true) && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(key);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmittingRsvp(true);
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/$/, "");
      const res = await fetch(`${backendUrl}/events/${event.slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: guestName || guest?.name || "Tamu Terhormat",
          attendance,
          message,
          guest_id: guest?.id || null,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setRsvpSent(true);
        setWishes([json.data, ...wishes]);
        setMessage("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRsvp(false);
    }
  };

  // Floating audio position
  const audioPositionClass = useMemo(() => {
    switch (audio?.position) {
      case "bottom-left":
        return "bottom-6 left-6";
      case "top-right":
        return "top-6 right-6";
      default:
        return "bottom-6 right-6";
    }
  }, [audio?.position]);

  return (
    <div
      className="min-h-screen text-slate-100 font-sans selection:bg-rose-500/30 relative"
      style={{
        backgroundColor: theme.bgColor,
        color: theme.textColor,
        fontFamily: theme.fontBody === "serif" ? 'Georgia, Cambria, "Times New Roman", serif' : 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Background Audio */}
      {audio.enabled && (
        <audio
          ref={audioRef}
          src={audio.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
          loop
          preload="auto"
        />
      )}

      {/* Floating Audio Controller with Spinning Vinyl Effect */}
      {isOpen && audio.enabled && (
        <button
          onClick={toggleMusic}
          className={`fixed ${audioPositionClass} z-40 h-12 w-12 rounded-full flex items-center justify-center shadow-2xl transition cursor-pointer border`}
          style={{
            backgroundColor: theme.primaryColor,
            color: buttonText,
            borderColor: `${theme.accentColor}60`,
          }}
          title={isPlaying ? "Jeda Musik" : "Putar Musik"}
        >
          <Disc className={`h-6 w-6 ${isPlaying ? "animate-spin" : ""}`} />
        </button>
      )}

      {/* Floating Bottom App Dock for Slide Presentation Archetype */}
      {isOpen && layoutArchetype === "slide-presentation" && (
        <nav className="fixed bottom-4 inset-x-0 mx-auto w-fit max-w-[92vw] z-40 bg-stone-900/90 backdrop-blur-xl border border-stone-700/60 rounded-full px-3 py-1.5 flex items-center gap-1 shadow-2xl">
          <a
            href="#hero"
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            Sampul
          </a>
          <a
            href="#couple"
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            Mempelai
          </a>
          <a
            href="#schedule"
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            Acara
          </a>
          <a
            href="#gifts"
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            Hadiah
          </a>
          <a
            href="#rsvp"
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            Doa &amp; RSVP
          </a>
        </nav>
      )}

      {/* 1. COVER / OPENING GATE MODAL */}
      {!isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 text-center backdrop-blur-xl"
          style={{ backgroundColor: `${theme.bgColor}f0` }}
        >
          <div
            className="max-w-md w-full border p-8 rounded-3xl shadow-2xl space-y-6"
            style={{
              backgroundColor: theme.cardBgColor,
              borderColor: theme.borderColor,
            }}
          >
            <div className="flex justify-center">
              <span
                className="p-3 rounded-full border shadow-lg"
                style={{
                  backgroundColor: `${theme.primaryColor}20`,
                  borderColor: `${theme.primaryColor}50`,
                  color: theme.primaryColor,
                }}
              >
                <Sparkles className="h-6 w-6" />
              </span>
            </div>

            <div>
              <p
                className="text-xs uppercase tracking-widest font-mono"
                style={{ color: theme.accentColor }}
              >
                THE WEDDING INVITATION
              </p>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight mt-2"
                style={{
                  fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                }}
              >
                {event.groom_name && event.bride_name
                  ? `${event.groom_name} & ${event.bride_name}`
                  : event.title}
              </h1>
            </div>

            {guest && (
              <div
                className="p-4 rounded-2xl border"
                style={{
                  backgroundColor: `${theme.bgColor}a0`,
                  borderColor: theme.borderColor,
                }}
              >
                <p className="text-xs" style={{ color: theme.textMutedColor }}>
                  Kepada Yth. Bapak/Ibu/Saudara/i:
                </p>
                <h3 className="text-lg font-bold mt-1" style={{ color: theme.primaryColor }}>
                  {guest.name}
                </h3>
                <span
                  className="inline-block mt-2 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${theme.primaryColor}20`,
                    borderColor: `${theme.primaryColor}40`,
                    color: theme.primaryColor,
                  }}
                >
                  {guest.category || "Tamu Terhormat"}
                </span>
              </div>
            )}

            <button
              onClick={handleOpenInvitation}
              className="w-full py-3.5 px-6 rounded-full font-semibold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
              style={{
                backgroundColor: theme.primaryColor,
                color: buttonText,
              }}
            >
              <Heart className="h-4 w-4 fill-current" />
              Buka Undangan
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN RESPONSIVE INVITATION BLOCKS */}
      <div className={`transition-opacity duration-1000 ${isOpen ? "opacity-100" : "opacity-0"} ${layoutArchetype === "slide-presentation" ? "pb-24" : ""}`}>
        {config.blocks.map((block) => {
          if (!block.visible) return null;
          const ornament = safeOrnaments.has(block.content.ornamentSvg) ? block.content.ornamentSvg : undefined;

          switch (block.type) {
            // ==================== HERO BLOCK ====================
            case "hero": {
              const coverImg = block.content.coverImage || event.theme_config?.hero_image_url;
              const collection = INVITATION_COLLECTION.find((design) => block.variant === `collection-${design.layout}`);
              if (collection) {
                return (
                  <section id="hero" key={block.id}>
                    <CollectionCover layout={collection.layout} theme={theme}
                      title={block.content.title || event.title} eyebrow={block.content.eyebrow}
                      date={block.content.dateText} description={block.content.subtitle} photo={coverImg} />
                  </section>
                );
              }

              // 1. Arch Palace Variant (Kahayan Royal)
              if (block.variant === "arch-palace") {
                return (
                  <section
                    id="hero"
                    key={block.id}
                    className="relative py-20 px-6 text-center flex flex-col items-center justify-center overflow-hidden"
                  >
                    {ornament && (
                      <div
                        className="w-14 h-14 mx-auto mb-3 opacity-90 transition-transform duration-500 hover:scale-110"
                        style={{ color: theme.primaryColor }}
                        dangerouslySetInnerHTML={{ __html: ornament }}
                      />
                    )}
                    <span
                      className="text-xs font-mono uppercase tracking-[0.3em] font-semibold"
                      style={{ color: theme.accentColor }}
                    >
                      {block.content.eyebrow || "WALIMATUL 'URS"}
                    </span>

                    {/* Kubah Lengkung Arch Istana */}
                    <div
                      className="my-6 relative w-64 sm:w-72 aspect-[3/4] rounded-t-full border-4 shadow-[0_0_50px_rgba(217,119,6,0.25)] overflow-hidden mx-auto"
                      style={{ borderColor: theme.primaryColor }}
                    >
                      {coverImg ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={coverImg}
                          alt="Foto Sampul Istana"
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-900 text-stone-600">
                          <Heart className="h-16 w-16 opacity-30" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>

                    <h1
                      className="text-3xl sm:text-5xl font-bold tracking-tight"
                      style={{
                        fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                      }}
                    >
                      {block.content.title || event.title}
                    </h1>
                    <p
                      className="text-xs sm:text-sm max-w-md mx-auto mt-2 leading-relaxed"
                      style={{ color: theme.textMutedColor }}
                    >
                      {block.content.subtitle}
                    </p>
                    <div
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-mono mt-4 shadow-md"
                      style={{
                        backgroundColor: theme.cardBgColor,
                        borderColor: theme.borderColor,
                        color: theme.primaryColor,
                      }}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{block.content.dateText}</span>
                    </div>
                  </section>
                );
              }

              // 2. Editorial Asymmetric Variant (Ivory Editorial Magazine)
              if (block.variant === "editorial-asymmetric") {
                return (
                  <section
                    id="hero"
                    key={block.id}
                    className="relative py-16 px-6 max-w-4xl mx-auto overflow-hidden"
                  >
                    <div
                      className="border-b pb-3 mb-6 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-stone-400"
                      style={{ borderColor: theme.borderColor }}
                    >
                      <span>VOL. 01 / WEDDING EDITION</span>
                      <span style={{ color: theme.primaryColor }}>KALAKAI ATELIER</span>
                      <span>PALANGKA RAYA</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-7 space-y-4 text-left">
                        <span
                          className="text-xs font-mono uppercase tracking-[0.2em]"
                          style={{ color: theme.accentColor }}
                        >
                          {block.content.eyebrow || "THE WEDDING STORY OF"}
                        </span>
                        <h1
                          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-none"
                          style={{
                            fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                          }}
                        >
                          {block.content.title || event.title}
                        </h1>
                        <p
                          className="text-xs sm:text-sm leading-relaxed border-l-2 pl-4 py-1"
                          style={{ borderColor: theme.primaryColor, color: theme.textMutedColor }}
                        >
                          {block.content.subtitle || "Kebersamaan dua insan merajut asa, doa dan cinta abadi."}
                        </p>
                        <div
                          className="inline-flex items-center gap-2 text-xs font-mono font-semibold pt-2"
                          style={{ color: theme.primaryColor }}
                        >
                          <Calendar className="h-4 w-4" />
                          <span>{block.content.dateText}</span>
                        </div>
                      </div>

                      <div className="md:col-span-5">
                        <div
                          className="relative aspect-[4/5] rounded-none border shadow-2xl overflow-hidden"
                          style={{ borderColor: theme.borderColor }}
                        >
                          {coverImg ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={coverImg}
                              alt="Cover Majalah"
                              className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-stone-900 flex items-center justify-center">
                              <Heart className="h-12 w-12 text-stone-700" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3 text-[9px] font-mono px-2 py-0.5 bg-black/70 text-white uppercase tracking-widest border border-white/20">
                            EDITORIAL
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              }

              // 3. Polaroid Rustic Variant (Bohemian Terracotta)
              if (block.variant === "polaroid-rustic") {
                return (
                  <section
                    id="hero"
                    key={block.id}
                    className="relative py-20 px-6 text-center overflow-hidden"
                  >
                    <span
                      className="text-xs font-mono uppercase tracking-[0.25em]"
                      style={{ color: theme.accentColor }}
                    >
                      {block.content.eyebrow || "WE ARE GETTING MARRIED"}
                    </span>

                    {/* Polaroid Card with Washi Tape */}
                    <div className="relative my-8 inline-block max-w-[280px] bg-amber-50 p-3 pb-8 shadow-2xl rounded-sm rotate-[-2deg] hover:rotate-0 transition-transform duration-500 border border-stone-200">
                      {/* Washi Tape */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-amber-200/70 backdrop-blur-sm -rotate-2 shadow-sm border border-amber-300/40" />
                      <div className="aspect-[4/5] overflow-hidden bg-stone-200 rounded-sm">
                        {coverImg ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={coverImg}
                            alt="Polaroid"
                            className="w-full h-full object-cover sepia-[0.25]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-300 text-stone-500">
                            <Heart className="h-10 w-10 opacity-40" />
                          </div>
                        )}
                      </div>
                      <div className="pt-3 text-center">
                        <p className="font-serif italic text-stone-800 text-base font-semibold">
                          {block.content.title || event.title}
                        </p>
                        <p className="text-[11px] font-mono text-stone-500 mt-1">
                          {block.content.dateText}
                        </p>
                      </div>
                    </div>

                    <p
                      className="text-xs sm:text-sm max-w-md mx-auto"
                      style={{ color: theme.textMutedColor }}
                    >
                      {block.content.subtitle}
                    </p>
                  </section>
                );
              }

              // 4. Syari Calligraphy Variant (Madinah Syar'i)
              if (block.variant === "syari-calligraphy" || block.variant === "syari-dome") {
                return (
                  <section
                    id="hero"
                    key={block.id}
                    className="relative py-24 px-6 text-center overflow-hidden"
                  >
                    <div className="max-w-2xl mx-auto space-y-4">
                      {/* Kaligrafi Basmalah */}
                      <div
                        className="py-2 text-2xl sm:text-4xl font-serif tracking-widest select-none font-bold"
                        style={{ color: theme.primaryColor }}
                      >
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </div>
                      <span
                        className="text-xs font-mono uppercase tracking-[0.3em] font-semibold"
                        style={{ color: theme.accentColor }}
                      >
                        {block.content.eyebrow || "WALIMATUL 'URS — UNDANGAN PERNIKAHAN SYAR'I"}
                      </span>
                      <h1
                        className="text-4xl sm:text-6xl font-bold tracking-tight"
                        style={{
                          fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                        }}
                      >
                        {block.content.title || event.title}
                      </h1>
                      <p
                        className="text-xs sm:text-sm max-w-lg mx-auto leading-relaxed"
                        style={{ color: theme.textMutedColor }}
                      >
                        {block.content.subtitle || "Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan untuk membangun keluarga sakinah mawaddah wa rahmah."}
                      </p>
                      <div
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-mono mt-3 shadow-md"
                        style={{
                          backgroundColor: theme.cardBgColor,
                          borderColor: theme.borderColor,
                          color: theme.primaryColor,
                        }}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{block.content.dateText}</span>
                      </div>
                    </div>
                  </section>
                );
              }

              // 5. Adat Carving Variant (Batang Garing Dayak)
              if (block.variant === "adat-carving") {
                return (
                  <section
                    id="hero"
                    key={block.id}
                    className="relative py-20 px-6 text-center overflow-hidden"
                  >
                    <div className="max-w-3xl mx-auto space-y-4">
                      {ornament && (
                        <div
                          className="w-16 h-16 mx-auto mb-2 opacity-90 transition-transform duration-500 hover:scale-110"
                          style={{ color: theme.primaryColor }}
                          dangerouslySetInnerHTML={{ __html: ornament }}
                        />
                      )}
                      <span
                        className="text-xs font-mono uppercase tracking-[0.3em] font-semibold"
                        style={{ color: theme.accentColor }}
                      >
                        {block.content.eyebrow || "UPACARA PENGANTIN ADAT DAYAK KALIMANTAN TENGAH"}
                      </span>
                      <h1
                        className="text-4xl sm:text-6xl font-bold tracking-tight"
                        style={{
                          fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                        }}
                      >
                        {block.content.title || event.title}
                      </h1>
                      <p
                        className="text-xs sm:text-sm max-w-lg mx-auto leading-relaxed"
                        style={{ color: theme.textMutedColor }}
                      >
                        {block.content.subtitle || "Membina mahligai rumah tangga yang kokoh berakar pada adat leluhur dan restu keluarga besar."}
                      </p>
                      <div
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-mono mt-3"
                        style={{
                          backgroundColor: theme.cardBgColor,
                          borderColor: theme.borderColor,
                          color: theme.primaryColor,
                        }}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{block.content.dateText}</span>
                      </div>
                    </div>
                  </section>
                );
              }

              // Default / Centered Hero
              return (
                <section
                  id="hero"
                  key={block.id}
                  className="relative py-24 sm:py-32 px-6 text-center flex flex-col items-center justify-center overflow-hidden"
                >
                  {coverImg && (
                    <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImg}
                        alt="Foto Sampul"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/80 to-stone-950" />
                    </div>
                  )}
                  <div className="relative z-10 max-w-3xl mx-auto space-y-4">
                    {ornament && (
                      <div
                        className="w-16 h-16 mx-auto mb-2 opacity-90 transition-transform duration-500 hover:scale-110"
                        style={{ color: theme.primaryColor }}
                        dangerouslySetInnerHTML={{ __html: ornament }}
                      />
                    )}
                    <span
                      className="text-xs font-mono uppercase tracking-[0.25em]"
                      style={{ color: theme.accentColor }}
                    >
                      {block.content.eyebrow || "WALIMATUL 'URS"}
                    </span>
                    <h1
                      className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight"
                      style={{
                        fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                      }}
                    >
                      {block.content.title || event.title}
                    </h1>
                    <p
                      className="text-sm sm:text-base max-w-lg mx-auto leading-relaxed"
                      style={{ color: theme.textMutedColor }}
                    >
                      {block.content.subtitle}
                    </p>
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono mt-4"
                      style={{
                        backgroundColor: theme.cardBgColor,
                        borderColor: theme.borderColor,
                      }}
                    >
                      <Calendar className="h-3.5 w-3.5" style={{ color: theme.primaryColor }} />
                      <span>{block.content.dateText}</span>
                    </div>
                  </div>
                </section>
              );
            }

            // ==================== COUNTDOWN BLOCK ====================
            case "countdown": {
              // 1. Gold Circles Variant
              if (block.variant === "gold-circles") {
                return (
                  <section key={block.id} className="py-12 px-6 max-w-xl mx-auto text-center space-y-6">
                    <h3
                      className="text-xs font-mono uppercase tracking-widest font-semibold"
                      style={{ color: theme.accentColor }}
                    >
                      {block.content.heading || "MENGHITUNG HARI BAHAGIA"}
                    </h3>
                    <div className="grid grid-cols-4 gap-3 sm:gap-4 font-mono">
                      {[
                        { label: "Hari", val: timeLeft.days },
                        { label: "Jam", val: timeLeft.hours },
                        { label: "Menit", val: timeLeft.minutes },
                        { label: "Detik", val: timeLeft.seconds },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="aspect-square rounded-full border-2 flex flex-col items-center justify-center p-2 shadow-[0_0_20px_rgba(217,119,6,0.2)]"
                          style={{
                            backgroundColor: theme.cardBgColor,
                            borderColor: theme.primaryColor,
                          }}
                        >
                          <div className="text-xl sm:text-2xl font-extrabold" style={{ color: theme.primaryColor }}>
                            {item.val}
                          </div>
                          <span className="text-[9px] uppercase tracking-wider text-stone-400">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              // 2. Minimal Pill Variant
              if (block.variant === "minimal-pill") {
                return (
                  <section key={block.id} className="py-10 px-6 max-w-lg mx-auto text-center space-y-4">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: theme.accentColor }}>
                      {block.content.heading || "COUNTDOWN"}
                    </span>
                    <div
                      className="inline-flex items-center gap-3 sm:gap-6 px-6 py-3 rounded-full border shadow-lg font-mono text-xs"
                      style={{ backgroundColor: theme.cardBgColor, borderColor: theme.borderColor }}
                    >
                      {[
                        { label: "Hari", val: timeLeft.days },
                        { label: "Jam", val: timeLeft.hours },
                        { label: "Menit", val: timeLeft.minutes },
                        { label: "Detik", val: timeLeft.seconds },
                      ].map((item, idx) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <span className="text-base font-bold" style={{ color: theme.primaryColor }}>
                            {item.val}
                          </span>
                          <span className="text-[9px] text-stone-400 uppercase">{item.label}</span>
                          {idx < 3 && <span className="text-stone-600">:</span>}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              // Default Cards Variant
              return (
                <section key={block.id} className="py-12 px-6 max-w-xl mx-auto text-center space-y-6">
                  <h3
                    className="text-xs font-mono uppercase tracking-wider"
                    style={{ color: theme.accentColor }}
                  >
                    {block.content.heading || "MENGHITUNG HARI"}
                  </h3>
                  <div className="grid grid-cols-4 gap-3 sm:gap-4 font-mono">
                    {[
                      { label: "Hari", val: timeLeft.days },
                      { label: "Jam", val: timeLeft.hours },
                      { label: "Menit", val: timeLeft.minutes },
                      { label: "Detik", val: timeLeft.seconds },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-4 rounded-2xl border text-center shadow-lg"
                        style={{
                          backgroundColor: theme.cardBgColor,
                          borderColor: theme.borderColor,
                        }}
                      >
                        <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: theme.primaryColor }}>
                          {item.val}
                        </div>
                        <span className="text-[10px] uppercase text-stone-400">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            // ==================== QUOTE BLOCK ====================
            case "quote":
              return (
                <section key={block.id} className="py-16 px-6 max-w-2xl mx-auto text-center">
                  <div
                    className="p-8 rounded-3xl border shadow-xl space-y-3"
                    style={{
                      backgroundColor: theme.cardBgColor,
                      borderColor: theme.borderColor,
                    }}
                  >
                    {ornament ? (
                      <div
                        className="w-12 h-12 mx-auto mb-2 opacity-90"
                        style={{ color: theme.primaryColor }}
                        dangerouslySetInnerHTML={{ __html: ornament }}
                      />
                    ) : (
                      <Heart className="h-6 w-6 mx-auto" style={{ color: theme.primaryColor }} />
                    )}
                    <blockquote
                      className="text-sm sm:text-base italic leading-relaxed"
                      style={{ color: theme.textColor }}
                    >
                      "{block.content.quote}"
                    </blockquote>
                    <span className="block text-xs font-semibold pt-2" style={{ color: theme.accentColor }}>
                      {block.content.source}
                    </span>
                  </div>
                </section>
              );

            // ==================== COUPLE BLOCK ====================
            case "couple": {
              // 1. Arch Portraits Variant (Kahayan Royal)
              if (block.variant === "arch-portraits") {
                return (
                  <section id="couple" key={block.id} className="py-20 px-6 max-w-4xl mx-auto space-y-12 text-center">
                    <div className="space-y-2">
                      <span className="text-xs uppercase font-mono tracking-widest font-semibold" style={{ color: theme.accentColor }}>
                        PASANGAN MEMPELAI
                      </span>
                      <h2
                        className="text-3xl sm:text-4xl font-bold"
                        style={{
                          fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                        }}
                      >
                        Mempelai yang Berbahagia
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center max-w-2xl mx-auto">
                      {/* Groom */}
                      <div className="space-y-4">
                        <div
                          className="w-48 aspect-[3/4] mx-auto rounded-t-full border-2 overflow-hidden shadow-xl"
                          style={{ borderColor: theme.primaryColor, backgroundColor: theme.cardBgColor }}
                        >
                          <div className="w-full h-full flex items-center justify-center bg-stone-900/50 text-stone-600">
                            <Crown className="h-10 w-10 opacity-30" style={{ color: theme.primaryColor }} />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                          {block.content.groomName}
                        </h3>
                        <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: theme.textMutedColor }}>
                          {block.content.groomDesc}
                        </p>
                      </div>

                      {/* Bride */}
                      <div className="space-y-4">
                        <div
                          className="w-48 aspect-[3/4] mx-auto rounded-t-full border-2 overflow-hidden shadow-xl"
                          style={{ borderColor: theme.primaryColor, backgroundColor: theme.cardBgColor }}
                        >
                          <div className="w-full h-full flex items-center justify-center bg-stone-900/50 text-stone-600">
                            <Crown className="h-10 w-10 opacity-30" style={{ color: theme.primaryColor }} />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                          {block.content.brideName}
                        </h3>
                        <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: theme.textMutedColor }}>
                          {block.content.brideDesc}
                        </p>
                      </div>
                    </div>
                  </section>
                );
              }

              // 2. Alternating Editorial Variant (Ivory Editorial Magazine)
              if (block.variant === "alternating-editorial") {
                return (
                  <section id="couple" key={block.id} className="py-20 px-6 max-w-4xl mx-auto space-y-12">
                    <div className="text-left border-b pb-3" style={{ borderColor: theme.borderColor }}>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: theme.accentColor }}>
                        THE COUPLE
                      </span>
                      <h2
                        className="text-3xl sm:text-5xl font-bold tracking-tight mt-1"
                        style={{ fontFamily: theme.fontDisplay === "serif" ? 'Georgia, serif' : 'sans-serif' }}
                      >
                        Dua Insan Menyatukan Janji
                      </h2>
                    </div>

                    <div className="space-y-8">
                      {/* Groom */}
                      <div className="p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-6"
                           style={{ backgroundColor: theme.cardBgColor, borderColor: theme.borderColor }}>
                        <span className="text-3xl font-mono font-extrabold text-stone-600">01</span>
                        <div className="flex-1 text-left">
                          <span className="text-[10px] font-mono uppercase text-stone-400">Mempelai Pria</span>
                          <h3 className="text-2xl font-bold text-white mt-0.5" style={{ color: theme.primaryColor }}>
                            {block.content.groomName}
                          </h3>
                          <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.textMutedColor }}>
                            {block.content.groomDesc}
                          </p>
                        </div>
                      </div>

                      {/* Bride */}
                      <div className="p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-6"
                           style={{ backgroundColor: theme.cardBgColor, borderColor: theme.borderColor }}>
                        <span className="text-3xl font-mono font-extrabold text-stone-600">02</span>
                        <div className="flex-1 text-left">
                          <span className="text-[10px] font-mono uppercase text-stone-400">Mempelai Wanita</span>
                          <h3 className="text-2xl font-bold text-white mt-0.5" style={{ color: theme.primaryColor }}>
                            {block.content.brideName}
                          </h3>
                          <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.textMutedColor }}>
                            {block.content.brideDesc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              }

              // 3. Polaroid Cards Variant (Bohemian Terracotta)
              if (block.variant === "polaroid-cards") {
                return (
                  <section id="couple" key={block.id} className="py-20 px-6 max-w-3xl mx-auto text-center space-y-12">
                    <span className="text-xs uppercase font-mono tracking-widest" style={{ color: theme.accentColor }}>
                      KEDUA MEMPELAI
                    </span>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                      {/* Groom Polaroid */}
                      <div className="bg-amber-50 p-4 pb-6 rounded-sm shadow-xl border border-stone-200 rotate-[-2deg] max-w-[220px]">
                        <div className="w-full aspect-[4/5] bg-stone-200 rounded-sm flex items-center justify-center">
                          <Heart className="h-8 w-8 text-stone-400 opacity-50" />
                        </div>
                        <h4 className="font-serif italic text-stone-900 font-bold text-lg mt-3">
                          {block.content.groomName}
                        </h4>
                        <p className="text-[10px] text-stone-600 mt-1 line-clamp-2">
                          {block.content.groomDesc}
                        </p>
                      </div>

                      {/* Bride Polaroid */}
                      <div className="bg-amber-50 p-4 pb-6 rounded-sm shadow-xl border border-stone-200 rotate-[2deg] max-w-[220px]">
                        <div className="w-full aspect-[4/5] bg-stone-200 rounded-sm flex items-center justify-center">
                          <Heart className="h-8 w-8 text-stone-400 opacity-50" />
                        </div>
                        <h4 className="font-serif italic text-stone-900 font-bold text-lg mt-3">
                          {block.content.brideName}
                        </h4>
                        <p className="text-[10px] text-stone-600 mt-1 line-clamp-2">
                          {block.content.brideDesc}
                        </p>
                      </div>
                    </div>
                  </section>
                );
              }

              // Default Couple Cards
              return (
                <section id="couple" key={block.id} className="py-20 px-6 max-w-4xl mx-auto space-y-12 text-center">
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-mono tracking-widest" style={{ color: theme.accentColor }}>
                      PASANGAN MEMPELAI
                    </span>
                    <h2
                      className="text-3xl sm:text-4xl font-bold"
                      style={{
                        fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                      }}
                    >
                      Mempelai yang Berbahagia
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                    <div
                      className="p-8 rounded-3xl border shadow-xl space-y-4"
                      style={{
                        backgroundColor: theme.cardBgColor,
                        borderColor: theme.borderColor,
                      }}
                    >
                      <h3 className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                        {block.content.groomName}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: theme.textMutedColor }}>
                        {block.content.groomDesc}
                      </p>
                    </div>

                    <div
                      className="p-8 rounded-3xl border shadow-xl space-y-4"
                      style={{
                        backgroundColor: theme.cardBgColor,
                        borderColor: theme.borderColor,
                      }}
                    >
                      <h3 className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                        {block.content.brideName}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: theme.textMutedColor }}>
                        {block.content.brideDesc}
                      </p>
                    </div>
                  </div>
                </section>
              );
            }

            // ==================== STORY BLOCK ====================
            case "story":
              return (
                <section key={block.id} className="py-20 px-6 max-w-3xl mx-auto space-y-8">
                  <div className="text-center space-y-2">
                    <span className="text-xs uppercase font-mono tracking-widest" style={{ color: theme.accentColor }}>
                      CERITA KAMI
                    </span>
                    <h2
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                      }}
                    >
                      {block.content.heading}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {block.content.items?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-6 rounded-2xl border shadow-md space-y-1.5 text-left"
                        style={{
                          backgroundColor: theme.cardBgColor,
                          borderColor: theme.borderColor,
                        }}
                      >
                        <span className="text-xs font-bold font-mono" style={{ color: theme.primaryColor }}>
                          {item.year}
                        </span>
                        <h4 className="text-lg font-bold">{item.title}</h4>
                        <p className="text-xs leading-relaxed" style={{ color: theme.textMutedColor }}>
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            // ==================== SCHEDULE & LOCATION ====================
            case "schedule": {
              // 1. Palace Gates Variant (Kahayan Royal)
              if (block.variant === "palace-gates") {
                return (
                  <section id="schedule" key={block.id} className="py-20 px-6 max-w-3xl mx-auto text-center space-y-8">
                    <div className="space-y-2">
                      <span className="text-xs uppercase font-mono tracking-widest font-semibold" style={{ color: theme.accentColor }}>
                        GERBANG WAKTU &amp; LOKASI ISTANA
                      </span>
                      <h2
                        className="text-3xl font-bold"
                        style={{ fontFamily: theme.fontDisplay === "serif" ? 'Georgia, serif' : 'sans-serif' }}
                      >
                        {block.content.heading}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      {/* Gate 1 */}
                      <div
                        className="p-6 rounded-t-full rounded-b-2xl border-2 space-y-2 text-center pt-10 relative overflow-hidden shadow-xl"
                        style={{ backgroundColor: theme.cardBgColor, borderColor: theme.primaryColor }}
                      >
                        <span className="text-xs uppercase font-mono font-bold" style={{ color: theme.accentColor }}>
                          AKAD NIKAH
                        </span>
                        <div className="text-2xl font-bold">{block.content.akadTime}</div>
                        <p className="text-xs" style={{ color: theme.textMutedColor }}>Prosesi Sakral Keluarga Inti</p>
                      </div>

                      {/* Gate 2 */}
                      <div
                        className="p-6 rounded-t-full rounded-b-2xl border-2 space-y-2 text-center pt-10 relative overflow-hidden shadow-xl"
                        style={{ backgroundColor: theme.cardBgColor, borderColor: theme.primaryColor }}
                      >
                        <span className="text-xs uppercase font-mono font-bold" style={{ color: theme.accentColor }}>
                          RESEPSI PERNIKAHAN
                        </span>
                        <div className="text-2xl font-bold">{block.content.resepsiTime}</div>
                        <p className="text-xs" style={{ color: theme.textMutedColor }}>Jamuan Seluruh Tamu Undangan</p>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div
                      className="p-8 rounded-3xl border shadow-xl space-y-4"
                      style={{ backgroundColor: theme.cardBgColor, borderColor: theme.borderColor }}
                    >
                      <MapPin className="h-6 w-6 mx-auto" style={{ color: theme.primaryColor }} />
                      <h3 className="text-xl font-bold">{block.content.locationName}</h3>
                      <p className="text-xs max-w-md mx-auto" style={{ color: theme.textMutedColor }}>
                        {block.content.locationAddress}
                      </p>
                      {block.content.mapUrl && (
                        <a
                          href={block.content.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold shadow-md transition hover:opacity-90"
                          style={{
                            backgroundColor: theme.primaryColor,
                            color: buttonText,
                          }}
                        >
                          <Navigation className="h-4 w-4" /> Buka Google Maps
                        </a>
                      )}
                    </div>
                  </section>
                );
              }

              // 2. Agenda Timeline Variant (Ivory Editorial Magazine)
              if (block.variant === "agenda-timeline") {
                return (
                  <section id="schedule" key={block.id} className="py-20 px-6 max-w-3xl mx-auto space-y-8">
                    <div className="text-left border-b pb-3" style={{ borderColor: theme.borderColor }}>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: theme.accentColor }}>
                        THE ITINERARY
                      </span>
                      <h2
                        className="text-3xl font-bold tracking-tight mt-1"
                        style={{ fontFamily: theme.fontDisplay === "serif" ? 'Georgia, serif' : 'sans-serif' }}
                      >
                        Agenda &amp; Denah Acara
                      </h2>
                    </div>

                    <div className="space-y-4 border-l-2 pl-6 ml-2" style={{ borderColor: theme.primaryColor }}>
                      <div className="space-y-1 relative">
                        <span className="text-xs font-mono font-bold" style={{ color: theme.primaryColor }}>
                          {block.content.akadTime}
                        </span>
                        <h4 className="text-lg font-bold">Akad Nikah</h4>
                        <p className="text-xs" style={{ color: theme.textMutedColor }}>Pemberkatan &amp; Ijab Qobul</p>
                      </div>

                      <div className="space-y-1 relative pt-4">
                        <span className="text-xs font-mono font-bold" style={{ color: theme.primaryColor }}>
                          {block.content.resepsiTime}
                        </span>
                        <h4 className="text-lg font-bold">Resepsi &amp; Jamuan Kasih</h4>
                        <p className="text-xs" style={{ color: theme.textMutedColor }}>Ramah tamah bersama seluruh sahabat &amp; handai tolan</p>
                      </div>
                    </div>

                    <div
                      className="p-6 rounded-2xl border space-y-3"
                      style={{ backgroundColor: theme.cardBgColor, borderColor: theme.borderColor }}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: theme.primaryColor }} />
                        <div>
                          <h4 className="text-base font-bold">{block.content.locationName}</h4>
                          <p className="text-xs mt-0.5" style={{ color: theme.textMutedColor }}>{block.content.locationAddress}</p>
                        </div>
                      </div>
                      {block.content.mapUrl && (
                        <a
                          href={block.content.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold pt-1"
                          style={{ color: theme.primaryColor }}
                        >
                          <Navigation className="h-3.5 w-3.5" /> Petunjuk Arah Google Maps
                        </a>
                      )}
                    </div>
                  </section>
                );
              }

              // Default Schedule Variant
              return (
                <section id="schedule" key={block.id} className="py-20 px-6 max-w-3xl mx-auto text-center space-y-8">
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-mono tracking-widest" style={{ color: theme.accentColor }}>
                      WAKTU &amp; LOKASI
                    </span>
                    <h2
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                      }}
                    >
                      {block.content.heading}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div
                      className="p-6 rounded-2xl border space-y-2"
                      style={{ backgroundColor: theme.cardBgColor, borderColor: theme.borderColor }}
                    >
                      <span className="text-xs uppercase font-mono text-stone-400">Akad Nikah</span>
                      <div className="text-xl font-bold">{block.content.akadTime}</div>
                      <p className="text-xs" style={{ color: theme.textMutedColor }}>Khusus Keluarga &amp; Kerabat Dekat</p>
                    </div>

                    <div
                      className="p-6 rounded-2xl border space-y-2"
                      style={{ backgroundColor: theme.cardBgColor, borderColor: theme.borderColor }}
                    >
                      <span className="text-xs uppercase font-mono text-stone-400">Resepsi Pernikahan</span>
                      <div className="text-xl font-bold">{block.content.resepsiTime}</div>
                      <p className="text-xs" style={{ color: theme.textMutedColor }}>Bagi Seluruh Tamu Undangan</p>
                    </div>
                  </div>

                  <div
                    className="p-8 rounded-3xl border shadow-xl space-y-4"
                    style={{ backgroundColor: theme.cardBgColor, borderColor: theme.borderColor }}
                  >
                    <MapPin className="h-6 w-6 mx-auto" style={{ color: theme.primaryColor }} />
                    <h3 className="text-xl font-bold">{block.content.locationName}</h3>
                    <p className="text-xs max-w-md mx-auto" style={{ color: theme.textMutedColor }}>
                      {block.content.locationAddress}
                    </p>
                    {block.content.mapUrl && (
                      <a
                        href={block.content.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold shadow-md transition"
                        style={{
                          backgroundColor: theme.primaryColor,
                          color: buttonText,
                        }}
                      >
                        <Navigation className="h-4 w-4" /> Buka Google Maps
                      </a>
                    )}
                  </div>
                </section>
              );
            }

            // ==================== PERSONAL QR TICKET PASS ====================
            case "ticket":
              if (!guest) return null;
              return (
                <section key={block.id} className="py-20 px-6 max-w-lg mx-auto text-center space-y-6">
                  <div
                    className="p-8 rounded-3xl border-2 shadow-2xl space-y-4"
                    style={{
                      backgroundColor: theme.cardBgColor,
                      borderColor: `${theme.primaryColor}60`,
                    }}
                  >
                    <div
                      className="flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-wider"
                      style={{ color: theme.primaryColor }}
                    >
                      <QrCode className="h-4 w-4" />
                      {block.content.heading || "TIKET MASUK PERSONAL"}
                    </div>

                    <h3 className="text-2xl font-bold">{guest.name}</h3>
                    <p className="text-xs" style={{ color: theme.textMutedColor }}>
                      {block.content.instruction}
                    </p>

                    <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(guest.qr_code)}`}
                        alt={`QR Code ${guest.name}`}
                        className="w-40 h-40 object-contain mx-auto"
                      />
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-mono pt-2">
                      <span className="px-3 py-1 rounded-full border bg-black/40 text-stone-300 border-stone-800">
                        Kode: {guest.qr_code}
                      </span>
                      <span className="px-3 py-1 rounded-full border bg-black/40 text-stone-300 border-stone-800">
                        Kuota: {guest.pax} Pax
                      </span>
                      {guest.table_number && (
                        <span className="px-3 py-1 rounded-full border font-bold text-amber-300 bg-amber-500/20 border-amber-500/40">
                          {guest.table_number}
                        </span>
                      )}
                    </div>
                  </div>
                </section>
              );

            // ==================== GIFTS / AMPLOP DIGITAL ====================
            case "gifts": {
              const giftAccounts = block.content.accounts?.length
                ? block.content.accounts
                : (event.gift_accounts || []);
              if (!giftAccounts.length) return null;

              // 1. Credit Cards Variant (Realistic Debit/ATM Card)
              if (block.variant === "credit-cards") {
                return (
                  <section id="gifts" key={block.id} className="py-20 px-6 max-w-3xl mx-auto text-center space-y-8">
                    <div className="space-y-2">
                      <span className="text-xs uppercase font-mono tracking-widest font-semibold" style={{ color: theme.accentColor }}>
                        AMPLOP DIGITAL &amp; TANDA KASIH
                      </span>
                      <h2
                        className="text-3xl font-bold"
                        style={{ fontFamily: theme.fontDisplay === "serif" ? 'Georgia, serif' : 'sans-serif' }}
                      >
                        {block.content.heading || "Kado &amp; Amplop Cashless"}
                      </h2>
                      <p className="text-xs max-w-md mx-auto" style={{ color: theme.textMutedColor }}>
                        {block.content.subtitle || "Doa restu Anda adalah kado terindah bagi kami. Namun jika ingin memberikan tanda kasih secara cashless:"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
                      {giftAccounts.map((acc: any, aIdx: number) => {
                        const bankName = acc.bank_name || acc.bank || "BANK TRANSFER";
                        const accNumber = acc.account_number || acc.number || "";
                        const accHolder = acc.account_holder || acc.holder || "";
                        const accKey = String(acc.id || aIdx);
                        const isCopied = copiedBank === accKey;

                        return (
                          <div
                            key={accKey}
                            className="p-6 rounded-2xl border bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-[1.58/1]"
                            style={{ borderColor: `${theme.primaryColor}50` }}
                          >
                            {/* Card Header: EMV Chip & Bank Name */}
                            <div className="flex items-center justify-between">
                              {/* Gold EMV Chip */}
                              <div className="w-10 h-7 rounded bg-amber-400/90 border border-amber-300 shadow-inner flex items-center justify-center relative overflow-hidden">
                                <div className="w-full h-[1px] bg-amber-600/60" />
                                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-amber-600/60" />
                              </div>
                              <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-300">
                                {bankName}
                              </span>
                            </div>

                            {/* Card Body: Account Number */}
                            <div className="my-2">
                              <span className="text-[9px] uppercase font-mono text-stone-500 block mb-0.5">NOMOR REKENING</span>
                              <div className="text-lg sm:text-xl font-mono font-bold tracking-widest text-white drop-shadow">
                                {accNumber}
                              </div>
                            </div>

                            {/* Card Footer: Holder Name & Copy Button */}
                            <div className="flex items-end justify-between pt-1 border-t border-stone-800/80">
                              <div>
                                <span className="text-[9px] uppercase font-mono text-stone-500 block">ATAS NAMA</span>
                                <span className="text-xs font-semibold text-stone-200 uppercase">{accHolder}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => copyToClipboard(accNumber, accKey)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow ${
                                  isCopied
                                    ? "bg-emerald-600 text-white"
                                    : "bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40"
                                }`}
                              >
                                {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {isCopied ? "Tersalin!" : "Salin No. Rekening"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              }

              // Default Gifts Grid
              return (
                <section id="gifts" key={block.id} className="py-20 px-6 max-w-3xl mx-auto text-center space-y-8">
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-mono tracking-widest" style={{ color: theme.accentColor }}>
                      TANDA KASIH
                    </span>
                    <h2
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                      }}
                    >
                      {block.content.heading || "Tanda Kasih (Amplop Digital)"}
                    </h2>
                    <p className="text-xs max-w-md mx-auto" style={{ color: theme.textMutedColor }}>
                      {block.content.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {giftAccounts.map((acc: any, aIdx: number) => {
                      const bankName = acc.bank_name || acc.bank || "BANK";
                      const accNumber = acc.account_number || acc.number || "";
                      const accHolder = acc.account_holder || acc.holder || "";
                      const accKey = String(acc.id || aIdx);

                      return (
                        <div
                          key={accKey}
                          className="p-6 rounded-2xl border space-y-3"
                          style={{
                            backgroundColor: theme.cardBgColor,
                            borderColor: theme.borderColor,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold uppercase" style={{ color: theme.primaryColor }}>
                              {bankName}
                            </span>
                            <button
                              onClick={() => copyToClipboard(accNumber, accKey)}
                              className="text-xs flex items-center gap-1 font-mono transition cursor-pointer hover:underline"
                              style={{ color: theme.primaryColor }}
                            >
                              {copiedBank === accKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              {copiedBank === accKey ? "Tersalin" : "Salin"}
                            </button>
                          </div>
                          <div className="text-lg font-mono font-bold text-white tracking-wider">
                            {accNumber}
                          </div>
                          <p className="text-xs" style={{ color: theme.textMutedColor }}>
                            a.n. {accHolder}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            }

            // ==================== RSVP & BUKU TAMU ====================
            case "rsvp":
            case "guestbook":
              return (
                <section id="rsvp" key={block.id} className="py-20 px-6 max-w-2xl mx-auto space-y-8">
                  <div className="text-center space-y-2">
                    <span className="text-xs uppercase font-mono tracking-widest" style={{ color: theme.accentColor }}>
                      UCAPAN &amp; DOA
                    </span>
                    <h2
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: theme.fontDisplay === "serif" ? 'Georgia, "Playfair Display", serif' : 'system-ui, sans-serif',
                      }}
                    >
                      Kirimkan Doa &amp; Konfirmasi Hadir
                    </h2>
                  </div>

                  {/* Form RSVP */}
                  <form
                    onSubmit={handleRsvpSubmit}
                    className="p-8 rounded-3xl border shadow-xl space-y-4"
                    style={{
                      backgroundColor: theme.cardBgColor,
                      borderColor: theme.borderColor,
                    }}
                  >
                    <div>
                      <label className="block text-xs font-mono uppercase mb-1" style={{ color: theme.textMutedColor }}>
                        Nama Anda
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-rose-500" style={{ backgroundColor: theme.bgColor, borderColor: theme.borderColor, color: theme.textColor }}
                        placeholder="Nama lengkap..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase mb-1" style={{ color: theme.textMutedColor }}>
                        Konfirmasi Kehadiran
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setAttendance("hadir")}
                          className={`py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            attendance === "hadir"
                              ? "bg-rose-600 text-white border-rose-500 shadow-md"
                              : "bg-black/20 text-stone-400 border-stone-800 hover:text-white"
                          }`}
                        >
                          Saya Akan Hadir
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttendance("tidak_hadir")}
                          className={`py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            attendance === "tidak_hadir"
                              ? "bg-rose-600 text-white border-rose-500 shadow-md"
                              : "bg-black/20 text-stone-400 border-stone-800 hover:text-white"
                          }`}
                        >
                          Maaf, Belum Bisa
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase mb-1" style={{ color: theme.textMutedColor }}>
                        Ucapan &amp; Doa Restu
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-rose-500" style={{ backgroundColor: theme.bgColor, borderColor: theme.borderColor, color: theme.textColor }}
                        placeholder="Tuliskan ucapan dan doa terbaik untuk kedua mempelai..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingRsvp}
                      className="w-full py-3 rounded-xl font-semibold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
                      style={{
                        backgroundColor: theme.primaryColor,
                        color: buttonText,
                      }}
                    >
                      <Send className="h-4 w-4" />
                      {submittingRsvp ? "Mengirimkan..." : "Kirim Doa &amp; Konfirmasi"}
                    </button>
                    {rsvpSent && (
                      <p className="text-center text-xs text-emerald-400 font-medium">
                        Terima kasih, doa dan konfirmasi kehadiran Anda telah tersimpan!
                      </p>
                    )}
                  </form>

                  {/* Wishes Feed */}
                  <div className="space-y-3 pt-4">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400">
                      Doa dari Para Tamu ({wishes.length})
                    </h4>
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {wishes.map((w: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border text-left space-y-1 shadow-sm"
                          style={{
                            backgroundColor: theme.cardBgColor,
                            borderColor: theme.borderColor,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold" style={{ color: theme.primaryColor }}>
                              {w.guest_name || w.name}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              {w.attendance === "hadir" ? "Hadir" : "Berhalangan"}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: theme.textColor }}>
                            {w.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            // ==================== CLOSING / FOOTER ====================
            case "footer":
              return (
                <footer key={block.id} className="py-20 px-6 text-center space-y-6 border-t" style={{ borderColor: theme.borderColor }}>
                  <div className="space-y-2">
                    <p className="text-xs tracking-widest uppercase font-mono" style={{ color: theme.accentColor }}>
                      TERIMA KASIH
                    </p>
                    <h3
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ fontFamily: theme.fontDisplay === "serif" ? 'Georgia, serif' : 'sans-serif' }}
                    >
                      {event.groom_name && event.bride_name
                        ? `${event.groom_name} & ${event.bride_name}`
                        : event.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-stone-500 font-mono">
                    <span>Powered by</span>
                    <strong>KALAKAI</strong>
                    <span>— Platform Digitalisasi Event</span>
                  </div>
                </footer>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
