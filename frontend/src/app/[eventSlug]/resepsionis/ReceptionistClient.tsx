"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Users, UserCheck, Clock, QrCode, Search, CheckCircle2, 
  AlertCircle, RefreshCw, Sparkles, Filter, ExternalLink,
  Gift, Crown, MonitorPlay, Download, Mail, Check, X,
  Lock, LogIn, LogOut, ShieldAlert, KeyRound
} from "lucide-react";

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

interface GuestbookData {
  event: {
    id: number;
    user_id?: number;
    title: string;
    slug: string;
    package_code?: "free" | "bahagia" | "resepsi";
    event_date: string;
    location_name: string | null;
  };
  stats: {
    total_guests: number;
    total_hadir: number;
    total_tidak_hadir: number;
    total_pending: number;
    total_checked_in: number;
    total_souvenirs_claimed: number;
    total_souvenirs_target: number;
    total_vip: number;
    total_pax_attended: number;
  };
  guests: Guest[];
}

export interface ReceptionistUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "partner" | "super_admin";
}

export default function ReceptionistClient({
  eventSlug,
  initialUser,
}: {
  eventSlug: string;
  initialUser: ReceptionistUser | null;
}) {
  const [currentUser, setCurrentUser] = useState<ReceptionistUser | null>(initialUser);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [data, setData] = useState<GuestbookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrInput, setQrInput] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [lastCheckinResult, setLastCheckinResult] = useState<{
    guest: Guest;
    already_checked_in: boolean;
    message: string;
  } | null>(null);

  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSouvenir, setFilterSouvenir] = useState("all");

  // Editing envelope in table
  const [editingEnvelopeId, setEditingEnvelopeId] = useState<number | null>(null);
  const [envelopeInput, setEnvelopeInput] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const loadData = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/events/${eventSlug}/guestbook`, { cache: "no-store" });
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

  // Handle Login to the event owner's account
  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    const emailToUse = customEmail || authEmail;
    const passwordToUse = customPassword || authPassword;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse, password: passwordToUse }),
      });

      const json = await res.json();

      if (!res.ok) {
        setAuthError(json.message || "Email atau kata sandi tidak sesuai.");
      } else {
        setCurrentUser(json.user);
        setAuthError("");
        setToast({ type: "success", message: `Berhasil masuk sebagai ${json.user.name}` });
      }
    } catch (err) {
      console.error(err);
      setAuthError("Gagal terhubung ke server autentikasi.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Fast 1-click Demo Account Login
  const handleDemoLogin = () => {
    setAuthEmail("user@kalakai.test");
    setAuthPassword("UserKalakai!2026");
    handleLogin(undefined, "user@kalakai.test", "UserKalakai!2026");
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setCurrentUser(null);
    setToast({ type: "info", message: "Anda telah keluar dari meja resepsionis." });
  };

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
        setLastCheckinResult(null);
      } else {
        setLastCheckinResult({
          guest: json.data,
          already_checked_in: json.already_checked_in,
          message: json.message,
        });
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

  const handleToggleSouvenir = async (guestId: number, currentClaimed: boolean) => {
    const action = currentClaimed ? "revoke" : "claim";
    try {
      const res = await fetch(`${backendUrl}/api/events/${eventSlug}/guests/${guestId}/souvenir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (res.ok) {
        setToast({ type: "success", message: json.message });
        if (lastCheckinResult && lastCheckinResult.guest.id === guestId) {
          setLastCheckinResult({
            ...lastCheckinResult,
            guest: json.data,
          });
        }
        await loadData();
      } else {
        setToast({ type: "error", message: json.message || "Gagal memperbarui status souvenir" });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Gagal memperbarui souvenir." });
    }
  };

  const handleSaveEnvelope = async (guestId: number) => {
    try {
      const res = await fetch(`${backendUrl}/api/events/${eventSlug}/guests/${guestId}/envelope`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envelope_number: envelopeInput }),
      });
      const json = await res.json();
      if (res.ok) {
        setToast({ type: "success", message: json.message });
        setEditingEnvelopeId(null);
        setEnvelopeInput("");
        if (lastCheckinResult && lastCheckinResult.guest.id === guestId) {
          setLastCheckinResult({
            ...lastCheckinResult,
            guest: json.data,
          });
        }
        await loadData();
      } else {
        setToast({ type: "error", message: json.message || "Gagal menyimpan nomor amplop" });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Gagal menyimpan nomor amplop." });
    }
  };

  // Export to CSV for Excel
  const exportToCSV = () => {
    if (!data?.guests?.length) return;

    const headers = [
      "Nama Tamu",
      "Kategori",
      "VIP",
      "Nomor Meja",
      "Jumlah Pax",
      "Status Hadir",
      "Waktu Check-in",
      "Jatah Souvenir",
      "Status Souvenir",
      "Waktu Souvenir",
      "Nomor Amplop Fisik",
      "Nomor Telepon",
      "Kode QR",
    ];

    const rows = data.guests.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.category}"`,
      g.is_vip ? "VIP" : "Biasa",
      `"${g.table_number || "-"}"`,
      g.pax,
      g.checked_in_at ? "Hadir" : "Belum Hadir",
      g.checked_in_at ? new Date(g.checked_in_at).toLocaleString("id-ID") : "-",
      g.souvenir_count,
      g.souvenir_claimed_at ? "Sudah Diambil" : "Belum Diambil",
      g.souvenir_claimed_at ? new Date(g.souvenir_claimed_at).toLocaleString("id-ID") : "-",
      `"${g.envelope_number || "-"}"`,
      `"${g.phone || "-"}"`,
      `"${g.qr_code}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `buku_tamu_${eventSlug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredGuests = useMemo(() => {
    if (!data?.guests) return [];
    return data.guests.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.qr_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.table_number && g.table_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (g.envelope_number && g.envelope_number.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = filterCategory === "all" || g.category === filterCategory;
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "checked_in" && g.checked_in_at) ||
        (filterStatus === "not_checked_in" && !g.checked_in_at) ||
        (filterStatus === "vip" && g.is_vip);

      const matchSouvenir =
        filterSouvenir === "all" ||
        (filterSouvenir === "claimed" && g.souvenir_claimed_at) ||
        (filterSouvenir === "unclaimed" && !g.souvenir_claimed_at);

      return matchSearch && matchCat && matchStatus && matchSouvenir;
    });
  }, [data?.guests, searchQuery, filterCategory, filterStatus, filterSouvenir]);

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

  // 1. RECEPTIONIST LOGIN GATE (If user is not logged in)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 mb-3 shadow-lg shadow-rose-950/40">
              <Lock className="h-7 w-7" />
            </div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-rose-400">
              Otorisasi Akses &bull; Kerabat Kalakai
            </div>
            <h1 className="text-2xl font-bold text-white">
              Login Meja Resepsionis
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Penerima tamu wajib masuk menggunakan akun pemilik acara{" "}
              <strong className="text-white">({data.event.title})</strong> untuk mengakses pemindai QR dan data buku tamu.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Pemilik Acara
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="user@kalakai.test"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              {authLoading ? "Memverifikasi..." : "Masuk ke Meja Resepsionis"}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="pt-2 border-t border-slate-800 text-center space-y-3">
            <p className="text-[11px] text-slate-400">
              Pengujian Lokal / Akun Demo Pemilik:
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={authLoading}
              className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="h-4 w-4 text-amber-400" />
              Gunakan Akun Demo (user@kalakai.test)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. CHECK OWNERSHIP / PERMISSION (User must be owner or super_admin)
  const isOwner = currentUser.role === "super_admin" || (data.event.user_id && currentUser.id === data.event.user_id);

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans text-center">
        <div className="max-w-md w-full bg-slate-900 border border-rose-800/40 rounded-3xl p-8 shadow-2xl space-y-4">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-white">Akses Meja Resepsi Dibatasi</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Anda saat ini login sebagai <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}), namun akun ini bukan pemilik dari acara <strong>{data.event.title}</strong>.
          </p>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Masuk dengan Akun Lain
          </button>
        </div>
      </div>
    );
  }

  // 3. UNLOCKED RECEPTIONIST DASHBOARD
  const isResepsiPackage = data.event.package_code === "resepsi";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs uppercase font-mono tracking-wider text-rose-400">
                Mode Resepsionis &bull; Manajemen Meja &amp; Souvenir
              </span>

              {/* Package Badge */}
              {isResepsiPackage ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                  <Crown className="h-3.5 w-3.5 text-amber-400" /> Paket Resepsi (Pro Platinum)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Paket: {data.event.package_code || "Free"}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {data.event.title}
            </h1>

            {/* Authenticated Receptionist User Pill */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>Petugas Meja Resepsi:</span>
              <span className="text-slate-200 font-semibold">{currentUser.name}</span>
              <span className="font-mono text-slate-500">({currentUser.email})</span>
              <button
                onClick={handleLogout}
                className="ml-2 text-[11px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
                title="Keluar / Ganti Akun"
              >
                <LogOut className="h-3 w-3" /> Keluar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/${eventSlug}/live-display`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition flex items-center gap-2"
              title="Buka layar display untuk proyektor/TV lobi"
            >
              <MonitorPlay className="h-4 w-4 text-amber-400" />
              Layar Proyektor (Live Display)
            </a>

            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
              title="Unduh data buku tamu dalam format Excel/CSV"
            >
              <Download className="h-4 w-4 text-slate-300" /> Ekspor Excel
            </button>

            <button
              onClick={loadData}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Segarkan
            </button>

            <a
              href={`/${eventSlug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-xl transition flex items-center gap-2"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Undangan Web
            </a>
          </div>
        </div>

        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Undangan</span>
              <Users className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-white">{data.stats.total_guests}</div>
            <p className="text-[10px] text-slate-500 mt-1">
              {data.stats.total_vip} Tamu VIP Terdaftar
            </p>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
              <span>Sudah Hadir</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-400">{data.stats.total_checked_in}</div>
            <p className="text-[10px] text-emerald-500/80 mt-1">
              Total {data.stats.total_pax_attended} Pax di lokasi
            </p>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
              <span>Souvenir Diserahkan</span>
              <Gift className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-amber-400">
              {data.stats.total_souvenirs_claimed} <span className="text-sm font-normal text-slate-400">/ {data.stats.total_souvenirs_target}</span>
            </div>
            <p className="text-[10px] text-amber-500/80 mt-1">Terverifikasi anti-double claim</p>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
              <span>Menunggu Hadir</span>
              <Clock className="h-4 w-4" />
            </div>
            <div className="text-3xl font-bold font-mono text-rose-400">
              {data.stats.total_guests - data.stats.total_checked_in}
            </div>
            <p className="text-[10px] text-rose-500/80 mt-1">Belum melakukan scan QR</p>
          </div>
        </div>

        {/* QR Scanner / Fast Input Box */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-800/40 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold">
              <QrCode className="h-5 w-5" />
              Scan QR Code Tamu / Masukkan Kode Undangan
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Mendukung Barcode Scanner USB / Kamera / Input Keyboard
            </span>
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
              autoFocus
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

          {/* CHECK-IN QUICK ACTION SPOTLIGHT CARD */}
          {lastCheckinResult && (
            <div className="mt-4 p-5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 font-bold">
                    {lastCheckinResult.guest.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">
                        {lastCheckinResult.guest.name}
                      </span>
                      {lastCheckinResult.guest.is_vip && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                          <Crown className="h-3 w-3" /> VIP
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {lastCheckinResult.guest.category} &bull; Reservasi {lastCheckinResult.guest.pax} Pax
                    </span>
                  </div>
                </div>

                {/* Table Number Pill */}
                <div className="bg-amber-950/40 border border-amber-500/40 px-4 py-2 rounded-xl text-center">
                  <div className="text-[10px] uppercase font-mono text-amber-300">Nomor Meja</div>
                  <div className="text-xl font-extrabold text-amber-400">
                    {lastCheckinResult.guest.table_number || "Reguler"}
                  </div>
                </div>
              </div>

              {/* Fast Logistics Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Souvenir Management */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <Gift className="h-4 w-4 text-amber-400" />
                      Status Souvenir ({lastCheckinResult.guest.souvenir_count} Pax)
                    </div>
                    <div className="text-xs mt-1">
                      {lastCheckinResult.guest.souvenir_claimed_at ? (
                        <span className="text-emerald-400 font-medium">
                          ✓ Sudah diserahkan (
                          {new Date(lastCheckinResult.guest.souvenir_claimed_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB)
                        </span>
                      ) : (
                        <span className="text-slate-400">Belum diserahkan</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleToggleSouvenir(
                        lastCheckinResult.guest.id,
                        !!lastCheckinResult.guest.souvenir_claimed_at
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      lastCheckinResult.guest.souvenir_claimed_at
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        : "bg-amber-600 hover:bg-amber-500 text-white"
                    }`}
                  >
                    {lastCheckinResult.guest.souvenir_claimed_at ? "Batalkan" : "Serahkan Souvenir"}
                  </button>
                </div>

                {/* Physical Envelope Number Assignment */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex-1 mr-3">
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-rose-400" />
                      Nomor Amplop Fisik
                    </div>
                    {editingEnvelopeId === lastCheckinResult.guest.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={envelopeInput}
                          onChange={(e) => setEnvelopeInput(e.target.value)}
                          placeholder="Misal: A-12..."
                          className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white uppercase w-28 focus:outline-none focus:border-rose-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEnvelope(lastCheckinResult.guest.id)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingEnvelopeId(null)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        {lastCheckinResult.guest.envelope_number ? (
                          <span className="text-rose-300 font-bold">
                            Kode: {lastCheckinResult.guest.envelope_number}
                          </span>
                        ) : (
                          "Belum dicatat"
                        )}
                      </div>
                    )}
                  </div>

                  {editingEnvelopeId !== lastCheckinResult.guest.id && (
                    <button
                      onClick={() => {
                        setEditingEnvelopeId(lastCheckinResult.guest.id);
                        setEnvelopeInput(lastCheckinResult.guest.envelope_number || "");
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      {lastCheckinResult.guest.envelope_number ? "Ubah" : "Catat No. Amplop"}
                    </button>
                  )}
                </div>
              </div>
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
                  placeholder="Cari nama / meja / amplop..."
                  className="pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 w-52"
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
                <option value="all">Semua Kehadiran</option>
                <option value="checked_in">Sudah Check-In</option>
                <option value="not_checked_in">Belum Check-In</option>
                <option value="vip">Khusus Tamu VIP</option>
              </select>

              <select
                value={filterSouvenir}
                onChange={(e) => setFilterSouvenir(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">Semua Souvenir</option>
                <option value="claimed">Souvenir Sudah Diambil</option>
                <option value="unclaimed">Souvenir Belum Diambil</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Tamu</th>
                  <th className="py-3 px-4">Kategori &amp; Meja</th>
                  <th className="py-3 px-4">Kode QR</th>
                  <th className="py-3 px-4">Pax</th>
                  <th className="py-3 px-4">Souvenir</th>
                  <th className="py-3 px-4">No. Amplop</th>
                  <th className="py-3 px-4">Jam Check-In</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredGuests.length > 0 ? (
                  filteredGuests.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          {g.is_vip && <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                          <span>{g.name}</span>
                        </div>
                        {g.phone && <div className="text-[10px] text-slate-500 font-mono">{g.phone}</div>}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {g.category}
                          </span>
                          {g.table_number && (
                            <span className="text-[11px] font-semibold text-amber-400 font-mono">
                              {g.table_number}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-rose-300">
                        {g.qr_code}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {g.pax} Org
                      </td>

                      <td className="py-3.5 px-4">
                        {g.souvenir_claimed_at ? (
                          <button
                            onClick={() => handleToggleSouvenir(g.id, true)}
                            className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 cursor-pointer hover:bg-emerald-500/20"
                            title="Klik untuk membatalkan klaim"
                          >
                            <Check className="h-3 w-3" /> Sudah ({g.souvenir_count})
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleSouvenir(g.id, false)}
                            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer hover:bg-slate-700"
                            title="Klik untuk serahkan souvenir"
                          >
                            <Gift className="h-3 w-3" /> Berikan ({g.souvenir_count})
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {editingEnvelopeId === g.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={envelopeInput}
                              onChange={(e) => setEnvelopeInput(e.target.value)}
                              className="px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-[11px] text-white uppercase w-20"
                              placeholder="No..."
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEnvelope(g.id)}
                              className="p-1 bg-emerald-600 rounded text-white"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => {
                              setEditingEnvelopeId(g.id);
                              setEnvelopeInput(g.envelope_number || "");
                            }}
                            className="cursor-pointer hover:underline text-slate-400 hover:text-white"
                            title="Klik untuk edit no amplop"
                          >
                            {g.envelope_number || "-"}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {g.checked_in_at ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {new Date(g.checked_in_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              WIB
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
                    <td colSpan={8} className="py-8 text-center text-slate-500">
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
