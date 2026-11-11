"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { RequestStatus, ServiceItem } from "./service-types";

export default function RequestActions({ item, role }: { item: ServiceItem; role: "user" | "partner" }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function change(status: RequestStatus, fields: Record<string, FormDataEntryValue> = {}) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/service-requests/${item.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, ...fields }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(Object.values<string[]>(result.errors ?? {}).flat()[0] ?? result.message ?? "Status belum dapat diubah.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Periksa koneksi lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  function quote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void change("quoted", Object.fromEntries(new FormData(event.currentTarget)));
  }

  return <>
    {role === "partner" && item.status === "submitted" && <form className="work-form work-quote-form" onSubmit={quote}>
      <fieldset disabled={saving}>
        <label>Total penawaran (Rp)<input name="quoted_price" type="number" min={1} max={9999999999} step={1} required /></label>
        <label>Catatan penawaran<textarea name="quote_note" rows={2} maxLength={1000} placeholder="Rincian, waktu pengerjaan, atau syarat penawaran" /></label>
        <div className="work-actions"><button className="work-primary" type="submit">Kirim penawaran</button><button type="button" className="work-secondary" onClick={() => void change("cancelled")}>Tolak permintaan</button></div>
      </fieldset>
    </form>}
    <div className="work-actions">
      {role === "user" && item.status === "quoted" && <button type="button" className="work-primary" disabled={saving} onClick={() => void change("accepted")}>Terima penawaran</button>}
      {role === "user" && (item.status === "submitted" || item.status === "quoted") && <button type="button" className="work-secondary" disabled={saving} onClick={() => void change("cancelled")}>{item.status === "quoted" ? "Tolak penawaran" : "Batalkan permintaan"}</button>}
      {role === "partner" && item.status === "accepted" && <button type="button" className="work-primary" disabled={saving} onClick={() => void change("in_progress")}>Mulai pengerjaan</button>}
      {role === "partner" && item.status === "in_progress" && <button type="button" className="work-primary" disabled={saving} onClick={() => void change("completed")}>Tandai selesai</button>}
    </div>
    {error && <p className="work-error" role="alert">{error}</p>}
  </>;
}
