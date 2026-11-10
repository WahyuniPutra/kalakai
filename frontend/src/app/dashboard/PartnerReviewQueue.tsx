"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MapPin, ShieldCheck, Store, X } from "lucide-react";

type PendingPartner = {
  id: number;
  business_name: string;
  logo_url: string | null;
  category: string;
  city: string | null;
  description: string | null;
  user?: { name: string; email: string };
};

export default function PartnerReviewQueue({ partners }: { partners: PendingPartner[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function updateStatus(id: number, status: "active" | "rejected") {
    setBusyId(id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/partners/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Status mitra belum dapat diperbarui.");
      setMessage(payload.message);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusyId(null);
    }
  }

  if (!partners.length) return <div className="dashboard-empty"><ShieldCheck size={22} /><p>Belum ada pendaftaran mitra yang menunggu verifikasi.</p></div>;

  return <div className="partner-review-list">
    {message && <p className="partner-review-feedback" role="status">{message}</p>}
    {partners.map((partner) => <article className="partner-review-card" key={partner.id}>
      <div className="partner-review-main">
        <span className="partner-directory-icon">{partner.logo_url ? <img src={partner.logo_url} alt={`Logo ${partner.business_name}`} /> : <Store size={20} />}</span>
        <div><h3>{partner.business_name}</h3><p>{partner.category}{partner.city ? <> <span>·</span> <MapPin size={13} /> {partner.city}</> : null}</p><small>Pendaftar: {partner.user?.name ?? "Pengguna"} · {partner.user?.email}</small>{partner.description && <p className="partner-review-description">{partner.description}</p>}</div>
      </div>
      <div className="partner-review-actions">
        <button type="button" disabled={busyId !== null} onClick={() => updateStatus(partner.id, "rejected")}><X size={16} />Tolak</button>
        <button type="button" disabled={busyId !== null} onClick={() => updateStatus(partner.id, "active")}><Check size={16} />Setujui &amp; aktifkan</button>
      </div>
    </article>)}
  </div>;
}
