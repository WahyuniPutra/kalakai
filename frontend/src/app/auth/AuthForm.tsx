"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, ShieldCheck } from "lucide-react";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [accountType, setAccountType] = useState<"user" | "partner">("user");
  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...(isRegister ? {
            name,
            account_type: accountType,
            password_confirmation: passwordConfirmation,
            ...(accountType === "partner" ? { business_name: businessName, logo_url: logoUrl, category, city, description } : {}),
          } : {}),
          email,
          password,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        const validationError = Object.values(payload.errors ?? {}).flat()[0];
        setError(typeof validationError === "string" ? validationError : payload.message ?? "Periksa kembali data yang Anda masukkan.");
        return;
      }

      if (payload.pending_review) {
        setSuccess(payload.message ?? "Pendaftaran mitra menunggu verifikasi Super Admin.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Belum dapat terhubung ke Kalakai. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link className="auth-brand" href="/">
          <span><Heart size={18} fill="currentColor" /></span>kalakai<span className="auth-brand-dot">.</span>
        </Link>
        <div className="auth-story-copy">
          <p className="auth-kicker">RUANG KERABAT KALAKAI</p>
          <h1>Setiap momen<br />punya <em>ceritanya.</em></h1>
          <p>Siapkan undangan, kelola tamu, dan sambut hari perayaan dari satu ruang yang dirancang untuk Anda.</p>
        </div>
        <div className="auth-story-footer"><ShieldCheck size={15} />Ruang acara pribadi Anda</div>
      </section>

      <section className="auth-form-side">
        <Link href="/" className="auth-back"><ArrowLeft size={15} />Kembali ke Kalakai</Link>
        <div className="auth-card">
          <div className="auth-card-brand"><span><Heart size={17} fill="currentColor" /></span><b>kalakai<span>.</span></b></div>
          <p className="auth-eyebrow">{isRegister ? "MULAI BERSAMA KALAKAI" : "SELAMAT DATANG KEMBALI"}</p>
          <h2>{isRegister ? "Buat akun Anda" : "Masuk ke akun"}</h2>
          <p className="auth-intro">{isRegister ? "Buat ruang untuk merancang acara istimewa Anda atau daftarkan usaha sebagai mitra." : "Lanjutkan mengelola undangan dan acara Anda."}</p>

          <form className="auth-fields" onSubmit={handleSubmit}>
            {isRegister && <label>Nama lengkap<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama Anda" required maxLength={255} /></label>}
            {isRegister && <label>Jenis akun<select value={accountType} onChange={(event) => setAccountType(event.target.value as "user" | "partner")}><option value="user">Pengguna Kalakai</option><option value="partner">Mitra Kerabat Kalakai</option></select></label>}
            {isRegister && accountType === "partner" && <>
              <div className="partner-register-notice"><ShieldCheck size={17} /><span>Pendaftaran mitra akan ditinjau Super Admin. Akun aktif setelah disetujui.</span></div>
              <label>Nama usaha<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Contoh: Cetak Rupa Palangka" required maxLength={255} /></label>
              <label><span>URL logo usaha <span className="auth-field-optional">(opsional)</span></span><input type="url" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} placeholder="https://contoh.com/logo.png" maxLength={2048} /></label>
              <label>Kategori layanan<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Percetakan, MUA, dekorasi…" required maxLength={100} /></label>
              <label>Kota<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Palangka Raya" maxLength={100} /></label>
              <label>Deskripsi usaha<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ceritakan layanan dan keunggulan usaha Anda" maxLength={2000} rows={3} /></label>
            </>}
            <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required /></label>
            <label>Kata sandi<input type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? "Minimal 8 karakter" : "Masukkan kata sandi"} required minLength={isRegister ? 8 : undefined} /></label>
            {isRegister && <label>Ulangi kata sandi<input type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Ketik ulang kata sandi" required minLength={8} /></label>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            {success && <p className="auth-success" role="status">{success}</p>}
            <button className="auth-submit" type="submit" disabled={loading || Boolean(success)}>
              {loading ? "Memproses…" : success ? "Pendaftaran terkirim" : isRegister ? "Daftar" : "Masuk"}<ArrowRight size={15} />
            </button>
          </form>

          <p className="auth-switch">{isRegister ? "Sudah punya akun?" : "Belum punya akun?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Masuk" : "Daftar gratis"}</Link></p>
          <p className="auth-terms">Dengan melanjutkan, Anda menyetujui ketentuan penggunaan dan kebijakan privasi Kalakai.</p>
        </div>
        <p className="auth-side-note">Teknologi untuk momen yang berarti <Heart size={12} fill="currentColor" /></p>
      </section>
    </main>
  );
}
