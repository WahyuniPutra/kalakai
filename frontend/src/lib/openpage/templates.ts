/**
 * KALAKAI OPENPAGE TEMPLATE CATALOG
 * Berbagai jenis layout HTML terinspirasi dari portofolio Elliott Invitation & tren industri.
 * Setiap template bukan sekadar ganti warna, melainkan mengubah arsitektur layout HTML,
 * bentuk bingkai foto, struktur kartu jadwal, kartu rekening ATM realistis, dan sistem navigasi.
 */

import type { OpenPageConfig, OpenPageTheme, OpenPageBlock } from "./schema";

export interface OpenPageTemplate {
  id: string;
  name: string;
  category: "luxury" | "adat" | "minimalist" | "floral" | "syari" | "rustic" | "slider";
  categoryLabel: string;
  badge: string;
  badgeColor: string;
  layoutArchetype: "luxury-arch" | "editorial-split" | "slide-presentation" | "adat-heritage" | "syari-dome" | "rustic-polaroid" | "classic-vertical";
  layoutLabel: string;
  description: string;
  thumbnailGradient: string;
  previewImage: string;
  theme: OpenPageTheme;
  quoteDefault: string;
  quoteSourceDefault: string;
  eyebrowDefault: string;
  apply: (current: OpenPageConfig, eventInfo?: any) => OpenPageConfig;
}

