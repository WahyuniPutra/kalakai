"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Sparkles, Maximize2, Minimize2, Users, MapPin, 
  Calendar, Heart, MessageCircle, Crown, ShieldCheck, Clock
} from "lucide-react";

interface Guest {
  id: number;
  name: string;
  category: string;
  is_vip: boolean;
  table_number: string | null;
  pax: number;
  checked_in_at: string | null;
}

interface Wish {
  id: number;
  guest_name: string;
  message: string;
  attendance: string;
  created_at: string;
}

interface LiveFeedData {
  event: {
    id: number;
    title: string;
    slug: string;
    groom_name: string | null;
    bride_name: string | null;
    event_date: string | null;
    location_name: string | null;
    theme_config: any;
  };
  stats: {
    total_guests: number;
    total_checked_in: number;
    total_pax_attended: number;
  };
  recent_checkins: Guest[];
  recent_wishes: Wish[];
}

export default function LiveDisplayClient({ eventSlug }: { eventSlug: string }) {
  const [data, setData] = useState<LiveFeedData | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightGuest, setHighlightGuest] = useState<Guest | null>(null);
  const [activeWishIndex, setActiveWishIndex] = useState(0);

  const lastCheckedInIdRef = useRef<number | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live feed
  const fetchFeed = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/events/${eventSlug}/live-feed`, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.status === "success") {
        setData(json);

        // Check if there is a newly checked-in guest
        const latest = json.recent_checkins?.[0];
        if (latest) {
          if (lastCheckedInIdRef.current !== null && lastCheckedInIdRef.current !== latest.id) {
            // New check-in detected! Highlight for 12 seconds
            setHighlightGuest(latest);
            setTimeout(() => {
              setHighlightGuest(null);
            }, 12000);
          } else if (lastCheckedInIdRef.current === null) {
            // Initial load: show latest guest
            setHighlightGuest(latest);
            setTimeout(() => {
              setHighlightGuest(null);
            }, 8000);
          }
          lastCheckedInIdRef.current = latest.id;
        }
      }
    } catch (err) {
      console.error("Live feed fetch error:", err);
    }
  };

  // Poll every 3.5 seconds
  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 3500);
    return () => clearInterval(interval);
  }, [eventSlug]);

  // Rotate wishes every 6 seconds
  useEffect(() => {
    if (!data?.recent_wishes?.length) return;
    const wishTimer = setInterval(() => {
      setActiveWishIndex((prev) => (prev + 1) % data.recent_wishes.length);
    }, 6000);
    return () => clearInterval(wishTimer);
  }, [data?.recent_wishes]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentWish = data?.recent_wishes?.[activeWishIndex];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col justify-between selection:bg-rose-500/30">
      {/* Ambient background glowing orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 p-6 md:p-8 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-900/30">
            <Heart className="h-6 w-6 text-white fill-white/80 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase text-rose-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              KALAKAI LIVE RECEPTION DISPLAY
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {data?.event.title || "The Wedding Celebration"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Live Clock */}
          <div className="hidden sm:flex flex-col items-end">
            <div className="text-xl md:text-2xl font-mono font-bold tracking-wider text-amber-400">
              {currentTime}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Waktu Resepsi
            </div>
          </div>

          {/* Quick Counter */}
          <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
            <Users className="h-5 w-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Kehadiran</div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                {data?.stats.total_checked_in ?? 0} <span className="text-xs text-slate-400 font-normal">/ {data?.stats.total_guests ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl border border-slate-800 transition cursor-pointer"
            title="Toggle Layar Penuh (F11)"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Main Center Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center max-w-5xl mx-auto w-full">
        {highlightGuest ? (
          /* POPUP WELCOME CARD FOR NEW ARRIVAL */
          <div className="w-full bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950 border-2 border-rose-500/40 shadow-2xl shadow-rose-950/60 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs md:text-sm font-semibold tracking-wider uppercase">
              <Sparkles className="h-4 w-4 animate-spin" />
              Selamat Datang di Acara Kami
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
                {highlightGuest.name}
              </h2>
              {highlightGuest.is_vip && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs md:text-sm font-bold uppercase tracking-wider">
                  <Crown className="h-4 w-4 text-amber-400" /> Tamu Kehormatan (VIP)
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] font-mono uppercase text-slate-400">Nomor Meja Anda</span>
                <div className="text-xl md:text-2xl font-bold text-amber-400 mt-1">
                  {highlightGuest.table_number || "Area Reguler Bebas"}
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] font-mono uppercase text-slate-400">Reservasi Kursi</span>
                <div className="text-xl md:text-2xl font-bold text-emerald-400 mt-1">
                  {highlightGuest.pax} Kursi Tersedia
                </div>
              </div>
            </div>

            <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto italic">
              "Terima kasih atas kehadiran dan doa restu yang Bapak/Ibu berikan bagi kedua mempelai."
            </p>
          </div>
        ) : (
          /* IDLE / ROTATING WELCOME STAGE */
          <div className="space-y-8 w-full max-w-3xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                {data?.event.location_name || "Palangka Raya, Kalimantan Tengah"}
              </div>

              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-white to-amber-200">
                {data?.event.groom_name && data?.event.bride_name 
                  ? `${data.event.groom_name} & ${data.event.bride_name}`
                  : data?.event.title}
              </h2>

              <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                Silakan siapkan <strong className="text-rose-400">QR Code Pass</strong> Anda di meja resepsionis untuk verifikasi cepat dan informasi nomor meja.
              </p>
            </div>

            {/* Wishes Card Rotator */}
            {currentWish && (
              <div className="bg-slate-900/70 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-sm shadow-xl space-y-3 text-left">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold">
                    <MessageCircle className="h-4 w-4" />
                    Doa &amp; Ucapan dari Kerabat:
                  </div>
                  <span className="font-mono text-[11px]">
                    {activeWishIndex + 1} / {data?.recent_wishes.length}
                  </span>
                </div>
                <blockquote className="text-sm md:text-base text-slate-200 italic font-serif leading-relaxed">
                  "{currentWish.message}"
                </blockquote>
                <div className="text-xs font-medium text-amber-300">
                  &mdash; {currentWish.guest_name}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Live Arrivals Rail */}
      <footer className="relative z-10 p-6 md:p-8 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Tamu Terakhir Check-in:
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {data?.recent_checkins && data.recent_checkins.length > 0 ? (
              data.recent_checkins.slice(0, 5).map((guest) => (
                <div
                  key={guest.id}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center gap-2 shrink-0"
                >
                  {guest.is_vip && <Crown className="h-3 w-3 text-amber-400" />}
                  <span className="text-slate-200 font-medium">{guest.name}</span>
                  {guest.table_number && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">
                      {guest.table_number}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {guest.checked_in_at
                      ? new Date(guest.checked_in_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500">Menunggu kedatangan tamu pertama...</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
