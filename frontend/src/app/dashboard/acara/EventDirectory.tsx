"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Copy, ExternalLink, MapPin, Search, UsersRound } from "lucide-react";
import { siteUrl } from "@/lib/seo";

export type WorkspaceEvent = {
  id: number; title: string; slug: string; event_date: string | null; location_name: string | null;
  guests_count: number; is_published: boolean;
};
const calendar = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

export default function EventDirectory({ events }: { events: WorkspaceEvent[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("updated");
  const [notice, setNotice] = useState("");
  const published = events.filter((event) => event.is_published).length;
  const filtered = events.filter((event) => {
    const matchesStatus = status === "all" || event.is_published === (status === "published");
    const text = `${event.title} ${event.location_name ?? ""}`.toLocaleLowerCase("id-ID");
    return matchesStatus && text.includes(query.trim().toLocaleLowerCase("id-ID"));
  });
  if (sort === "date") filtered.sort((left, right) => (Date.parse(left.event_date ?? "") || Infinity) - (Date.parse(right.event_date ?? "") || Infinity));

  async function copy(event: WorkspaceEvent) {
    try {
      await navigator.clipboard.writeText(`${siteUrl}/${event.slug}`);
      setNotice(`Tautan ${event.title} disalin.`);
    } catch {
      setNotice("Buka undangan untuk menyalin tautan dari bilah alamat.");
    }
  }

  return <section className="work-panel" aria-label="Daftar acara">
    <div className="work-metrics">
      <span><strong>{events.length}</strong> semua acara</span>
      <span><strong>{events.length - published}</strong> draf</span>
      <span><strong>{published}</strong> terbit</span>
    </div>
    <div className="work-toolbar">
      <label className="work-search"><span>Cari acara</span><span><Search size={17} /><input type="search" value={query} placeholder="Nama atau lokasi acara" onChange={(event) => setQuery(event.target.value)} /></span></label>
      <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Semua status</option><option value="draft">Draf</option><option value="published">Terbit</option></select></label>
      <label>Urutkan<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="updated">Terbaru dibuat</option><option value="date">Tanggal acara</option></select></label>
    </div>
    <p className="work-message" role="status">{notice}</p>
    {filtered.length ? <div className="work-list">{filtered.map((event) => {
      const date = Date.parse(event.event_date ?? "");
      return <article className="work-event" key={event.id}>
        <div className="work-event-main"><div className="work-event-title"><h2>{event.title}</h2><span className={`work-status ${event.is_published ? "work-status-good" : ""}`}>{event.is_published ? "Terbit" : "Draf"}</span></div>
          <div className="work-event-meta"><span><CalendarDays size={15} />{Number.isNaN(date) ? "Tanggal belum diatur" : calendar.format(date)}</span><span><MapPin size={15} />{event.location_name || "Lokasi belum diatur"}</span><span><UsersRound size={15} />{event.guests_count} tamu</span></div>
        </div>
        <div className="work-actions">
          <Link className="work-secondary" href={`/dashboard/undangan/${event.id}`}>Edit undangan</Link>
          <Link className="work-secondary" href={`/dashboard/layanan?acara=${event.id}#ajukan`}>Ajukan layanan</Link>
          {event.is_published && <><Link className="work-secondary" href={`/${event.slug}`}><ExternalLink size={15} /> Buka</Link><button type="button" className="work-secondary" onClick={() => void copy(event)}><Copy size={15} /> Salin tautan</button></>}
        </div>
      </article>;
    })}</div> : <div className="work-empty"><CalendarDays size={26} /><h2>{events.length ? "Tidak ada acara yang cocok" : "Belum ada acara"}</h2><p>{events.length ? "Ubah kata pencarian atau filter status." : "Buat undangan untuk mulai menyiapkan acara."}</p>{!events.length && <Link className="work-primary" href="/dashboard/undangan/new">Buat undangan pertama</Link>}</div>}
  </section>;
}
