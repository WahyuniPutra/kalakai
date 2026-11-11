import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import PartnerCatalog, { type CatalogPartner } from "./PartnerCatalog";
import { publicMetadata } from "@/lib/seo";

const backendApiUrl = (process.env.KALAKAI_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export const metadata: Metadata = publicMetadata("Katalog Mitra Layanan Acara — Kalakai", "Temukan percetakan dan penyedia layanan acara dari Kerabat Kalakai. Lihat profil usaha, lokasi, katalog, dan harga layanan mitra.", "/mitra");

async function getPartners(): Promise<CatalogPartner[]> {
  try {
    const response = await fetch(`${backendApiUrl}/api/partners`, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export default async function MitraPage() {
  const partners = await getPartners();

  return (
    <main className="partner-catalog-page">
      <header className="partner-catalog-header">
        <Link href="/" className="public-brand" aria-label="Kalakai beranda">
          <span className="public-brand-mark"><Heart size={18} fill="currentColor" /></span>
          <span>kalakai<span>.</span></span>
        </Link>
        <nav className="public-nav partner-catalog-nav" aria-label="Navigasi halaman">
          <Link href="/#fitur">Fitur</Link>
          <Link href="/#cara-kerja">Cara kerja</Link>
          <Link href="/#harga">Harga</Link>
          <Link href="/mitra" aria-current="page">Katalog mitra</Link>
          <Link href="/#tentang">Tentang Kalakai</Link>
        </nav>
        <div className="topbar-actions partner-catalog-actions">
          <Link className="secure-label" href="/login">Masuk</Link>
          <Link className="dashboard-logout partner-register-link" href="/register">Daftar mitra</Link>
        </div>
      </header>
      <section className="partner-catalog-hero">
        <p className="public-eyebrow"><span />KERABAT KALAKAI</p>
        <h1>Temukan mitra yang<br /><em>tepat untuk momenmu.</em></h1>
        <p>Percetakan dan penyedia layanan acara pilihan untuk membantu setiap detail perayaan terasa lebih mudah.</p>
      </section>
      <PartnerCatalog partners={partners} />
      <footer className="partner-catalog-footer">
        <span>© 2026 Kalakai Id · Kerabat Kalakai</span>
        <Link href="/register">Bergabung sebagai mitra <span aria-hidden="true">↗</span></Link>
      </footer>
    </main>
  );
}
