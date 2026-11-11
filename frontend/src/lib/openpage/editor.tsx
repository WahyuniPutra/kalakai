"use client";

import { useState, useRef, useMemo } from "react";
import { 
  Smartphone, Tablet, Monitor, Eye, EyeOff, ArrowUp, ArrowDown, 
  Sparkles, Palette, Layers, Save, Check, Plus, Trash2,
  ChevronDown, ChevronUp, Music, Volume2, Upload,
  Calendar, MapPin, Heart, CreditCard, Clock, MessageSquare,
  Search, BookOpen, Shapes, Copy, CheckCheck, Play, ArrowRight,
  Crown, ExternalLink, Pause, Disc, Sliders, VolumeX, Radio, CheckCircle
} from "lucide-react";
import type { OpenPageConfig, OpenPageBlock, OpenPageBlockType } from "./schema";
import { OPENPAGE_THEME_PRESETS } from "./presets";
import { OPENPAGE_CATALOG_TEMPLATES, type OpenPageTemplate } from "./templates";
import { OPENPAGE_DECORATIVE_ELEMENTS, type DecorativeElement } from "./elements";
import OpenPageRenderer from "./renderer";

interface OpenPageEditorProps {
  config: OpenPageConfig;
  onChange: (updated: OpenPageConfig) => void;
  event: any;
  onSave?: () => void;
  saving?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
  onUploadAudio?: (file: File) => Promise<string>;
}

// Koleksi Rekomendasi Musik Pernikahan Terlengkap Berdasarkan Kategori
export interface WeddingSongItem {
  id: string;
  category: "romantis" | "indonesia" | "syari" | "adat" | "klasik";
  title: string;
  spotifyId: string;
  mp3: string;
  genre: string;
  desc: string;
}

const WEDDING_PLAYLIST_SUGGESTIONS: WeddingSongItem[] = [
  // ROMANTIS GLOBAL
  {
    id: "stephen-sanchez",
    category: "romantis",
    title: "Until I Found You - Stephen Sanchez",
    spotifyId: "3n3Ppam7vgaVa1iaRUc9Lp",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    genre: "Romantic 50s Ballad",
    desc: "Nuansa syahdu romantis retro yang sangat viral untuk prosesi resepsi."
  },
  {
    id: "christina-perri",
    category: "romantis",
    title: "A Thousand Years - Christina Perri",
    spotifyId: "6lanRgr6w69um767JV1RJq",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    genre: "Wedding Anthem Global",
    desc: "Lagu janji suci abadi mengiringi langkah kedua mempelai."
  },
  {
    id: "ed-sheeran-perfect",
    category: "romantis",
    title: "Perfect - Ed Sheeran",
    spotifyId: "0tgVpDi06FyKpA1z0VMD4v",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    genre: "Acoustic Pop Romance",
    desc: "Alunan manis dansa pertama di bawah kerlip bintang."
  },
  {
    id: "kina-grannis",
    category: "romantis",
    title: "Can't Help Falling in Love - Kina Grannis",
    spotifyId: "6lfxhnr66xsY2Pr2b19280",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    genre: "Intimate Acoustic Cello",
    desc: "Petikan gitar lembut menghadirkan suasana intim dan haru."
  },

  // POP INDONESIA
  {
    id: "yovie-nuno-janji",
    category: "indonesia",
    title: "Janji Suci - Yovie & Nuno",
    spotifyId: "4J55uQ94Yk5p7qT6yMvVfT",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    genre: "Pop Romantis Indonesia",
    desc: "Lagu lamaran dan komitmen seumur hidup yang paling dicintai di Indonesia."
  },
  {
    id: "payung-teduh-akad",
    category: "indonesia",
    title: "Akad - Payung Teduh",
    spotifyId: "3bH4HGtNsqv6p9e5nNeqzB",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    genre: "Akustik Folk Syahdu",
    desc: "Bila nanti saatnya telah tiba, ku ingin kau menjadi pendamping hidupku."
  },
  {
    id: "jaz-teman-bahagia",
    category: "indonesia",
    title: "Teman Bahagia - Jaz",
    spotifyId: "2nLtzopw45GAbBY9xWky9G",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    genre: "Ceria & Hangat",
    desc: "Melodi riang merayakan pertemuan dua hati sebagai teman hidup."
  },
  {
    id: "glenn-fredly-kisah",
    category: "indonesia",
    title: "Kisah Romantis - Glenn Fredly",
    spotifyId: "1X4P6U9u5j3x5z8Y8K9vQZ",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    genre: "Klasik Pesta Resepsi",
    desc: "Nada penuh sukacita merayakan ikatan cinta di hadapan seluruh kerabat."
  },
  {
    id: "raim-laode-komang",
    category: "indonesia",
    title: "Komang - Raim Laode",
    spotifyId: "0bYg9bo50gSsH3LtW2Wpn6",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    genre: "Pop Akustik Lembut",
    desc: "Sebab kau terlalu indah dari sekadar kata yang dapat diucapkan."
  },

  // ISLAMI & SYAR'I
  {
    id: "maher-baraka",
    category: "syari",
    title: "Baraka Allahu Lakuma - Maher Zain",
    spotifyId: "2n8R39sH8QZ63914aK8zB0",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    genre: "Nasyid Doa Pernikahan",
    desc: "Doa keberkahan sunnah Rasulullah SAW bagi pasangan pengantin baru."
  },
  {
    id: "maher-rest-of-life",
    category: "syari",
    title: "For the Rest of My Life - Maher Zain",
    spotifyId: "6m7aU8sL9e2bK6aV3pZ7yX",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    genre: "Islamic Love Song",
    desc: "Rasa syukur kepada Sang Maha Pencipta atas dianugerahkannya bidadari hidup."
  },
  {
    id: "humood-kun-anta",
    category: "syari",
    title: "Kun Anta - Humood AlKhudher",
    spotifyId: "5jN8k0Kq9b9aK3zL1m7xPq",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    genre: "Nasyid Bahagia & Syukur",
    desc: "Nuansa positif, riang, penuh keanggunan dan adab santun."
  },

  // TRADISIONAL, ADAT & ETNIK
  {
    id: "dayak-sape-kalteng",
    category: "adat",
    title: "Melodi Sape Dayak Kalteng (Palangka Raya Melody)",
    spotifyId: "3v8W9x7q1z0k4y6m8a9b0c",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    genre: "Adat Dayak Kalteng",
    desc: "Petikan dawai instrumen sape khas Kalimantan Tengah yang sakral dan membumi."
  },
  {
    id: "jawa-gamelan-kebo-giro",
    category: "adat",
    title: "Gamelan Jawa Kebo Giro (Temanten Agung)",
    spotifyId: "4m6a7x9b0k1z2w3v4u5t6s",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    genre: "Gamelan Sakral Jawa",
    desc: "Ladrang penyambutan kedatangan kedua mempelai adat keraton."
  },
  {
    id: "sunda-kacapi-suling",
    category: "adat",
    title: "Kacapi Suling Romantis Sunda",
    spotifyId: "7x8y9z0a1b2c3d4e5f6g7h",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    genre: "Tradisional Sunda",
    desc: "Harmoni suling bambu dan petikan kecapi yang menyejukkan kalbu hadirin."
  },

  // AKUSTIK & KLASIK INSTRUMENTAL
  {
    id: "pachelbel-canon",
    category: "klasik",
    title: "Canon in D - Johann Pachelbel (Acoustic Ensemble)",
    spotifyId: "1dJuw0vF4eNfG8xT4Y7u21",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    genre: "Klasik Agung",
    desc: "Karya instrumental paling legendaris untuk iringan sakral janji suci."
  },
  {
    id: "yiruma-river-flows",
    category: "klasik",
    title: "River Flows in You - Yiruma (Piano Solo)",
    spotifyId: "2agBPyX49Z944b5q0V9oYn",
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    genre: "Romantic Piano",
    desc: "Petikan nada tuts piano yang menyentuh relung hati para tamu undangan."
  },
];

