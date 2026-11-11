/**
 * SEJUTA ELEMEN OPENSOURCE - WEDDING DECORATIVE COLLECTION
 * Koleksi aset grafis dekoratif, ornamen, bunga, bingkai, dan simbol adat
 * yang dapat disisipkan ke dalam undangan digital OpenPage.
 */

export interface DecorativeElement {
  id: string;
  name: string;
  category: "floral" | "ornaments" | "cultural" | "seals" | "icons";
  categoryLabel: string;
  svg: string;
  keywords: string[];
  recommendedBlock?: string;
  description: string;
}

export const OPENPAGE_DECORATIVE_ELEMENTS: DecorativeElement[] = [
  // ─── 1. FLORAL & BOTANICAL ──────────────────────────────────────
  {
    id: "flower-rose-corner",
    name: "Mawar Sudut Elegan (Rose Flourish)",
    category: "floral",
    categoryLabel: "Bunga & Daun",
    keywords: ["bunga", "rose", "mawar", "sudut", "botanical"],
    description: "Ornamen floral mawar klasik untuk mempermanis sudut kartu atau atas judul.",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15 C55 25 70 25 75 35 C80 45 75 60 65 70 C55 80 40 85 30 75 C20 65 20 45 30 35 C38 27 45 22 50 15 Z" fill-opacity="0.25"/>
      <path d="M50 25 C53 32 63 32 67 39 C70 46 67 56 60 63 C53 70 42 74 35 67 C28 60 28 46 35 39 C41 33 46 30 50 25 Z" fill-opacity="0.45"/>
      <circle cx="50" cy="48" r="10" fill="currentColor"/>
      <path d="M25 65 C15 70 10 80 12 90 C22 92 32 87 37 77 Z" fill-opacity="0.35"/>
      <path d="M75 35 C85 30 90 20 88 10 C78 8 68 13 63 23 Z" fill-opacity="0.35"/>
    </svg>`,
  },
  {
    id: "botanical-eucalyptus",
    name: "Tangkai Daun Eucalyptus",
    category: "floral",
    categoryLabel: "Bunga & Daun",
    keywords: ["eucalyptus", "daun", "ranting", "rustic"],
    description: "Tangkai daun minimalis yang memberi kesan sejuk, anggun, dan natural.",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 85 Q50 50 80 15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <ellipse cx="32" cy="70" rx="9" ry="6" transform="rotate(-30 32 70)" fill-opacity="0.5"/>
      <ellipse cx="44" cy="56" rx="9" ry="6" transform="rotate(40 44 56)" fill-opacity="0.5"/>
      <ellipse cx="56" cy="42" rx="8" ry="5.5" transform="rotate(-25 56 42)" fill-opacity="0.6"/>
      <ellipse cx="68" cy="28" rx="7" ry="5" transform="rotate(35 68 28)" fill-opacity="0.6"/>
      <ellipse cx="78" cy="17" rx="5" ry="3.5" transform="rotate(10 78 17)" fill="currentColor"/>
    </svg>`,
  },
  {
    id: "floral-wreath-circle",
    name: "Karangan Bunga Lingkaran (Wreath)",
    category: "floral",
    categoryLabel: "Bunga & Daun",
    keywords: ["wreath", "lingkaran", "cincin bunga", "frame foto"],
    description: "Karangan melingkar cocok untuk mengelilingi inisial nama atau foto pasangan.",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="38" stroke="currentColor" stroke-width="1.8" stroke-dasharray="3 3" fill="none" opacity="0.6"/>
      <path d="M50 10 C52 14 56 14 58 11 C57 16 61 17 64 14 C62 19 65 21 68 19" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <ellipse cx="25" cy="25" rx="5" ry="3" transform="rotate(-45 25 25)" fill-opacity="0.6"/>
      <ellipse cx="75" cy="25" rx="5" ry="3" transform="rotate(45 75 25)" fill-opacity="0.6"/>
      <ellipse cx="20" cy="50" rx="5" ry="3" transform="rotate(-90 20 50)" fill-opacity="0.6"/>
      <ellipse cx="80" cy="50" rx="5" ry="3" transform="rotate(90 80 50)" fill-opacity="0.6"/>
      <ellipse cx="25" cy="75" rx="5" ry="3" transform="rotate(-135 25 75)" fill-opacity="0.6"/>
      <ellipse cx="75" cy="75" rx="5" ry="3" transform="rotate(135 75 75)" fill-opacity="0.6"/>
      <path d="M46 90 C48 86 52 86 54 89 C53 84 57 83 60 86" stroke="currentColor" stroke-width="1.5" fill="none"/>
    </svg>`,
  },
  {
    id: "golden-palm-leaf",
    name: "Daun Palem Senja (Boho Palm)",
    category: "floral",
    categoryLabel: "Bunga & Daun",
    keywords: ["palem", "boho", "terracotta", "daun kering"],
    description: "Daun palem tropis kering aesthetic untuk konsep pernikahan rustic bohemian.",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 90 L50 40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      <path d="M50 40 C35 25 20 30 15 45 C30 42 45 45 50 40 Z" fill-opacity="0.4"/>
      <path d="M50 40 C65 25 80 30 85 45 C70 42 55 45 50 40 Z" fill-opacity="0.4"/>
      <path d="M50 35 C40 15 30 18 28 30 C38 28 46 32 50 35 Z" fill-opacity="0.55"/>
      <path d="M50 35 C60 15 70 18 72 30 C62 28 54 32 50 35 Z" fill-opacity="0.55"/>
      <path d="M50 25 C45 8 55 8 50 25 Z" fill="currentColor"/>
    </svg>`,
  },

  // ─── 2. ORNAMEN & BINGKAI EMAS ──────────────────────────────────
  {
    id: "ornament-arch-dome",
    name: "Bingkai Lengkung Kubah (Arch Dome)",
    category: "ornaments",
    categoryLabel: "Ornamen & Bingkai",
    keywords: ["arch", "kubah", "bingkai", "modern arch"],
    description: "Garis lengkung kubah ala istana modern yang sedang menjadi tren utama dekorasi wedding.",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 85 L25 45 C25 28 75 28 75 45 L75 85" stroke-linecap="round"/>
      <path d="M32 85 L32 46 C32 34 68 34 68 46 L68 85" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.6"/>
      <circle cx="50" cy="20" r="3.5" fill="currentColor"/>
      <line x1="20" y1="85" x2="80" y2="85" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: "ornament-corner-flourish",
    name: "Sudut Ukiran Klasik (Corner Flourish)",
    category: "ornaments",
    categoryLabel: "Ornamen & Bingkai",
    keywords: ["sudut", "flourish", "vintage", "bingkai emas"],
    description: "Aksen sudut vintage untuk membingkai kutipan doa atau foto pengantin.",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 80 L15 25 C15 18 20 15 28 15 L80 15" stroke-linecap="round"/>
      <path d="M15 25 C25 25 35 35 35 45 C35 55 25 60 20 60" stroke-width="1.8"/>
      <path d="M25 15 C25 25 35 35 45 35 C55 35 60 25 60 20" stroke-width="1.8"/>
      <circle cx="35" cy="35" r="3" fill="currentColor"/>
    </svg>`,
  },
  {
    id: "ornament-gold-divider",
    name: "Pemisah Berbintang Emas (Starry Divider)",
    category: "ornaments",
    categoryLabel: "Ornamen & Bingkai",
    keywords: ["divider", "pemisah", "garis", "bintang", "emas"],
    description: "Garis pemisah mewah dengan sentuhan bintang berlian untuk jeda antar bagian.",
    svg: `<svg viewBox="0 0 120 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <line x1="5" y1="20" x2="45" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <polygon points="60,10 63,18 71,20 63,22 60,30 57,22 49,20 57,18"/>
      <circle cx="48" cy="20" r="2"/>
      <circle cx="72" cy="20" r="2"/>
      <line x1="75" y1="20" x2="115" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: "ornament-diamond-crest",
    name: "Lambang Mahkota Berlian (Royal Crest)",
    category: "ornaments",
    categoryLabel: "Ornamen & Bingkai",
    keywords: ["crest", "mahkota", "kerajaan", "lambang"],
    description: "Simbol mahkota kehormatan royal family untuk diletakkan di puncak pembuka undangan.",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 65 L30 35 L42 50 L50 25 L58 50 L70 35 L80 65 Z" fill-opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <circle cx="30" cy="32" r="3"/>
      <circle cx="50" cy="22" r="3.5"/>
      <circle cx="70" cy="32" r="3"/>
      <rect x="20" y="68" width="60" height="5" rx="2" fill="currentColor"/>
    </svg>`,
  },

  // ─── 3. SIMBOL BUDAYA & AGAMA ────────────────────────────────────
  {
    id: "cultural-batang-garing",
    name: "Pohon Batang Garing (Simbol Dayak Kalteng)",
    category: "cultural",
    categoryLabel: "Adat & Simbol",
    keywords: ["dayak", "kalteng", "palangka raya", "batang garing", "pohon kehidupan"],
    description: "Simbol luhur Pohon Kehidupan masyarakat Dayak Kalimantan Tengah, melambangkan keharmonisan semesta.",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <!-- Batang Utama -->
      <line x1="50" y1="90" x2="50" y2="18"/>
      <!-- Pucuk Burung Tingang -->
      <path d="M42 22 Q50 12 58 22" fill="currentColor"/>
      <circle cx="50" cy="14" r="3" fill="currentColor"/>
      <!-- Cabang Kanan & Kiri Bertingkat -->
      <path d="M50 40 Q68 35 72 45 Q75 55 65 52"/>
      <path d="M50 40 Q32 35 28 45 Q25 55 35 52"/>
      <path d="M50 60 Q72 55 76 68 Q80 78 68 74"/>
      <path d="M50 60 Q28 55 24 68 Q20 78 32 74"/>
      <!-- Guci Balanga Bawah -->
      <path d="M35 90 C35 82 65 82 65 90 Z" fill="currentColor"/>
    </svg>`,
  },
  {
    id: "cultural-gunungan-wayang",
    name: "Gunungan Kayon Wayang (Adat Jawa)",
    category: "cultural",
    categoryLabel: "Adat & Simbol",
    keywords: ["wayang", "jawa", "gunungan", "kayon", "tradisional"],
    description: "Gunungan perlambang gerbang kehidupan sakral, mengawali babak baru rumah tangga.",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 C62 30 82 50 82 75 C82 85 70 88 50 88 C30 88 18 85 18 75 C18 50 38 30 50 10 Z" fill-opacity="0.15" fill="currentColor"/>
      <line x1="50" y1="88" x2="50" y2="98" stroke-width="3"/>
      <path d="M50 35 L50 78 M35 55 Q50 45 65 55 M30 70 Q50 60 70 70" opacity="0.6"/>
      <circle cx="50" cy="22" r="3" fill="currentColor"/>
    </svg>`,
  },
  {
    id: "cultural-bismillah-calligraphy",
    name: "Lafadz Basmalah (Khat Kufi / Diwani)",
    category: "cultural",
    categoryLabel: "Adat & Simbol",
    keywords: ["bismillah", "islami", "arab", "syari", "kaligrafi"],
    description: "Pembuka suci kalimat Basmalah untuk keberkahan majelis pernikahan syar'i.",
    svg: `<svg viewBox="0 0 140 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 25 Q20 15 35 25 T60 25 T85 20 T110 25 T130 15" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="25" cy="15" r="2.5"/>
      <circle cx="50" cy="12" r="2.5"/>
      <circle cx="75" cy="12" r="2.5"/>
      <circle cx="95" cy="15" r="2.5"/>
      <path d="M40 35 Q70 42 100 35" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>`,
  },
  {
    id: "cultural-wedding-rings",
    name: "Dua Cincin Bersatu (Golden Rings)",
    category: "cultural",
    categoryLabel: "Adat & Simbol",
    keywords: ["cincin", "rings", "emas", "tunangan", "akad"],
    description: "Sepasang cincin kawin bertaut lambang cinta dan kesetiaan sehidup semati.",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" xmlns="http://www.w3.org/2000/svg">
      <circle cx="42" cy="52" r="24"/>
      <circle cx="58" cy="48" r="24"/>
      <!-- Kilau Permata Berlian -->
      <polygon points="58,15 63,22 58,26 53,22" fill="currentColor" stroke="none"/>
      <circle cx="58" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },

  // ─── 4. STEMPEL LILIN & LENCANA (WAX SEALS) ──────────────────────
  {
    id: "seal-wax-monogram",
    name: "Segel Lilin Stempel Emas (Wax Seal)",
    category: "seals",
    categoryLabel: "Stempel & Segel",
    keywords: ["wax seal", "lilin", "stempel", "amplop", "monogram"],
    description: "Stempel lilin klasik bergaya eropa bangsawan untuk diletakkan pada tombol pembuka.",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8 C65 6 78 14 85 24 C92 34 94 48 90 62 C86 76 75 88 60 92 C45 96 30 92 18 82 C6 72 4 56 8 42 C12 28 22 14 36 9 C41 7 45 8 50 8 Z" fill-opacity="0.3"/>
      <circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="2" fill-opacity="0.2"/>
      <circle cx="50" cy="50" r="24" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2" fill="none"/>
      <!-- Huruf Monogram Cinta -->
      <path d="M42 42 C42 36 48 36 50 41 C52 36 58 36 58 42 C58 49 50 56 50 56 C50 56 42 49 42 42 Z" fill="currentColor"/>
    </svg>`,
  },
  {
    id: "seal-golden-laurel",
    name: "Lencana Daun Kehormatan (Laurel Wreath)",
    category: "seals",
    categoryLabel: "Stempel & Segel",
    keywords: ["laurel", "lencana", "crest", "vip"],
    description: "Untaian daun laurel yang melambangkan kejayaan dan kehormatan tamu undangan.",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 80 C18 60 22 35 48 18" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M75 80 C82 60 78 35 52 18" stroke="currentColor" stroke-width="2" fill="none"/>
      <ellipse cx="22" cy="70" rx="6" ry="3" transform="rotate(-30 22 70)"/>
      <ellipse cx="18" cy="52" rx="6" ry="3" transform="rotate(-60 18 52)"/>
      <ellipse cx="26" cy="35" rx="6" ry="3" transform="rotate(-75 26 35)"/>
      <ellipse cx="40" cy="22" rx="6" ry="3" transform="rotate(-40 40 22)"/>
      <ellipse cx="78" cy="70" rx="6" ry="3" transform="rotate(30 78 70)"/>
      <ellipse cx="82" cy="52" rx="6" ry="3" transform="rotate(60 82 52)"/>
      <ellipse cx="74" cy="35" rx="6" ry="3" transform="rotate(75 74 35)"/>
      <ellipse cx="60" cy="22" rx="6" ry="3" transform="rotate(40 60 22)"/>
      <circle cx="50" cy="85" r="4"/>
    </svg>`,
  },
  {
    id: "seal-ribbon-bow",
    name: "Pita Sutra Resepsi (Silk Ribbon Bow)",
    category: "seals",
    categoryLabel: "Stempel & Segel",
    keywords: ["pita", "ribbon", "hadiah", "kado"],
    description: "Pita simpul kado elegan untuk disematkan di atas kotak amplop digital.",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <!-- Simpul Tengah -->
      <circle cx="50" cy="45" r="7"/>
      <!-- Sayap Kiri & Kanan -->
      <path d="M44 43 C30 30 15 35 22 48 C28 58 43 48 44 45 Z" fill-opacity="0.6"/>
      <path d="M56 43 C70 30 85 35 78 48 C72 58 57 48 56 45 Z" fill-opacity="0.6"/>
      <!-- Ekor Pita -->
      <path d="M46 51 Q35 75 25 80 L35 70 L47 54 Z" fill-opacity="0.75"/>
      <path d="M54 51 Q65 75 75 80 L65 70 L53 54 Z" fill-opacity="0.75"/>
    </svg>`,
  },

  // ─── 5. IKON ACARA & RESEPSI (EVENT UTILITIES) ───────────────────
  {
    id: "icon-envelope-gold",
    name: "Amplop Surat Emas Terbuka (Letter of Joy)",
    category: "icons",
    categoryLabel: "Ikon Acara",
    keywords: ["amplop", "surat", "undangan", "pesan"],
    description: "Amplop surat klasik terbuka dengan kilauan kertas undangan di dalamnya.",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="35" width="70" height="48" rx="6" fill="currentColor" fill-opacity="0.15"/>
      <path d="M15 38 L50 62 L85 38"/>
      <path d="M15 80 L42 55"/>
      <path d="M85 80 L58 55"/>
      <!-- Kartu Dalam -->
      <path d="M28 35 L28 20 C28 17 31 14 34 14 L66 14 C69 14 72 17 72 20 L72 35" stroke-width="2"/>
      <line x1="38" y1="24" x2="62" y2="24" stroke-width="1.8"/>
    </svg>`,
  },
  {
    id: "icon-calendar-clock",
    name: "Kalender & Waktu Akad (Save The Date)",
    category: "icons",
    categoryLabel: "Ikon Acara",
    keywords: ["kalender", "waktu", "akad", "jam", "tanggal"],
    description: "Ikon kalender pengingat hari-H acara agar tamu tidak melewatkan momen penting.",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="24" width="60" height="60" rx="10" fill="currentColor" fill-opacity="0.15"/>
      <line x1="20" y1="42" x2="80" y2="42"/>
      <line x1="36" y1="16" x2="36" y2="28" stroke-width="3"/>
      <line x1="64" y1="16" x2="64" y2="28" stroke-width="3"/>
      <!-- Hati Tanggal -->
      <path d="M46 58 C46 54 50 54 50 57 C50 54 54 54 54 58 C54 63 50 67 50 67 C50 67 46 63 46 58 Z" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  {
    id: "icon-map-pin-heart",
    name: "Pin Lokasi Hati (Venue Location)",
    category: "icons",
    categoryLabel: "Ikon Acara",
    keywords: ["peta", "lokasi", "gedung", "hotel", "maps"],
    description: "Penunjuk lokasi gedung resepsi dengan lambang hati penanda tempat bahagia.",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15 C33 15 20 28 20 45 C20 65 45 88 50 90 C55 88 80 65 80 45 C80 28 67 15 50 15 Z" fill-opacity="0.2" stroke="currentColor" stroke-width="2.5"/>
      <!-- Heart Center -->
      <path d="M42 40 C42 34 48 34 50 39 C52 34 58 34 58 40 C58 47 50 53 50 53 C50 53 42 47 42 40 Z" fill="currentColor"/>
    </svg>`,
  },
  {
    id: "icon-gift-box",
    name: "Kotak Tanda Kasih (Gift Box)",
    category: "icons",
    categoryLabel: "Ikon Acara",
    keywords: ["kado", "amplop", "hadiah", "rekening"],
    description: "Ikon kotak kado berpita untuk bagian amplop digital dan nomor rekening.",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="44" width="56" height="42" rx="4" fill="currentColor" fill-opacity="0.15"/>
      <rect x="18" y="32" width="64" height="12" rx="3" fill="currentColor" fill-opacity="0.25"/>
      <line x1="50" y1="32" x2="50" y2="86"/>
      <!-- Pita Atas -->
      <path d="M50 32 C40 18 28 22 36 32 Z" fill="currentColor"/>
      <path d="M50 32 C60 18 72 22 64 32 Z" fill="currentColor"/>
    </svg>`,
  },
];
