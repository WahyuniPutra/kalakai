import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Heart, MapPin, PackageCheck, Store } from "lucide-react";
import { publicMetadata } from "@/lib/seo";

const backendApiUrl = (process.env.KALAKAI_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

type Service = { name: string; description?: string | null; photo_url?: string | null; price_from: number; unit: string };
type Partner = { id: number; business_name: string; logo_url: string | null; category: string; city: string | null; description: string | null; catalog: Service[] | null };

async function getPartner(id: string): Promise<Partner | null> {
  if (!/^\d+$/.test(id)) return null;
  try {
    const response = await fetch(`${backendApiUrl}/api/partners/${id}`, { next: { revalidate: 60 } });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps<"/mitra/[partnerId]">): Promise<Metadata> {
  const { partnerId } = await params;
  const partner = await getPartner(partnerId);
  if (!partner) return { title: "Mitra tidak ditemukan — Kalakai", robots: { index: false, follow: false } };
  const description = partner.description?.slice(0, 160) || `${partner.business_name}, mitra ${partner.category}${partner.city ? ` di ${partner.city}` : ""}. Lihat katalog layanan dan informasi usaha di Kalakai.`;
  return publicMetadata(`${partner.business_name} — Mitra Kalakai`, description, `/mitra/${partner.id}`);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export default async function PartnerDetailPage({ params }: PageProps<"/mitra/[partnerId]">) {
  const { partnerId } = await params;
  const partner = await getPartner(partnerId);
  if (!partner) notFound();

  return <main className="partner-catalog-page">
    <header className="partner-catalog-header">
      <Link href="/" className="public-brand" aria-label="Kalakai beranda"><span className="public-brand-mark"><Heart size={18} fill="currentColor" /></span><span>kalakai<span>.</span></span></Link>
      <nav className="public-nav partner-catalog-nav" aria-label="Navigasi halaman">
        <Link href="/#fitur">Fitur</Link><Link href="/#cara-kerja">Cara kerja</Link><Link href="/#harga">Harga</Link><Link href="/mitra" aria-current="page">Katalog mitra</Link><Link href="/#tentang">Tentang Kalakai</Link>
      </nav>
      <div className="topbar-actions partner-catalog-actions"><Link className="secure-label" href="/login">Masuk</Link><Link className="dashboard-logout partner-register-link" href="/register">Daftar mitra</Link></div>
    </header>
    <div className="partner-detail-wrap">
      <Link className="partner-detail-back" href="/mitra"><ArrowLeft size={16} />Kembali ke katalog mitra</Link>
      <section className="partner-detail-hero">
        <div className="partner-detail-identity">
          <div className="partner-detail-logo">{partner.logo_url ? <img src={partner.logo_url} alt={`Logo ${partner.business_name}`} /> : <Store size={34} />}</div>
          <div><span className="partner-directory-category">{partner.category}</span><h1>{partner.business_name}</h1><p className="partner-directory-location"><MapPin size={16} />{partner.city || "Melayani berbagai kota"}</p></div>
        </div>
        <p className="partner-detail-description">{partner.description || "Mitra Kerabat Kalakai yang siap membantu kebutuhan acara Anda."}</p>
        <Link className="partner-detail-cta" href="/register">Ajukan layanan melalui Kalakai <ArrowUpRight size={17} /></Link>
      </section>
      <section className="partner-detail-services">
        <div className="partner-detail-services-heading"><div><p className="public-eyebrow"><span />KATALOG LAYANAN</p><h2>Pilih layanan yang Anda butuhkan.</h2></div><span>{(partner.catalog ?? []).length} layanan</span></div>
        {(partner.catalog ?? []).length ? <div className="partner-detail-service-grid">{partner.catalog?.map((service) => <article className="partner-detail-service-card" key={service.name}>
          <div className="partner-service-photo">{service.photo_url ? <img src={service.photo_url} alt={service.name} loading="lazy" /> : partner.logo_url ? <img src={partner.logo_url} alt={`Foto ${service.name}`} loading="lazy" /> : <div className="partner-service-photo-placeholder"><PackageCheck size={32} /><span>Foto layanan</span></div>}</div>
          <div className="partner-service-copy"><p className="partner-service-category">{partner.category}</p><h3>{service.name}</h3><p className="partner-service-description">{service.description || `Layanan ${service.name.toLowerCase()} dari ${partner.business_name}. Hubungi mitra untuk menyesuaikan detail pesanan.`}</p><div className="partner-service-price"><span>Mulai dari</span><strong>{formatPrice(service.price_from)}</strong><small>/ {service.unit}</small></div></div>
        </article>)}</div> : <div className="partner-catalog-empty"><PackageCheck size={28} /><h2>Detail layanan segera diperbarui</h2><p>Hubungi mitra melalui Kalakai untuk menanyakan layanan dan harga.</p></div>}
      </section>
    </div>
    <footer className="partner-catalog-footer"><span>© 2026 Kalakai Id · Kerabat Kalakai</span><Link href="/mitra">Jelajahi mitra lain <span aria-hidden="true">↗</span></Link></footer>
  </main>;
}
