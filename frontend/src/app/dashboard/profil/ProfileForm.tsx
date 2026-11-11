"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, ClipboardList, LayoutDashboard, Save, Store } from "lucide-react";
import DashboardShell, { type DashboardUser } from "../DashboardShell";

type Partner = {
  id: number; business_name: string; category: string; city: string | null;
  description: string | null; logo_url: string | null; status: string;
};
type Profile = DashboardUser & { partner_profile: Partner | null };
const statusNames: Record<string, string> = { active: "Terverifikasi", pending: "Menunggu verifikasi", rejected: "Perlu diperbarui" };

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const partner = profile.partner_profile;
  const [values, setValues] = useState({
    name: profile.name, email: profile.email, current_password: "",
    business_name: partner?.business_name ?? "", category: partner?.category ?? "",
    city: partner?.city ?? "", description: partner?.description ?? "", logo_url: partner?.logo_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [savedUser, setSavedUser] = useState<DashboardUser>(profile);
  const isPartner = profile.role === "partner";
  const emailChanged = values.email !== savedUser.email;
  const nav = [
    { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { label: isPartner ? "Permintaan masuk" : "Acara saya", href: isPartner ? "/dashboard#permintaan" : "/dashboard#acara", icon: isPartner ? ClipboardList : CalendarDays },
    { label: isPartner ? "Katalog layanan" : "Permintaan layanan", href: isPartner ? "/dashboard#katalog" : "/dashboard#layanan", icon: isPartner ? Store : ClipboardList },
  ];

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setMessage("");
    setFieldErrors((current) => ({ ...current, [field]: [] }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    setFieldErrors({});
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, current_password: emailChanged ? values.current_password : undefined }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFieldErrors(data.errors ?? {});
        throw new Error(data.message ?? "Profil belum dapat disimpan.");
      }
      setSavedUser(data);
      setValues((current) => ({ ...current, name: data.name, email: data.email, current_password: "" }));
      setMessage("Profil berhasil disimpan.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  function fieldError(field: string) {
    return fieldErrors[field]?.[0] ? <small className="profile-field-error" id={`error-${field}`}>{fieldErrors[field][0]}</small> : null;
  }

  return <DashboardShell user={savedUser} nav={nav} profileActive>
    <div className="profile-heading"><p className="eyebrow">PENGATURAN AKUN</p><h1>{isPartner ? "Profil akun & usaha" : "Profil saya"}</h1><p>Perbarui informasi agar akun dan komunikasi acara Anda tetap sesuai.</p></div>
    <form className="profile-form" onSubmit={submit}>
      <section className="dashboard-panel profile-panel" aria-labelledby="profile-account">
        <h2 id="profile-account">Informasi akun</h2>
        <div className="profile-fields">
          <label>Nama lengkap<input value={values.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" required maxLength={255} aria-invalid={Boolean(fieldErrors.name?.length)} aria-describedby={fieldErrors.name?.length ? "error-name" : undefined} />{fieldError("name")}</label>
          <label>Email<input type="email" value={values.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" required maxLength={255} aria-invalid={Boolean(fieldErrors.email?.length)} aria-describedby={fieldErrors.email?.length ? "error-email" : undefined} />{fieldError("email")}</label>
          {emailChanged && <label>Sandi saat ini<input type="password" autoComplete="current-password" value={values.current_password} onChange={(event) => update("current_password", event.target.value)} required aria-invalid={Boolean(fieldErrors.current_password?.length)} aria-describedby="profile-password-help" /><small id="profile-password-help">Masukkan sandi akun untuk mengonfirmasi perubahan email.</small>{fieldError("current_password")}</label>}
        </div>
      </section>
      {isPartner && partner && <section className="dashboard-panel profile-panel" aria-labelledby="profile-business">
        <div className="profile-business-heading"><h2 id="profile-business">Profil usaha</h2><span className="profile-status">{statusNames[partner.status] ?? partner.status}</span></div>
        <p className="profile-help">Informasi usaha mitra terverifikasi ditampilkan di katalog publik.</p>
        <div className="profile-fields">
          <label>Nama usaha<input value={values.business_name} onChange={(event) => update("business_name", event.target.value)} required maxLength={255} />{fieldError("business_name")}</label>
          <label>Kategori layanan<input value={values.category} onChange={(event) => update("category", event.target.value)} required maxLength={100} />{fieldError("category")}</label>
          <label>Kota<input value={values.city} onChange={(event) => update("city", event.target.value)} autoComplete="address-level2" maxLength={100} />{fieldError("city")}</label>
          <label>URL logo usaha<input type="url" value={values.logo_url} onChange={(event) => update("logo_url", event.target.value)} placeholder="https://..." maxLength={2048} />{fieldError("logo_url")}</label>
          <label className="profile-full">Tentang usaha<textarea rows={5} value={values.description} onChange={(event) => update("description", event.target.value)} maxLength={2000} />{fieldError("description")}</label>
        </div>
        {partner.status === "active" && <Link className="profile-public-link" href={`/mitra/${partner.id}`}>Lihat halaman publik usaha ↗</Link>}
      </section>}
      <div aria-live="polite">{message && <p className="profile-success"><Check size={17} />{message}</p>}</div>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="profile-save" type="submit" disabled={saving}><Save size={16} />{saving ? "Menyimpan…" : "Simpan profil"}</button>
    </form>
  </DashboardShell>;
}
