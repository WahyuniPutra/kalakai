"use client";

import Link from "next/link";

export default function WorkspaceError({ reset }: { reset: () => void }) {
  return <main className="workspace-load-error">
    <h1>Ruang kerja belum dapat dimuat</h1>
    <p>Coba muat ulang untuk mengambil data terbaru.</p>
    <div className="work-actions"><button type="button" className="work-primary" onClick={reset}>Muat ulang</button><Link className="work-secondary" href="/dashboard">Ke ringkasan</Link></div>
  </main>;
}
