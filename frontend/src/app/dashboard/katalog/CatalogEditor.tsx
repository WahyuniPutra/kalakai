"use client";

import { useState, type FormEvent } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

export type CatalogItem = { name: string; price_from: number | string; unit: string; description?: string | null; photo_url?: string | null };
type Item = CatalogItem & { key: string };

export default function CatalogEditor({ catalog }: { catalog: CatalogItem[] }) {
  const [items, setItems] = useState<Item[]>(() => catalog.map((item, index) => ({ ...item, key: String(index) })));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function update(key: string, fields: Partial<CatalogItem>) {
    setItems((current) => current.map((item) => item.key === key ? { ...item, ...fields } : item));
    setNotice("");
  }

  function add() {
    const key = crypto.randomUUID();
    setItems((current) => [...current, { key, name: "", price_from: "", unit: "acara", description: "", photo_url: "" }]);
    setNotice("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/profile/catalog", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalog: items.map(({ name, price_from, unit, description, photo_url }) => ({ name, price_from: Number(price_from), unit, description, photo_url })) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(Object.values<string[]>(result.errors ?? {}).flat()[0] ?? result.message ?? "Katalog belum dapat disimpan.");
      setNotice("Katalog sudah disimpan dan siap dilihat pelanggan.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Periksa koneksi lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return <form className="work-panel work-catalog work-form" onSubmit={save}>
    <div className="work-panel-heading"><h2>Daftar layanan</h2><span>{items.length} dari 30 layanan</span></div>
    <fieldset disabled={saving}>
      {items.length ? items.map((item, index) => <section className="work-catalog-item" key={item.key} aria-label={`Layanan ${index + 1}`}>
        <div className="work-panel-heading"><h3>{item.name || `Layanan ${index + 1}`}</h3><button type="button" className="work-secondary work-remove" onClick={() => { setItems((current) => current.filter((entry) => entry.key !== item.key)); setNotice(""); }}><Trash2 size={15} /> Hapus dari daftar</button></div>
        <div className="work-catalog-fields">
          <label>Nama layanan<input required value={item.name} maxLength={100} onChange={(event) => update(item.key, { name: event.target.value })} /></label>
          <label>Harga mulai (Rp)<input required type="number" min={0} max={9999999999} step={1} value={item.price_from} onChange={(event) => update(item.key, { price_from: event.target.value })} /></label>
          <label>Satuan<input required value={item.unit} maxLength={32} placeholder="acara, paket, lembar" onChange={(event) => update(item.key, { unit: event.target.value })} /></label>
          <label>URL foto <small>(opsional)</small><input type="url" value={item.photo_url ?? ""} maxLength={2048} onChange={(event) => update(item.key, { photo_url: event.target.value })} /></label>
          <label className="work-wide-field">Deskripsi <small>(opsional)</small><textarea rows={3} maxLength={500} value={item.description ?? ""} onChange={(event) => update(item.key, { description: event.target.value })} /></label>
        </div>
      </section>) : <div className="work-empty"><p>Tambahkan layanan pertama agar pelanggan bisa melihat penawaran Anda.</p></div>}
      <div className="work-actions"><button type="button" className="work-secondary" onClick={add} disabled={items.length >= 30}><Plus size={16} /> Tambah layanan</button><button type="submit" className="work-primary"><Save size={16} />{saving ? "Menyimpan…" : "Simpan katalog"}</button></div>
    </fieldset>
    {error && <p className="work-error" role="alert">{error}</p>}
    <p className="work-message" role="status">{notice}</p>
  </form>;
}
