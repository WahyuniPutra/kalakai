"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  Users, UserCheck, Clock, Plus, Download, Upload, Share2, 
  Copy, Edit, Trash2, ExternalLink, QrCode, Crown, MessageSquare, 
  Gift, Search, CheckCircle2, AlertCircle, RefreshCw, FileSpreadsheet, 
  Sparkles, ArrowLeft, Send, Check, X, Eye
} from "lucide-react";
import type { DashboardUser } from "../../../DashboardShell";

interface Guest {
  id: number;
  name: string;
  slug: string;
  phone: string | null;
  category: string;
  is_vip: boolean;
  table_number: string | null;
  pax: number;
  souvenir_count: number;
  souvenir_claimed_at: string | null;
  envelope_number: string | null;
  qr_code: string;
  status: string;
  checked_in_at: string | null;
}

interface GuestStats {
  total: number;
  vip: number;
  hadir_rsvp: number;
  tidak_hadir_rsvp: number;
  pending_rsvp: number;
  checked_in: number;
  souvenir_claimed: number;
}

interface EventData {
  id: number;
  title: string;
  slug: string;
}

const DEFAULT_WA_TEMPLATE = `Kepada Yth.
*Bapak/Ibu/Saudara/i {nama}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu untuk hadir dan memberikan doa restu pada hari bahagia kami:

*{acara}*

Buka tautan undangan digital dan tiket QR masuk Anda di:
👉 {link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir di momen istimewa ini.

Terima kasih,
Salam hangat dari kami sekeluarga.`;

