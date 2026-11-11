"use client";

import { useState } from "react";
import { 
  Crown, Sparkles, Check, QrCode, ArrowRight, ShieldCheck, 
  RefreshCw, X, CreditCard, Copy, CheckCircle2, Zap
} from "lucide-react";

interface UpgradePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number | string | undefined;
  currentPackage: "free" | "bahagia" | "resepsi";
  onUpgraded?: (newPackage: "bahagia" | "resepsi") => void;
}

export default function UpgradePackageModal({
  isOpen,
  onClose,
  eventId,
  currentPackage,
  onUpgraded,
}: UpgradePackageModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<"bahagia" | "resepsi">(
    currentPackage === "bahagia" ? "resepsi" : "bahagia"
  );
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "bca_va" | "mandiri_va">("qris");
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedVa, setCopiedVa] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!eventId) {
      setError("Silakan simpan draf acara Anda terlebih dahulu sebelum melakukan upgrade.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/payments/events/${eventId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_code: selectedPackage,
          payment_method: paymentMethod,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal membuat tagihan pembayaran.");
      setCheckoutData(json.data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!checkoutData?.transaction?.invoice_number) return;
    setSimulating(true);
    setError("");
    try {
      const res = await fetch(
        `/api/payments/transactions/${checkoutData.transaction.invoice_number}/simulate`,
        { method: "POST" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal memproses pembayaran.");
      setSuccessMessage(json.message);
      if (onUpgraded) {
        onUpgraded(selectedPackage);
      }
    } catch (err: any) {
      setError(err.message || "Gagal verifikasi pembayaran.");
    } finally {
      setSimulating(false);
    }
  };

  const copyVa = () => {
    if (!checkoutData?.va_number) return;
    navigator.clipboard.writeText(checkoutData.va_number);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans text-stone-100">
      <div className="max-w-2xl w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* STEP 1: SELECT PACKAGE & METHOD */}
        {!checkoutData && !successMessage && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono mb-2">
                <Crown className="h-3.5 w-3.5" /> UPGRADE PAKET ACARA
              </div>
              <h2 className="text-2xl font-bold text-white">Pilih Paket Spesial Kalakai</h2>
              <p className="text-xs text-stone-400 mt-1">
                Buka akses fitur premium, undang tamu tanpa batas, dan aktifkan Meja Resepsionis Digital.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Package Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Paket Bahagia */}
              <div
                onClick={() => setSelectedPackage("bahagia")}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer relative ${
                  selectedPackage === "bahagia"
                    ? "border-rose-500 bg-rose-950/20 shadow-lg shadow-rose-950/30"
                    : "border-stone-800 bg-stone-950/60 hover:border-stone-700"
                }`}
              >
                {currentPackage === "bahagia" && (
                  <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                    Paket Saat Ini
                  </span>
                )}
                <div className="text-sm font-bold text-white">Paket Bahagia</div>
                <div className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">
                  Rp 99.000
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Cocok untuk undangan digital lengkap</p>

                <ul className="mt-4 space-y-2 text-xs text-stone-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-rose-400" /> Tamu &amp; Undangan Tanpa Batas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-rose-400" /> Musik Latar &amp; Integrasi Spotify
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-rose-400" /> Amplop Digital &amp; QRIS
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-rose-400" /> Sebar via WhatsApp Personal
                  </li>
                </ul>
              </div>

              {/* Paket Resepsi (Pro) */}
              <div
                onClick={() => setSelectedPackage("resepsi")}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer relative ${
                  selectedPackage === "resepsi"
                    ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-950/40"
                    : "border-stone-800 bg-stone-950/60 hover:border-stone-700"
                }`}
              >
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  <Sparkles className="h-3 w-3" /> Paling Direkomendasikan
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  Paket Resepsi <Crown className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
                  Rp 199.000
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Sistem Meja Resepsi Lengkap di Hari-H</p>

                <ul className="mt-4 space-y-2 text-xs text-stone-300">
                  <li className="flex items-center gap-2 font-medium text-white">
                    <Check className="h-3.5 w-3.5 text-amber-400" /> Semua Fitur Paket Bahagia
                  </li>
                  <li className="flex items-center gap-2 font-medium text-white">
                    <Check className="h-3.5 w-3.5 text-amber-400" /> Meja Resepsi &amp; QR Scanner
                  </li>
                  <li className="flex items-center gap-2 font-medium text-white">
                    <Check className="h-3.5 w-3.5 text-amber-400" /> Layar Proyektor (Live Display)
                  </li>
                  <li className="flex items-center gap-2 font-medium text-white">
                    <Check className="h-3.5 w-3.5 text-amber-400" /> Nomor Meja &amp; Anti-Fraud Souvenir
                  </li>
                </ul>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <label className="block text-xs font-semibold text-stone-300">
                Metode Pembayaran Instan
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("qris")}
                  className={`p-3 rounded-xl border text-xs font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === "qris"
                      ? "border-rose-500 bg-rose-500/10 text-white"
                      : "border-stone-800 bg-stone-950 text-stone-400 hover:text-white"
                  }`}
                >
                  <QrCode className="h-4 w-4 text-rose-400" />
                  <span>QRIS (Semua E-Wallet)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("bca_va")}
                  className={`p-3 rounded-xl border text-xs font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === "bca_va"
                      ? "border-rose-500 bg-rose-500/10 text-white"
                      : "border-stone-800 bg-stone-950 text-stone-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="h-4 w-4 text-cyan-400" />
                  <span>BCA Virtual Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("mandiri_va")}
                  className={`p-3 rounded-xl border text-xs font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === "mandiri_va"
                      ? "border-rose-500 bg-rose-500/10 text-white"
                      : "border-stone-800 bg-stone-950 text-stone-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="h-4 w-4 text-amber-400" />
                  <span>Mandiri VA</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleCheckout}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Lanjut ke Pembayaran <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: CHECKOUT INVOICE DISPLAY */}
        {checkoutData && !successMessage && (
          <div className="space-y-6 text-center">
            <div>
              <span className="text-[11px] font-mono uppercase text-amber-400 tracking-wider">
                Menunggu Pembayaran
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {checkoutData.transaction.metadata?.package_title}
              </h2>
              <p className="text-xs text-stone-400 font-mono mt-1">
                No. Tagihan: {checkoutData.transaction.invoice_number}
              </p>
            </div>

            <div className="bg-stone-950 border border-stone-800 p-6 rounded-2xl space-y-4 max-w-sm mx-auto">
              <div className="text-3xl font-extrabold text-white font-mono">
                Rp {checkoutData.transaction.amount.toLocaleString("id-ID")}
              </div>

              {checkoutData.qris_image_url && paymentMethod === "qris" && (
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-2xl inline-block shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={checkoutData.qris_image_url}
                      alt="QRIS Pembayaran"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Scan menggunakan BCA Mobile, Livin, GoPay, ShopeePay, Dana, atau OVO
                  </p>
                </div>
              )}

              {checkoutData.va_number && paymentMethod !== "qris" && (
                <div className="space-y-2 text-left bg-stone-900 p-4 rounded-xl border border-stone-800">
                  <span className="text-[11px] text-stone-400 uppercase font-mono">Nomor Virtual Account</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold font-mono text-cyan-400">
                      {checkoutData.va_number}
                    </span>
                    <button
                      onClick={copyVa}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedVa ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedVa ? "Disalin" : "Salin"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Simulation Trigger Button */}
            <div className="pt-2 border-t border-stone-800 space-y-3">
              <button
                type="button"
                disabled={simulating}
                onClick={handleSimulatePayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                {simulating ? "Memverifikasi..." : "⚡ Simulasi Pembayaran Berhasil (Uji Coba Langsung)"}
              </button>

              <button
                type="button"
                onClick={() => setCheckoutData(null)}
                className="text-xs text-stone-400 hover:text-stone-200 underline cursor-pointer"
              >
                Ubah Pilihan Paket / Metode
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS UPGRADE CONFIRMATION */}
        {successMessage && (
          <div className="text-center py-6 space-y-5">
            <div className="h-16 w-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-950/40">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Pembayaran Sukses!</h2>
              <p className="text-xs text-stone-300 max-w-md mx-auto">{successMessage}</p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
            >
              Tutup &amp; Nikmati Fitur Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
