/**
 * KALAKAI OPENPAGE SCHEMA
 * JSON-first, deterministic, responsive block architecture for event invitations.
 * Inspired by buildingopen/openpage (MIT).
 */

export type OpenPageBlockType =
  | "hero"
  | "countdown"
  | "couple"
  | "quote"
  | "story"
  | "schedule"
  | "ticket"
  | "gifts"
  | "rsvp"
  | "guestbook"
  | "footer";

export interface OpenPageTheme {
  preset: string; // e.g. "rose-romance", "emerald-palace", "midnight-velvet", "ivory-sand"
  primaryColor: string; // Accent/Gold/Rose
  accentColor: string; // Secondary highlight
  bgColor: string; // Page background
  cardBgColor: string; // Card surface background
  textColor: string; // Main text color
  textMutedColor: string; // Secondary text
  borderColor: string; // Border accent
  fontDisplay: "serif" | "sans" | "display"; // Heading font
  fontBody: "sans" | "serif"; // Body font
  borderRadius: "none" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}

export interface OpenPageBlock {
  id: string;
  type: OpenPageBlockType;
  variant: string; // e.g. "centered", "split", "overlay", "cards", "timeline"
  visible: boolean;
  styles?: {
    paddingY?: "sm" | "md" | "lg" | "xl";
    bgOverride?: string;
  };
  content: Record<string, any>;
}

export interface OpenPageConfig {
  version: "2.0.0";
  layoutArchetype?: "luxury-arch" | "editorial-split" | "slide-presentation" | "adat-heritage" | "syari-dome" | "rustic-polaroid" | "classic-vertical";
  metadata: {
    title: string;
    description: string;
    ogImage?: string;
  };
  theme: OpenPageTheme;
  audio: {
    enabled: boolean;
    title: string;
    audioUrl?: string;
    spotifyId?: string;
    autoplay?: boolean;
    volume?: number; // 0 - 100
    position?: "bottom-right" | "bottom-left" | "top-right";
  };
  blocks: OpenPageBlock[];
}

/**
 * Factory to generate a default, production-ready OpenPage configuration
 */