export const OPENPAGE_CATALOG_TEMPLATES: OpenPageTemplate[] = [
  // 1. ELLIOTT SIGNATURE - KAHAYAN ROYAL LUXURY ARCH (BINGKAI KUBAH ISTANA)
  {
    id: "kahayan-royal-emerald",
    name: "Kahayan Royal Arch & Gold",
    category: "luxury",
    categoryLabel: "Mewah & Gold",
    badge: "Elliott Signature Luxury",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    layoutArchetype: "luxury-arch",
    layoutLabel: "Layout Kubah Istana (Arch Frame)",
    description: "Format arsitektur lengkung kubah ala istana (Arch Dome) khas Elliott Invitation Luxury 1 & 2. Foto pasangan dalam bingkai lengkung vertikal, kartu ATM emas realistis, dan bingkai border ganda.",
    thumbnailGradient: "linear-gradient(135deg, #061e14 0%, #0d3826 50%, #d4af37 100%)",
    previewImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
    theme: {
      preset: "emerald-palace",
      primaryColor: "#d4af37", // Gold
      accentColor: "#f3e5ab", // Champagne
      bgColor: "#04150e", // Deep forest Kahayan
      cardBgColor: "#0a261a",
      textColor: "#fbfaf8",
      textMutedColor: "#a3b8ad",
      borderColor: "#194d36",
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "3xl",
    },
    eyebrowDefault: "THE ROYAL WEDDING CELEBRATION",
    quoteDefault: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.",
    quoteSourceDefault: "QS. Ar-Rum: 21",
    apply: (current, eventInfo) => {
      const couple = eventInfo?.groom_name && eventInfo?.bride_name
        ? `${eventInfo.groom_name} & ${eventInfo.bride_name}`
        : current.metadata.title;

      return {
        ...current,
        layoutArchetype: "luxury-arch",
        theme: {
          preset: "emerald-palace",
          primaryColor: "#d4af37",
          accentColor: "#f3e5ab",
          bgColor: "#04150e",
          cardBgColor: "#0a261a",
          textColor: "#fbfaf8",
          textMutedColor: "#a3b8ad",
          borderColor: "#194d36",
          fontDisplay: "serif",
          fontBody: "sans",
          borderRadius: "3xl",
        },
        blocks: current.blocks.map((b) => {
          if (b.type === "hero") {
            return {
              ...b,
              variant: "arch-palace", // HTML Lengkung Kubah Istana
              content: {
                ...b.content,
                eyebrow: "THE ROYAL WEDDING CELEBRATION",
                title: couple,
                subtitle: "Dengan memohon rahmat dan ridho Illahi, kami bermaksud mengikat janji suci dan menyelenggarakan syukuran pernikahan kami.",
              },
            };
          }
          if (b.type === "couple") {
            return {
              ...b,
              variant: "arch-portraits", // HTML Foto Lengkung Bertingkat
            };
          }
          if (b.type === "schedule") {
            return {
              ...b,
              variant: "palace-gates", // HTML Pintu Gerbang Acara
            };
          }
          if (b.type === "countdown") {
            return {
              ...b,
              variant: "gold-circles", // HTML 4 Cincin Emas Melingkar
            };
          }
          if (b.type === "gifts") {
            return {
              ...b,
              variant: "credit-cards", // HTML Kartu ATM / Debit Mewah
            };
          }
          return b;
        }),
      };
    },
  },

  // 2. MODERN EDITORIAL ASYMMETRIC (ALA MAJALAH VOGUE / MINIMALIS)
  {
    id: "ivory-editorial-magazine",
    name: "Modern Editorial Magazine",
    category: "minimalist",
    categoryLabel: "Minimalis & Editorial",
    badge: "Vogue Editorial Style",
    badgeColor: "bg-stone-500/20 text-stone-200 border-stone-500/40",
    layoutArchetype: "editorial-split",
    layoutLabel: "Layout Majalah Asimetris (Editorial Split)",
    description: "Format tata letak majalah mode berkelas dunia. Tipografi raksasa asimetris bertumpuk, foto portrait bersilangan kiri-kanan, garis pembatas tegas tanpa lengkungan, dan timetable horizontal.",
    thumbnailGradient: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #71717a 100%)",
    previewImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
    theme: {
      preset: "ivory-sand",
      primaryColor: "#f4f4f5", // Zinc 100
      accentColor: "#a1a1aa", // Zinc 400
      bgColor: "#09090b", // Pure dark
      cardBgColor: "#121215",
      textColor: "#fafafa",
      textMutedColor: "#71717a",
      borderColor: "#27272a",
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "md", // Sharp modern
    },
    eyebrowDefault: "ISSUE NO. 01 · THE WEDDING EDITION",
    quoteDefault: "Two distinct stories, harmoniously woven into a timeless masterpiece.",
    quoteSourceDefault: "Editorial Journal",
    apply: (current, eventInfo) => {
      const couple = eventInfo?.groom_name && eventInfo?.bride_name
        ? `${eventInfo.groom_name} & ${eventInfo.bride_name}`
        : current.metadata.title;

      return {
        ...current,
        layoutArchetype: "editorial-split",
        theme: {
          preset: "ivory-sand",
          primaryColor: "#f4f4f5",
          accentColor: "#a1a1aa",
          bgColor: "#09090b",
          cardBgColor: "#121215",
          textColor: "#fafafa",
          textMutedColor: "#71717a",
          borderColor: "#27272a",
          fontDisplay: "serif",
          fontBody: "sans",
          borderRadius: "md",
        },
        blocks: current.blocks.map((b) => {
          if (b.type === "hero") {
            return {
              ...b,
              variant: "editorial-asymmetric", // HTML Typo Raksasa Bertumpuk
              content: {
                ...b.content,
                eyebrow: "THE WEDDING EDITION · SPECIAL ISSUE",
                title: couple,
                subtitle: "Please join us in celebrating the marriage of two best friends.",
              },
            };
          }
          if (b.type === "couple") {
            return {
              ...b,
              variant: "alternating-editorial", // HTML Foto Bersilangan Kiri-Kanan
            };
          }
          if (b.type === "schedule") {
            return {
              ...b,
              variant: "agenda-timeline", // HTML Agenda Waktu Minimalis
            };
          }
          if (b.type === "countdown") {
            return {
              ...b,
              variant: "minimal-pill", // HTML Bar Kaca Horizontal
            };
          }
          if (b.type === "gifts") {
            return {
              ...b,
              variant: "credit-cards",
            };
          }
          return b;
        }),
      };
    },
  },

  // 3. ELLIOTT SLIDE PRESENTATION (SLIDER APP DENGAN FLOATING DOCK)
  {
    id: "elliott-slide-presentation",
    name: "Elliott Slide Presentation",
    category: "slider",
    categoryLabel: "Slider Multi-Page",
    badge: "Navigasi App Dock",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    layoutArchetype: "slide-presentation",
    layoutLabel: "Layout Presentasi Slide & Floating Dock",
    description: "Format paginasi modern ala aplikasi mobile. Dilengkapi floating bottom dock bar (Sampul, Pasangan, Acara, Hadiah, Doa) untuk berpindah bagian dengan 1-klik mulus.",
    thumbnailGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #38bdf8 100%)",
    previewImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop",
    theme: {
      preset: "midnight-velvet",
      primaryColor: "#38bdf8", // Sky blue glow
      accentColor: "#93c5fd",
      bgColor: "#030712",
      cardBgColor: "#0f172a",
      textColor: "#f8fafc",
      textMutedColor: "#94a3b8",
      borderColor: "#1e293b",
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "2xl",
    },
    eyebrowDefault: "DIGITAL WEDDING INVITATION",
    quoteDefault: "Di bawah naungan cinta suci, dua insan dipersatukan dalam sebuah perjalanan penuh makna.",
    quoteSourceDefault: "Elliott Digital Presentation",
    apply: (current, eventInfo) => {
      const couple = eventInfo?.groom_name && eventInfo?.bride_name
        ? `${eventInfo.groom_name} & ${eventInfo.bride_name}`
        : current.metadata.title;

      return {
        ...current,
        layoutArchetype: "slide-presentation",
        theme: {
          preset: "midnight-velvet",
          primaryColor: "#38bdf8",
          accentColor: "#93c5fd",
          bgColor: "#030712",
          cardBgColor: "#0f172a",
          textColor: "#f8fafc",
          textMutedColor: "#94a3b8",
          borderColor: "#1e293b",
          fontDisplay: "serif",
          fontBody: "sans",
          borderRadius: "2xl",
        },
        blocks: current.blocks.map((b) => {
          if (b.type === "hero") {
            return {
              ...b,
              variant: "arch-palace",
              content: {
                ...b.content,
                eyebrow: "DIGITAL WEDDING INVITATION",
                title: couple,
                subtitle: "Gunakan menu di bagian bawah layar untuk menjelajahi profil mempelai, jadwal acara, kado digital, dan ucapan.",
              },
            };
          }
          if (b.type === "couple") return { ...b, variant: "arch-portraits" };
          if (b.type === "schedule") return { ...b, variant: "palace-gates" };
          if (b.type === "countdown") return { ...b, variant: "gold-circles" };
          if (b.type === "gifts") return { ...b, variant: "credit-cards" };
          return b;
        }),
      };
    },
  },

  // 4. BATANG GARING DAYAK HERITAGE (ADAT & BUDAYA KALTENG)
  {
    id: "batang-garing-dayak",
    name: "Batang Garing Dayak Heritage",
    category: "adat",
    categoryLabel: "Adat & Nusantara",
    badge: "Warisan Budaya Kalteng",
    badgeColor: "bg-amber-600/25 text-amber-200 border-amber-600/50",
    layoutArchetype: "adat-heritage",
    layoutLabel: "Layout Sakral Adat & Silsilah Keluarga",
    description: "Format sakral berbalut ukiran kayu ulin Dayak. Menampilkan seksi Upacara Adat Basarah terpisah dari Resepsi, ornamen Pohon Batang Garing di puncak judul, dan penghormatan silsilah keluarga besar.",
    thumbnailGradient: "linear-gradient(135deg, #240f06 0%, #451d0d 60%, #d49a37 100%)",
    previewImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop",
    theme: {
      preset: "dayak-heritage",
      primaryColor: "#d49a37",
      accentColor: "#f3c267",
      bgColor: "#140804",
      cardBgColor: "#220e07",
      textColor: "#fef8f0",
      textMutedColor: "#ba9d90",
      borderColor: "#4d2315",
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "xl",
    },
    eyebrowDefault: "PERKAWINAN ADAT & IBADAH SYUKUR",
    quoteDefault: "Batu Lilis Katambung, Basarah Hayak Manyumpit. Bagaikan kokohnya Batang Garing, kami melangkah bersama mengarungi samudra kehidupan.",
    quoteSourceDefault: "Falsafah Luhur Dayak Kalteng",
    apply: (current, eventInfo) => {
      const couple = eventInfo?.groom_name && eventInfo?.bride_name
        ? `${eventInfo.groom_name} & ${eventInfo.bride_name}`
        : current.metadata.title;

      return {
        ...current,
        layoutArchetype: "adat-heritage",
        theme: {
          preset: "dayak-heritage",
          primaryColor: "#d49a37",
          accentColor: "#f3c267",
          bgColor: "#140804",
          cardBgColor: "#220e07",
          textColor: "#fef8f0",
          textMutedColor: "#ba9d90",
          borderColor: "#4d2315",
          fontDisplay: "serif",
          fontBody: "sans",
          borderRadius: "xl",
        },
        blocks: current.blocks.map((b) => {
          if (b.type === "hero") {
            return {
              ...b,
              variant: "adat-carving", // HTML Ukiran Adat Dayak
              content: {
                ...b.content,
                eyebrow: "IKATAN SUCI PERNIKAHAN ADAT",
                title: couple,
                subtitle: "Dengan penuh rasa syukur dan hormat pada leluhur, kami mengundang Bapak/Ibu/Saudara/i untuk menyaksikan persatuan dua keluarga besar kami.",
              },
            };
          }
          if (b.type === "couple") {
            return {
              ...b,
              variant: "adat-lineage", // HTML Silsilah & Keturunan Keluarga
            };
          }
          if (b.type === "schedule") {
            return {
              ...b,
              variant: "ceremonial-adat", // HTML Sesi Ritual Adat Terpisah
            };
          }
          if (b.type === "countdown") {
            return {
              ...b,
              variant: "gold-circles",
            };
          }
          if (b.type === "gifts") {
            return {
              ...b,
              variant: "credit-cards",
            };
          }
          return b;
        }),
      };
    },
  },

  // 5. MADINAH EMERALD SYAR'I (ISLAMI KUBAH NABAWI)
  {
    id: "madinah-emerald-syari",
    name: "Madinah Emerald Syar'i",
    category: "syari",
    categoryLabel: "Islami & Syar'i",
    badge: "Elegan Syar'i",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    layoutArchetype: "syari-dome",
    layoutLabel: "Layout Kubah Nabawi & Adab Walimah",
    description: "Format syar'i bermartabat. Dilengkapi medali kaligrafi Basmalah megah di atas judul, bingkai kubah hijau zamrud, kartu mempelai yang santun terpisah, serta panduan adab walimatul 'urs.",
    thumbnailGradient: "linear-gradient(135deg, #061914 0%, #11382c 50%, #5eead4 100%)",
    previewImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop",
    theme: {
      preset: "madinah-syari",
      primaryColor: "#10b981",
      accentColor: "#6ee7b7",
      bgColor: "#02120e",
      cardBgColor: "#06241b",
      textColor: "#f0fdf4",
      textMutedColor: "#86efac",
      borderColor: "#0f4233",
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "3xl",
    },
    eyebrowDefault: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ · WALIMATUL 'URSY",
    quoteDefault: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
    quoteSourceDefault: "QS. Ar-Rum: 21",
    apply: (current, eventInfo) => {
      const couple = eventInfo?.groom_name && eventInfo?.bride_name
        ? `${eventInfo.groom_name} & ${eventInfo.bride_name}`
        : current.metadata.title;

      return {
        ...current,
        layoutArchetype: "syari-dome",
        theme: {
          preset: "madinah-syari",
          primaryColor: "#10b981",
          accentColor: "#6ee7b7",
          bgColor: "#02120e",
          cardBgColor: "#06241b",
          textColor: "#f0fdf4",
          textMutedColor: "#86efac",
          borderColor: "#0f4233",
          fontDisplay: "serif",
          fontBody: "sans",
          borderRadius: "3xl",
        },
        blocks: current.blocks.map((b) => {
          if (b.type === "hero") {
            return {
              ...b,
              variant: "syari-calligraphy", // HTML Kaligrafi Basmalah & Kubah
              content: {
                ...b.content,
                eyebrow: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ · WALIMATUL 'URSY",
                title: couple,
                subtitle: "Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Izinkan kami memohon doa restu dari Bapak/Ibu/Saudara/i.",
              },
            };
          }
          if (b.type === "couple") {
            return {
              ...b,
              variant: "syari-modest", // HTML Kartu Mempelai Santun
            };
          }
          if (b.type === "schedule") {
            return {
              ...b,
              variant: "agenda-timeline",
            };
          }
          if (b.type === "countdown") {
            return {
              ...b,
              variant: "minimal-pill",
            };
          }
          if (b.type === "gifts") {
            return {
              ...b,
              variant: "envelope-letter", // HTML Kartu Amplop Surat
            };
          }
          return b;
        }),
      };
    },
  },

  // 6. BOHEMIAN TERRACOTTA RUSTIC (POLAROID & SCRAPBOOK)
  {
    id: "bohemian-terracotta",
    name: "Bohemian Terracotta Sun",
    category: "rustic",
    categoryLabel: "Rustic & Boho",
    badge: "Polaroid Scrapbook",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    layoutArchetype: "rustic-polaroid",
    layoutLabel: "Layout Polaroid & Kertas Scrapbook",
    description: "Format foto polaroid miring dengan aksen selotip perekat transparan, kertas kraft serat alami, dan font tulisan tangan hangat. Sangat digemari untuk pesta kebun dan outdoor.",
    thumbnailGradient: "linear-gradient(135deg, #240d06 0%, #521c0e 55%, #ea580c 100%)",
    previewImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600&auto=format&fit=crop",
    theme: {
      preset: "boho-terracotta",
      primaryColor: "#ea580c",
      accentColor: "#fed7aa",
      bgColor: "#0f0704",
      cardBgColor: "#1f0f09",
      textColor: "#fff7ed",
      textMutedColor: "#c2a498",
      borderColor: "#3d1b11",
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "3xl",
    },
    eyebrowDefault: "A BEAUTIFUL SUNSET JOURNEY",
    quoteDefault: "Cinta sejati ibarat mentari senja yang menghangatkan bumi, menenangkan setiap langkah perjalanan kami berdua.",
    quoteSourceDefault: "Rustic Harmony",
    apply: (current, eventInfo) => {
      const couple = eventInfo?.groom_name && eventInfo?.bride_name
        ? `${eventInfo.groom_name} & ${eventInfo.bride_name}`
        : current.metadata.title;

      return {
        ...current,
        layoutArchetype: "rustic-polaroid",
        theme: {
          preset: "boho-terracotta",
          primaryColor: "#ea580c",
          accentColor: "#fed7aa",
          bgColor: "#0f0704",
          cardBgColor: "#1f0f09",
          textColor: "#fff7ed",
          textMutedColor: "#c2a498",
          borderColor: "#3d1b11",
          fontDisplay: "serif",
          fontBody: "sans",
          borderRadius: "3xl",
        },
        blocks: current.blocks.map((b) => {
          if (b.type === "hero") {
            return {
              ...b,
              variant: "polaroid-rustic", // HTML Foto Polaroid Miring
              content: {
                ...b.content,
                eyebrow: "A BEAUTIFUL SUNSET JOURNEY",
                title: couple,
                subtitle: "Bersama embusan angin sore dan hangatnya senja, kami mengundang Anda untuk menjadi saksi pengucapan janji setia kami.",
              },
            };
          }
          if (b.type === "couple") {
            return {
              ...b,
              variant: "polaroid-cards", // HTML Dua Kartu Polaroid Berjajar
            };
          }
          if (b.type === "schedule") {
            return {
              ...b,
              variant: "cards",
            };
          }
          if (b.type === "gifts") {
            return {
              ...b,
              variant: "envelope-letter",
            };
          }
          return b;
        }),
      };
    },
  },
];
