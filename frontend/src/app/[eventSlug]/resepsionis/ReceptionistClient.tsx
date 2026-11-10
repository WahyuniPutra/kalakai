"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { 
  Users, UserCheck, Clock, QrCode, Search, CheckCircle2, 
  AlertCircle, RefreshCw, Sparkles, Filter, ExternalLink 
} from "lucide-react";

interface Guest {
  id: number;
  name: string;
  slug: string;
  phone: string | null;
  category: string;
  pax: number;
  qr_code: string;
  status: string;
  checked_in_at: string | null;
}

interface GuestbookData {
  event: {
    id: number;
    title: string;
    slug: string;
    event_date: string;
  };
  stats: {
    total_guests: number;
    total_hadir: number;
    total_tidak_hadir: number;
    total_pending: number;
    total_checked_in: number;
  };
  guests: Guest[];
}

export default function ReceptionistClient({ eventSlug }: { eventSlug: string }) {
  

  const [data, setData] = useState<GuestbookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrInput, setQrInput] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const loadData = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/events/${eventSlug}/guestbook`);
      if (!res.ok) throw new Error("Gagal mengambil data buku tamu");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventSlug) {
      loadData();
    }
  }, [eventSlug]);

  const handleCheckin = async (codeToScan?: string) => {
    const code = codeToScan || qrInput.trim();
    if (!code) return;

    setCheckingIn(true);
    setToast(null);

    try {
      const res = await fetch(`${backendUrl}/api/events/${eventSlug}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: code }),
      });

      const json = await res.json();

      if (!res.ok) {
        setToast({ type: "error", message: json.message || "Gagal melakukan check-in." });
      } else {
        setToast({
          type: json.already_checked_in ? "info" : "success",
          message: json.message,
        });
        setQrInput("");
        await loadData();
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Gagal terhubung ke server." });
    } finally {
      setCheckingIn(false);
    }
  };

  const filteredGuests = useMemo(() => {
    if (!data?.guests) return [];
    return data.guests.filter((g) => {
      const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.qr_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === "all" || g.category === filterCategory;
      const matchStatus = filterStatus === "all" || 
                          (filterStatus === "checked_in" && g.checked_in_at) ||
                          (filterStatus === "not_checked_in" && !g.checked_in_at);
      return matchSearch && matchCat && matchStatus;
    });
  }, [data?.guests, searchQuery, filterCategory, filterStatus]);

  const categories = useMemo(() => {
    if (!data?.guests) return [];
    return Array.from(new Set(data.guests.map((g) => g.category)));
  }, [data?.guests]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-500 mb-2" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold mb-2">Acara Tidak Ditemukan</h1>
        <p className="text-sm text-slate-400">Pastikan alamat URL buku tamu acara ini benar.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs uppercase font-mono tracking-wider text-rose-400">
                Mode Resepsionis &bull; Buku Tamu Digital
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {data.event.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola kedatangan tamu secara real-time dan cepat di hari-H
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Segarkan
            </button>
            <a
              href={`/${eventSlug}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-xl transition flex items-center gap-2"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Lihat Undangan
            </a>
          </div>
        </div>

        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Terdaftar</span>
              <Users className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">{data.stats.total_guests}</div>
            <p className="text-[10px] text-slate-500 mt-1">Undangan terkirim</p>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
              <span>Sudah Hadir</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-400">{data.stats.total_checked_in}</div>
            <p className="text-[10px] text-emerald-500/80 mt-1">Sudah scan di resepsi</p>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
              <span>Belum Hadir</span>
              <Clock className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-amber-400">
              {data.stats.total_guests - data.stats.total_checked_in}
            </div>
            <p className="text-[10px] text-amber-500/80 mt-1">Menunggu kedatangan</p>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
              <span>Total Hadir (RSVP)</span>
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-rose-400">{data.stats.total_hadir}</div>
            <p className="text-[10px] text-rose-500/80 mt-1">Konfirmasi hadir di web</p>
          </div>
        </div>

        {/* QR Scanner / Fast Input Box */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-800/40 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold">
            <QrCode className="h-5 w-5" />
            Scan QR Code / Masukkan Kode Undangan Tamu
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCheckin();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Contoh: KLK-ROMJUL-001..."
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-base font-mono focus:outline-none focus:border-rose-500 uppercase placeholder:normal-case placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={checkingIn || !qrInput.trim()}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {checkingIn ? "Memproses..." : "Check-in Tamu"}
            </button>
          </form>

          {/* Toast Notification */}
          {toast && (
            <div
              className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
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
        </div>

        {/* Guest List & Search Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-rose-400" />
              Daftar Tamu Undangan ({filteredGuests.length})
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama / kode QR..."
                  className="pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 w-48"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
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
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">Semua Status Hadir</option>
                <option value="checked_in">Sudah Check-In</option>
                <option value="not_checked_in">Belum Check-In</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Tamu</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Kode QR</th>
                  <th className="py-3 px-4">Kuota</th>
                  <th className="py-3 px-4">Status &amp; Jam Check-In</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredGuests.length > 0 ? (
                  filteredGuests.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {g.name}
                        {g.phone && <div className="text-[10px] text-slate-500 font-mono">{g.phone}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {g.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-rose-300">
                        {g.qr_code}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {g.pax} Orang
                      </td>
                      <td className="py-3.5 px-4">
                        {g.checked_in_at ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              Hadir ({new Date(g.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Belum Datang
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!g.checked_in_at ? (
                          <button
                            onClick={() => handleCheckin(g.qr_code)}
                            className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-medium transition cursor-pointer"
                          >
                            Check-in Manual
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">
                            Selesai
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Tidak ada data tamu yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}