export function createDefaultOpenPageConfig(event: {
  title?: string;
  groom_name?: string | null;
  bride_name?: string | null;
  event_date?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  map_url?: string | null;
  spotify_track_id?: string | null;
}): OpenPageConfig {
  const coupleName =
    event.groom_name && event.bride_name
      ? `${event.groom_name} & ${event.bride_name}`
      : event.title || "Romeo & Juliet";

  return {
    version: "2.0.0",
    metadata: {
      title: `The Wedding of ${coupleName}`,
      description: `Undangan digital resmi dan tiket masuk resepsi untuk ${coupleName}`,
      ogImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
    },
    theme: {
      preset: "rose-romance",
      primaryColor: "#e11d48", // rose-600
      accentColor: "#f43f5e", // rose-500
      bgColor: "#09090b", // zinc-950
      cardBgColor: "#18181b", // zinc-900
      textColor: "#fafafa", // zinc-50
      textMutedColor: "#a1a1aa", // zinc-400
      borderColor: "#27272a", // zinc-800
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "3xl",
    },
    audio: {
      enabled: true,
      title: "Until I Found You - Stephen Sanchez",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      spotifyId: event.spotify_track_id || "3n3Ppam7vgaVa1iaRUc9Lp",
    },
    blocks: [
      // 1. HERO COVER
      {
        id: "block-hero",
        type: "hero",
        variant: "centered",
        visible: true,
        styles: { paddingY: "xl" },
        content: {
          eyebrow: "THE WEDDING INVITATION",
          title: coupleName,
          subtitle: "Dengan penuh rasa syukur, kami mengundang Anda untuk merayakan momen bahagia kami.",
          dateText: event.event_date ? new Date(event.event_date).toLocaleDateString("id-ID", { dateStyle: "full" }) : "Jumat, 25 Desember 2026",
          coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1080&auto=format&fit=crop",
          openButtonText: "Buka Undangan",
        },
      },
      // 2. COUNTDOWN
      {
        id: "block-countdown",
        type: "countdown",
        variant: "cards",
        visible: true,
        styles: { paddingY: "md" },
        content: {
          heading: "Menghitung Hari",
          targetDate: event.event_date || "2026-12-25T09:00:00",
        },
      },
      // 3. QUOTE
      {
        id: "block-quote",
        type: "quote",
        variant: "card",
        visible: true,
        styles: { paddingY: "md" },
        content: {
          quote: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
          source: "QS. Ar-Rum: 21",
        },
      },
      // 4. COUPLE
      {
        id: "block-couple",
        type: "couple",
        variant: "split",
        visible: true,
        styles: { paddingY: "lg" },
        content: {
          groomName: event.groom_name || "Romeo Montague",
          groomDesc: "Putra pertama dari Bapak Montague & Ibu Montague",
          groomPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
          groomInstagram: "@romeo",
          brideName: event.bride_name || "Juliet Capulet",
          brideDesc: "Putri bungsu dari Bapak Capulet & Ibu Capulet",
          bridePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
          brideInstagram: "@juliet",
        },
      },
      // 5. STORY
      {
        id: "block-story",
        type: "story",
        variant: "timeline",
        visible: true,
        styles: { paddingY: "lg" },
        content: {
          heading: "Kisah Cinta Kami",
          subtitle: "Perjalanan indah yang mempertemukan dua hati hingga mengikat janji suci.",
          items: [
            {
              year: "2021",
              title: "Pertemuan Pertama",
              desc: "Tatap mata pertama di tepi Sungai Kahayan, Palangka Raya, mengawali percakapan panjang tak terlupakan.",
            },
            {
              year: "2023",
              title: "Menjalin Komitmen",
              desc: "Memutuskan untuk saling menguatkan mimpi dan berjalan beriringan mengatasi segala tantangan bersama.",
            },
            {
              year: "2026",
              title: "Hari Bahagia",
              desc: "Dengan penuh rasa syukur, mengikat janji suci pernikahan di hadapan keluarga dan kerabat terkasih.",
            },
          ],
        },
      },
      // 6. SCHEDULE & LOCATION
      {
        id: "block-schedule",
        type: "schedule",
        variant: "cards",
        visible: true,
        styles: { paddingY: "lg" },
        content: {
          heading: "Waktu & Tempat Acara",
          locationName: event.location_name || "Grand Ballroom Hotel Aquarius",
          locationAddress: event.location_address || "Jl. Imam Bonjol No. 5, Palangka Raya, Kalimantan Tengah",
          mapUrl: event.map_url || "https://maps.google.com/?q=-2.215562,113.916944",
          akadTime: "08:00 - 10:00 WIB",
          resepsiTime: "11:00 - 15:00 WIB",
        },
      },
      // 7. PERSONAL TICKET PASS
      {
        id: "block-ticket",
        type: "ticket",
        variant: "card",
        visible: true,
        styles: { paddingY: "lg" },
        content: {
          heading: "Tiket Masuk & QR Check-In",
          instruction: "Tunjukkan kode QR ini kepada penerima tamu di meja resepsionis untuk verifikasi cepat dan informasi nomor meja.",
        },
      },
      // 8. DIGITAL GIFTS / AMPLOP
      {
        id: "block-gifts",
        type: "gifts",
        variant: "grid",
        visible: true,
        styles: { paddingY: "lg" },
        content: {
          heading: "Tanda Kasih (Amplop Digital)",
          subtitle: "Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda ingin memberikan tanda kasih, Anda dapat menggunakan saluran transfer berikut:",
        },
      },
      // 9. GUESTBOOK & WISHES
      {
        id: "block-guestbook",
        type: "guestbook",
        variant: "centered",
        visible: true,
        styles: { paddingY: "lg" },
        content: {
          heading: "Doa & Konfirmasi Kehadiran (RSVP)",
          subtitle: "Kirimkan doa terbaik Anda serta konfirmasi kehadiran untuk memudahkan persiapan kami.",
        },
      },
      // 10. FOOTER
      {
        id: "block-footer",
        type: "footer",
        variant: "centered",
        visible: true,
        styles: { paddingY: "md" },
        content: {
          thankYouText: "Merupakan suatu kehormatan & kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu bagi kedua mempelai.",
          closingFamily: "Kami yang berbahagia, Keluarga Besar Romeo & Juliet",
          branding: "Ditenagai oleh Kalakai (Kerabat Kalakai)",
        },
      },
    ],
  };
}
