"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import type { WorkspaceEvent } from "../acara/EventDirectory";
import type { PartnerChoice } from "./service-types";

export default function RequestForm({ partners, events, partnerId, eventId }: { partners: PartnerChoice[]; events: WorkspaceEvent[]; partnerId?: number; eventId?: number }) {
  const router = useRouter();
  const key = useRef<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    key.current ??= crypto.randomUUID();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/service-requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, request_key: key.current }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(Object.values<string[]>(result.errors ?? {}).flat()[0] ?? result.message ?? "Permintaan belum terkirim.");
      key.current = null;
      form.reset();
      setNotice("Permintaan terkirim. Penawaran mitra akan muncul di riwayat.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Periksa koneksi lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return <form className="work-form" onSubmit={submit}>
    <fieldset disabled={saving}>
      <label>Mitra<select name="partner_profile_id" required defaultValue={partners.some((partner) => partner.id === partnerId) ? partnerId : ""}>
        <option value="">Pilih mitra</option>
        {partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.business_name} · {partner.category}{partner.city ? ` · ${partner.city}` : ""}</option>)}
      </select></label>
      <label>Acara terkait <small>(opsional)</small><select name="event_id" defaultValue={events.some((event) => event.id === eventId) ? eventId : ""}><option value="">Tanpa acara terkait</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label>
      <label>Judul kebutuhan<input name="title" required maxLength={150} placeholder="Contoh: Cetak kartu ucapan" /></label>
      <label>Jumlah <small>(opsional)</small><input name="quantity" type="number" min={1} max={100000} step={1} /></label>
      <label>Detail kebutuhan<textarea name="description" required rows={4} maxLength={2000} placeholder="Sertakan tanggal, lokasi, dan kebutuhan yang ingin ditawarkan." /></label>
      <button className="work-primary" type="submit"><Send size={16} />{saving ? "Mengirim…" : "Kirim permintaan"}</button>
    </fieldset>
    {error && <p className="work-error" role="alert">{error}</p>}
    <p className="work-message" role="status">{notice}</p>
  </form>;
}