export default function GuestManagerClient({
  eventId,
  user,
}: {
  eventId: string;
  user: DashboardUser;
}) {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [stats, setStats] = useState<GuestStats | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Notifications
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Single Guest Form State
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCategory, setFormCategory] = useState("Reguler");
  const [formTable, setFormTable] = useState("");
  const [formPax, setFormPax] = useState(2);
  const [formSouvenir, setFormSouvenir] = useState(1);
  const [formIsVip, setFormIsVip] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Import State
  const [importPastedText, setImportPastedText] = useState("");
  const [importSubmitting, setImportSubmitting] = useState(false);

  // WhatsApp Message Template State
  const [waTemplate, setWaTemplate] = useState(DEFAULT_WA_TEMPLATE);
  const [copiedLink, setCopiedLink] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load WhatsApp template from localStorage if saved
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`kalakai_wa_template_${eventId}`);
      if (saved) setWaTemplate(saved);
    } catch {}
  }, [eventId]);

  const saveWaTemplate = (text: string) => {
    setWaTemplate(text);
    try {
      localStorage.setItem(`kalakai_wa_template_${eventId}`, text);
    } catch {}
  };

  const loadGuests = async () => {
    try {
      const res = await fetch(`/api/user/events/${eventId}/guests`);
      if (!res.ok) throw new Error("Gagal memuat data tamu");
      const json = await res.json();
      setEventData(json.event);
      setStats(json.stats);
      setGuests(json.guests || []);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Gagal memuat data tamu undangan." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [eventId]);

  // Handle single guest create or edit
  const handleSubmitGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setFormSubmitting(true);
    setToast(null);

    const payload = {
      name: formName.trim(),
      phone: formPhone.trim() || null,
      category: formCategory.trim() || "Reguler",
      table_number: formTable.trim() || null,
      pax: Number(formPax) || 2,
      souvenir_count: Number(formSouvenir) || 1,
      is_vip: formIsVip,
    };

    try {
      if (editingGuest) {
        // Update
        const res = await fetch(`/api/user/events/${eventId}/guests/${editingGuest.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal memperbarui tamu");
        setToast({ type: "success", message: `Data tamu ${formName} berhasil diperbarui.` });
      } else {
        // Create
        const res = await fetch(`/api/user/events/${eventId}/guests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal menambahkan tamu");
        setToast({ type: "success", message: `Tamu ${formName} berhasil ditambahkan.` });
      }

      setIsAddModalOpen(false);
      setEditingGuest(null);
      resetForm();
      await loadGuests();
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Terjadi kesalahan." });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open edit modal
  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormName(guest.name);
    setFormPhone(guest.phone || "");
    setFormCategory(guest.category);
    setFormTable(guest.table_number || "");
    setFormPax(guest.pax);
    setFormSouvenir(guest.souvenir_count);
    setFormIsVip(guest.is_vip);
    setIsAddModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (guest: Guest) => {
    if (!confirm(`Hapus tamu "${guest.name}" dari buku tamu?`)) return;

    try {
      const res = await fetch(`/api/user/events/${eventId}/guests/${guest.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus tamu");
      setToast({ type: "info", message: `Tamu "${guest.name}" telah dihapus.` });
      await loadGuests();
    } catch (err) {
      setToast({ type: "error", message: "Gagal menghapus tamu." });
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormPhone("");
    setFormCategory("Reguler");
    setFormTable("");
    setFormPax(2);
    setFormSouvenir(1);
    setFormIsVip(false);
    setEditingGuest(null);
  };

  // Parse and submit bulk import
  const handleProcessImport = async (textData: string) => {
    const lines = textData
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      alert("Teks atau berkas kosong. Silakan masukkan data.");
      return;
    }

    // Check if first line is header
    const firstLine = lines[0].toLowerCase();
    const startIndex = firstLine.includes("nama") ? 1 : 0;

    const parsedGuests: any[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Split by comma or tab
      const cols = line.includes("\t") ? line.split("\t") : line.split(",");
      const name = cols[0]?.trim();
      if (!name) continue;

      const phone = cols[1]?.trim() || null;
      const category = cols[2]?.trim() || "Reguler";
      const table = cols[3]?.trim() || null;
      const pax = Number(cols[4]?.trim()) || 2;
      const isVipStr = cols[5]?.trim().toLowerCase();
      const isVip = isVipStr === "1" || isVipStr === "ya" || isVipStr === "vip" || isVipStr === "true";

      parsedGuests.push({
        name,
        phone,
        category,
        table_number: table,
        pax,
        souvenir_count: 1,
        is_vip: isVip,
      });
    }

    if (parsedGuests.length === 0) {
      alert("Tidak ada baris data valid yang terdeteksi.");
      return;
    }

    setImportSubmitting(true);
    try {
      const res = await fetch(`/api/user/events/${eventId}/guests/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: parsedGuests }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengimpor tamu");

      setToast({ type: "success", message: json.message });
      setIsImportModalOpen(false);
      setImportPastedText("");
      await loadGuests();
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Gagal mengimpor tamu." });
    } finally {
      setImportSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportPastedText(text);
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const sample = `Nama,No WhatsApp,Kategori,Nomor Meja,Jumlah Pax,VIP
Budi Santoso,081234567890,VIP,Meja VIP 01,2,1
dr. Anita Wijaya,081987654321,Keluarga,Meja Keluarga A,2,0
Kevin Sanjaya,085233445566,Teman Dekat,Meja 08,1,0
Hendra Setiawan,081377889900,Kolega,Meja 12,2,0`;

    const blob = new Blob(["\uFEFF" + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_tamu_kalakai.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build personalized WhatsApp text and URL
  const getWaUrl = (guest: Guest) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://kalakai.site";
    const personalLink = `${origin}/${eventData?.slug || "acara"}/${guest.slug}`;

    const text = waTemplate
      .replace(/{nama}/g, guest.name)
      .replace(/{acara}/g, eventData?.title || "Hari Bahagia Kami")
      .replace(/{link}/g, personalLink);

    let phone = guest.phone ? guest.phone.replace(/\D/g, "") : "";
    if (phone.startsWith("0")) {
      phone = "62" + phone.slice(1);
    }

    if (phone) {
      return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const copyGuestLink = (guest: Guest) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://kalakai.site";
    const personalLink = `${origin}/${eventData?.slug || "acara"}/${guest.slug}`;
    navigator.clipboard.writeText(personalLink);
    setCopiedLink(guest.id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const categories = useMemo(() => {
    return Array.from(new Set(guests.map((g) => g.category)));
  }, [guests]);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.phone && g.phone.includes(searchQuery)) ||
        (g.table_number && g.table_number.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = filterCategory === "all" || g.category === filterCategory;
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "hadir" && g.status === "hadir") ||
        (filterStatus === "tidak_hadir" && g.status === "tidak_hadir") ||
        (filterStatus === "pending" && g.status === "pending") ||
        (filterStatus === "vip" && g.is_vip) ||
        (filterStatus === "checked_in" && g.checked_in_at);

      return matchSearch && matchCat && matchStatus;
    });
  }, [guests, searchQuery, filterCategory, filterStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-500 mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/undangan/${eventId}`}
            className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-stone-200 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Editor Undangan
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/${eventData?.slug}/resepsionis`}
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-800 transition flex items-center gap-1.5"
            >
              <QrCode className="h-3.5 w-3.5 text-rose-400" /> Meja Resepsi
            </Link>
            <Link
              href={`/${eventData?.slug}/live-display`}
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-800 transition flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5 text-amber-400" /> Layar Proyektor
            </Link>
          </div>
        </div>

        {/* Header Bar */}
        <div className="bg-stone-900/80 border border-stone-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              <span className="text-xs uppercase font-mono tracking-wider text-rose-400">
                Manajemen Tamu &amp; Sebar Undangan WhatsApp
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {eventData?.title || "Daftar Tamu Undangan"}
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Kelola nama tamu, nomor meja, kuota souvenir, dan kirim pesan personal via WhatsApp
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 transition flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" /> Template WhatsApp
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 transition flex items-center gap-2 cursor-pointer"
            >
              <Upload className="h-4 w-4 text-cyan-400" /> Impor Excel / CSV
            </button>

            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Tambah Tamu
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 border ${
              toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : toast.type === "error"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
            {toast.type === "info" && <Sparkles className="h-5 w-5 text-cyan-400 shrink-0" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-stone-900/60 border border-stone-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
              <span>Total Tamu</span>
              <Users className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">{stats?.total || 0}</div>
            <p className="text-[10px] text-stone-500 mt-1">{stats?.vip || 0} Tamu Prioritas VIP</p>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
              <span>Konfirmasi Hadir</span>
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-400">{stats?.hadir_rsvp || 0}</div>
            <p className="text-[10px] text-emerald-500/80 mt-1">{stats?.tidak_hadir_rsvp || 0} Berhalangan</p>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
              <span>Hadir di Lokasi</span>
              <QrCode className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-amber-400">{stats?.checked_in || 0}</div>
            <p className="text-[10px] text-amber-500/80 mt-1">Sudah scan di meja resepsi</p>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
              <span>Souvenir Diserahkan</span>
              <Gift className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-rose-400">{stats?.souvenir_claimed || 0}</div>
            <p className="text-[10px] text-rose-500/80 mt-1">Paket souvenir terdistribusi</p>
          </div>
        </div>

        {/* Guest Table Container */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-rose-400" />
              Daftar Tamu Undangan ({filteredGuests.length})
            </h2>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, no HP, meja..."
                  className="pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 w-52"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-stone-950 border border-stone-800 text-xs text-stone-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-stone-950 border border-stone-800 text-xs text-stone-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="hadir">RSVP Hadir</option>
                <option value="tidak_hadir">RSVP Tidak Hadir</option>
                <option value="pending">Belum RSVP</option>
                <option value="checked_in">Sudah Check-In di Hari-H</option>
                <option value="vip">Khusus Tamu VIP</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950/70 text-stone-400 uppercase font-mono text-[10px] border-b border-stone-800">
                <tr>
                  <th className="py-3 px-4">Nama Tamu</th>
                  <th className="py-3 px-4">No. WhatsApp</th>
                  <th className="py-3 px-4">Kategori &amp; Meja</th>
                  <th className="py-3 px-4">Pax</th>
                  <th className="py-3 px-4">Status RSVP</th>
                  <th className="py-3 px-4">Hari-H</th>
                  <th className="py-3 px-4 text-center">Kirim WhatsApp</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-sans">
                {filteredGuests.length > 0 ? (
                  filteredGuests.map((g) => (
                    <tr key={g.id} className="hover:bg-stone-800/30 transition">
                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          {g.is_vip && <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                          <span>{g.name}</span>
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">
                          Slug: /{g.slug}
                        </span>
                      </td>

                      {/* WhatsApp Phone */}
                      <td className="py-3.5 px-4 font-mono text-stone-300">
                        {g.phone || <span className="text-stone-600">-</span>}
                      </td>

                      {/* Category & Table */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5 items-start">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-800 text-stone-300 border border-stone-700">
                            {g.category}
                          </span>
                          {g.table_number && (
                            <span className="text-[11px] font-bold text-amber-400 font-mono">
                              {g.table_number}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pax */}
                      <td className="py-3.5 px-4 font-mono">
                        {g.pax} Pax
                      </td>

                      {/* RSVP Status */}
                      <td className="py-3.5 px-4">
                        {g.status === "hadir" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Hadir
                          </span>
                        ) : g.status === "tidak_hadir" ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                            <X className="h-3.5 w-3.5" /> Berhalangan
                          </span>
                        ) : (
                          <span className="text-stone-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Belum Konfirmasi
                          </span>
                        )}
                      </td>

                      {/* Reception Checked-in */}
                      <td className="py-3.5 px-4">
                        {g.checked_in_at ? (
                          <span className="text-[11px] text-emerald-400 font-medium font-mono">
                            ✓ {new Date(g.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        ) : (
                          <span className="text-stone-600">-</span>
                        )}
                      </td>

                      {/* Quick WhatsApp Blast Button */}
                      <td className="py-3.5 px-4 text-center">
                        <a
                          href={getWaUrl(g)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm"
                          title="Buka WhatsApp dengan pesan personal siap kirim"
                        >
                          <Send className="h-3.5 w-3.5" /> Kirim WA
                        </a>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => copyGuestLink(g)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
                            title="Salin tautan undangan personal"
                          >
                            {copiedLink === g.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <Link
                            href={`/${eventData?.slug}/${g.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
                            title="Pratinjau undangan personal tamu ini"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            onClick={() => handleEdit(g)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
                            title="Ubah data tamu"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(g)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 transition cursor-pointer"
                            title="Hapus tamu"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-500">
                      Belum ada tamu yang sesuai dengan pencarian / filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 1. ADD / EDIT GUEST MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="max-w-lg w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-rose-400" />
                  {editingGuest ? "Ubah Data Tamu" : "Tambah Tamu Undangan"}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitGuest} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Nama Tamu / Pasangan <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Budi Santoso & Partner"
                    required
                    className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Kategori Tamu
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="Keluarga, VIP, Teman, Kolega..."
                      className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Nomor Meja
                    </label>
                    <input
                      type="text"
                      value={formTable}
                      onChange={(e) => setFormTable(e.target.value)}
                      placeholder="Misal: Meja 04"
                      className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Kuota Kursi (Pax)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={formPax}
                      onChange={(e) => setFormPax(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Jatah Souvenir
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={formSouvenir}
                      onChange={(e) => setFormSouvenir(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="vipCheckbox"
                    checked={formIsVip}
                    onChange={(e) => setFormIsVip(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-700 text-rose-600 focus:ring-rose-500 bg-stone-950"
                  />
                  <label htmlFor="vipCheckbox" className="text-xs text-stone-300 cursor-pointer flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                    Tandai sebagai Tamu Prioritas (VIP)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    {formSubmitting ? "Menyimpan..." : editingGuest ? "Simpan Perubahan" : "Tambahkan Tamu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. BULK IMPORT MODAL */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="max-w-2xl w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                    Impor Tamu Massal (Excel / CSV)
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Masukkan ratusan tamu sekaligus dengan mengunggah berkas CSV atau menempel baris dari Excel.
                  </p>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Instructions & Template download */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-stone-300 space-y-1">
                  <p className="font-semibold text-white">Format Kolom yang Didukung:</p>
                  <p className="text-stone-400 font-mono text-[11px]">
                    Nama, No WhatsApp, Kategori, Nomor Meja, Jumlah Pax, VIP (0/1)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium rounded-xl border border-stone-700 transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-amber-400" /> Unduh Template CSV
                </button>
              </div>

              {/* File upload trigger */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-stone-300">
                  Opsi 1: Unggah Berkas .CSV
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="w-full text-xs text-stone-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-600/20 file:text-rose-300 hover:file:bg-rose-600/30 cursor-pointer"
                />
              </div>

              {/* Textarea for copy paste */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-stone-300">
                  Opsi 2: Tempel Langsung dari Microsoft Excel / Google Sheets
                </label>
                <textarea
                  rows={6}
                  value={importPastedText}
                  onChange={(e) => setImportPastedText(e.target.value)}
                  placeholder={`Budi Santoso\t081234567890\tVIP\tMeja VIP 01\t2\t1\ndr. Anita Wijaya\t081987654321\tKeluarga\tMeja A\t2\t0`}
                  className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={importSubmitting || !importPastedText.trim()}
                  onClick={() => handleProcessImport(importPastedText)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {importSubmitting ? "Memproses Impor..." : "Mulai Impor Tamu"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. WHATSAPP TEMPLATE EDITOR MODAL */}
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="max-w-xl w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                    Kustomisasi Template Pesan WhatsApp
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Pesan sopan yang otomatis digenerate saat Anda mengklik tombol "Kirim WA".
                  </p>
                </div>
                <button
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs text-stone-300 bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1">
                <span className="font-semibold text-rose-300">Variabel Dinamis:</span>
                <p className="text-stone-400 font-mono text-[11px]">
                  <code>&#123;nama&#125;</code> = Nama tamu otomatis &bull; <code>&#123;acara&#125;</code> = Judul acara &bull; <code>&#123;link&#125;</code> = Tautan personal tamu
                </p>
              </div>

              <textarea
                rows={9}
                value={waTemplate}
                onChange={(e) => saveWaTemplate(e.target.value)}
                className="w-full p-4 bg-stone-950 border border-stone-800 rounded-2xl text-white text-xs leading-relaxed focus:outline-none focus:border-rose-500 font-sans"
              />

              <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => saveWaTemplate(DEFAULT_WA_TEMPLATE)}
                  className="text-xs text-stone-400 hover:text-stone-200 underline cursor-pointer"
                >
                  Reset ke Teks Standar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTemplateModalOpen(false);
                    setToast({ type: "success", message: "Template WhatsApp tersimpan." });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Simpan Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
