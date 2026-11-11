"use client";

import { useEffect, useState } from "react";
import OpenPageRenderer from "@/lib/openpage/renderer";
import { createDefaultOpenPageConfig } from "@/lib/openpage/schema";
import { Heart } from "lucide-react";

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
    primary_color?: string;
    accent_color?: string;
    font_family?: string;
    hero_image_url?: string;
    quote?: string;
    quote_source?: string;
    audio_title?: string;
    audio_preview_url?: string;
    openpage_config?: any;
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
  is_vip?: boolean;
  table_number?: string | null;
  pax: number;
  qr_code: string;
  status: string;
}

export default function InvitationClient({
  eventSlug,
  guestSlug,
}: {
  eventSlug: string;
  guestSlug?: string;
}) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);

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

        if (json.data?.event) {
          setEvent(json.data.event);
          setGuest(json.data.guest);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-rose-100 font-serif">
        <Heart className="h-10 w-10 animate-bounce text-rose-400 mb-4" />
        <p className="text-xs tracking-widest uppercase font-mono text-stone-400">
          Memuat Undangan...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-slate-100 p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Undangan Tidak Ditemukan</h1>
        <p className="text-slate-400 text-sm">
          Pastikan alamat tautan yang Anda masukkan sudah benar.
        </p>
      </div>
    );
  }

  const theme = event.theme_config ?? {};

  const activeConfig =
    theme.openpage_config ||
    createDefaultOpenPageConfig({
      title: event.title,
      groom_name: event.groom_name,
      bride_name: event.bride_name,
      event_date: event.event_date,
      location_name: event.location_name,
      location_address: event.location_address,
      map_url: event.map_url,
      spotify_track_id: event.spotify_track_id,
    });

  return (
    <OpenPageRenderer
      config={activeConfig}
      event={event}
      guest={guest}
      isPreview={false}
    />
  );
}