export default function OpenPageEditor({
  config,
  onChange,
  event,
  onSave,
  saving = false,
  onUploadImage,
  onUploadAudio,
}: OpenPageEditorProps) {
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [activeTab, setActiveTab] = useState<"templates" | "elements" | "blocks" | "theme" | "audio">("templates");
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>("block-hero");
  
  // Template Catalog State
  const [templateCategory, setTemplateCategory] = useState<string>("all");
  const [appliedTemplateNotice, setAppliedTemplateNotice] = useState<string | null>(null);

  // Decorative Elements State
  // Audio Test Player & Custom MP3 Upload State
  const [testAudioPlaying, setTestAudioPlaying] = useState(false);
  const [audioUploadLoading, setAudioUploadLoading] = useState(false);
  const [audioPlaylistCategory, setAudioPlaylistCategory] = useState<string>("all");
  const testAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  // Toggle in-editor test playback
  const toggleTestPlayback = (targetUrl?: string) => {
    if (!testAudioRef.current) return;
    const url = targetUrl || config.audio?.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    
    if (testAudioRef.current.src !== url) {
      testAudioRef.current.src = url;
    }

    if (testAudioPlaying) {
      testAudioRef.current.pause();
      setTestAudioPlaying(false);
    } else {
      testAudioRef.current.volume = ((config.audio?.volume ?? 80) / 100);
      testAudioRef.current.play()
        .then(() => setTestAudioPlaying(true))
        .catch(() => {
          alert("Gagal memutar audio pratinjau. Format URL atau peramban mungkin membatasi audio.");
          setTestAudioPlaying(false);
        });
    }
  };

  // Trigger MP3 upload
  const handleAudioUploadClick = () => {
    if (audioFileInputRef.current) {
      audioFileInputRef.current.value = "";
      audioFileInputRef.current.click();
    }
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Ukuran berkas audio maksimal 15MB.");
      return;
    }

    setAudioUploadLoading(true);
    try {
      if (onUploadAudio) {
        const url = await onUploadAudio(file);
        updateAudio("audioUrl", url);
        updateAudio("title", file.name.replace(/\.[^/.]+$/, ""));
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            updateAudio("audioUrl", reader.result);
            updateAudio("title", file.name.replace(/\.[^/.]+$/, ""));
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah berkas audio.");
    } finally {
      setAudioUploadLoading(false);
    }
  };

  const [elementCategory, setElementCategory] = useState<string>("all");
  const [elementSearch, setElementSearch] = useState<string>("");
  const [copiedSvgId, setCopiedSvgId] = useState<string | null>(null);
  const [attachedElementNotice, setAttachedElementNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadCallbackRef = useRef<((url: string) => void) | null>(null);

  // Trigger file upload dialog
  const triggerImageUpload = (onDone: (url: string) => void) => {
    uploadCallbackRef.current = onDone;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadCallbackRef.current) return;

    try {
      if (onUploadImage) {
        const url = await onUploadImage(file);
        uploadCallbackRef.current(url);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string" && uploadCallbackRef.current) {
            uploadCallbackRef.current(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    }
  };

  // Reorder blocks
  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.blocks.length) return;

    const newBlocks = [...config.blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    onChange({ ...config, blocks: newBlocks });
  };

  // Toggle visibility
  const toggleVisibility = (blockId: string) => {
    const updated = config.blocks.map((b) =>
      b.id === blockId ? { ...b, visible: !b.visible } : b
    );
    onChange({ ...config, blocks: updated });
  };

  // Delete block
  const deleteBlock = (blockId: string) => {
    if (config.blocks.length <= 1) {
      alert("Undangan minimal harus memiliki 1 balok konten.");
      return;
    }
    if (confirm("Hapus balok konten ini dari undangan?")) {
      const updated = config.blocks.filter((b) => b.id !== blockId);
      onChange({ ...config, blocks: updated });
    }
  };

  // Update block content
  const updateBlockContent = (blockId: string, key: string, value: any) => {
    const updated = config.blocks.map((b) =>
      b.id === blockId ? { ...b, content: { ...b.content, [key]: value } } : b
    );
    onChange({ ...config, blocks: updated });
  };

  // Add a new block
  const handleAddBlock = (type: OpenPageBlockType) => {
    const newId = `block-${type}-${Date.now().toString(36)}`;
    let initialContent: Record<string, any> = {};

    switch (type) {
      case "quote":
        initialContent = {
          quote: "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu...",
          source: "QS. Ar-Rum: 21",
        };
        break;
      case "story":
        initialContent = {
          heading: "Cerita Tambahan",
          items: [{ year: "2026", title: "Momen Spesial", desc: "Kisah kenangan berharga yang ingin dibagikan." }],
        };
        break;
      case "schedule":
        initialContent = {
          heading: "Sesi Acara Tambahan",
          akadTime: "16:00 - 18:00 WIB",
          resepsiTime: "19:00 - 21:00 WIB",
          locationName: "Lokasi Acara",
          locationAddress: "Alamat lengkap acara",
          mapUrl: "",
        };
        break;
      case "gifts":
        initialContent = {
          heading: "Amplop Digital Tambahan",
          subtitle: "Saluran transfer rekening hadiah.",
          accounts: [{ id: Date.now(), bank: "BCA", number: "1234567890", holder: "Nama Pemilik" }],
        };
        break;
      default:
        initialContent = { heading: `Balok ${type}` };
    }

    const newBlock: OpenPageBlock = {
      id: newId,
      type,
      variant: "cards",
      visible: true,
      styles: { paddingY: "lg" },
      content: initialContent,
    };

    onChange({
      ...config,
      blocks: [...config.blocks, newBlock],
    });
    setExpandedBlockId(newId);
  };

  // Apply a template from the catalog
  const handleApplyTemplate = (tpl: OpenPageTemplate) => {
    const updated = tpl.apply(config, event);
    onChange(updated);
    setAppliedTemplateNotice(`Template "${tpl.name}" berhasil diterapkan!`);
    setTimeout(() => setAppliedTemplateNotice(null), 3000);
  };

  // Attach decorative element to a block (Hero or Quote)
  const handleAttachElement = (elem: DecorativeElement, targetBlockType: "hero" | "quote") => {
    const targetBlock = config.blocks.find((b) => b.type === targetBlockType);
    if (!targetBlock) {
      alert(`Balok ${targetBlockType} tidak ditemukan pada susunan undangan Anda.`);
      return;
    }

    updateBlockContent(targetBlock.id, "ornamentSvg", elem.svg);
    updateBlockContent(targetBlock.id, "ornamentName", elem.name);

    setAttachedElementNotice(`Ornamen "${elem.name}" dipasang ke balok ${targetBlockType === "hero" ? "Sampul Utama" : "Kutipan Doa"}!`);
    setTimeout(() => setAttachedElementNotice(null), 3500);
  };

  // Copy SVG to clipboard
  const handleCopySvg = (elem: DecorativeElement) => {
    navigator.clipboard.writeText(elem.svg);
    setCopiedSvgId(elem.id);
    setTimeout(() => setCopiedSvgId(null), 2000);
  };

  // Switch Theme Preset
  const handleSelectPreset = (presetId: string) => {
    const found = OPENPAGE_THEME_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    onChange({
      ...config,
      theme: {
        ...found.theme,
        fontDisplay: config.theme.fontDisplay || found.theme.fontDisplay,
        fontBody: config.theme.fontBody || found.theme.fontBody,
      },
    });
  };

  // Update specific theme property
  const updateTheme = (field: keyof typeof config.theme, value: any) => {
    onChange({
      ...config,
      theme: {
        ...config.theme,
        [field]: value,
      },
    });
  };

  // Update audio settings
  const updateAudio = (field: keyof typeof config.audio, value: any) => {
    onChange({
      ...config,
      audio: {
        ...config.audio,
        [field]: value,
      },
    });
  };

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    if (templateCategory === "all") return OPENPAGE_CATALOG_TEMPLATES;
    return OPENPAGE_CATALOG_TEMPLATES.filter((t) => t.category === templateCategory);
  }, [templateCategory]);

  // Filtered Elements
  const filteredElements = useMemo(() => {
    return OPENPAGE_DECORATIVE_ELEMENTS.filter((el) => {
      const matchCat = elementCategory === "all" || el.category === elementCategory;
      const matchSearch = !elementSearch || 
        el.name.toLowerCase().includes(elementSearch.toLowerCase()) ||
        el.keywords.some((k) => k.toLowerCase().includes(elementSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [elementCategory, elementSearch]);

  const dummyGuest = {
    id: 1,
    name: "Budi Santoso & Partner",
    category: "VIP",
    qr_code: "KLK-ROMJUL-001",
    table_number: "Meja VIP 01",
    pax: 2,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-stone-950 text-stone-100 font-sans border border-stone-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Controller Bar */}
      <div className="bg-stone-900 border-b border-stone-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 overflow-x-auto">
            {/* 1. KATALOG TEMPLATE (ALA ELLIOTT) */}
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "templates"
                  ? "bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md font-bold"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Crown className="h-3.5 w-3.5 text-amber-300" /> Katalog Template
            </button>

            {/* 2. SEJUTA ELEMEN OPENSOURCE */}
            <button
              type="button"
              onClick={() => setActiveTab("elements")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "elements"
                  ? "bg-rose-600 text-white shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Shapes className="h-3.5 w-3.5 text-rose-300" /> Sejuta Elemen
            </button>

            {/* 3. BALOK KONTEN */}
            <button
              type="button"
              onClick={() => setActiveTab("blocks")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "blocks"
                  ? "bg-rose-600 text-white shadow"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Balok ({config.blocks.length})
            </button>

            {/* 4. PALET & DESAIN */}
            <button
              type="button"
              onClick={() => setActiveTab("theme")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "theme"
                  ? "bg-rose-600 text-white shadow"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Palette className="h-3.5 w-3.5" /> Palet &amp; Desain
            </button>

            {/* 5. MUSIK LATAR */}
            <button
              type="button"
              onClick={() => setActiveTab("audio")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === "audio"
                  ? "bg-rose-600 text-white shadow"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Music className="h-3.5 w-3.5" /> Musik
            </button>
          </div>
        </div>

        {/* Viewport Device Switcher */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs ${
              viewport === "mobile" ? "bg-stone-800 text-white" : "text-stone-400 hover:text-white"
            }`}
            title="Pratinjau Layar HP (390px)"
          >
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline text-[10px]">HP 390px</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs ${
              viewport === "tablet" ? "bg-stone-800 text-white" : "text-stone-400 hover:text-white"
            }`}
            title="Pratinjau Layar Tablet (768px)"
          >
            <Tablet className="h-4 w-4" />
            <span className="hidden sm:inline text-[10px]">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs ${
              viewport === "desktop" ? "bg-stone-800 text-white" : "text-stone-400 hover:text-white"
            }`}
            title="Pratinjau Layar Desktop (Penuh)"
          >
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline text-[10px]">Desktop</span>
          </button>
        </div>

        {/* Save Button */}
        {onSave && (
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Menyimpan..." : "Simpan Desain"}
          </button>
        )}
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (5 Powerful Menus) */}
        <div className="w-80 sm:w-96 border-r border-stone-800 bg-stone-900/90 overflow-y-auto p-4 space-y-4 shrink-0">
          
          {/* TAB 1: KATALOG TEMPLATE SIAP PAKAI (ALA ELLIOTT) */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-amber-400" /> Katalog Template Siap Pakai
                  </h3>
                  <p className="text-[11px] text-stone-400">Terinspirasi dari Elliott Invitation &amp; Tren Nasional</p>
                </div>
              </div>

              {appliedTemplateNotice && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
                  <CheckCheck className="h-4 w-4 shrink-0" />
                  <span>{appliedTemplateNotice}</span>
                </div>
              )}

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "Semua" },
                  { id: "luxury", label: "Mewah & Gold" },
                  { id: "adat", label: "Adat Kalteng/Jawa" },
                  { id: "floral", label: "Romantis Floral" },
                  { id: "syari", label: "Islami Syar'i" },
                  { id: "rustic", label: "Rustic Boho" },
                  { id: "minimalist", label: "Minimalis" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTemplateCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                      templateCategory === cat.id
                        ? "bg-rose-600 text-white"
                        : "bg-stone-950 text-stone-400 hover:text-white border border-stone-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Template Cards Grid */}
              <div className="space-y-3">
                {filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="rounded-2xl border border-stone-800 bg-stone-950 overflow-hidden shadow-lg hover:border-stone-700 transition space-y-2.5 p-3"
                  >
                    {/* Visual Banner */}
                    <div
                      className="h-28 rounded-xl relative overflow-hidden flex items-end p-3 border border-white/10"
                      style={{ background: tpl.thumbnailGradient }}
                    >
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${tpl.badgeColor}`}>
                          {tpl.badge}
                        </span>
                      </div>
                      <div className="relative z-10">
                        <span className="text-[10px] font-mono text-stone-300 uppercase tracking-wider">{tpl.categoryLabel}</span>
                        <h4 className="text-sm font-bold text-white drop-shadow">{tpl.name}</h4>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {tpl.description}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-full border border-black/50" style={{ backgroundColor: tpl.theme.primaryColor }} />
                        <span className="h-4 w-4 rounded-full border border-black/50" style={{ backgroundColor: tpl.theme.accentColor }} />
                        <span className="h-4 w-4 rounded-full border border-black/50" style={{ backgroundColor: tpl.theme.bgColor }} />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1 cursor-pointer transition"
                      >
                        Gunakan Template <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SEJUTA ELEMEN OPENSOURCE */}
          {activeTab === "elements" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shapes className="h-3.5 w-3.5 text-rose-400" /> Sejuta Elemen Opensource
                  </h3>
                  <p className="text-[11px] text-stone-400">Aset grafis, ornamen, floral, dan simbol adat gratis</p>
                </div>
              </div>

              {attachedElementNotice && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
                  <CheckCheck className="h-4 w-4 shrink-0" />
                  <span>{attachedElementNotice}</span>
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-stone-500" />
                <input
                  type="text"
                  value={elementSearch}
                  onChange={(e) => setElementSearch(e.target.value)}
                  placeholder="Cari ornamen: mawar, dayak, kubah, cincin..."
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-xs placeholder:text-stone-600 focus:outline-none"
                />
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "Semua" },
                  { id: "floral", label: "🌿 Floral" },
                  { id: "ornaments", label: "✨ Ornamen Bingkai" },
                  { id: "cultural", label: "🏛️ Simbol Adat" },
                  { id: "seals", label: "📜 Stempel Lilin" },
                  { id: "icons", label: "💌 Ikon Acara" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setElementCategory(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                      elementCategory === c.id
                        ? "bg-rose-600 text-white"
                        : "bg-stone-950 text-stone-400 hover:text-white border border-stone-800"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Elements Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {filteredElements.map((elem) => (
                  <div
                    key={elem.id}
                    className="p-3 rounded-2xl border border-stone-800 bg-stone-950 hover:border-rose-500/60 transition flex flex-col justify-between space-y-2 group"
                  >
                    {/* SVG Vector Preview */}
                    <div
                      className="h-20 w-full flex items-center justify-center text-rose-400 group-hover:text-amber-300 transition-colors p-2"
                      dangerouslySetInnerHTML={{ __html: elem.svg }}
                    />

                    <div>
                      <span className="text-[9px] uppercase font-mono text-stone-500 block">{elem.categoryLabel}</span>
                      <h5 className="text-[11px] font-bold text-white truncate" title={elem.name}>
                        {elem.name}
                      </h5>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-stone-800/80">
                      <button
                        type="button"
                        onClick={() => handleAttachElement(elem, "hero")}
                        className="w-full py-1 bg-stone-900 hover:bg-rose-600 text-[10px] text-stone-300 hover:text-white rounded font-medium transition cursor-pointer"
                      >
                        Pasang ke Sampul
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttachElement(elem, "quote")}
                        className="w-full py-1 bg-stone-900 hover:bg-stone-800 text-[10px] text-stone-400 hover:text-stone-200 rounded font-medium transition cursor-pointer"
                      >
                        Pasang ke Doa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopySvg(elem)}
                        className="w-full py-0.5 text-[9px] text-stone-500 hover:text-stone-300 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {copiedSvgId === elem.id ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                        {copiedSvgId === elem.id ? "SVG Disalin" : "Salin SVG"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BLOCKS CONTENT */}
          {activeTab === "blocks" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase text-stone-400">
                <span>Susunan Balok Undangan</span>
                <span className="text-stone-500">{config.blocks.length} balok</span>
              </div>

              {config.blocks.map((block, idx) => {
                const isExpanded = expandedBlockId === block.id;

                return (
                  <div
                    key={block.id}
                    className="rounded-2xl border border-stone-800 bg-stone-950/80 overflow-hidden shadow-sm transition"
                  >
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleVisibility(block.id)}
                          className="text-stone-400 hover:text-white p-1"
                          title={block.visible ? "Sembunyikan balok" : "Tampilkan balok"}
                        >
                          {block.visible ? (
                            <Eye className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5 text-stone-600" />
                          )}
                        </button>
                        <span
                          onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                          className="text-xs font-bold text-stone-200 capitalize cursor-pointer hover:text-rose-400"
                        >
                          {block.type === "hero" ? "Sampul Utama (Hero)" :
                           block.type === "countdown" ? "Hitung Mundur" :
                           block.type === "couple" ? "Profil Pasangan" :
                           block.type === "quote" ? "Kutipan Doa / Surat" :
                           block.type === "story" ? "Kisah Cinta (Timeline)" :
                           block.type === "schedule" ? "Waktu & Lokasi Acara" :
                           block.type === "ticket" ? "Tiket Masuk & QR Pass" :
                           block.type === "gifts" ? "Amplop Digital / Bank" :
                           block.type === "guestbook" ? "Buku Tamu / RSVP" :
                           block.type === "footer" ? "Bagian Penutup" : block.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveBlock(idx, "up")}
                          className="p-1 text-stone-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Geser ke atas"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === config.blocks.length - 1}
                          onClick={() => moveBlock(idx, "down")}
                          className="p-1 text-stone-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Geser ke bawah"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBlock(block.id)}
                          className="p-1 text-stone-500 hover:text-rose-400 cursor-pointer"
                          title="Hapus balok"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                          className="p-1 text-stone-400 hover:text-white cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Inline Content Editor when expanded */}
                    {isExpanded && (
                      <div className="p-3.5 border-t border-stone-800/80 bg-stone-900/50 space-y-3 text-xs">
                        {/* 1. HERO BLOCK */}
                        {block.type === "hero" && (
                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Teks Pembuka (Eyebrow)</label>
                              <input
                                type="text"
                                value={block.content.eyebrow || ""}
                                onChange={(e) => updateBlockContent(block.id, "eyebrow", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Judul Utama / Nama Pasangan</label>
                              <input
                                type="text"
                                value={block.content.title || ""}
                                onChange={(e) => updateBlockContent(block.id, "title", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Kalimat Undangan (Subtitle)</label>
                              <textarea
                                rows={2}
                                value={block.content.subtitle || ""}
                                onChange={(e) => updateBlockContent(block.id, "subtitle", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Tanggal Acara Ditampilkan</label>
                              <input
                                type="text"
                                value={block.content.dateText || ""}
                                onChange={(e) => updateBlockContent(block.id, "dateText", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Foto Sampul Utama (Cover Image)</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={block.content.coverImage || ""}
                                  onChange={(e) => updateBlockContent(block.id, "coverImage", e.target.value)}
                                  placeholder="https://..."
                                  className="flex-1 px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => triggerImageUpload((url) => updateBlockContent(block.id, "coverImage", url))}
                                  className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                                  title="Unggah Foto dari Komputer"
                                >
                                  <Upload className="h-3.5 w-3.5" /> Unggah
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. COUNTDOWN BLOCK */}
                        {block.type === "countdown" && (
                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Judul Hitung Mundur</label>
                              <input
                                type="text"
                                value={block.content.heading || ""}
                                onChange={(e) => updateBlockContent(block.id, "heading", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Target Tanggal &amp; Jam Acara</label>
                              <input
                                type="datetime-local"
                                value={block.content.targetDate?.slice(0, 16) || ""}
                                onChange={(e) => updateBlockContent(block.id, "targetDate", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {/* 3. QUOTE BLOCK */}
                        {block.type === "quote" && (
                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Isi Kutipan / Doa</label>
                              <textarea
                                rows={3}
                                value={block.content.quote || ""}
                                onChange={(e) => updateBlockContent(block.id, "quote", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Sumber Kutipan / Ayat</label>
                              <input
                                type="text"
                                value={block.content.source || ""}
                                onChange={(e) => updateBlockContent(block.id, "source", e.target.value)}
                                placeholder="Contoh: QS. Ar-Rum: 21"
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {/* 4. COUPLE BLOCK */}
                        {block.type === "couple" && (
                          <div className="space-y-3">
                            <div className="p-2.5 bg-stone-950/60 rounded-xl border border-stone-850 space-y-2">
                              <span className="text-[10px] font-bold text-rose-400 font-mono">MEMPELAI PRIA</span>
                              <div>
                                <label className="block text-[10px] text-stone-400 uppercase font-mono mb-0.5">Nama Lengkap &amp; Gelar</label>
                                <input
                                  type="text"
                                  value={block.content.groomName || ""}
                                  onChange={(e) => updateBlockContent(block.id, "groomName", e.target.value)}
                                  className="w-full px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-lg text-white text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-stone-400 uppercase font-mono mb-0.5">Keterangan / Orang Tua</label>
                                <input
                                  type="text"
                                  value={block.content.groomDesc || ""}
                                  onChange={(e) => updateBlockContent(block.id, "groomDesc", e.target.value)}
                                  className="w-full px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-lg text-white text-xs"
                                />
                              </div>
                            </div>

                            <div className="p-2.5 bg-stone-950/60 rounded-xl border border-stone-850 space-y-2">
                              <span className="text-[10px] font-bold text-rose-400 font-mono">MEMPELAI WANITA</span>
                              <div>
                                <label className="block text-[10px] text-stone-400 uppercase font-mono mb-0.5">Nama Lengkap &amp; Gelar</label>
                                <input
                                  type="text"
                                  value={block.content.brideName || ""}
                                  onChange={(e) => updateBlockContent(block.id, "brideName", e.target.value)}
                                  className="w-full px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-lg text-white text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-stone-400 uppercase font-mono mb-0.5">Keterangan / Orang Tua</label>
                                <input
                                  type="text"
                                  value={block.content.brideDesc || ""}
                                  onChange={(e) => updateBlockContent(block.id, "brideDesc", e.target.value)}
                                  className="w-full px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-lg text-white text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. STORY / TIMELINE BLOCK */}
                        {block.type === "story" && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Judul Bagian</label>
                              <input
                                type="text"
                                value={block.content.heading || ""}
                                onChange={(e) => updateBlockContent(block.id, "heading", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-[10px] text-stone-400 uppercase font-mono">Daftar Momen Perjalanan</label>
                              {(block.content.items || []).map((item: any, sIdx: number) => (
                                <div key={sIdx} className="p-2 bg-stone-950/80 rounded-xl border border-stone-800 space-y-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <input
                                      type="text"
                                      value={item.year || ""}
                                      onChange={(e) => {
                                        const nextItems = [...(block.content.items || [])];
                                        nextItems[sIdx] = { ...nextItems[sIdx], year: e.target.value };
                                        updateBlockContent(block.id, "items", nextItems);
                                      }}
                                      placeholder="Tahun"
                                      className="w-20 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs text-rose-300 font-mono"
                                    />
                                    <input
                                      type="text"
                                      value={item.title || ""}
                                      onChange={(e) => {
                                        const nextItems = [...(block.content.items || [])];
                                        nextItems[sIdx] = { ...nextItems[sIdx], title: e.target.value };
                                        updateBlockContent(block.id, "items", nextItems);
                                      }}
                                      placeholder="Judul Momen"
                                      className="flex-1 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs text-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextItems = (block.content.items || []).filter((_: any, i: number) => i !== sIdx);
                                        updateBlockContent(block.id, "items", nextItems);
                                      }}
                                      className="text-stone-500 hover:text-rose-400 p-1"
                                      title="Hapus momen"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={item.desc || ""}
                                    onChange={(e) => {
                                      const nextItems = [...(block.content.items || [])];
                                      nextItems[sIdx] = { ...nextItems[sIdx], desc: e.target.value };
                                      updateBlockContent(block.id, "items", nextItems);
                                    }}
                                    placeholder="Cerita singkat..."
                                    className="w-full px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs text-stone-300"
                                  />
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => {
                                  const nextItems = [...(block.content.items || []), { year: "2026", title: "Momen Baru", desc: "Cerita momen..." }];
                                  updateBlockContent(block.id, "items", nextItems);
                                }}
                                className="w-full py-1.5 border border-dashed border-stone-700 hover:border-rose-500 text-stone-400 hover:text-rose-300 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus className="h-3 w-3" /> Tambah Momen Cerita
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 6. SCHEDULE & LOCATION BLOCK */}
                        {block.type === "schedule" && (
                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Judul Bagian</label>
                              <input
                                type="text"
                                value={block.content.heading || ""}
                                onChange={(e) => updateBlockContent(block.id, "heading", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Waktu Akad</label>
                                <input
                                  type="text"
                                  value={block.content.akadTime || ""}
                                  onChange={(e) => updateBlockContent(block.id, "akadTime", e.target.value)}
                                  placeholder="08:00 - 10:00 WIB"
                                  className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Waktu Resepsi</label>
                                <input
                                  type="text"
                                  value={block.content.resepsiTime || ""}
                                  onChange={(e) => updateBlockContent(block.id, "resepsiTime", e.target.value)}
                                  placeholder="11:00 - 15:00 WIB"
                                  className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Nama Tempat / Gedung</label>
                              <input
                                type="text"
                                value={block.content.locationName || ""}
                                onChange={(e) => updateBlockContent(block.id, "locationName", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Alamat Lengkap</label>
                              <textarea
                                rows={2}
                                value={block.content.locationAddress || ""}
                                onChange={(e) => updateBlockContent(block.id, "locationAddress", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Tautan Google Maps</label>
                              <input
                                type="url"
                                value={block.content.mapUrl || ""}
                                onChange={(e) => updateBlockContent(block.id, "mapUrl", e.target.value)}
                                placeholder="https://maps.google.com/..."
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {/* 7. PERSONAL TICKET PASS BLOCK */}
                        {block.type === "ticket" && (
                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Judul Tiket Pass</label>
                              <input
                                type="text"
                                value={block.content.heading || ""}
                                onChange={(e) => updateBlockContent(block.id, "heading", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Petunjuk Meja Resepsionis</label>
                              <textarea
                                rows={2}
                                value={block.content.instruction || ""}
                                onChange={(e) => updateBlockContent(block.id, "instruction", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {/* 8. GIFTS / AMPLOP DIGITAL BLOCK */}
                        {block.type === "gifts" && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Judul Bagian</label>
                              <input
                                type="text"
                                value={block.content.heading || ""}
                                onChange={(e) => updateBlockContent(block.id, "heading", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Keterangan / Doa</label>
                              <textarea
                                rows={2}
                                value={block.content.subtitle || ""}
                                onChange={(e) => updateBlockContent(block.id, "subtitle", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-[10px] text-stone-400 uppercase font-mono">Daftar Rekening Bank &amp; E-Wallet</label>
                              {(block.content.accounts || []).map((acc: any, aIdx: number) => (
                                <div key={aIdx} className="p-2.5 bg-stone-950/80 rounded-xl border border-stone-800 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <input
                                      type="text"
                                      value={acc.bank || acc.bank_name || ""}
                                      onChange={(e) => {
                                        const nextAccs = [...(block.content.accounts || [])];
                                        nextAccs[aIdx] = { ...nextAccs[aIdx], bank: e.target.value, bank_name: e.target.value };
                                        updateBlockContent(block.id, "accounts", nextAccs);
                                      }}
                                      placeholder="Nama Bank (e.g. BCA, Mandiri)"
                                      className="w-36 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs text-white uppercase font-bold"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextAccs = (block.content.accounts || []).filter((_: any, i: number) => i !== aIdx);
                                        updateBlockContent(block.id, "accounts", nextAccs);
                                      }}
                                      className="text-stone-500 hover:text-rose-400 p-1"
                                      title="Hapus rekening"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={acc.number || acc.account_number || ""}
                                      onChange={(e) => {
                                        const nextAccs = [...(block.content.accounts || [])];
                                        nextAccs[aIdx] = { ...nextAccs[aIdx], number: e.target.value, account_number: e.target.value };
                                        updateBlockContent(block.id, "accounts", nextAccs);
                                      }}
                                      placeholder="Nomor Rekening"
                                      className="px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs text-rose-300 font-mono"
                                    />
                                    <input
                                      type="text"
                                      value={acc.holder || acc.account_holder || ""}
                                      onChange={(e) => {
                                        const nextAccs = [...(block.content.accounts || [])];
                                        nextAccs[aIdx] = { ...nextAccs[aIdx], holder: e.target.value, account_holder: e.target.value };
                                        updateBlockContent(block.id, "accounts", nextAccs);
                                      }}
                                      placeholder="Atas Nama (a.n.)"
                                      className="px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs text-white"
                                    />
                                  </div>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => {
                                  const nextAccs = [...(block.content.accounts || []), { id: Date.now(), bank: "BCA", number: "1234567890", holder: "Nama Pemilik" }];
                                  updateBlockContent(block.id, "accounts", nextAccs);
                                }}
                                className="w-full py-1.5 border border-dashed border-stone-700 hover:border-rose-500 text-stone-400 hover:text-rose-300 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus className="h-3 w-3" /> Tambah Rekening Bank
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 9. GUESTBOOK / RSVP BLOCK */}
                        {block.type === "guestbook" && (
                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Judul Buku Tamu</label>
                              <input
                                type="text"
                                value={block.content.heading || ""}
                                onChange={(e) => updateBlockContent(block.id, "heading", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Petunjuk Konfirmasi</label>
                              <textarea
                                rows={2}
                                value={block.content.subtitle || ""}
                                onChange={(e) => updateBlockContent(block.id, "subtitle", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {/* 10. FOOTER BLOCK */}
                        {block.type === "footer" && (
                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Ucapan Terima Kasih</label>
                              <textarea
                                rows={2}
                                value={block.content.thankYouText || ""}
                                onChange={(e) => updateBlockContent(block.id, "thankYouText", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Keluarga yang Berbahagia</label>
                              <input
                                type="text"
                                value={block.content.closingFamily || ""}
                                onChange={(e) => updateBlockContent(block.id, "closingFamily", e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add New Block Selector */}
              <div className="pt-2 border-t border-stone-800">
                <span className="block text-[10px] uppercase font-mono text-stone-400 mb-2">Tambah Balok Konten Baru</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddBlock("quote")}
                    className="p-2 bg-stone-950 border border-stone-800 hover:border-rose-500 rounded-xl text-left text-stone-300 hover:text-white text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-rose-400" /> Balok Doa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("story")}
                    className="p-2 bg-stone-950 border border-stone-800 hover:border-rose-500 rounded-xl text-left text-stone-300 hover:text-white text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-rose-400" /> Balok Cerita
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("schedule")}
                    className="p-2 bg-stone-950 border border-stone-800 hover:border-rose-500 rounded-xl text-left text-stone-300 hover:text-white text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-rose-400" /> Balok Sesi Acara
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("gifts")}
                    className="p-2 bg-stone-950 border border-stone-800 hover:border-rose-500 rounded-xl text-left text-stone-300 hover:text-white text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-rose-400" /> Balok Rekening
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THEME & PALET KUSTOM */}
          {activeTab === "theme" && (
            <div className="space-y-5">
              {/* Presets */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase text-stone-400">
                  Preset Tema Cepat
                </div>
                <div className="space-y-2">
                  {OPENPAGE_THEME_PRESETS.map((preset) => {
                    const isSelected = config.theme.preset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset.id)}
                        className={`p-3.5 rounded-2xl border-2 transition cursor-pointer space-y-1.5 ${
                          isSelected
                            ? "border-rose-500 bg-rose-950/20 shadow-md"
                            : "border-stone-800 bg-stone-950/80 hover:border-stone-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{preset.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-rose-400" />}
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {preset.previewColors.map((color, cIdx) => (
                            <span
                              key={cIdx}
                              className="h-3.5 w-3.5 rounded-full border border-black/40"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                <div className="text-[11px] font-mono uppercase text-stone-400">
                  Palet Warna Presisi
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-300">Warna Aksen Utama</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.theme.primaryColor || "#e11d48"}
                        onChange={(e) => updateTheme("primaryColor", e.target.value)}
                        className="w-7 h-7 rounded border border-stone-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.theme.primaryColor || "#e11d48"}
                        onChange={(e) => updateTheme("primaryColor", e.target.value)}
                        className="w-20 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs font-mono text-white text-center"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-300">Warna Sorotan Kedua</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.theme.accentColor || "#f43f5e"}
                        onChange={(e) => updateTheme("accentColor", e.target.value)}
                        className="w-7 h-7 rounded border border-stone-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.theme.accentColor || "#f43f5e"}
                        onChange={(e) => updateTheme("accentColor", e.target.value)}
                        className="w-20 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs font-mono text-white text-center"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-300">Latar Belakang (Page)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.theme.bgColor || "#09090b"}
                        onChange={(e) => updateTheme("bgColor", e.target.value)}
                        className="w-7 h-7 rounded border border-stone-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.theme.bgColor || "#09090b"}
                        onChange={(e) => updateTheme("bgColor", e.target.value)}
                        className="w-20 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs font-mono text-white text-center"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-300">Permukaan Kartu (Card)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.theme.cardBgColor || "#18181b"}
                        onChange={(e) => updateTheme("cardBgColor", e.target.value)}
                        className="w-7 h-7 rounded border border-stone-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.theme.cardBgColor || "#18181b"}
                        onChange={(e) => updateTheme("cardBgColor", e.target.value)}
                        className="w-20 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs font-mono text-white text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                <div className="text-[11px] font-mono uppercase text-stone-400">
                  Tipografi &amp; Font
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Font Judul / Nama</label>
                  <select
                    value={config.theme.fontDisplay}
                    onChange={(e) => updateTheme("fontDisplay", e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-white text-xs"
                  >
                    <option value="serif">Serif Mewah (Playfair / Georgia)</option>
                    <option value="sans">Modern Minimalis (Sans-Serif)</option>
                    <option value="display">Kaligrafi Artistik (Cormorant / Script)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Font Paragraf &amp; Teks</label>
                  <select
                    value={config.theme.fontBody}
                    onChange={(e) => updateTheme("fontBody", e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-white text-xs"
                  >
                    <option value="sans">Sans-Serif Bersih (Mudah dibaca di HP)</option>
                    <option value="serif">Serif Klasik (Nuansa Buku / Surat)</option>
                  </select>
                </div>
              </div>

              {/* Border Radius */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                <div className="text-[11px] font-mono uppercase text-stone-400">
                  Bentuk Lengkungan Sudut
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "md", label: "Elegan (8px)" },
                    { id: "3xl", label: "Bulat (24px)" },
                    { id: "full", label: "Pill Penuh" },
                  ].map((rad) => (
                    <button
                      key={rad.id}
                      type="button"
                      onClick={() => updateTheme("borderRadius", rad.id)}
                      className={`p-2 rounded-xl border text-xs font-medium cursor-pointer transition ${
                        config.theme.borderRadius === rad.id
                          ? "border-rose-500 bg-rose-950/30 text-rose-300"
                          : "border-stone-800 bg-stone-900 text-stone-400 hover:text-white"
                      }`}
                    >
                      {rad.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIO STUDIO & PLAYLIST REKOMENDASI LENGKAP */}
          {activeTab === "audio" && (
            <div className="space-y-4">
              {/* Hidden audio elements */}
              <audio
                ref={testAudioRef}
                src={config.audio?.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
                onEnded={() => setTestAudioPlaying(false)}
                onError={() => setTestAudioPlaying(false)}
              />
              <input
                ref={audioFileInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/*"
                onChange={handleAudioFileChange}
                className="hidden"
              />

              {/* 1. STUDIO TEST PLAYER CARD */}
              <div className="p-4 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 rounded-2xl border border-rose-500/30 shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 ${testAudioPlaying ? "animate-pulse" : ""}`}>
                      <Disc className={`h-4 w-4 ${testAudioPlaying ? "animate-spin" : ""}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        Studio Pemutar Musik
                        {testAudioPlaying && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                            Memutar
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-stone-400 truncate max-w-[210px]">
                        {config.audio?.title || "Belum ada lagu yang dipilih"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleTestPlayback()}
                    className={`h-9 w-9 rounded-full flex items-center justify-center transition cursor-pointer shadow-lg ${
                      testAudioPlaying
                        ? "bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30"
                        : "bg-stone-800 hover:bg-rose-600 text-white"
                    }`}
                    title={testAudioPlaying ? "Jeda Audio" : "Tes Putar Audio"}
                  >
                    {testAudioPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
                  </button>
                </div>

                {/* Soundwave Animation Graphic */}
                <div className="flex items-end justify-between h-5 px-1 bg-stone-950/60 rounded-lg border border-stone-800/80">
                  {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 35, 75, 50, 85, 65, 90, 40, 70, 100, 60].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        testAudioPlaying ? "bg-rose-400 animate-pulse" : "bg-stone-700 h-1"
                      }`}
                      style={{
                        height: testAudioPlaying ? `${Math.max(15, (h * (i % 2 === 0 ? 0.9 : 1.2)) % 100)}%` : "4px",
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  ))}
                </div>

                {/* Volume Slider */}
                <div className="pt-1 flex items-center gap-3">
                  <Volume2 className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.audio?.volume ?? 80}
                    onChange={(e) => {
                      const vol = Number(e.target.value);
                      updateAudio("volume", vol);
                      if (testAudioRef.current) testAudioRef.current.volume = vol / 100;
                    }}
                    className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <span className="text-[10px] font-mono text-stone-400 w-8 text-right">
                    {config.audio?.volume ?? 80}%
                  </span>
                </div>
              </div>

              {/* 2. DETAIL MUSIK & FORM INPUT */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono uppercase text-stone-400 flex items-center gap-1.5">
                    <Music className="h-3.5 w-3.5 text-rose-400" /> Detail Musik &amp; Sumber Lagu
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Judul Lagu &amp; Penyanyi</label>
                  <input
                    type="text"
                    value={config.audio?.title || ""}
                    onChange={(e) => updateAudio("title", e.target.value)}
                    placeholder="Contoh: Until I Found You - Stephen Sanchez"
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-white text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1">Tautan / ID Track Spotify</label>
                  <input
                    type="text"
                    value={config.audio?.spotifyId || ""}
                    onChange={(e) => updateAudio("spotifyId", e.target.value)}
                    placeholder="3n3Ppam7vgaVa1iaRUc9Lp"
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-white text-xs font-mono focus:border-rose-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Masukkan URL track Spotify atau 22 karakter ID unik track.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-stone-400 uppercase font-mono">Berkas Audio MP3</label>
                    <button
                      type="button"
                      onClick={handleAudioUploadClick}
                      disabled={audioUploadLoading}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"
                    >
                      <Upload className="h-3 w-3" />
                      {audioUploadLoading ? "Mengunggah..." : "Unggah MP3 Sendiri"}
                    </button>
                  </div>
                  <input
                    type="url"
                    value={config.audio?.audioUrl || ""}
                    onChange={(e) => updateAudio("audioUrl", e.target.value)}
                    placeholder="https://.../lagu-pernikahan.mp3"
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-white text-xs focus:border-rose-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Mendukung berkas audio langsung dari server hosting atau hasil unggahan MP3 mandiri (maks 15MB).
                  </p>
                </div>
              </div>

              {/* 3. PENGATURAN PEMUTAR UNDANGAN */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                <div className="text-[11px] font-mono uppercase text-stone-400 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-rose-400" /> Pengaturan Pemutar di Undangan
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-bold text-white block">Putar Otomatis (Autoplay)</span>
                    <span className="text-[10px] text-stone-400">Putar musik saat tamu menekan tombol Buka Undangan</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.audio?.autoplay ?? config.audio?.enabled ?? true}
                    onChange={(e) => {
                      updateAudio("autoplay", e.target.checked);
                      updateAudio("enabled", e.target.checked);
                    }}
                    className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-stone-900">
                  <label className="block text-[10px] text-stone-400 uppercase font-mono mb-1.5">
                    Posisi Tombol Pemutar di Layar Tamu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "bottom-right", label: "Kanan Bawah" },
                      { id: "bottom-left", label: "Kiri Bawah" },
                      { id: "top-right", label: "Kanan Atas" },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => updateAudio("position", pos.id)}
                        className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition cursor-pointer text-center ${
                          (config.audio?.position || "bottom-right") === pos.id
                            ? "bg-rose-950/50 border-rose-500 text-rose-300 font-bold"
                            : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. KOLEKSI REKOMENDASI MUSIK PERNIKAHAN TERLENGKAP */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-stone-400 flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-amber-400" /> Pilihan Musik Wedding Lengkap
                  </span>
                  <span className="text-[10px] text-stone-500">1-Klik Terapkan</span>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: "Semua" },
                    { id: "romantis", label: "Populer" },
                    { id: "indonesia", label: "Indonesia" },
                    { id: "syari", label: "Syar'i" },
                    { id: "adat", label: "Adat Etnik" },
                    { id: "klasik", label: "Klasik" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setAudioPlaylistCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition cursor-pointer ${
                        audioPlaylistCategory === cat.id
                          ? "bg-rose-600 text-white"
                          : "bg-stone-900 text-stone-400 hover:text-white border border-stone-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Filtered Song List */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {WEDDING_PLAYLIST_SUGGESTIONS.filter(
                    (s) => audioPlaylistCategory === "all" || s.category === audioPlaylistCategory
                  ).map((sug) => {
                    const isCurrent =
                      config.audio?.spotifyId === sug.spotifyId ||
                      config.audio?.title === sug.title;

                    return (
                      <div
                        key={sug.id}
                        className={`p-3 rounded-xl border transition flex flex-col gap-2 ${
                          isCurrent
                            ? "bg-rose-950/40 border-rose-500/60 text-white"
                            : "bg-stone-900/60 border-stone-800 hover:border-stone-700 text-stone-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate text-white">{sug.title}</p>
                            <span className="text-[10px] text-rose-400 font-mono block mt-0.5">{sug.genre}</span>
                            <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">{sug.desc}</p>
                          </div>
                          {isCurrent && (
                            <span className="text-[9px] font-mono text-rose-300 font-bold px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 shrink-0">
                              Aktif
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-800/60">
                          <button
                            type="button"
                            onClick={() => toggleTestPlayback(sug.mp3)}
                            className="text-[10px] text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer py-1 px-2 rounded bg-stone-800/80 hover:bg-stone-800"
                          >
                            <Play className="h-3 w-3" /> Pratinjau Lagu
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateAudio("title", sug.title);
                              updateAudio("spotifyId", sug.spotifyId);
                              if (sug.mp3) updateAudio("audioUrl", sug.mp3);
                            }}
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
                              isCurrent
                                ? "bg-rose-600 text-white"
                                : "bg-stone-800 hover:bg-rose-600 hover:text-white text-stone-300"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {isCurrent ? "Terpasang" : "Gunakan Lagu"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Preview Canvas */}
        <div className="flex-1 bg-stone-950/60 p-4 sm:p-6 overflow-y-auto flex items-start justify-center">
          <div
            className={`transition-all duration-300 shadow-2xl overflow-hidden rounded-3xl border border-stone-800 ${
              viewport === "mobile"
                ? "w-[390px] min-h-[750px]"
                : viewport === "tablet"
                ? "w-[768px] min-h-[850px]"
                : "w-full min-h-[850px]"
            }`}
          >
            <OpenPageRenderer
              config={config}
              event={event}
              guest={dummyGuest}
              isPreview={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
